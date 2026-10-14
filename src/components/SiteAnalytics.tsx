/**
 * Visitor numbers through Vercel Web Analytics (the dashboard is the owner's
 * Vercel project → Analytics). No cookies; Vercel identifies a visitor with a
 * hash of the request that resets every day.
 *
 * One page view per page: sent when the path changes, never for a "#..."
 * jump (the enquiry form, the phone chat's "#chat"), so opening the chat
 * doesn't count as a second page. Nothing is sent from a device marked
 * "don't count" (set when the owner signs in on /leads) or from /leads.
 */
import { Analytics, type BeforeSendEvent } from "@vercel/analytics/react";
import { useRouterState } from "@tanstack/react-router";

const DONT_COUNT = "dxbch-dont-count";

export function isCountingThisDevice(): boolean {
  try { return localStorage.getItem(DONT_COUNT) !== "1"; } catch { return true; }
}
export function setCountingThisDevice(count: boolean) {
  try { if (count) localStorage.removeItem(DONT_COUNT); else localStorage.setItem(DONT_COUNT, "1"); } catch { /* storage blocked: nothing to remember */ }
}

export function beforeSend(event: BeforeSendEvent): BeforeSendEvent | null {
  if (!isCountingThisDevice()) return null;
  try {
    const url = new URL(event.url);
    if (url.pathname.startsWith("/leads")) return null;
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
  return <Analytics route={route} path={path} beforeSend={beforeSend} />;
}
