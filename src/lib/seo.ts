/**
 * Search-result helpers: title and description length rules, the brokerage
 * entity (every fact here is printed in the footer) and breadcrumbs. Titles
 * stay within ~60 characters and descriptions within ~160 so Google shows
 * them whole; the site name is not appended because Google shows it anyway.
 */
import { SITE, type Project } from "@/data/projects";
import { projectLabel } from "@/lib/format";

export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 160;

/** The first candidate that fits, else the last (shortest) one. */
export const fitTitle = (...candidates: string[]): string => candidates.find((t) => t.length <= TITLE_MAX) ?? candidates[candidates.length - 1]!;

/** Whole sentences, in order, until the next one would pass the limit. */
export function fitDescription(parts: (string | null | undefined | false)[], max = DESCRIPTION_MAX): string {
  let out = "";
  for (const part of parts) {
    if (!part) continue;
    const next = out ? `${out} ${part}` : part;
    if (next.length > max) continue;
    out = next;
  }
  return out;
}

export const ORG_ID = `${SITE.url}/#organization`;
export const WEBSITE_ID = `${SITE.url}/#website`;

/** One JSON-LD script per page; every node in one @graph so @id references resolve. */
export const ldScript = (graph: object[]) => ({ type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }) });

export const breadcrumbNode = (trail: [name: string, path: string][]) => ({
  "@type": "BreadcrumbList",
  itemListElement: trail.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: `${SITE.url}${path}` })),
});

export const organizationNode = () => ({
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
  areaServed: { "@type": "Place", name: "Dubai Creek Harbour, Dubai" },
  identifier: [
    { "@type": "PropertyValue", propertyID: "RERA ORN", value: SITE.reraOrn },
    { "@type": "PropertyValue", propertyID: "Dubai trade licence", value: SITE.tradeLicence },
  ],
  employee: { "@type": "Person", name: SITE.broker, jobTitle: "Real estate broker", identifier: { "@type": "PropertyValue", propertyID: "RERA BRN", value: SITE.brokerBrn } },
});

export const websiteNode = () => ({ "@type": "WebSite", "@id": WEBSITE_ID, name: SITE.name, url: SITE.url, inLanguage: "en", publisher: { "@id": ORG_ID } });

const bedroomsText = (p: Project) => (p.bedrooms.includes("bedroom") ? p.bedrooms : `${p.bedrooms} bedrooms`);

/** "Creek Haven by Emaar, Dubai Creek Harbour: Price & Payment Plan", shortened until it fits. */
export function projectTitle(p: Project): string {
  const label = projectLabel(p);
  const loc = /dubai creek harbour/i.test(p.name) ? "" : ", Dubai Creek Harbour";
  const tail = p.paymentPlan ? "Price & Payment Plan" : p.status === "Ready" ? "Sales & Rents" : "Prices & Availability";
  const tail2 = p.status === "Ready" && !p.paymentPlan ? "DLD Sales & Rents" : `Emaar ${tail}`;
  return fitTitle(`${label} by Emaar${loc}: ${tail}`, `${label}${loc}: ${tail2}`, `${label}${loc}: ${tail}`, `${label} by Emaar: ${tail}`, `${label}: ${tail}`, `${label}: Emaar Prices`, label);
}

/** Emaar's starting price first (what buyers search for), then the plan split and handover. */
export function projectDescription(p: Project, handover: string): string {
  const label = projectLabel(p);
  const where = /dubai creek harbour/i.test(p.name) ? "" : ` in Dubai Creek Harbour${p.district ? ` (${p.district})` : ""}`;
  const price = p.startingPrice
    ? p.status === "Now selling" ? `From ${p.startingPrice}, Emaar's starting price.` : `Launched from ${p.startingPrice}; resale prices on request.`
    : p.pricesFrom ? `Listed units from ${p.pricesFrom}.` : "Price on request.";
  const plan = p.paymentPlan ? `${p.paymentPlan.steps.map((s) => s.percent).join("/")} payment plan.` : null;
  const when = /on request/.test(handover) ? null : `${handover}.`;
  return fitDescription([`${label} by Emaar${where}.`, price, `${bedroomsText(p)}.`, plan, when, p.isNewLaunch ? null : "Registered sales and rents.", "Enquire on WhatsApp."]);
}
