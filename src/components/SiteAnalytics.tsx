/**
 * Visitor numbers through Vercel Web Analytics (the dashboard is the owner's
 * Vercel project → Analytics). No cookies; Vercel identifies a visitor with a
 * hash of the request that resets every day.
 *
 * One page view per page: sent when the path changes, never for a "#..."
 * jump (the enquiry form, the phone chat's "#chat"), so opening the chat
 * doesn't count as a second page. Nothing is sent from a browser marked
 * "don't count" (set when the owner signs in on /leads, or opens /leads?me=1)
 * or from /leads.
 *
 * "Who stayed": Vercel's free plan has no time-on-site figure, so a visit
 * whose page has been on screen for 30 seconds in total sends one extra page
 * view, STAYED_PATH. Its count in the dashboard's Pages list is the number of
 * visits that stayed at least 30 seconds, and the bounce rate becomes the
 * share who left within 30 seconds without opening another page.
 */
import { useEffect } from "react";
import { Analytics, type BeforeSendEvent } from "@vercel/analytics/react";
import { useRouterState } from "@tanstack/react-router";

const DONT_COUNT = "dxbch-dont-count";
const STAYED_SENT = "dxbch-stayed-sent";
export const STAYED_PATH = "/stayed-30-seconds";
const STAYED_AFTER_S = 30;

export function isCountingThisDevice(): boolean {
  try { return localStorage.getItem(DONT_COUNT) !== "1"; } catch { return true; }
}
/** Returns whether this browser is now counted (storage can be blocked, so the wish may not stick). */
export function setCountingThisDevice(count: boolean): boolean {
  try { if (count) localStorage.removeItem(DONT_COUNT); else localStorage.setItem(DONT_COUNT, "1"); } catch { /* storage blocked */ }
  return isCountingThisDevice();
}

const isPrivatePath = (pathname: string) => pathname.toLowerCase().startsWith("/leads");

/* Set just before the "stayed" page view is handed to the (already loaded) script, and used up by the
   next page view it reports, so that event is filed under STAYED_PATH whatever address the script
   puts on it. */
let stayedPending = false;

export function beforeSend(event: BeforeSendEvent): BeforeSendEvent | null {
  if (!isCountingThisDevice()) { stayedPending = false; return null; }
  try {
    const url = new URL(event.url);
    if (stayedPending && event.type === "pageview") { stayedPending = false; url.pathname = STAYED_PATH; url.search = ""; }
    else if (isPrivatePath(url.pathname)) return null;
    url.hash = "";
    return { ...event, url: url.toString() };
  } catch {
    return event;
  }
}

export function SiteAnalytics() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  // Group the 42 project pages under one route in the dashboard, with each page still listed by its path.
  const route = path.startsWith("/projects/") ? "/projects/[slug]" : path;

  // Count on-screen time across the visit (this tab); at 30 seconds, report the visit as one that stayed.
  useEffect(() => {
    // Only once Vercel's script is running, so the page views queued before it are reported first.
    const script = document.querySelector<HTMLScriptElement>('script[src*="/insights/script"]');
    script?.addEventListener("load", () => { script.dataset["dxbchReady"] = "1"; }, { once: true });
    try { if (sessionStorage.getItem(STAYED_SENT)) return; } catch { /* no storage: may report once per page load */ }
    let seen = 0;
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible" || isPrivatePath(window.location.pathname)) return;
      if (++seen < STAYED_AFTER_S || script?.dataset["dxbchReady"] !== "1" || !window.va) return;
      window.clearInterval(timer);
      try { sessionStorage.setItem(STAYED_SENT, "1"); } catch { /* ignore */ }
      if (!isCountingThisDevice()) return;
      stayedPending = true;
      window.va("pageview", { route: STAYED_PATH, path: STAYED_PATH });
      window.setTimeout(() => { stayedPending = false; }, 2000);
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return <Analytics route={route} path={path} beforeSend={beforeSend} />;
}
