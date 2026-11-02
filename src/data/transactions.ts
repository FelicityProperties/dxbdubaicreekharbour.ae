/**
 * Registered Dubai Land Department sales and tenancy contracts for Dubai Creek
 * Harbour. transactions.json is a committed snapshot of Dubai Land Department
 * registration records, produced by scratchpad tooling — never edit the
 * figures by hand; re-run the snapshot instead. The site credits the Dubai
 * Land Department, whose records these are, and this file carries no other
 * supplier name or link. Every number shown on the site comes from this file
 * or from Emaar's pages (projects.ts).
 */
import raw from "./transactions.json";
import { dateLong, monthYear } from "@/lib/format";
import { tFor, type T } from "@/i18n/messages";

/** English, for code outside a page (FelicityBot's knowledge, tests): windowLabel() and coverageLabel() default to it. */
const EN = tFor("en");

export type Basis = "ready" | "offplan";
export type SaleRow = {
  date: string;
  building: string;
  project: string | null;
  floor: string | null;
  bedrooms: string | null;
  sizeSqft: number | null;
  price: number | null;
  psf: number | null;
  basis: Basis;
  kind: string;
  tier: string | null;
};
export type RentRow = {
  registered: string;
  start: string;
  end: string;
  building: string;
  project: string | null;
  bedrooms: string | null;
  sizeSqft: number | null;
  annualRent: number | null;
  rentPsf: number | null;
  newContract: boolean;
};
export type BuildingSales = { building: string; project: string | null; basis: Basis; count: number; medianPsf: number | null; p25Psf: number | null; p75Psf: number | null; medianPrice: number | null };
export type BuildingRentals = { building: string; project: string | null; count: number; medianRent: number | null; p25Rent: number | null; p75Rent: number | null; medianRentPsf: number | null };
export type Transactions = {
  source: { name: string; basis: string; coverage: string; snapshotDate: string; filters: string };
  window: { from: string; to: string; label: string };
  recent: {
    readySales: { count: number; from: string; to: string };
    offplanSales: { count: number; from: string; to: string };
    rentals: { count: number; from: string; to: string; newContracts: number };
  };
  summary: {
    sales: { basis: Basis; count: number; medianPsf: number | null; p25Psf: number | null; p75Psf: number | null; medianPrice: number | null; totalValue: number | null }[];
    salesByBedroom: { basis: Basis; bedrooms: string; count: number; medianPsf: number | null; medianPrice: number | null; p25Price: number | null; p75Price: number | null; medianSizeSqft: number | null }[];
    rentalsByBedroom: { bedrooms: string; count: number; medianRent: number | null; p25Rent: number | null; p75Rent: number | null; medianRentPsf: number | null; medianSizeSqft: number | null }[];
    rentalsNewVsRenewal: { newContract: boolean; count: number; medianRent: number | null; medianRentPsf: number | null }[];
  };
  byBuilding: { sales: BuildingSales[]; rentals: BuildingRentals[] };
  sales: SaleRow[];
  rentals: RentRow[];
};

export const TX = raw as unknown as Transactions;
/** The latest registration date among the recent-row tables (the 12-month summaries stop at TX.window.to; rows run past it). */
export const LATEST_ROW = [TX.recent.readySales.to, TX.recent.offplanSales.to, TX.recent.rentals.to].reduce((a, b) => (a > b ? a : b));

/**
 * The 12-month window ("12 months to 31 October 2026") in the page's language, rebuilt from the window's end date so a
 * data refresh needs no new translation (src/i18n/README.md, "Text that changes with the data"). In English it is
 * exactly TX.window.label.
 */
export const windowLabel = (t: T = EN): string => t("12 months to {date}", { date: dateLong(TX.window.to, t.locale) });

/**
 * "DLD registrations loaded through October 2026" in the page's language, rebuilt from the month the snapshot's
 * coverage line names. In English it is exactly TX.source.coverage; a line in any other wording comes back unchanged.
 */
export function coverageLabel(t: T = EN): string {
  const m = /^DLD registrations loaded through ([A-Z][a-z]+) (\d{4})$/.exec(TX.source.coverage);
  const month = m && Array.from({ length: 12 }, (_, i) => `${m[2]}-${String(i + 1).padStart(2, "0")}`).find((ym) => monthYear(ym) === `${m[1]} ${m[2]}`);
  return month ? t("DLD registrations loaded through {month}", { month: monthYear(month, t.locale) }) : TX.source.coverage;
}

/** The placeholder the snapshot puts where the register has not yet named a building ("New launch — building not yet named in the register"): unlike real building names, it is translated. */
export const UNASSIGNED = /not yet named/;

export const salesFor = (slug: string) => TX.sales.filter((s) => s.project === slug);
export const rentalsFor = (slug: string) => TX.rentals.filter((r) => r.project === slug);
export const buildingsFor = (slug: string) => ({
  sales: TX.byBuilding.sales.filter((b) => b.project === slug),
  rentals: TX.byBuilding.rentals.filter((b) => b.project === slug),
});
/** Registered sales in the 12-month window across a project's towers (counts add up; medians do not). */
export const salesCount12m = (slug: string) => buildingsFor(slug).sales.reduce((n, b) => n + b.count, 0);
export const rentalsCount12m = (slug: string) => buildingsFor(slug).rentals.reduce((n, b) => n + b.count, 0);
