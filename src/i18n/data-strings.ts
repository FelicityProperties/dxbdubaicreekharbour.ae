/**
 * Every piece of English the data files hold that a page can show, so the translation check knows what must be
 * translated. A page shows data text with t(value) — t(project.overview), t(place.title) — and the same text is a
 * key here. Names stay as they are and are left out: project and building names, brands, the company, people,
 * addresses of web pages, dates written as numbers, prices ("AED 1.96M"), enums the code turns into words.
 *
 * Text that changes with every data refresh (the 12-month window, the "loaded through" line, the DLD figures card)
 * is not a key: the page builds it from a template and the numbers (src/i18n/README.md, "Text that changes with the
 * data").
 */
import { PROJECTS, DISTRICT, GUIDE, COSTS, FAQ, SITE } from "@/data/projects";
import { BENEFITS } from "@/data/benefits";
import { BUSINESS_DISTRICT } from "@/data/business-district";
import { TERMS, PRIVACY } from "@/data/legal";
import { TX, UNASSIGNED } from "@/data/transactions";

/** Keys never shown as prose, or shown exactly as they are in every language. */
const SKIP = new Set(["slug", "name", "brand", "status", "construction", "startingPrice", "pricesFrom", "emaarUrl", "brochureUrl", "floorPlanUrl", "ogImage", "base", "source", "sources", "sourceUrl", "placesSource", "overseasSource", "driveTimesSource", "image", "kind", "lastUpdated", "date", "text"]);
const URLISH = /^(https?:|\/|#)|^[\d\s.,:%–—-]*$|^\d{4}-\d{2}(-\d{2})?$|^AED [\d.,]+[MK]?$/;

function walk(value: unknown, into: Set<string>, key = ""): void {
  if (SKIP.has(key)) return;
  if (typeof value === "string") {
    if (/[A-Za-z]/.test(value) && !URLISH.test(value.trim())) into.add(value);
    return;
  }
  if (Array.isArray(value)) { for (const v of value) walk(v, into, key); return; }
  if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) walk(v, into, k);
}

/** Text from the project, area, guide, cost, FAQ and benefit data (the "data" dictionary). */
export function dataStrings(): string[] {
  const out = new Set<string>();
  for (const p of PROJECTS) {
    walk(p, out);
    if (p.handover) out.add(p.handover.note);
  }
  walk({ ...DISTRICT, images: Object.values(DISTRICT.images).map((i) => ({ caption: i.caption })) }, out);
  walk(GUIDE, out);
  walk(COSTS, out);
  walk(FAQ, out);
  walk(BUSINESS_DISTRICT, out); // its image is skipped as a whole: only the caption is text
  out.add(BUSINESS_DISTRICT.image.caption);
  // The DLD figures card is rebuilt from the snapshot on every refresh: it is translated as a template instead.
  walk(BENEFITS.map((b) => (b.kind === "dld-snapshot" ? { title: b.title } : b)), out);
  for (const v of [SITE.licence, SITE.address, SITE.constructionSource]) if (v) out.add(v);
  for (const v of txStrings()) out.add(v);
  return [...out].sort();
}

/**
 * The stable text of the DLD snapshot (transactions.json): its source lines, the bedroom labels ("1 Bed"), the sale
 * types ("Resale") and the placeholder for a building the register has not named yet. Building names stay as they
 * are; the window label and the coverage line are templates (windowLabel, coverageLabel in transactions.ts); basis
 * and new/renewal are enums the code turns into words; the price tier is not shown.
 */
export function txStrings(): string[] {
  const out = new Set<string>();
  for (const v of [TX.source.name, TX.source.basis, TX.source.filters]) if (v) out.add(v);
  for (const r of [...TX.sales, ...TX.rentals, ...TX.summary.salesByBedroom, ...TX.summary.rentalsByBedroom]) if (r.bedrooms) out.add(r.bedrooms);
  for (const r of TX.sales) if (r.kind) out.add(r.kind);
  for (const b of [...TX.sales, ...TX.rentals, ...TX.byBuilding.sales, ...TX.byBuilding.rentals]) if (UNASSIGNED.test(b.building)) out.add(b.building);
  return [...out].sort();
}

/** The Terms of Use and Privacy Notice (the "legal" dictionary). */
export function legalStrings(): string[] {
  const out = new Set<string>();
  walk(TERMS, out);
  walk(PRIVACY, out);
  return [...out].sort();
}
