/**
 * The site's languages. English lives at the bare paths (/projects); Arabic and
 * Simplified Chinese at /ar/… and /zh/…. The router maps the prefixed address
 * onto the same page (src/router.tsx) and adds the prefix back to every link.
 */
export const LOCALES = ["en", "ar", "zh"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_META: Record<Locale, { htmlLang: string; hreflang: string; dir: "ltr" | "rtl"; label: string; english: string; ogLocale: string }> = {
  en: { htmlLang: "en", hreflang: "en", dir: "ltr", label: "English", english: "English", ogLocale: "en_GB" },
  ar: { htmlLang: "ar", hreflang: "ar", dir: "rtl", label: "العربية", english: "Arabic", ogLocale: "ar_AE" },
  zh: { htmlLang: "zh-Hans", hreflang: "zh-Hans", dir: "ltr", label: "中文", english: "Chinese", ogLocale: "zh_CN" },
};

/** Paths that exist in English only: the private enquiries page and the server's own endpoints. */
const ENGLISH_ONLY = /^\/(leads|api|_server|_serverFn)(\/|$)/;

/** "/zh/projects" → { locale: "zh", path: "/projects" }; anything without a language prefix is English. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const m = /^\/(ar|zh)(?=\/|$)/.exec(pathname);
  if (!m) return { locale: "en", path: pathname };
  const path = pathname.slice(m[0].length) || "/";
  if (ENGLISH_ONLY.test(path)) return { locale: "en", path: pathname };
  return { locale: m[1] as Locale, path };
}

/** "/projects" in Chinese → "/zh/projects"; the home page is "/zh". Hashes and queries pass through. */
export function localizePath(path: string, locale: Locale): string {
  if (locale === "en" || !path.startsWith("/") || ENGLISH_ONLY.test(path)) return path;
  return path === "/" || /^\/[?#]/.test(path) ? `/${locale}${path.slice(1)}` : `/${locale}${path}`;
}

/** The language of an address as the browser shows it ("/ar/guide#faq" → "ar"). */
export const localeFromHref = (href: string | undefined): Locale => splitLocale((href ?? "/").split(/[?#]/)[0] || "/").locale;

/**
 * A short Latin label ("4+", "AED 5M+") inside Arabic text: without isolation the "+" jumps to the wrong
 * side in right-to-left reading. Other languages get the label unchanged.
 */
export const ltrLabel = (s: string, locale: Locale): string => (locale === "ar" ? `\u2066${s}\u2069` : s);

export const isLocale = (v: unknown): v is Locale => typeof v === "string" && (LOCALES as readonly string[]).includes(v);
