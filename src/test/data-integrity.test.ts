import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { PROJECTS, DISTRICT, SITE } from "@/data/projects";
import { BENEFITS } from "@/data/benefits";
import { TERMS, PRIVACY } from "@/data/legal";
import { TX, LATEST_ROW, salesCount12m, rentalsCount12m } from "@/data/transactions";
import { aed, num, projectLabel } from "@/lib/format";
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

  it("gives every place card a photo that exists, or none on purpose", () => {
    for (const place of DISTRICT.places) expect(place.image === null || place.image in DISTRICT.images, `${place.title} -> ${place.image}`).toBe(true);
  });

  it("puts every map pin inside Dubai Creek Harbour", () => {
    for (const p of PROJECTS) {
      if (p.lat === null || p.lng === null) continue;
      expect(p.lat, `${p.slug} lat`).toBeGreaterThan(25.185); expect(p.lat, `${p.slug} lat`).toBeLessThan(25.22);
      expect(p.lng, `${p.slug} lng`).toBeGreaterThan(55.335); expect(p.lng, `${p.slug} lng`).toBeLessThan(55.375);
    }
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

  it("keeps the registered-market card's figures equal to the DLD snapshot", () => {
    // Fails after a data refresh that moves these figures: update the card in benefits.ts and benefits-sources.json.
    const fresh = TX.summary.rentalsNewVsRenewal.find((r) => r.newContract)!;
    const renewed = TX.summary.rentalsNewVsRenewal.find((r) => !r.newContract)!;
    const oneBed = TX.summary.rentalsByBedroom.find((r) => r.bedrooms === "1 Bed")!;
    const ready = TX.summary.sales.find((x) => x.basis === "ready")!;
    const card = BENEFITS.find((b) => b.kind === "dld-snapshot")!;
    expect(card.body).toBe(`Dubai Land Department records for the ${TX.window.label} show ${num(fresh.count)} new tenancy contracts and ${num(renewed.count)} renewals registered for apartments in Dubai Creek Harbour, with a median rent of ${aed(oneBed.medianRent)} across ${num(oneBed.count)} one-bedroom contracts. The same records show ${num(ready.count)} ready-apartment sales registered in that window; these are registered contracts and sales, not valuations or forecasts.`);
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

  it("claims registered sales or rents in a description only when the snapshot has them", () => {
    for (const p of PROJECTS) {
      const d = projectDescription(p, handoverText(p));
      if (d.includes("Registered sales and rents.")) expect(salesCount12m(p.slug) > 0 && rentalsCount12m(p.slug) > 0, `${p.slug}: ${d}`).toBe(true);
      else if (d.includes("Registered sales.")) expect(salesCount12m(p.slug), `${p.slug}: ${d}`).toBeGreaterThan(0);
    }
  });

  it("lists every page and every project in the sitemap, none dated before the data", () => {
    const xml = readFileSync(join(PUBLIC, "sitemap.xml"), "utf8");
    const all = [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]!);
    // Every entry is on the address the site is served from, never one that redirects to it.
    for (const loc of all) expect(loc.startsWith(`${SITE.url}/`), loc).toBe(true);
    const locs = all.map((loc) => loc.slice(SITE.url.length) || "/");
    const pages = ["/", "/projects", "/payment-plans", "/market", "/area", "/guide", "/terms", "/privacy", ...PROJECTS.map((p) => `/projects/${p.slug}`)];
    for (const page of pages) expect(locs, page).toContain(page);
    expect(locs).not.toContain("/leads");
    expect(new Set(locs).size).toBe(locs.length);
    // data pages are dated no earlier than the snapshot; the legal pages carry their own "last updated" date
    for (const m of xml.matchAll(/<loc>[^<]+?(\/[a-z0-9/-]*)<\/loc><lastmod>([^<]+)<\/lastmod>/g)) {
      if (m[1] === "/terms" || m[1] === "/privacy") continue;
      expect(m[2]! >= TX.source.snapshotDate, m[1]).toBe(true);
    }
    expect(xml).toContain(`/terms</loc><lastmod>${TERMS.lastUpdated}</lastmod>`);
    expect(xml).toContain(`/privacy</loc><lastmod>${PRIVACY.lastUpdated}</lastmod>`);
    // every route file except the root, the private leads page and the dynamic project route has a sitemap entry
    const routes = readdirSync(join(process.cwd(), "src/routes")).filter((f) => f.endsWith(".tsx") && !["__root.tsx", "leads.tsx", "projects.$slug.tsx"].includes(f));
    for (const f of routes) {
      const path = f === "index.tsx" ? "/" : `/${f.replace(/\.tsx$/, "").replace(/\.index$/, "").replace(/\./g, "/")}`;
      expect(locs, f).toContain(path);
    }
  });

  it("points search engines at the www address the site is served from", () => {
    // Vercel serves www.dxbdubaicreekharbour.ae and redirects the bare domain to it; a sitemap, canonical or
    // robots.txt naming the bare domain sends Google through a redirect and the page is not indexed.
    expect(SITE.url).toBe("https://www.dxbdubaicreekharbour.ae");
    const robots = readFileSync(join(PUBLIC, "robots.txt"), "utf8");
    expect(robots).toContain(`Sitemap: ${SITE.url}/sitemap.xml`);
    for (const [address] of robots.matchAll(/https?:\/\/\S+/g)) expect(address.startsWith(`${SITE.url}/`), address).toBe(true);
    expect(robots).not.toMatch(/Disallow:\s*\/\s*$/m);
    expect(readFileSync(join(PUBLIC, "sitemap.xml"), "utf8")).not.toContain("https://dxbdubaicreekharbour.ae");
  });
});
