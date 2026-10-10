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

export const salesFor = (slug: string) => TX.sales.filter((s) => s.project === slug);
export const rentalsFor = (slug: string) => TX.rentals.filter((r) => r.project === slug);
export const buildingsFor = (slug: string) => ({
  sales: TX.byBuilding.sales.filter((b) => b.project === slug),
  rentals: TX.byBuilding.rentals.filter((b) => b.project === slug),
});
/** Registered sales in the 12-month window across a project's towers (counts add up; medians do not). */
export const salesCount12m = (slug: string) => buildingsFor(slug).sales.reduce((n, b) => n + b.count, 0);
export const rentalsCount12m = (slug: string) => buildingsFor(slug).rentals.reduce((n, b) => n + b.count, 0);
