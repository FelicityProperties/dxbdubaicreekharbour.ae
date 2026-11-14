/**
 * Search-result helpers: title and description length rules, the brokerage
 * entity (every fact here is printed in the footer) and breadcrumbs. Titles
 * stay within ~60 characters and descriptions within ~160 so Google shows
 * them whole; the site name is not appended because Google shows it anyway.
 */
import { SITE, type Project } from "@/data/projects";
import { projectLabel } from "@/lib/format";
import { LOCALES, LOCALE_META, localizePath, type Locale } from "@/i18n/locales";
import { tFor, type T } from "@/i18n/messages";

/** English, for callers outside a page (tests, FelicityBot): projectTitle() and projectDescription() default to it. */
const EN = tFor("en");

export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 160;
/** Chinese characters are about twice as wide in search results, so a Chinese title or description holds half as many. */
export const titleMax = (locale: Locale = "en") => (locale === "zh" ? 30 : TITLE_MAX);
export const descriptionMax = (locale: Locale = "en") => (locale === "zh" ? 80 : DESCRIPTION_MAX);

/** The first candidate that fits, else the last (shortest) one. */
export const fitTitle = (...candidates: string[]): string => candidates.find((t) => t.length <= TITLE_MAX) ?? candidates[candidates.length - 1]!;
/** fitTitle for a page in that language. */
export const fitTitleFor = (locale: Locale, ...candidates: string[]): string => candidates.find((t) => t.length <= titleMax(locale)) ?? candidates[candidates.length - 1]!;

/** The full address of a page in a language: "/projects" in Arabic → "https://www…/ar/projects"; the English home page is the bare site address. */
export const pageUrl = (path: string, locale: Locale = "en"): string => {
  const p = localizePath(path, locale);
  return p === "/" ? SITE.url : `${SITE.url}${p}`;
};

/**
 * Everything a page's head needs to be found and shared in its language: title, description, the address
 * search engines should index (canonical), the same page in the other languages (hreflang), and the
 * preview image. Every route head uses this, so no page can forget the other languages.
 */
export function pageHead({ locale, path, title, description, shareDescription, image = `${SITE.url}/og-image.png`, largeCard = true }: { locale: Locale; path: string; title: string; description: string; shareDescription?: string; image?: string; largeCard?: boolean }) {
  const url = pageUrl(path, locale);
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: shareDescription ?? description },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: LOCALE_META[locale].ogLocale },
      // Always sent: a page without its own would keep the root route's large card.
      { name: "twitter:card", content: largeCard ? "summary_large_image" : "summary" },
      { property: "og:image", content: image },
      { name: "twitter:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:url", content: url },
    ],
    links: [
      { rel: "canonical", href: url },
      ...LOCALES.map((l) => ({ rel: "alternate", hrefLang: LOCALE_META[l].hreflang, href: pageUrl(path, l) })),
      { rel: "alternate", hrefLang: "x-default", href: pageUrl(path, "en") },
    ],
  };
}

/** Whole sentences, in order, until the next one would pass the limit. */
export function fitDescription(parts: (string | null | undefined | false)[], max = DESCRIPTION_MAX): string {
  let out = "";
  for (const part of parts) {
    if (!part) continue;
    // Chinese sentences run on after their full-width stop ("。"); every other language takes a space.
    const next = out ? `${out}${/[。！？]$/.test(out) ? "" : " "}${part}` : part;
    if (next.length > max) continue;
    out = next;
  }
  return out;
}

export const ORG_ID = `${SITE.url}/#organization`;
export const WEBSITE_ID = `${SITE.url}/#website`;

/** One JSON-LD script per page; every node in one @graph so @id references resolve. */
export const ldScript = (graph: object[]) => ({ type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }) });

/** Breadcrumbs for a page in a language: pass the names already translated and the paths without a language prefix. */
export const breadcrumbNode = (trail: [name: string, path: string][], locale: Locale = "en") => ({
  "@type": "BreadcrumbList",
  itemListElement: trail.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: `${SITE.url}${localizePath(path, locale)}` })),
});

/** The brokerage, with its readable labels in the language of t (English by default). */
export const organizationNode = (t: T = EN) => ({
  "@type": "RealEstateAgent",
  "@id": ORG_ID,
  name: SITE.company,
  legalName: SITE.company,
  alternateName: SITE.name,
  url: SITE.url,
  logo: `${SITE.url}/icon-512.png`,
  image: `${SITE.url}/og-image.png`,
  telephone: `+${SITE.whatsapp}`,
  email: SITE.email,
  address: { "@type": "PostalAddress", streetAddress: SITE.address.replace(/\s*[-,]\s*Dubai$/, ""), addressLocality: "Dubai", addressCountry: "AE" },
  areaServed: { "@type": "Place", name: t("Dubai Creek Harbour, Dubai") },
  identifier: [
    { "@type": "PropertyValue", propertyID: "RERA ORN", value: SITE.reraOrn },
    { "@type": "PropertyValue", propertyID: "Dubai trade licence", value: SITE.tradeLicence },
  ],
  ...(SITE.profiles.length ? { sameAs: SITE.profiles } : {}),
  employee: { "@type": "Person", name: SITE.broker, jobTitle: t("Real estate broker"), identifier: { "@type": "PropertyValue", propertyID: "RERA BRN", value: SITE.brokerBrn } },
});

/**
 * The site, as seen in the page's language (inLanguage is that page's language: "en" on English pages). The domain
 * (SITE.url without "https://www.") is the alternate name: Google shows the site's name above each result and falls
 * back to an alternate when it cannot use the first.
 */
export const websiteNode = (locale: Locale = "en") => ({ "@type": "WebSite", "@id": WEBSITE_ID, name: SITE.name, alternateName: new URL(SITE.url).hostname.replace(/^www\./, ""), url: SITE.url, inLanguage: LOCALE_META[locale].hreflang, publisher: { "@id": ORG_ID } });

const bedroomsText = (p: Project, t: T) => (p.bedrooms.includes("bedroom") ? t(p.bedrooms) : t("{range} bedrooms", { range: p.bedrooms }));

/**
 * "Creek Haven by Emaar, Dubai Creek Harbour: Price & Payment Plan", shortened until it fits — in the language of
 * t (English by default). Each candidate is one whole title template; the project name is never translated.
 */
export function projectTitle(p: Project, t: T = EN): string {
  const name = projectLabel(p);
  const inName = /dubai creek harbour/i.test(p.name);
  const tail = p.paymentPlan ? t("Price & Payment Plan") : p.status === "Ready" ? t("Sales & Rents") : t("Prices & Availability");
  const tail2 = p.status === "Ready" && !p.paymentPlan ? t("DLD Sales & Rents") : p.paymentPlan ? t("Emaar Price & Payment Plan") : t("Emaar Prices & Availability");
  const byEmaar = (topic: string) => (inName ? t("{name} by Emaar: {topic}", { name, topic }) : t("{name} by Emaar, Dubai Creek Harbour: {topic}", { name, topic }));
  const plain = (topic: string) => (inName ? t("{name}: {topic}", { name, topic }) : t("{name}, Dubai Creek Harbour: {topic}", { name, topic }));
  return fitTitleFor(t.locale, byEmaar(tail), plain(tail2), plain(tail), t("{name} by Emaar: {topic}", { name, topic: tail }), t("{name}: {topic}", { name, topic: tail }), t("{name}: {topic}", { name, topic: t("Emaar Prices") }), name);
}

/**
 * Emaar's starting price first (what buyers search for), then the plan split and handover. `handover` is
 * handoverText(p, t) in the same language as t.
 */
export function projectDescription(p: Project, handover: string, t: T = EN): string {
  const name = projectLabel(p);
  const intro = /dubai creek harbour/i.test(p.name) ? t("{name} by Emaar.", { name })
    : p.district ? t("{name} by Emaar in Dubai Creek Harbour ({district}).", { name, district: t(p.district) })
    : t("{name} by Emaar in Dubai Creek Harbour.", { name });
  const price = p.startingPrice
    ? p.status === "Now selling" ? t("From {price}, Emaar's starting price.", { price: p.startingPrice }) : t("Launched from {price}; resale prices on request.", { price: p.startingPrice })
    : p.pricesFrom ? t("Listed units from {price}.", { price: p.pricesFrom }) : t("Price on request.");
  const plan = p.paymentPlan ? t("{split} payment plan.", { split: p.paymentPlan.steps.map((s) => s.percent).join("/") }) : null;
  const when = /on request/.test(handover) || handover === t("Construction status on request") ? null : t("{text}.", { text: handover });
  return fitDescription([intro, price, t("{text}.", { text: bedroomsText(p, t) }), plan, when, p.isNewLaunch ? null : p.construction === "under_construction" ? t("Registered sales.") : t("Registered sales and rents."), t("Enquire on WhatsApp.")], descriptionMax(t.locale));
}
