/** The site's public pages, for checking a path a browser reports (FelicityBot's page context, visit counting). */
import { PROJECTS } from "@/data/projects";
import { projectLabel } from "@/lib/format";

const NAMES: Record<string, string> = {
  "/": "Home", "/projects": "All projects", "/payment-plans": "Payment plans", "/market": "Market data",
  "/area": "The area", "/guide": "Buying guide", "/terms": "Terms", "/privacy": "Privacy",
  ...Object.fromEntries(PROJECTS.map((p) => [`/projects/${p.slug}`, projectLabel(p)])),
};

/** The page's path without a trailing slash, or null when it isn't one of the site's pages. */
export function sitePath(raw: unknown): string | null {
  if (typeof raw !== "string" || raw.length > 200) return null;
  const path = raw.length > 1 ? raw.replace(/\/+$/, "") : raw;
  // Own keys only: "constructor", "__proto__" and friends are not pages.
  return path.startsWith("/") && Object.hasOwn(NAMES, path) ? path : null;
}

/** A page's name for people ("Creek Haven", "Payment plans"). */
export const pageName = (path: string): string => (Object.hasOwn(NAMES, path) ? NAMES[path]! : String(path));
