/** The "stayed 30 seconds" signal: sent once a visit has been on screen for 30 s, filed under its own line. */
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const calls: unknown[][] = [];
let send: ((e: { type: "pageview"; url: string }) => unknown) | undefined;
vi.mock("@tanstack/react-router", () => ({ useRouterState: () => "/projects/creek-haven" }));
vi.mock("@vercel/analytics/react", () => ({
  // Stand-in for the package: registers beforeSend and adds the script tag, as the real one does.
  Analytics: (props: { beforeSend: typeof send }) => {
    send = props.beforeSend;
    if (!document.querySelector('script[src*="/insights/script"]')) {
      const s = document.createElement("script");
      s.src = "/_vercel/insights/script.js";
      document.head.appendChild(s);
    }
    return null;
  },
}));

import { STAYED_PATH, SiteAnalytics, setCountingThisDevice } from "@/components/SiteAnalytics";

const scriptLoads = () => document.querySelector('script[src*="/insights/script"]')!.dispatchEvent(new Event("load"));

beforeEach(() => {
  vi.useFakeTimers(); calls.length = 0; localStorage.clear(); sessionStorage.clear();
  document.head.innerHTML = "";
  window.va = (...args: unknown[]) => { calls.push(args); };
});
afterEach(() => vi.useRealTimers());

describe("Who stayed", () => {
  it("reports a visit once, after 30 seconds on screen, under its own page", () => {
    render(<SiteAnalytics />);
    scriptLoads();
    act(() => { vi.advanceTimersByTime(29_000); });
    expect(calls).toHaveLength(0);
    act(() => { vi.advanceTimersByTime(2_000); });
    expect(calls).toEqual([["pageview", { route: STAYED_PATH, path: STAYED_PATH }]]);
    // The script reports it with the current address; beforeSend files it under the stayed line.
    expect(send!({ type: "pageview", url: "https://dxbdubaicreekharbour.ae/projects/creek-haven?x=1" })).toEqual({ type: "pageview", url: `https://dxbdubaicreekharbour.ae${STAYED_PATH}` });
    // The next real page view is filed normally.
    expect(send!({ type: "pageview", url: "https://dxbdubaicreekharbour.ae/market" })).toEqual({ type: "pageview", url: "https://dxbdubaicreekharbour.ae/market" });
    act(() => { vi.advanceTimersByTime(60_000); });
    expect(calls).toHaveLength(1);
  });
  it("waits for Vercel's script, and sends nothing from the owner's browser", () => {
    render(<SiteAnalytics />);
    act(() => { vi.advanceTimersByTime(40_000); });
    expect(calls).toHaveLength(0);
    setCountingThisDevice(false);
    scriptLoads();
    act(() => { vi.advanceTimersByTime(2_000); });
    expect(calls).toHaveLength(0);
  });
});
