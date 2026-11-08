/**
 * Visitor numbers, browser side. Keeps one visit in this tab (sessionStorage,
 * no cookies): the pages opened and the time the site is on screen and in use.
 * The visit is reported to /api/visit when the visitor leaves or switches
 * away, with the totals so far; the numbers show on /leads.
 *
 * Half an hour without use ends a visit, also in a tab that stays open: the
 * next page, return to the tab or use of it starts a new one. A project opened
 * in a new tab keeps the source of the visit it came from. A tab opened in the
 * background starts its visit when first looked at, and isn't reported if it
 * never is.
 *
 * A tap on a WhatsApp button is recorded with the visit (which button, on
 * which page, and the project it is about; never the message) and reported
 * at once, since WhatsApp usually takes the visitor away from the page.
 *
 * Nothing is sent from the owner's browser (marked when the password is typed
 * on /leads, or by opening /leads?me=1), from /leads itself, or from automated
 * browsers. "#..." jumps (the phone chat's "#chat", the enquiry form) are not
 * pages.
 */
import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";
import { VISIT_LIMITS, type VisitReport, type WaPlace } from "@/lib/visits.shared";
import { PROJECTS } from "@/data/projects";
import { splitLocale } from "@/i18n/locales";

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

const WHATSAPP_LINK = /^(https:\/\/(wa\.me|api\.whatsapp\.com)\/|whatsapp:)/i;
/** Which WhatsApp button, from where it sits on the page. */
function waPlace(a: Element, page: string): WaPlace {
  const inside = (selector: string) => !!a.closest(selector);
  if (inside(".floating-wa")) return "floating";
  if (inside(".app-menu")) return "menu"; // the phone menu sheet (it opens outside the header)
  if (inside(".mobile-bar")) return "bar"; // the phone tab bar, and a project page's contact bar
  if (inside(".site-header")) return "menu";
  if (inside(".site-footer")) return "footer";
  if (inside("[class*='bot-']")) return "bot";
  if (inside("#enquire")) return "enquiry";
  if (inside("[class*='aiv-']")) return "viewing";
  if (inside(".cta-band")) return "band";
  if (inside(".project-card, .project-table")) return "card";
  if (/^\/projects\/[^/]+$/.test(page)) return "project";
  if (page === "/payment-plans") return "plans";
  return "page";
}
const BY_LENGTH = [...PROJECTS].sort((a, b) => b.name.length - a.name.length);
/**
 * The project the tap is about: a project card's or table row's own project (a related project on another project's
 * page), else the project page it was on, else the project its message names.
 */
function waProject(a: Element, href: string, page: string): string | null {
  let text = "";
  try { text = new URL(href).searchParams.get("text") ?? ""; } catch { /* not a link with a message */ }
  const named = BY_LENGTH.find((p) => text.includes(p.name))?.slug ?? null;
  if (named && a.closest(".project-card, .project-table")) return named;
  const onPage = /^\/projects\/([^/]+)$/.exec(page)?.[1];
  if (onPage && PROJECTS.some((p) => p.slug === onPage)) return onPage;
  return named;
}

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
  // The address as the browser shows it: Arabic and Chinese pages keep their prefix ("/ar/market"), like the first page
  // counted below, so /leads shows their language. (The router's own pathname has the prefix taken off.)
  const path = useRouterState({ select: (s) => s.location.publicHref.split(/[?#]/)[0] || "/" });
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
      const body = JSON.stringify({ id: v.id, pages: v.pages, views: v.views, seconds: v.seconds, ref: v.ref, src: v.src, touch: v.touch === true, wa: v.wa ?? [] } satisfies VisitReport);
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
    // A scroll, tap or key press: someone is really back. A cursor passing over the window only keeps time counting.
    let lastAct = Date.now();
    const input = () => { lastInput = Date.now(); };
    const act = () => { lastInput = lastAct = Date.now(); };
    const acts = ["pointerdown", "keydown", "scroll", "touchstart", "wheel"] as const;
    acts.forEach((e) => window.addEventListener(e, act, { passive: true }));
    window.addEventListener("mousemove", input, { passive: true });
    const tick = window.setInterval(() => {
      const t = Date.now();
      if (document.visibilityState !== "visible" || t - lastInput > IDLE_AFTER_MS || isPrivatePath(window.location.pathname)) return;
      // In use again after half an hour on screen untouched: that's a new visit too (once they scroll, tap or type).
      if (t - v.last >= NEW_VISIT_AFTER_MS) {
        if (t - lastAct > IDLE_AFTER_MS) return;
        if (freshIfStale()) countPage.current?.(window.location.pathname);
      }
      v.seconds = Math.min(VISIT_LIMITS.maxSeconds, v.seconds + 1);
      v.last = t;
      if (v.seconds % 5 === 0) storeVisit(v);
    }, 1000);

    // Back to the tab (or back to a page kept in the browser's memory): maybe a new visit, counted from this page.
    const onBack = () => {
      lastInput = lastAct = Date.now();
      if (!seen) {
        seen = true;
        // First look at a tab opened in the background: its visit starts now and keeps its source.
        if (v.seconds === 0) { v.last = Date.now(); storeVisit(v); return; }
      }
      if (freshIfStale() && !isPrivatePath(window.location.pathname)) countPage.current?.(window.location.pathname);
    };
    // A tap on a WhatsApp button: recorded and reported straight away (WhatsApp usually takes the visitor off the page).
    const onWhatsApp = (e: MouseEvent) => {
      if (e.type === "auxclick" && e.button !== 1) return;
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!a || !WHATSAPP_LINK.test(a.getAttribute("href") ?? "") || isPrivatePath(window.location.pathname)) return;
      freshIfStale();
      const shown = window.location.pathname;
      if (!v.pages.includes(shown) && v.pages.length < VISIT_LIMITS.maxPages) v.pages.push(shown);
      const taps = (v.wa ??= []);
      if (taps.length < VISIT_LIMITS.maxWaClicks) {
        const page = splitLocale(shown).path;
        taps.push({ at: Date.now(), page: shown, place: waPlace(a, page), project: waProject(a, a.getAttribute("href") ?? "", page) });
      }
      v.last = Date.now();
      seen = true;
      report();
    };
    document.addEventListener("click", onWhatsApp, true);
    document.addEventListener("auxclick", onWhatsApp, true);
    const onVisibility = () => { if (document.visibilityState === "hidden") report(); else onBack(); };
    const onShow = (e: PageTransitionEvent) => { if (e.persisted) onBack(); };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", report);
    window.addEventListener("pageshow", onShow);
    return () => {
      countPage.current = null;
      acts.forEach((e) => window.removeEventListener(e, act));
      window.removeEventListener("mousemove", input);
      window.clearInterval(tick);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("click", onWhatsApp, true);
      document.removeEventListener("auxclick", onWhatsApp, true);
      window.removeEventListener("pagehide", report);
      window.removeEventListener("pageshow", onShow);
    };
  }, []);

  return null;
}
