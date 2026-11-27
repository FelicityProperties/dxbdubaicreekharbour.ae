/**
 * The self-repair script in every page's head (src/lib/self-repair.ts). It runs here against a stand-in page: the
 * browser features it uses are replaced by stubs that record what it does.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { SELF_REPAIR_SCRIPT } from "@/lib/self-repair";

const ORIGIN = "https://www.dxbdubaicreekharbour.ae";
const ENTRY = `${ORIGIN}/assets/index-A1.js`;
const STYLES = `${ORIGIN}/assets/styles-B2.css`;

type Options = { files?: string[]; timings?: { name: string; responseStatus: number }[]; logoWidth?: number; online?: boolean; storage?: boolean };

function page({ files = [ENTRY, STYLES, `${ORIGIN}/fonts/inter-latin.woff2`, "https://example.com/assets/x.js"], timings = [], logoWidth = 40, online = true, storage = true }: Options = {}) {
  const listeners: Record<string, ((e: unknown) => void)[]> = {};
  const saved = new Map<string, string>();
  const fetched: { url: string; cache: string | undefined }[] = [];
  const done = { unregistered: 0, cachesDeleted: [] as string[], reloads: 0 };
  const elements = files.map((u) => (u.endsWith(".css") || u.endsWith(".woff2") ? { tagName: "LINK", href: u, src: "" } : { tagName: "SCRIPT", src: u, href: "" }));
  const stubs = {
    window: {} as Record<string, unknown>,
    document: { querySelectorAll: () => elements, querySelector: () => ({ getBoundingClientRect: () => ({ width: logoWidth }) }) },
    location: { href: `${ORIGIN}/`, origin: ORIGIN, reload: () => void done.reloads++ },
    navigator: { onLine: online, serviceWorker: { getRegistrations: async () => [{ unregister: async () => void done.unregistered++ }] } },
    sessionStorage: storage
      ? { getItem: (k: string) => saved.get(k) ?? null, setItem: (k: string, v: string) => void saved.set(k, v) }
      : { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } },
    caches: { keys: async () => ["static-2026-11-08", "pages-2026-11-08"], delete: async (n: string) => void done.cachesDeleted.push(n) },
    fetch: async (url: string, init?: { cache?: string }) => void fetched.push({ url, cache: init?.cache }),
    performance: { getEntriesByType: () => timings },
    addEventListener: (type: string, fn: (e: unknown) => void) => void (listeners[type] ??= []).push(fn),
  };
  stubs.window["caches"] = stubs.caches;
  new Function(...Object.keys(stubs), SELF_REPAIR_SCRIPT)(...Object.values(stubs));
  return {
    done,
    fetched,
    fire: (type: "error" | "load", target?: { tagName: string; src?: string; href?: string }) => listeners[type]?.forEach((fn) => fn({ target })),
    settle: () => new Promise((r) => setTimeout(r, 10)),
  };
}

describe("self-repair (a build file that fails to load)", () => {
  it("fetches every build file again past the saved copies, clears the service worker's store, and reloads once", async () => {
    const p = page();
    p.fire("error", { tagName: "SCRIPT", src: ENTRY });
    await p.settle();
    expect(p.fetched).toEqual([{ url: ENTRY, cache: "reload" }, { url: STYLES, cache: "reload" }]);
    expect(p.done).toEqual({ unregistered: 1, cachesDeleted: ["static-2026-11-08", "pages-2026-11-08"], reloads: 1 });
    // Once per tab: a second failure (the reload didn't help) changes nothing, so it can never loop.
    p.fire("error", { tagName: "LINK", href: STYLES });
    p.fire("load");
    await p.settle();
    expect(p.done.reloads).toBe(1);
    expect(p.fetched).toHaveLength(2);
  });

  it("also repairs an error answer recorded before it ran, and a page with its design missing", async () => {
    for (const p of [page({ timings: [{ name: ENTRY, responseStatus: 404 }] }), page({ logoWidth: 390 })]) {
      p.fire("load");
      await p.settle();
      expect(p.done.reloads).toBe(1);
      expect(p.fetched.map((f) => f.url)).toEqual([ENTRY, STYLES]);
    }
  });

  it("does nothing on a healthy page, for files that aren't build files, offline, or without storage for its flag", async () => {
    const healthy = page({ timings: [{ name: ENTRY, responseStatus: 200 }, { name: `${ORIGIN}/img/x.webp`, responseStatus: 404 }] });
    healthy.fire("error", { tagName: "IMG", src: `${ORIGIN}/assets/photo.png` });
    healthy.fire("error", { tagName: "LINK", href: `${ORIGIN}/fonts/inter-latin.woff2` });
    healthy.fire("error", { tagName: "SCRIPT", src: "https://example.com/assets/x.js" });
    healthy.fire("load");
    const offline = page({ online: false });
    offline.fire("error", { tagName: "SCRIPT", src: ENTRY });
    const noStorage = page({ storage: false });
    noStorage.fire("error", { tagName: "SCRIPT", src: ENTRY });
    await healthy.settle();
    for (const p of [healthy, offline, noStorage]) {
      expect(p.done.reloads).toBe(0);
      expect(p.fetched).toEqual([]);
    }
  });
});

describe("scripts/vercel-asset-cache.mjs (after the Vercel build)", () => {
  const script = resolve("scripts/vercel-asset-cache.mjs");
  const routesFromNitro = [
    { src: "/(.*)", headers: { "X-Frame-Options": "SAMEORIGIN" }, continue: true },
    { src: "/assets/(.*)", headers: { "cache-control": "public, max-age=0, must-revalidate" } },
    { handle: "filesystem" },
    { src: "/(.*)", dest: "/__server" },
  ];
  const run = (routes: unknown[], env: Record<string, string> = { NITRO_PRESET: "vercel" }) => {
    const dir = mkdtempSync(join(tmpdir(), "vac-"));
    mkdirSync(join(dir, ".vercel/output"), { recursive: true });
    const file = join(dir, ".vercel/output/config.json");
    writeFileSync(file, JSON.stringify({ version: 3, routes }));
    execFileSync(process.execPath, [script], { cwd: dir, env: { PATH: process.env["PATH"] ?? "", ...env }, stdio: "pipe" });
    return (JSON.parse(readFileSync(file, "utf8")) as { routes: unknown[] }).routes;
  };

  it("keeps only the files Vercel finds for a year; an address with no file is checked again every time", () => {
    const routes = run(routesFromNitro);
    expect(routes).toEqual([
      routesFromNitro[0],
      { handle: "filesystem" },
      { src: "/(.*)", dest: "/__server" },
      { handle: "hit" },
      { src: "/assets/(.*)", headers: { "cache-control": "public, max-age=31536000, immutable" }, continue: true, important: true },
    ]);
    expect(run(routes)).toEqual(routes); // running it again changes nothing
  });

  it("stops the build if the year is back on every /assets/ answer, and leaves other builds alone", () => {
    const year = routesFromNitro.map((r) => (r.src === "/assets/(.*)" ? { ...r, headers: { "cache-control": "public, max-age=31536000, immutable" } } : r));
    expect(() => run(year)).toThrow();
    expect(run(year, { NITRO_PRESET: "node-server" })).toEqual(year);
  });
});
