import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { PROJECTS, DISTRICT, SITE, FAQ } from "@/data/projects";
import { BENEFITS } from "@/data/benefits";
import { TERMS, PRIVACY } from "@/data/legal";
import { TX, LATEST_ROW, salesCount12m, rentalsCount12m } from "@/data/transactions";
import { aed, num, projectLabel } from "@/lib/format";
import { DESCRIPTION_MAX, TITLE_MAX, projectDescription, projectTitle } from "@/lib/seo";
import { DISCLAIMER, handoverText, priceSummary } from "@/components/showcase/shared";
import { LOCALES, LOCALE_META, localizePath } from "@/i18n/locales";
import sources from "../../design/benefits-sources.json";
import districtSources from "../../design/business-district-sources.json";
import { BUSINESS_DISTRICT } from "@/data/business-district";

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

  it("dates the prices in the FAQ and the footer disclaimer as the cards and project pages do", () => {
    const answer = FAQ.find((f) => f.q === "Are the prices current?")?.a ?? "";
    expect(answer).toContain(`checked on ${SITE.pricesCheckedOn}`);
    expect(DISCLAIMER).toContain(`as checked on ${SITE.pricesCheckedOn}`);
    // A project that is not now selling shows Emaar's starting price at launch on its card: the FAQ and the disclaimer say so.
    const launch = PROJECTS.filter((p) => p.status !== "Now selling" && p.startingPrice && !p.pricesFrom);
    for (const p of launch) expect(priceSummary(p).note, p.slug).toBe("Emaar's advertised starting price at launch — resale prices on request");
    if (launch.length) {
      expect(answer).toContain(`for projects now selling, the advertised starting price and, where Emaar lists units, the cheapest unit on its site, checked on ${SITE.pricesCheckedOn}; for the others, the starting price Emaar advertised at launch`);
      expect(DISCLAIMER).toContain("unless the project page gives another date or says the price was advertised at launch");
    }
    // A project page that dates a figure on another day (a handover date or plan from Emaar's booking page): the disclaimer allows for it.
    const other = PROJECTS.flatMap((p) => [p.startingPriceNote, p.pricesFromNote, p.sizesNote, p.handover?.note, p.paymentPlan?.note]).flatMap((n) => [...(n ?? "").matchAll(/(?:checked|on) (\d{1,2} [A-Z][a-z]+ \d{4})/g)].map((m) => m[1]!)).filter((d) => d !== SITE.pricesCheckedOn);
    if (other.length) expect(DISCLAIMER).toContain(`as checked on ${SITE.pricesCheckedOn}, unless the project page gives another date`);
  });

  it("credits the Land Department's figures in the footer: sales and rents dated where shown, construction status with its own source", () => {
    // Sales and rents are refreshed monthly and every table dates them; the construction status comes from the project
    // data's own capture, and list pages show it undated, so the footer keeps its source and month.
    expect(DISCLAIMER).toContain("Registered sale and rental figures are Dubai Land Department records, dated where they are shown,");
    expect(DISCLAIMER).toContain(`construction status is from ${SITE.constructionSource};`);
  });

  it("does not date every price on the home page with Emaar's check date", () => {
    // The home page's cards include launch prices; the date belongs to the FAQ and the disclaimer, which explain it.
    const home = readFileSync(join(process.cwd(), "src/routes/index.tsx"), "utf8");
    expect(home).not.toContain("pricesCheckedOn");
    // The /projects introduction keeps its qualification, as the FAQ and the disclaimer do.
    const projects = readFileSync(join(process.cwd(), "src/routes/projects.index.tsx"), "utf8");
    expect(projects).toContain("checked {date} unless the project page says otherwise");
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

describe("Dubai Square Business District", () => {
  // Numbers as digits or as words, so "Two metro stations" in the release covers a "2" on the page.
  const WORDS: Record<string, string> = { one: "1", two: "2", three: "3", four: "4", five: "5", six: "6", seven: "7", eight: "8", nine: "9", ten: "10", eleven: "11", twelve: "12" };
  const numbersIn = (s: string) => [
    ...(s.match(/\d[\d,]*(?:\.\d+)?/g) ?? []).map((n) => n.replace(/,/g, "")),
    ...(s.toLowerCase().match(/\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\b/g) ?? []).map((w) => WORDS[w]!),
  ];
  const quoted = new Set(districtSources.quotes.flatMap(numbersIn));
  const texts = [BUSINESS_DISTRICT.intro, BUSINESS_DISTRICT.note, BUSINESS_DISTRICT.image.caption, ...BUSINESS_DISTRICT.points, ...BUSINESS_DISTRICT.facts.flatMap((f) => [f.value, f.label])];

  it("shows only figures Emaar's release states", () => {
    for (const text of texts) for (const n of numbersIn(text)) expect(quoted.has(n), `${n} in "${text}"`).toBe(true);
  });
  it("records the release it comes from", () => {
    expect(BUSINESS_DISTRICT.sourceUrl).toBe(districtSources.sourceUrl);
    expect(BUSINESS_DISTRICT.announced).toBe(districtSources.date);
  });
  it("credits Emaar and never claims a price, launch or completion date", () => {
    expect(BUSINESS_DISTRICT.intro.startsWith("Emaar has announced")).toBe(true);
    expect(texts.join(" ")).not.toMatch(/\b(20(2[7-9]|3\d))\b|starting (price|from)|price[sd]? from|handover|complet(ed|ion) in/i);
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

  it("are credited to the Dubai Land Department alone: no file under src/ names the data supplier, comments and tests included", () => {
    // AGENTS.md: the supplier is named only in VERCEL-LAYER.md and the generators (tools/). Spelled in pieces so this file stays clear of it.
    const supplier = new RegExp(["property", "index"].join("[ _-]?") + "|\\bp" + "ix\\b", "i");
    const named: string[] = [];
    const walk = (dir: string): void => readdirSync(dir, { withFileTypes: true }).forEach((e) => {
      const path = join(dir, e.name);
      if (e.isDirectory()) return walk(path);
      readFileSync(path, "utf8").split("\n").forEach((line, i) => { if (supplier.test(line)) named.push(`${path.slice(process.cwd().length + 1)}:${i + 1}`); });
    });
    walk(join(process.cwd(), "src"));
    expect(named).toEqual([]);
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
    // every page in English, Arabic and Chinese
    for (const page of pages) for (const l of LOCALES) expect(locs, `${l} ${page}`).toContain(localizePath(page, l));
    expect(locs.length).toBe(pages.length * LOCALES.length);
    expect(locs.some((l) => /leads/.test(l))).toBe(false);
    expect(new Set(locs).size).toBe(locs.length);
    // each entry names all three language versions and the default, on the served address
    for (const entry of xml.match(/<url>.*?<\/url>/g) ?? []) {
      for (const l of LOCALES) expect(entry, entry.slice(0, 80)).toContain(`hreflang="${LOCALE_META[l].hreflang}"`);
      expect(entry).toContain('hreflang="x-default"');
      for (const [, href] of entry.matchAll(/href="([^"]+)"/g)) expect(href!.startsWith(`${SITE.url}/`) || href === SITE.url, href).toBe(true);
    }
    // data pages are dated no earlier than the snapshot; the legal pages carry their own "last updated" date
    for (const m of xml.matchAll(/<loc>[^<]+?(\/[a-z0-9/-]*)<\/loc><lastmod>([^<]+)<\/lastmod>/g)) {
      if (/\/(terms|privacy)$/.test(m[1]!)) continue;
      expect(m[2]! >= TX.source.snapshotDate, m[1]).toBe(true);
    }
    for (const l of LOCALES) {
      expect(xml).toContain(`${localizePath("/terms", l)}</loc><lastmod>${TERMS.lastUpdated}</lastmod>`);
      expect(xml).toContain(`${localizePath("/privacy", l)}</loc><lastmod>${PRIVACY.lastUpdated}</lastmod>`);
    }
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
