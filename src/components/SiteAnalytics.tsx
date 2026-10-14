/**
 * Visitor numbers, browser side. Keeps one visit in this tab (sessionStorage,
 * no cookies): the pages opened and the time the site is on screen and in use.
 * The visit is reported to /api/visit when the visitor leaves or switches
 * away, with the totals so far; the numbers show on /leads.
 *
 * Half an hour without use ends a visit, also in a tab that stays open: the
 * next page or return to the tab starts a new one. A project opened in a new
 * tab keeps the source of the visit it came from. A tab that is never looked at
 * (opened in the background, then closed) isn't reported.
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
const SOURCE = "dxbch-source"; // where the latest visit came from, for tabs it opens
const NEW_VISIT_AFTER_MS = 30 * 60_000;
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
const ownSite = (ref: string) => { try { return new URL(ref).host === window.location.host; } catch { return false; } };

/** A new visit. Arriving from this site itself (a project opened in a new tab), it keeps the opener's source. */
function newVisit(now: number, ref: string, src: string): Visit {
  if (!src && ownSite(ref)) {
    try {
      const from = JSON.parse(localStorage.getItem(SOURCE) ?? "null") as { ref: string; src: string; t: number } | null;
      if (from && now - from.t < NEW_VISIT_AFTER_MS) { ref = from.ref; src = from.src; }
      else ref = "";
    } catch { ref = ""; }
  }
  return { id: randomId(), pages: [], views: 0, seconds: 0, ref, src, touch: navigator.maxTouchPoints > 1, last: now };
}
function loadVisit(now: number): Visit {
  try {
    const v = JSON.parse(sessionStorage.getItem(VISIT) ?? "null") as Visit | null;
    if (v && typeof v.id === "string" && Array.isArray(v.pages) && now - v.last < NEW_VISIT_AFTER_MS) return v;
  } catch { /* start a new one */ }
  return newVisit(now, document.referrer, new URLSearchParams(window.location.search).get("utm_source") ?? "");
}
function storeVisit(v: Visit) {
  try { sessionStorage.setItem(VISIT, JSON.stringify(v)); } catch { /* private mode: kept in memory for this page */ }
  try { if (!ownSite(v.ref) || v.src) localStorage.setItem(SOURCE, JSON.stringify({ ref: v.ref, src: v.src, t: v.last })); } catch { /* ignore */ }
}

export function SiteAnalytics() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  // Set while counting runs: counts the page now on screen (starting a new visit first if the last one went stale).
  const countPage = useRef<((pathname: string) => void) | null>(null);

  useEffect(() => { if (!isPrivatePath(path)) countPage.current?.(path); }, [path]);

  useEffect(() => {
    if (!isCountingThisDevice() || navigator.webdriver) return;
    let v = loadVisit(Date.now());
    let lastSent = "";
    let seen = document.visibilityState === "visible";

    const report = () => {
      if (!seen || !isCountingThisDevice() || !v.pages.length) return;
      const body = JSON.stringify({ id: v.id, pages: v.pages, views: v.views, seconds: v.seconds, ref: v.ref, src: v.src, touch: v.touch === true } satisfies VisitReport);
      if (body === lastSent) return; // nothing new since the last report
      lastSent = body;
      storeVisit(v);
      try {
        if (!navigator.sendBeacon?.("/api/visit", new Blob([body], { type: "text/plain" }))) throw new Error("beacon refused");
      } catch {
        void fetch("/api/visit", { method: "POST", body, keepalive: true, headers: { "content-type": "text/plain" } }).catch(() => {});
      }
    };
    /** After half an hour without use, report what's left of the old visit and start a new one (source: direct). */
    const freshIfStale = () => {
      const now = Date.now();
      if (now - v.last < NEW_VISIT_AFTER_MS) return false;
      report();
      v = newVisit(now, "", "");
      lastSent = "";
      return true;
    };
    countPage.current = (pathname) => {
      freshIfStale();
      if (!v.pages.includes(pathname) && v.pages.length < VISIT_LIMITS.maxPages) v.pages.push(pathname);
      v.views = Math.min(VISIT_LIMITS.maxViews, v.views + 1);
      v.last = Date.now();
      storeVisit(v);
    };
    if (!isPrivatePath(window.location.pathname)) countPage.current(window.location.pathname);

    let lastInput = Date.now();
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

    // Back to the tab (or back to a page kept in the browser's memory): maybe a new visit, counted from this page.
    const onBack = () => {
      seen = true;
      lastInput = Date.now();
      if (freshIfStale() && !isPrivatePath(window.location.pathname)) countPage.current?.(window.location.pathname);
    };
    const onVisibility = () => { if (document.visibilityState === "hidden") report(); else onBack(); };
    const onShow = (e: PageTransitionEvent) => { if (e.persisted) onBack(); };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", report);
    window.addEventListener("pageshow", onShow);
    return () => {
      countPage.current = null;
      events.forEach((e) => window.removeEventListener(e, input));
      window.clearInterval(tick);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", report);
      window.removeEventListener("pageshow", onShow);
    };
  }, []);

  return null;
}
