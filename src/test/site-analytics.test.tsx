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

describe("WhatsApp taps", () => {
  it("records which button, on which page and about which project, and reports at once", async () => {
    window.history.replaceState(null, "", "/ar/projects/creek-haven");
    path = "/ar/projects/creek-haven";
    render(<SiteAnalytics />);
    const wa = document.createElement("a");
    wa.href = "https://wa.me/971500000000?text=" + encodeURIComponent("Hi, I'm interested in Creek Haven at Dubai Creek Harbour.");
    wa.addEventListener("click", (e) => e.preventDefault());
    const floating = document.createElement("div"); floating.className = "floating-wa"; floating.append(wa); document.body.append(floating);
    act(() => { wa.click(); });
    const r = JSON.parse(await (async () => { expect(sent.length).toBeGreaterThan(0); vi.useRealTimers(); return read(sent.at(-1)!); })()) as { pages: string[]; wa: { page: string; place: string; project: string | null; at: number }[] };
    expect(r.wa).toHaveLength(1);
    expect(r.wa[0]).toMatchObject({ page: "/ar/projects/creek-haven", place: "floating", project: "creek-haven" });
    expect(r.pages).toContain("/ar/projects/creek-haven");
    floating.remove();
  });
  it("names the project from the message on a page that isn't a project's, and ignores other links", async () => {
    window.history.replaceState(null, "", "/payment-plans");
    path = "/payment-plans";
    render(<SiteAnalytics />);
    const card = document.createElement("article"); card.className = "project-card";
    const wa = document.createElement("a");
    wa.href = "https://wa.me/971500000000?text=" + encodeURIComponent("Hi, I'm interested in Creek Haven at Dubai Creek Harbour.");
    wa.addEventListener("click", (e) => e.preventDefault());
    const other = document.createElement("a"); other.href = "/market"; other.addEventListener("click", (e) => e.preventDefault());
    card.append(wa, other); document.body.append(card);
    act(() => { other.click(); });
    expect(sent).toHaveLength(0);
    act(() => { wa.click(); });
    expect(sent.length).toBeGreaterThan(0);
    vi.useRealTimers();
    const r = JSON.parse(await read(sent.at(-1)!)) as { wa: { place: string; project: string | null }[] };
    expect(r.wa).toEqual([expect.objectContaining({ place: "card", project: "creek-haven" })]);
    card.remove();
  });
});

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
  it("counts a tab opened in the background from when it is first looked at, keeping its source", async () => {
    Object.defineProperty(document, "referrer", { value: "https://www.google.com/", configurable: true });
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    render(<SiteAnalytics />);
    act(() => { vi.advanceTimersByTime(40 * 60_000); });
    show(); document.dispatchEvent(new Event("visibilitychange"));
    act(() => { window.dispatchEvent(new Event("scroll")); vi.advanceTimersByTime(60_000); });
    hide();
    vi.useRealTimers();
    const reports = await Promise.all(sent.map(async (b) => JSON.parse(await read(b)) as { id: string; seconds: number; ref: string }));
    expect(new Set(reports.map((r) => r.id)).size).toBe(1);
    expect(reports.at(-1)).toMatchObject({ seconds: 60, ref: "https://www.google.com/" });
    Object.defineProperty(document, "referrer", { value: "", configurable: true });
  });
  it("starts a new visit when a tab left on screen is used again after half an hour", async () => {
    render(<SiteAnalytics />);
    act(() => { window.dispatchEvent(new Event("scroll")); vi.advanceTimersByTime(20_000); });
    act(() => { vi.advanceTimersByTime(3 * 3600_000); });
    act(() => { window.dispatchEvent(new Event("scroll")); vi.advanceTimersByTime(30_000); });
    hide();
    vi.useRealTimers();
    const reports = await Promise.all(sent.map(async (b) => JSON.parse(await read(b)) as { id: string; seconds: number }));
    const ids = [...new Set(reports.map((r) => r.id))];
    expect(ids).toHaveLength(2);
    // The first visit's time stops two idle minutes after its last scroll.
    expect(reports.filter((r) => r.id === ids[0]).at(-1)!.seconds).toBe(120);
    expect(reports.at(-1)!.seconds).toBe(30);
  });
  it("doesn't start a new visit when a cursor merely passes over a window left on screen", async () => {
    render(<SiteAnalytics />);
    act(() => { window.dispatchEvent(new Event("scroll")); vi.advanceTimersByTime(20_000); });
    act(() => { vi.advanceTimersByTime(3 * 3600_000); });
    act(() => { window.dispatchEvent(new Event("mousemove")); vi.advanceTimersByTime(30_000); });
    hide();
    vi.useRealTimers();
    const reports = await Promise.all(sent.map(async (b) => JSON.parse(await read(b)) as { id: string; seconds: number }));
    expect(new Set(reports.map((r) => r.id)).size).toBe(1);
    expect(reports.at(-1)!.seconds).toBe(120);
  });
  it("doesn't report a tab that was never looked at", () => {
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    render(<SiteAnalytics />);
    window.dispatchEvent(new Event("pagehide"));
    expect(sent).toHaveLength(0);
  });
});
