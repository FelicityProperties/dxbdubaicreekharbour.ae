// Runs after `vite build` (package.json "build"); does something only for the Vercel build (NITRO_PRESET=vercel).
//
// Build files (/assets/…) carry their content in their names, so a browser may keep one for a year without asking
// again — as long as the file exists. nitro writes that year as a rule for every address under /assets/, applied
// before Vercel looks for the file, so a request for a build file the deployment doesn't have got the "not found"
// page with the same year on it: a page left open across a deployment, or one loaded in the minute a deployment goes
// live, asks for such a file. The browser then kept that "not found" for a year and the site's scripts stopped
// starting in it — videos, buttons and FelicityBot all dead — until its saved copies were cleared (the owner's
// Chrome, 27 Nov 2026).
//
// vite.config.ts replaces nitro's rule with an everyday one (check again every time), which the server's own answers
// under /assets/ carry. This script takes that rule off the files themselves and gives the year back to the files
// Vercel actually finds (the "hit" phase of .vercel/output/config.json): only a file that exists is kept.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const CONFIG = ".vercel/output/config.json";
const SRC = "/assets/(.*)";
export const IMMUTABLE = "public, max-age=31536000, immutable";

/** The Vercel routes with the year on /assets/ files that exist only. Throws when nitro's output isn't as expected. */
export function assetCacheRoutes(config) {
  const routes = config.routes ?? [];
  const fs = routes.findIndex((r) => r.handle === "filesystem");
  if (fs === -1) throw new Error("no filesystem phase in the Vercel routes");
  const before = routes.findIndex((r, i) => i < fs && r.src === SRC && !r.dest && r.headers?.["cache-control"]);
  if (before === -1) {
    const hitAt = routes.findIndex((r) => r.handle === "hit");
    if (hitAt !== -1 && routes.slice(hitAt + 1).some((r) => r.src === SRC && r.headers?.["cache-control"] === IMMUTABLE)) return config; // already done
    throw new Error(`no ${SRC} cache rule before the filesystem phase: nitro's output changed; check vite.config.ts and this script`);
  }
  const rule = routes[before];
  if (/immutable/.test(rule.headers["cache-control"])) {
    throw new Error(`the ${SRC} rule before the filesystem phase says "immutable": vite.config.ts's /assets/** route rule is missing`);
  }
  if (Object.keys(rule).some((k) => !["src", "headers", "continue"].includes(k)) || Object.keys(rule.headers).length !== 1) {
    throw new Error(`the ${SRC} rule before the filesystem phase does more than set cache-control: check this script`);
  }
  const rest = routes.filter((_, i) => i !== before);
  const hit = rest.findIndex((r) => r.handle === "hit");
  const year = { src: SRC, headers: { "cache-control": IMMUTABLE }, continue: true, important: true };
  return { ...config, routes: hit === -1 ? [...rest, { handle: "hit" }, year] : [...rest.slice(0, hit + 1), year, ...rest.slice(hit + 1)] };
}

function main() {
  // Vercel's build command names the preset (vercel.json); nitro also picks it by itself on Vercel. Local node builds
  // and Lovable's own builds write no Vercel config (a stale one from an earlier local Vercel build is left alone).
  const vercel = process.env.NITRO_PRESET ? process.env.NITRO_PRESET === "vercel" : process.env.VERCEL === "1";
  if (!vercel) return;
  if (!existsSync(CONFIG)) throw new Error(`${CONFIG} is missing after a Vercel build`);
  const config = JSON.parse(readFileSync(CONFIG, "utf8"));
  writeFileSync(CONFIG, `${JSON.stringify(assetCacheRoutes(config), null, 2)}\n`);
  console.log("vercel-asset-cache: /assets/ files that exist are kept a year; an address with no file is checked again every time");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
