import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { PROJECTS, DISTRICT } from "@/data/projects";
import { TX } from "@/data/transactions";

const PUBLIC = join(process.cwd(), "public");

// The data files are generated; these checks catch a regeneration that drifts
// from the pages that read it.
describe("Project data", () => {
  it("has unique slugs and a cover image for every project", () => {
    const slugs = PROJECTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const p of PROJECTS) expect(p.images.length, p.slug).toBeGreaterThan(0);
  });

  it("ships every image variant it references", () => {
    const images = [...PROJECTS.flatMap((p) => p.images), ...Object.values(DISTRICT.images)];
    for (const img of images) {
      for (const w of img.widths) expect(existsSync(join(PUBLIC, `${img.base}-${w}.webp`)), `${img.base}-${w}.webp`).toBe(true);
    }
    for (const p of PROJECTS) if (p.ogImage) expect(existsSync(join(PUBLIC, p.ogImage)), p.ogImage).toBe(true);
  });

  it("carries the dates its figures were checked", () => {
    expect(TX.source.coverage).toMatch(/\d{4}/);
    expect(TX.source.snapshotDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("Registered transactions", () => {
  it("only point at projects the site has pages for", () => {
    const slugs = new Set(PROJECTS.map((p) => p.slug));
    const refs = [...TX.sales, ...TX.rentals, ...TX.byBuilding.sales, ...TX.byBuilding.rentals].map((r) => r.project).filter((s): s is string => s !== null);
    for (const s of refs) expect(slugs.has(s), s).toBe(true);
  });

  it("hold both ready and off-plan sales, and tenancy contracts", () => {
    expect(TX.sales.some((s) => s.basis === "ready")).toBe(true);
    expect(TX.sales.some((s) => s.basis === "offplan")).toBe(true);
    expect(TX.rentals.length).toBeGreaterThan(0);
    expect(TX.sales.every((s) => s.kind !== "" && /^\d{4}-\d{2}-\d{2}$/.test(s.date))).toBe(true);
  });
});
