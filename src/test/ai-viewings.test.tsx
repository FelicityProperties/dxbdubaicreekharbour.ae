/**
 * AI viewings: the projects, permits and WhatsApp wording the owner gave; video
 * files that are what src/data/ai-viewings.json says they are; and a player that
 * starts only muted and inline (the iPhone rule), at half visibility, and stops
 * below it.
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import encoded from "@/data/ai-viewings.json";
import { AI_VIEWING_SPECS, permitLine, videoObjectNode, viewingLine, viewingWhatsappUrl, type AiViewing, type EncodedViewing } from "@/data/ai-viewings";
import { PROJECTS, SITE } from "@/data/projects";
import { ViewingCard } from "@/components/showcase/AiViewings";

const PUBLIC = join(process.cwd(), "public");
const recorded = encoded.videos as EncodedViewing[];

/** Top-level MP4 boxes in order, and the handler of each track ("vide", "soun"). */
function mp4(file: string) {
  const buf = readFileSync(file);
  const order: string[] = [];
  for (let at = 0; at + 8 <= buf.length; ) {
    let size = buf.readUInt32BE(at);
    order.push(buf.toString("latin1", at + 4, at + 8));
    if (size === 1) size = Number(buf.readBigUInt64BE(at + 8));
    if (size === 0) break;
    at += size;
  }
  const handlers: string[] = [];
  for (let at = buf.indexOf("hdlr"); at >= 0; at = buf.indexOf("hdlr", at + 4)) handlers.push(buf.toString("latin1", at + 12, at + 16));
  return { order, handlers };
}

describe("AI viewings: what the owner asked for", () => {
  it("shows Valia and Albero, each a project on this site, with its own permit", () => {
    expect(AI_VIEWING_SPECS.map((v) => v.slug)).toEqual(["valia", "albero"]);
    for (const v of AI_VIEWING_SPECS) expect(PROJECTS.some((p) => p.slug === v.slug), v.slug).toBe(true);
    expect(AI_VIEWING_SPECS.map(viewingLine)).toEqual(["Valia · Dubai Creek Harbour · Emaar", "Albero · Dubai Creek Harbour · Emaar"]);
    expect(AI_VIEWING_SPECS.map(permitLine)).toEqual([
      "Felicity Properties · RERA ORN 33951 · DLD Permit No. 0710819088",
      "Felicity Properties · RERA ORN 33951 · DLD Permit No. 1251122980",
    ]);
    expect(AI_VIEWING_SPECS.map((v) => v.audio)).toEqual([false, true]); // Valia has no sound
  });

  it("opens WhatsApp with exactly the owner's message", () => {
    const want = (name: string) => `https://wa.me/971563520611?text=Hi%20Muhannad%2C%20I%20watched%20the%20${name}%20AI%20viewing%20on%20your%20site%20-%20please%20send%20the%20floor%20plans%20and%20prices`;
    expect(AI_VIEWING_SPECS.map(viewingWhatsappUrl)).toEqual([want("Valia"), want("Albero")]);
    expect(viewingWhatsappUrl({ ...AI_VIEWING_SPECS[0]!, project: "Creek Haven & Co" })).toBe(want("Creek%20Haven%20%26%20Co"));
  });
});

describe("AI viewings: the encoded files", () => {
  it("records only viewings this site carries", () => {
    for (const v of recorded) expect(AI_VIEWING_SPECS.some((s) => s.slug === v.slug), v.slug).toBe(true);
  });

  it.each(recorded.map((v) => [v.slug, v] as const))("%s is a fast-start 1080x1920 H.264 file of at most 8 MB, with its poster", (slug, v) => {
    const spec = AI_VIEWING_SPECS.find((s) => s.slug === slug)!;
    const video = join(PUBLIC, v.video), poster = join(PUBLIC, v.poster);
    expect(existsSync(video) && existsSync(poster)).toBe(true);
    expect(statSync(video).size).toBe(v.bytes);
    expect(v.bytes).toBeLessThanOrEqual(8_000_000);
    expect([v.width, v.height]).toEqual([1080, 1920]);
    expect(v.seconds).toBeGreaterThan(1);
    const { order, handlers } = mp4(video);
    expect(order.indexOf("moov"), order.join(",")).toBeGreaterThanOrEqual(0);
    expect(order.indexOf("moov"), "moov before mdat (+faststart)").toBeLessThan(order.indexOf("mdat"));
    expect(handlers).toContain("vide");
    expect(handlers.includes("soun")).toBe(spec.audio);
    expect(v.audio).toBe(spec.audio);
    expect(readFileSync(poster).subarray(0, 3)).toEqual(Buffer.from([0xff, 0xd8, 0xff]));
    expect(createHash("sha256").update(readFileSync(video)).update(readFileSync(poster)).digest("hex").slice(0, 10)).toBe(v.hash);
    expect(v.uploadDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+04:00$/);
  });

  it("leaves no stray files in public/videos", () => {
    const dir = join(PUBLIC, "videos");
    const files = existsSync(dir) ? readdirSync(dir) : [];
    const known = recorded.flatMap((v) => [v.video, v.poster]).map((p) => p.replace("/videos/", ""));
    expect(files.filter((f) => !known.includes(f))).toEqual([]);
  });
});

const fake = (slug: "valia" | "albero"): AiViewing => ({
  ...AI_VIEWING_SPECS.find((s) => s.slug === slug)!,
  video: `/videos/${slug}-ai-viewing.mp4`,
  poster: `/videos/${slug}-ai-viewing.jpg`,
  bytes: 1,
  seconds: 45.02,
  width: 1080,
  height: 1920,
  audio: slug === "albero",
  hash: "abc123",
  uploadDate: "2026-10-19T12:00:00+04:00",
  encoding: "test",
});

describe("AI viewings: structured data", () => {
  it("describes each video for search with absolute www addresses", () => {
    const node = videoObjectNode(fake("albero"));
    expect(node).toMatchObject({
      "@type": "VideoObject",
      thumbnailUrl: [`${SITE.url}/videos/albero-ai-viewing.jpg?v=abc123`],
      contentUrl: `${SITE.url}/videos/albero-ai-viewing.mp4?v=abc123`,
      uploadDate: "2026-10-19T12:00:00+04:00",
      duration: "PT45S",
    });
    expect(node.name).toContain("Albero");
    expect(node.description).toContain("Emaar");
    expect(SITE.url).toBe("https://www.dxbdubaicreekharbour.ae");
  });
});

describe("AI viewings: the player", () => {
  let observe: (ratio: number) => void;
  let reduced = false;
  const played = vi.fn(), paused = vi.fn();

  beforeEach(() => {
    reduced = false;
    played.mockClear();
    paused.mockClear();
    class IO {
      constructor(private cb: IntersectionObserverCallback) {
        observe = (ratio) => act(() => this.cb([{ isIntersecting: ratio > 0, intersectionRatio: ratio } as IntersectionObserverEntry], this as unknown as IntersectionObserver));
      }
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal("IntersectionObserver", IO);
    vi.spyOn(window, "matchMedia").mockImplementation((q: string) => ({ matches: reduced && q.includes("reduced-motion"), media: q, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false }) as MediaQueryList);
    const state = new WeakMap<HTMLMediaElement, boolean>();
    Object.defineProperty(HTMLMediaElement.prototype, "paused", { configurable: true, get() { return state.get(this) ?? true; } });
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLMediaElement) { played(this.muted); state.set(this, false); this.dispatchEvent(new Event("play")); return Promise.resolve(); });
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (this: HTMLMediaElement) { paused(); state.set(this, true); this.dispatchEvent(new Event("pause")); });
  });
  afterEach(() => {
    cleanup(); // unmount while play/pause are still stubbed (jsdom has neither)
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("is muted, inline, looping and loads nothing up front", () => {
    const { container } = render(<ViewingCard viewing={fake("valia")} />);
    const video = container.querySelector("video")!;
    expect(video.muted).toBe(true);
    expect(video.hasAttribute("muted")).toBe(true);
    expect(video.hasAttribute("playsinline")).toBe(true);
    expect(video.loop).toBe(true);
    expect(video.getAttribute("preload")).toBe("none");
    expect(video.getAttribute("poster")).toBe("/videos/valia-ai-viewing.jpg?v=abc123");
    expect(video.getAttribute("aria-label")).toMatch(/Valia AI viewing/);
    expect(screen.getByRole("link", { name: /Floor plans & prices on WhatsApp/ })).toHaveAttribute("href", viewingWhatsappUrl(fake("valia")));
  });

  it("puts playsinline in the server-rendered page too", () => {
    expect(renderToString(<ViewingCard viewing={fake("valia")} />)).toMatch(/playsinline=""/i);
  });

  it("plays muted from half visible and pauses below half", () => {
    render(<ViewingCard viewing={fake("valia")} />);
    observe(0.3);
    expect(played).not.toHaveBeenCalled();
    observe(0.5);
    expect(played).toHaveBeenCalledWith(true);
    observe(0.2);
    expect(paused).toHaveBeenCalled();
  });

  it("offers sound only where there is some", () => {
    render(<><ViewingCard viewing={fake("valia")} /><ViewingCard viewing={fake("albero")} /></>);
    expect(screen.queryByRole("button", { name: /sound for the Valia/ })).toBeNull();
    expect(screen.getByRole("button", { name: /Turn on sound for the Albero AI viewing/ })).toHaveTextContent("Tap for sound");
  });

  it("turns sound on for one viewing at a time", () => {
    const { container } = render(<><ViewingCard viewing={fake("albero")} /><ViewingCard viewing={{ ...fake("albero"), slug: "albero-2", project: "Albero 2" }} /></>);
    const [a, b] = Array.from(container.querySelectorAll("video"));
    fireEvent.click(screen.getByRole("button", { name: /Turn on sound for the Albero AI viewing/ }));
    expect(a!.muted).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: /Turn on sound for the Albero 2 AI viewing/ }));
    expect(b!.muted).toBe(false);
    expect(a!.muted).toBe(true);
  });

  it("stays paused once the visitor pauses it, and never autoplays for reduced motion", () => {
    render(<ViewingCard viewing={fake("valia")} />);
    observe(0.8);
    fireEvent.click(screen.getByRole("button", { name: "Pause the Valia AI viewing" }));
    played.mockClear();
    observe(0);
    observe(0.8);
    expect(played).not.toHaveBeenCalled();
    reduced = true;
    render(<ViewingCard viewing={fake("albero")} />);
    observe(1);
    expect(played).not.toHaveBeenCalled();
  });
});
