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
import { AI_VIEWINGS, AI_VIEWING_SPECS, permitLine, videoObjectNode, viewingLine, viewingMessage, type AiViewing, type EncodedViewing } from "@/data/ai-viewings";
import { PROJECTS, SITE } from "@/data/projects";
import { whatsappUrl } from "@/components/showcase/shared";
import { ViewingCard } from "@/components/showcase/AiViewings";

const PUBLIC = join(process.cwd(), "public");
/** The owner's WhatsApp link, character for character, with the project name already URL-encoded. */
const ownerWhatsapp = (name: string) => `https://wa.me/971563520611?text=Hi%20Muhannad%2C%20I%20watched%20the%20${name}%20AI%20viewing%20on%20your%20site%20-%20please%20send%20the%20floor%20plans%20and%20prices`;
const recorded = encoded.videos as EncodedViewing[];

/** What an MP4 holds: top-level boxes in order, track handlers ("vide", "soun"), sample formats before the media, and the video track's size. */
function mp4(file: string) {
  const buf = readFileSync(file);
  const order: string[] = [];
  let mdat = buf.length;
  for (let at = 0; at + 8 <= buf.length; ) {
    let size = buf.readUInt32BE(at);
    const type = buf.toString("latin1", at + 4, at + 8);
    order.push(type);
    if (type === "mdat") mdat = Math.min(mdat, at);
    if (size === 1) size = Number(buf.readBigUInt64BE(at + 8));
    if (size === 0) break;
    at += size;
  }
  const all = (name: string) => { const hits: number[] = []; for (let at = buf.indexOf(name); at >= 0 && at < mdat; at = buf.indexOf(name, at + 4)) hits.push(at); return hits; };
  const handlers = all("hdlr").map((at) => buf.toString("latin1", at + 12, at + 16));
  // tkhd ends with width and height as 16.16 fixed point; audio tracks report 0x0.
  const sizes = all("tkhd").map((at) => { const end = at - 4 + buf.readUInt32BE(at - 4); return [buf.readUInt32BE(end - 8) / 65536, buf.readUInt32BE(end - 4) / 65536]; }).filter(([w]) => (w ?? 0) > 0);
  const formats = ["avc1", "hvc1", "hev1", "av01", "vp09"].filter((f) => all(f).length > 0);
  return { order, handlers, sizes, formats };
}
/** Width and height from a JPEG's start-of-frame marker. */
function jpegSize(file: string): [number, number] | null {
  const buf = readFileSync(file);
  for (let at = 2; at + 9 < buf.length; ) {
    if (buf[at] !== 0xff) return null;
    const marker = buf[at + 1]!;
    if (marker >= 0xc0 && marker <= 0xc3) return [buf.readUInt16BE(at + 7), buf.readUInt16BE(at + 5)];
    at += 2 + buf.readUInt16BE(at + 2);
  }
  return null;
}

describe("AI viewings: what the owner asked for", () => {
  it("leads with Lyvia, then Valia and Albero, each a project on this site, with its own permit", () => {
    expect(AI_VIEWING_SPECS.map((v) => v.slug)).toEqual(["lyvia-by-palace", "valia", "albero"]);
    for (const v of AI_VIEWING_SPECS) expect(PROJECTS.some((p) => p.slug === v.slug), v.slug).toBe(true);
    expect(AI_VIEWING_SPECS.map(viewingLine)).toEqual(["Lyvia by Palace · Dubai Creek Harbour · Emaar", "Valia · Dubai Creek Harbour · Emaar", "Albero · Dubai Creek Harbour · Emaar"]);
    expect(AI_VIEWING_SPECS.map(permitLine)).toEqual([
      "Felicity Properties · RERA ORN 33951 · DLD Permit No. 2107900942",
      "Felicity Properties · RERA ORN 33951 · DLD Permit No. 0710819088",
      "Felicity Properties · RERA ORN 33951 · DLD Permit No. 1251122980",
    ]);
    expect(AI_VIEWING_SPECS.map((v) => v.audio)).toEqual([true, true, true]); // all three keep their songs since 27 Oct 2026
  });

  it("opens WhatsApp with exactly the owner's message", () => {
    expect(AI_VIEWING_SPECS.map((v) => whatsappUrl(viewingMessage(v)))).toEqual([ownerWhatsapp("Lyvia%20by%20Palace"), ownerWhatsapp("Valia"), ownerWhatsapp("Albero")]);
    expect(whatsappUrl(viewingMessage({ ...AI_VIEWING_SPECS[0]!, project: "Creek Haven & Co" }))).toBe(ownerWhatsapp("Creek%20Haven%20%26%20Co"));
  });
});

/** A recorded file is what its record says: fast-start H.264 1080x1920, at most 8 MB, sound only where wanted, its own poster. */
function expectEncoded(v: EncodedViewing, audio: boolean) {
  const video = join(PUBLIC, v.video), poster = join(PUBLIC, v.poster);
  expect(existsSync(video) && existsSync(poster)).toBe(true);
  expect(statSync(video).size).toBe(v.bytes);
  expect(v.bytes).toBeLessThanOrEqual(8_000_000);
  expect([v.width, v.height]).toEqual([1080, 1920]);
  expect(v.seconds).toBeGreaterThan(1);
  const { order, handlers, sizes, formats } = mp4(video);
  expect(order.indexOf("moov"), order.join(",")).toBeGreaterThanOrEqual(0);
  expect(order.indexOf("moov"), "moov before mdat (+faststart)").toBeLessThan(order.indexOf("mdat"));
  expect(formats).toEqual(["avc1"]); // H.264, which every browser plays
  expect(sizes).toEqual([[1080, 1920]]);
  expect(handlers).toContain("vide");
  expect(handlers.includes("soun")).toBe(audio);
  expect(v.audio).toBe(audio);
  expect(readFileSync(poster).subarray(0, 3)).toEqual(Buffer.from([0xff, 0xd8, 0xff]));
  expect(jpegSize(poster)).toEqual([1080, 1920]);
  expect(createHash("sha256").update(readFileSync(video)).update(readFileSync(poster)).digest("hex").slice(0, 10)).toBe(v.hash);
  expect(v.uploadDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+04:00$/);
}
/** Files in public/<dir> that no record mentions. */
function strayFiles(dir: string, records: EncodedViewing[]) {
  const path = join(PUBLIC, dir);
  const known = records.flatMap((v) => [v.video, v.poster]).map((p) => p.replace(`/${dir}/`, ""));
  return (existsSync(path) ? readdirSync(path) : []).filter((f) => !known.includes(f));
}

describe("AI viewings: the encoded files", () => {
  it("records exactly the viewings this site carries, so every one shows, in order", () => {
    for (const v of recorded) expect(AI_VIEWING_SPECS.some((s) => s.slug === v.slug), v.slug).toBe(true);
    // A spec without an encoded file drops off the page silently; this keeps Lyvia leading the homepage.
    expect(AI_VIEWINGS.map((v) => v.slug)).toEqual(AI_VIEWING_SPECS.map((s) => s.slug));
  });

  it.each(recorded.map((v) => [v.slug, v] as const))("%s is a fast-start 1080x1920 H.264 file of at most 8 MB, with its poster", (slug, v) => {
    expectEncoded(v, AI_VIEWING_SPECS.find((s) => s.slug === slug)!.audio);
  });

  it("leaves no stray files in public/videos", () => {
    expect(strayFiles("videos", recorded)).toEqual([]);
  });
});

// felicitypro.com is built on Durable and plays these copies from this site (the owner's choice, 19 Oct 2026),
// through the code in design/felicitypro-ai-viewings (scripts/felicitypro-snippets.mjs) that the owner pastes into Durable.
const FELICITY = join(process.cwd(), "design/felicitypro-ai-viewings");
const felicity = (JSON.parse(readFileSync(join(FELICITY, "videos.json"), "utf8")) as { videos: EncodedViewing[] }).videos;

describe("AI viewings: felicitypro.com's copies", () => {
  it("has Valia without sound, then Parkwood and Albero with sound", () => {
    expect(felicity.map((v) => [v.slug, v.audio])).toEqual([["valia", false], ["parkwood", true], ["albero", true]]);
  });

  it.each(felicity.map((v) => [v.slug, v] as const))("%s is a fast-start 1080x1920 H.264 file of at most 8 MB, with its poster", (slug, v) => {
    expectEncoded(v, slug !== "valia");
  });

  it("leaves no stray files in public/felicitypro", () => {
    expect(strayFiles("felicitypro", felicity)).toEqual([]);
  });

  it.each(["1-homepage-section.html", "2-ai-viewings-page.html"])("%s plays exactly these files and says what the owner asked", (file) => {
    const html = readFileSync(join(FELICITY, file), "utf8");
    const files = felicity.map((v) => [`${SITE.url}${v.video}?v=${v.hash}`, `${SITE.url}${v.poster}?v=${v.hash}`]);
    expect([...html.matchAll(/<video[^>]* src="([^"]+)" poster="([^"]+)"/g)].map((m) => [m[1], m[2]])).toEqual(files);
    for (const tag of html.match(/<video[^>]*>/g) ?? []) expect(tag).toMatch(/ muted playsinline loop preload="none" controls /);
    for (const name of ["Valia", "Parkwood", "Albero"]) expect(html).toContain(`href="${ownerWhatsapp(name)}"`);
    for (const text of [
      "Walk through it before it's built",
      "AI viewings of Dubai off-plan homes, built from the developers' own plans.",
      "Valia · Dubai Creek Harbour · Emaar",
      "Parkwood · Dubai Hills Estate · Emaar",
      "Albero · Dubai Creek Harbour · Emaar",
      "Emaar renders · AI visualisation",
      "Floor plans &amp; prices on WhatsApp",
      "Felicity Properties · RERA ORN 33951 · DLD Permit No. 0710819088",
      "Felicity Properties · RERA ORN 33951 · DLD Permit No. 1882419628",
      "Felicity Properties · RERA ORN 33951 · DLD Permit No. 1251122980",
      'href="https://www.instagram.com/felicity_properties/reels/"',
      "New viewing every Sunday and Wednesday on Instagram",
    ]) expect(html).toContain(text);
    const ld = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1]!) as { "@graph": { "@type": string; duration: string; contentUrl: string; thumbnailUrl: string[]; uploadDate: string }[] };
    expect(ld["@graph"].map((n) => [n["@type"], n.contentUrl, n.thumbnailUrl[0], n.duration, n.uploadDate])).toEqual(
      felicity.map((v, i) => ["VideoObject", files[i]![0], files[i]![1], `PT${Math.round(v.seconds)}S`, v.uploadDate]),
    );
  });

  it("gives the /ai-viewings page a video preview for links shared on social media", () => {
    const head = readFileSync(join(FELICITY, "3-ai-viewings-page-head.html"), "utf8");
    for (const v of felicity) expect(head).toContain(`<meta property="og:video" content="${SITE.url}${v.video}?v=${v.hash}">`);
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
  let pending: { reject: (e: unknown) => void } | null = null;
  let slowPlay = false;
  const played = vi.fn(), paused = vi.fn();

  beforeEach(() => {
    reduced = false;
    slowPlay = false;
    pending = null;
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
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLMediaElement) {
      played(this.muted);
      state.set(this, false);
      this.dispatchEvent(new Event("play"));
      // A slow connection: the play() promise is still pending when the next tap arrives.
      return slowPlay ? new Promise<void>((_, reject) => { pending = { reject }; }) : Promise.resolve();
    });
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (this: HTMLMediaElement) {
      paused();
      state.set(this, true);
      this.dispatchEvent(new Event("pause"));
      pending?.reject(new DOMException("The play() request was interrupted by a call to pause().", "AbortError"));
    });
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
    expect(screen.getByRole("link", { name: /Floor plans & prices on WhatsApp/ })).toHaveAttribute("href", whatsappUrl(viewingMessage(fake("valia"))));
  });

  it("puts muted and playsinline in the server-rendered page too", () => {
    const html = renderToString(<ViewingCard viewing={fake("valia")} />);
    expect(html).toMatch(/playsinline=""/i);
    expect(html).toMatch(/muted=""/);
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

  it("offers sound only where there is some, named by its visible words", () => {
    render(<><ViewingCard viewing={fake("valia")} /><ViewingCard viewing={fake("albero")} /></>);
    expect(screen.queryByRole("button", { name: /sound: the Valia/ })).toBeNull();
    const sound = screen.getByRole("button", { name: "Tap for sound: the Albero AI viewing" });
    expect(sound).toHaveTextContent("Tap for sound");
    expect(sound).not.toHaveAttribute("aria-pressed");
    fireEvent.click(sound);
    expect(screen.getByRole("button", { name: "Mute the Albero AI viewing" })).toBeInTheDocument();
  });

  it("turns sound on for one viewing at a time", () => {
    const { container } = render(<><ViewingCard viewing={fake("albero")} /><ViewingCard viewing={{ ...fake("albero"), slug: "albero-2", project: "Albero 2" }} /></>);
    const [a, b] = Array.from(container.querySelectorAll("video"));
    fireEvent.click(screen.getByRole("button", { name: "Tap for sound: the Albero AI viewing" }));
    expect(a!.muted).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Tap for sound: the Albero 2 AI viewing" }));
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

  it("keeps a pause made while the file is still loading, with the sound choice intact", async () => {
    const { container } = render(<ViewingCard viewing={fake("albero")} />);
    const video = container.querySelector("video")!;
    observe(0.3); // not yet half visible: nothing has started
    slowPlay = true;
    fireEvent.click(screen.getByRole("button", { name: "Tap for sound: the Albero AI viewing" }));
    fireEvent.click(screen.getByRole("button", { name: "Pause the Albero AI viewing" }));
    await act(async () => {});
    expect(played).toHaveBeenCalledTimes(1); // no muted replay after the interrupted load
    expect(video.paused).toBe(true);
    expect(video.muted).toBe(false);
  });

  it("treats a pause from the phone's own controls as the visitor's", () => {
    const { container } = render(<ViewingCard viewing={fake("albero")} />);
    const video = container.querySelector("video")!;
    observe(0.8);
    fireEvent.click(screen.getByRole("button", { name: "Tap for sound: the Albero AI viewing" }));
    act(() => video.pause()); // lock screen or headphone button: not the on-page control
    played.mockClear();
    observe(0);
    observe(0.8);
    expect(played).not.toHaveBeenCalled();
  });
});
