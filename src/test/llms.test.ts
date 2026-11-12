import { describe, expect, it } from "vitest";
import { PROJECTS, SITE } from "@/data/projects";
import { BUSINESS_DISTRICT as BD } from "@/data/business-district";
import { TX } from "@/data/transactions";
import { aed, num } from "@/lib/format";
import { llmsResponse, llmsText } from "@/lib/llms.server";
import { pageUrl } from "@/lib/seo";

const text = llmsText();
const lines = text.split("\n");

describe("/llms.txt (the site described for AI assistants)", () => {
  it("follows the llms.txt shape: a title, a summary, then sections of links", () => {
    expect(lines[0]).toBe(`# ${SITE.name}`);
    expect(lines[1]).toBe("");
    expect(lines[2]!.startsWith("> ")).toBe(true);
    expect(lines.filter((l) => l.startsWith("# "))).toHaveLength(1);
    const sections = lines.filter((l) => l.startsWith("## "));
    expect(sections).toEqual(["## Main pages", "## Now selling from Emaar", "## Resale, under construction", "## Ready, resale", "## Languages", "## Optional"]);
    // After the first section every line is a heading, a blank or one link: "- [name](address): notes".
    for (const l of lines.slice(lines.indexOf(sections[0]!))) {
      if (l === "" || l.startsWith("## ")) continue;
      expect(l, l).toMatch(/^- \[[^\]]+\]\(https:\/\/[^\s)]+\): \S/);
    }
  });

  it("links every project once and every main page, on the address the site is served from", () => {
    const linked = [...text.matchAll(/\]\((https:\/\/[^\s)]+)\)/g)].map((m) => m[1]!);
    for (const p of PROJECTS) expect(linked.filter((u) => u === pageUrl(`/projects/${p.slug}`)), p.slug).toHaveLength(1);
    for (const path of ["/projects", "/payment-plans", "/market", "/area", "/guide", "/terms", "/privacy"]) expect(linked, path).toContain(pageUrl(path));
    expect(linked).toContain(`${pageUrl("/area")}#business-district`);
    expect(linked).toContain(pageUrl("/", "ar"));
    expect(linked).toContain(pageUrl("/", "zh"));
    expect(new Set(linked).size).toBe(linked.length);
    // Nothing leads off the site: not Emaar's website (the announcement's address included), no other source (AGENTS.md).
    for (const [address] of text.matchAll(/https?:\/\/[^\s)]+/g)) expect(address === SITE.url || address.startsWith(`${SITE.url}/`), address).toBe(true);
    expect(text).not.toContain("emaar.com");
  });

  it("credits no source but Emaar and the Land Department, and dates its figures", () => {
    expect(text).not.toMatch(/property[ _-]?index/i);
    expect(text).not.toMatch(/\bPIX\b/);
    expect(text).toContain("Dubai Land Department");
    expect(text).toContain(SITE.pricesCheckedOn);
    expect(text).toContain(TX.window.label);
    expect(text).toContain(`RERA ORN ${SITE.reraOrn}`);
  });

  it("states the snapshot's own 12-month figures, and no by-bedroom median from fewer than five registrations", () => {
    for (const s of TX.summary.sales) {
      expect(text, s.basis).toContain(`${s.basis === "ready" ? "Ready" : "Off-plan"} apartments: ${num(s.count)} registered ${s.count === 1 ? "sale" : "sales"}, median ${num(s.medianPsf)} AED per sq ft, median price ${aed(s.medianPrice)}.`);
    }
    for (const r of TX.summary.rentalsByBedroom) {
      const quoted = text.includes(`${r.bedrooms}: ${num(r.count)} ${r.count === 1 ? "contract" : "contracts"}, median ${aed(r.medianRent)} a year`);
      expect(quoted, `${r.bedrooms} (${r.count})`).toBe(r.count >= 5);
    }
    for (const s of TX.summary.salesByBedroom) {
      const quoted = text.includes(`${s.basis === "ready" ? "ready" : "off-plan"} ${num(s.count)} ${s.count === 1 ? "sale" : "sales"}, median ${aed(s.medianPrice)}`);
      expect(quoted, `${s.basis} ${s.bedrooms} (${s.count})`).toBe(s.count >= 5);
    }
    // Every "AED …" amount in the market block is a median the snapshot holds.
    const from = lines.findIndex((l) => l.startsWith("**Registered apartment sales and rents"));
    const block = lines.slice(from + 1, lines.findIndex((l, i) => i > from && l.startsWith("**"))).join("\n");
    const medians = new Set([
      ...TX.summary.sales.map((s) => s.medianPrice),
      ...TX.summary.salesByBedroom.map((s) => s.medianPrice),
      ...TX.summary.rentalsByBedroom.map((r) => r.medianRent),
    ].filter((n) => n != null).map((n) => aed(n)));
    const amounts = [...block.matchAll(/AED [\d,]+/g)].map((m) => m[0]);
    expect(amounts.length).toBeGreaterThan(6);
    for (const a of amounts) expect(medians.has(a), a).toBe(true);
  });

  it("presents the business district as Emaar's announced plan, in the data file's own sentences", () => {
    expect(text).toContain(BD.intro);
    for (const p of BD.points) expect(text).toContain(`- ${p}`);
    for (const f of BD.facts) expect(text).toContain(`${f.label}: ${f.value}`);
    expect(text).toContain(`- ${BD.note}`);
  });

  it("answers at /llms.txt only, as plain text", async () => {
    const ok = llmsResponse(new Request(`${SITE.url}/llms.txt`));
    expect(ok.status).toBe(200);
    expect(ok.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    expect(await ok.text()).toBe(text);
    for (const path of ["/ar/llms.txt", "/zh/llms.txt"]) expect(llmsResponse(new Request(`${SITE.url}${path}`)).status, path).toBe(404);
  });
});
