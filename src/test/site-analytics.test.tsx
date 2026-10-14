/** The browser side: one visit per tab, time only while in use, reported when the visitor switches away. */
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let path = "/projects/creek-haven";
vi.mock("@tanstack/react-router", () => ({ useRouterState: () => path }));

import { SiteAnalytics, setCountingThisDevice } from "@/components/SiteAnalytics";

const sent: Blob[] = [];
const hide = () => { Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true }); document.dispatchEvent(new Event("visibilitychange")); };
const show = () => Object.defineProperty(document, "visibilityState", { value: "visible", configurable: true });

beforeEach(() => {
  vi.useFakeTimers(); sent.length = 0; localStorage.clear(); sessionStorage.clear(); show(); path = "/projects/creek-haven";
  window.history.replaceState(null, "", "/projects/creek-haven");
  Object.defineProperty(navigator, "webdriver", { configurable: true, value: false });
  Object.defineProperty(navigator, "sendBeacon", { configurable: true, value: (_u: string, b: Blob) => { sent.push(b); return true; } });
});
afterEach(() => vi.useRealTimers());

// jsdom's Blob has no text(); read it the old way, with real timers.
const read = (b: Blob) => new Promise<string>((resolve) => { const r = new FileReader(); r.onload = () => resolve(String(r.result)); r.readAsText(b); });
const lastReport = async () => {
  expect(sent.length).toBeGreaterThan(0);
  vi.useRealTimers();
  return JSON.parse(await read(sent.at(-1)!)) as { pages: string[]; views: number; seconds: number };
};

describe("Visit counting in the browser", () => {
  it("reports the pages and the time in use when the visitor switches away", async () => {
    const view = render(<SiteAnalytics />);
    act(() => { window.dispatchEvent(new Event("scroll")); vi.advanceTimersByTime(40_000); });
    path = "/payment-plans"; view.rerender(<SiteAnalytics />);
    act(() => { vi.advanceTimersByTime(5_000); });
    hide();
    const r = await lastReport();
    expect(r.pages).toEqual(["/projects/creek-haven", "/payment-plans"]);
    expect(r.views).toBe(2);
    expect(r.seconds).toBe(45);
  });
  it("stops counting time after two idle minutes", async () => {
    render(<SiteAnalytics />);
    act(() => { vi.advanceTimersByTime(10 * 60_000); });
    hide();
    expect((await lastReport()).seconds).toBe(120);
  });
  it("sends nothing from the owner's browser", async () => {
    setCountingThisDevice(false);
    render(<SiteAnalytics />);
    act(() => { vi.advanceTimersByTime(40_000); });
    hide();
    expect(sent).toHaveLength(0);
  });
  it("starts a new visit when an open tab is used again after half an hour", async () => {
    const view = render(<SiteAnalytics />);
    act(() => { window.dispatchEvent(new Event("scroll")); vi.advanceTimersByTime(20_000); });
    hide();
    act(() => { vi.advanceTimersByTime(3 * 3600_000); });
    show(); document.dispatchEvent(new Event("visibilitychange"));
    path = "/market"; view.rerender(<SiteAnalytics />);
    act(() => { window.dispatchEvent(new Event("scroll")); vi.advanceTimersByTime(10_000); });
    hide();
    vi.useRealTimers();
    const first = JSON.parse(await read(sent[0]!)) as { id: string; seconds: number };
    const second = JSON.parse(await read(sent.at(-1)!)) as { id: string; pages: string[]; seconds: number };
    expect(second.id).not.toBe(first.id);
    expect(first.seconds).toBe(20);
    expect(second.pages).toEqual(["/projects/creek-haven", "/market"]);
    expect(second.seconds).toBe(10);
  });
  it("doesn't report a tab that was never looked at", () => {
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    render(<SiteAnalytics />);
    window.dispatchEvent(new Event("pagehide"));
    expect(sent).toHaveLength(0);
  });
});
