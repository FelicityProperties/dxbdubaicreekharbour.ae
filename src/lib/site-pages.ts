/** The site's public pages, for checking a path a browser reports (FelicityBot's page context, visit counting). */
import { PROJECTS } from "@/data/projects";
import { projectLabel } from "@/lib/format";
import { LOCALE_META, splitLocale } from "@/i18n/locales";

const NAMES: Record<string, string> = {
  "/": "Home", "/projects": "All projects", "/payment-plans": "Payment plans", "/market": "Market data",
  "/area": "The area", "/guide": "Buying guide", "/terms": "Terms", "/privacy": "Privacy",
  ...Object.fromEntries(PROJECTS.map((p) => [`/projects/${p.slug}`, projectLabel(p)])),
};

/**
 * The page's path without a trailing slash, or null when it isn't one of the site's pages. The Arabic and
 * Chinese versions keep their prefix ("/ar/projects"), so visit counts and enquiries show the language.
 */
export function sitePath(raw: unknown): string | null {
  if (typeof raw !== "string" || raw.length > 200) return null;
  const path = raw.length > 1 ? raw.replace(/\/+$/, "") : raw;
  // Own keys only: "constructor", "__proto__" and friends are not pages.
  return path.startsWith("/") && Object.hasOwn(NAMES, splitLocale(path).path) ? path : null;
}

/** The page without its language: "/ar/projects" → "/projects". */
export const basePath = (path: string): string => splitLocale(path).path;

/** A page's name for people ("Creek Haven", "Payment plans", "Payment plans · Arabic"). */
export const pageName = (path: string): string => {
  const { locale, path: base } = splitLocale(String(path));
  if (!Object.hasOwn(NAMES, base)) return String(path);
  return locale === "en" ? NAMES[base]! : `${NAMES[base]!} · ${LOCALE_META[locale].english}`;
};
