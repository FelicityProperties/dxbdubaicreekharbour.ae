import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { PROJECTS, DISTRICT } from "@/data/projects";
import { BENEFITS } from "@/data/benefits";
import { TX, LATEST_ROW } from "@/data/transactions";
import { projectLabel } from "@/lib/format";
import { DESCRIPTION_MAX, TITLE_MAX, projectDescription, projectTitle } from "@/lib/seo";
import { handoverText } from "@/components/showcase/shared";
import sources from "../../design/benefits-sources.json";

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

  it("never doubles a brand in a project label", () => {
    for (const p of PROJECTS) expect(projectLabel(p), p.slug).not.toMatch(/\bby (\S+) by \1\b/i);
    expect(PROJECTS.map(projectLabel)).toContain("Lyvia by Palace");
  });

  it("keeps every benefit card equal to its recorded source", () => {
    expect(BENEFITS.length).toBe(sources.benefits.length);
    BENEFITS.forEach((b, i) => {
      const s = sources.benefits[i]!;
      expect(b.title).toBe(s.title);
      expect(b.body).toBe(s.body);
      expect(b.sourceUrl).toBe(s.sourceUrl);
    });
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

  it("lists each building once per basis in the by-building tables", () => {
    const k = TX.byBuilding.sales.map((b) => `${b.building}|${b.basis}`);
    expect(new Set(k).size).toBe(k.length);
    const r = TX.byBuilding.rentals.map((b) => b.building);
    expect(new Set(r).size).toBe(r.length);
  });

  it("dates no row after the latest registration it reports", () => {
    expect(LATEST_ROW).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    for (const s of TX.sales) expect(s.date <= LATEST_ROW, s.date).toBe(true);
    for (const r of TX.rentals) expect(r.registered <= LATEST_ROW, r.registered).toBe(true);
    expect(TX.window.to <= LATEST_ROW).toBe(true);
  });
});

describe("Search results", () => {
  it("keeps every project title within 60 characters and description within 160", () => {
    for (const p of PROJECTS) {
      const t = projectTitle(p), d = projectDescription(p, handoverText(p));
      expect(t.length, `${p.slug}: ${t}`).toBeLessThanOrEqual(TITLE_MAX);
      expect(d.length, `${p.slug}: ${d}`).toBeLessThanOrEqual(DESCRIPTION_MAX);
      expect(d.length, `${p.slug}: description too thin`).toBeGreaterThan(70);
      expect(t, p.slug).not.toMatch(/\| DXB Creek Harbour/);
    }
  });

  it("lists every page and every project in the sitemap, none dated before the data", () => {
    const xml = readFileSync(join(PUBLIC, "sitemap.xml"), "utf8");
    const locs = [...xml.matchAll(/<loc>https:\/\/dxbdubaicreekharbour\.ae([^<]*)<\/loc>/g)].map((m) => m[1] || "/");
    const pages = ["/", "/projects", "/payment-plans", "/market", "/area", "/guide", "/terms", "/privacy", ...PROJECTS.map((p) => `/projects/${p.slug}`)];
    for (const page of pages) expect(locs, page).toContain(page);
    expect(locs).not.toContain("/leads");
    expect(new Set(locs).size).toBe(locs.length);
    for (const m of xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) expect(m[1]! >= TX.source.snapshotDate).toBe(true);
    // every route file except the root, the private leads page and the dynamic project route has a sitemap entry
    const routes = readdirSync(join(process.cwd(), "src/routes")).filter((f) => f.endsWith(".tsx") && !["__root.tsx", "leads.tsx", "projects.$slug.tsx"].includes(f));
    for (const f of routes) {
      const path = f === "index.tsx" ? "/" : `/${f.replace(/\.tsx$/, "").replace(/\.index$/, "").replace(/\./g, "/")}`;
      expect(locs, f).toContain(path);
    }
  });
});
