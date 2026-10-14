/**
 * Visitor numbers, browser side. Keeps one visit in this tab (sessionStorage,
 * no cookies): the pages opened and the time the site is on screen and in use.
 * The visit is reported to /api/visit when the visitor leaves or switches
 * away, with the totals so far; the numbers show on /leads.
 *
 * Nothing is sent from the owner's browser (marked when the password is typed
 * on /leads, or by opening /leads?me=1), from /leads itself, or from automated
 * browsers. "#..." jumps (the phone chat's "#chat", the enquiry form) are not
 * pages.
 */
import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { VISIT_LIMITS, type VisitReport } from "@/lib/visits.shared";

const DONT_COUNT = "dxbch-dont-count";
const VISIT = "dxbch-visit";
const NEW_VISIT_AFTER_MS = 30 * 60_000; // half an hour away starts a new visit
const IDLE_AFTER_MS = 2 * 60_000; // no scroll, tap or key for two minutes: stop counting time until the next one

export function isCountingThisDevice(): boolean {
  try { return localStorage.getItem(DONT_COUNT) !== "1"; } catch { return true; }
}
/** Returns whether this browser is now counted (storage can be blocked, so the wish may not stick). */
export function setCountingThisDevice(count: boolean): boolean {
  try { if (count) localStorage.removeItem(DONT_COUNT); else localStorage.setItem(DONT_COUNT, "1"); } catch { /* storage blocked */ }
  return isCountingThisDevice();
}

type Visit = VisitReport & { last: number };
const isPrivatePath = (pathname: string) => pathname.toLowerCase().startsWith("/leads");
const randomId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`);

function loadVisit(now: number): Visit {
  try {
    const v = JSON.parse(sessionStorage.getItem(VISIT) ?? "null") as Visit | null;
    if (v && typeof v.id === "string" && Array.isArray(v.pages) && now - v.last < NEW_VISIT_AFTER_MS) return v;
  } catch { /* start a new one */ }
  const src = new URLSearchParams(window.location.search).get("utm_source") ?? "";
  return { id: randomId(), pages: [], views: 0, seconds: 0, ref: document.referrer, src, last: now };
}
function storeVisit(v: Visit) {
  try { sessionStorage.setItem(VISIT, JSON.stringify(v)); } catch { /* private mode: kept in memory for this page */ }
}

export function SiteAnalytics() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const visit = useRef<Visit | null>(null);
  const active = useRef(false);

  // Count this page.
  useEffect(() => {
    if (!active.current || isPrivatePath(path)) return;
    const v = visit.current!;
    if (!v.pages.includes(path) && v.pages.length < VISIT_LIMITS.maxPages) v.pages.push(path);
    v.views = Math.min(VISIT_LIMITS.maxViews, v.views + 1);
    v.last = Date.now();
    storeVisit(v);
  }, [path]);

  // Start the visit, count time in use, and report on leaving.
  useEffect(() => {
    if (!isCountingThisDevice() || navigator.webdriver) return;
    const now = Date.now();
    const v = loadVisit(now);
    visit.current = v;
    active.current = true;
    const here = window.location.pathname;
    if (!isPrivatePath(here)) {
      if (!v.pages.includes(here)) v.pages.push(here);
      v.views = Math.min(VISIT_LIMITS.maxViews, v.views + 1);
    }
    v.last = now;
    storeVisit(v);

    let lastInput = now;
    const input = () => { lastInput = Date.now(); };
    const events = ["pointerdown", "keydown", "scroll", "touchstart", "wheel", "mousemove"] as const;
    events.forEach((e) => window.addEventListener(e, input, { passive: true }));
    const tick = window.setInterval(() => {
      const t = Date.now();
      if (document.visibilityState !== "visible" || t - lastInput > IDLE_AFTER_MS || isPrivatePath(window.location.pathname)) return;
      v.seconds = Math.min(VISIT_LIMITS.maxSeconds, v.seconds + 1);
      v.last = t;
      if (v.seconds % 5 === 0) storeVisit(v);
    }, 1000);

    let lastSent = "";
    const report = () => {
      if (!isCountingThisDevice() || !v.pages.length) return;
      const body = JSON.stringify({ id: v.id, pages: v.pages, views: v.views, seconds: v.seconds, ref: v.ref, src: v.src } satisfies VisitReport);
      if (body === lastSent) return; // nothing new since the last report
      lastSent = body;
      storeVisit(v);
      try {
        if (!navigator.sendBeacon?.("/api/visit", new Blob([body], { type: "text/plain" }))) throw new Error("beacon refused");
      } catch {
        void fetch("/api/visit", { method: "POST", body, keepalive: true, headers: { "content-type": "text/plain" } }).catch(() => {});
      }
    };
    const onHide = () => { if (document.visibilityState === "hidden") report(); };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", report);
    return () => {
      events.forEach((e) => window.removeEventListener(e, input));
      window.clearInterval(tick);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", report);
    };
  }, []);

  return null;
}
