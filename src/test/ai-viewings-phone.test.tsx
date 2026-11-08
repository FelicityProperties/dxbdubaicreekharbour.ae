/**
 * AI viewings on phones: the viewings sit in one swipe row and only one plays at a time, the one that last came
 * into view. A viewing that gave way to another is not "paused by the visitor": it plays again when it comes back.
 * Above 640px nothing changes (src/test/ai-viewings.test.tsx covers the player itself).
 */
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AI_VIEWING_SPECS, type AiViewing } from "@/data/ai-viewings";
import { ViewingCard } from "@/components/showcase/AiViewings";

const fake = (slug: string, project: string): AiViewing => ({
  ...AI_VIEWING_SPECS[0]!,
  slug,
  project,
  video: `/videos/${slug}-ai-viewing.mp4`,
  poster: `/videos/${slug}-ai-viewing.jpg`,
  bytes: 1,
  seconds: 30,
  width: 1080,
  height: 1920,
  audio: true,
  hash: "abc123",
  uploadDate: "2026-10-19T12:00:00+04:00",
  encoding: "test",
});

describe("AI viewings: one at a time on phones", () => {
  let views: ((ratio: number) => void)[] = [];
  let phone = true;

  beforeEach(() => {
    views = [];
    phone = true;
    class IO {
      constructor(cb: IntersectionObserverCallback) {
        views.push((ratio) => act(() => cb([{ isIntersecting: ratio > 0, intersectionRatio: ratio } as IntersectionObserverEntry], this as unknown as IntersectionObserver)));
      }
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal("IntersectionObserver", IO);
    vi.spyOn(window, "matchMedia").mockImplementation((q: string) => ({ matches: phone && q.includes("max-width: 640px"), media: q, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false }) as MediaQueryList);
    const state = new WeakMap<HTMLMediaElement, boolean>();
    Object.defineProperty(HTMLMediaElement.prototype, "paused", { configurable: true, get() { return state.get(this) ?? true; } });
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLMediaElement) {
      state.set(this, false);
      this.dispatchEvent(new Event("play"));
      return Promise.resolve();
    });
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (this: HTMLMediaElement) {
      state.set(this, true);
      this.dispatchEvent(new Event("pause"));
    });
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("plays only the viewing swiped into view, and the one it replaced again when swiped back", () => {
    const { container } = render(<><ViewingCard viewing={fake("one", "One")} /><ViewingCard viewing={fake("two", "Two")} /></>);
    const [one, two] = Array.from(container.querySelectorAll("video"));
    const [seeOne, seeTwo] = views;
    seeOne!(1);
    expect(one!.paused).toBe(false);
    seeTwo!(0.6); // mid-swipe: the second is half in view while the first is still on screen
    expect(two!.paused).toBe(false);
    expect(one!.paused).toBe(true);
    seeOne!(0.1);
    seeTwo!(1);
    seeOne!(0.8); // swiped back
    expect(one!.paused).toBe(false);
    expect(two!.paused).toBe(true);
    expect(one!.muted && two!.muted).toBe(true); // still silent until a tap asks for sound
  });

  it("lets several viewings play side by side above 640px, as before", () => {
    phone = false;
    const { container } = render(<><ViewingCard viewing={fake("one", "One")} /><ViewingCard viewing={fake("two", "Two")} /></>);
    const [one, two] = Array.from(container.querySelectorAll("video"));
    views[0]!(1);
    views[1]!(1);
    expect(one!.paused).toBe(false);
    expect(two!.paused).toBe(false);
  });
});
