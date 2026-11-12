/**
 * Visitors buy through us: no page, and no FelicityBot reply, links to Emaar's (or any developer's) website —
 * no project page, no source page. The one exception, by the owner's decision (2 Nov 2026): the download
 * buttons for Emaar's brochure and floor-plan PDF files. The data files keep Emaar's page addresses as the
 * record of where each figure came from; pages credit Emaar in plain text.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { codeFiles } from "@/i18n/code-files";
import { FELICITYBOT_SYSTEM } from "@/lib/felicitybot.knowledge";
import { safeHref } from "@/lib/felicitybot.shared";
import { SITE } from "@/data/projects";
import { dubaiHillsUrl } from "@/components/showcase/shared";
import { LOCALES } from "@/i18n/locales";

const ROOT = process.cwd();
/** Data fields that hold addresses of pages on Emaar's website (brochureUrl and floorPlanUrl are PDF files, allowed). */
const EMAAR_FIELDS = /\b(emaarUrl|sourceUrl|placesSource|overseasSource|driveTimesSource)\b|\.source\b(?!\.)/;

describe("no links to the developer's website", () => {
  it("page code never puts an Emaar address in a link", () => {
    const bad: string[] = [];
    for (const path of codeFiles(ROOT)) {
      if (!/src\/(components|routes)\//.test(path)) continue;
      const text = readFileSync(path, "utf8");
      text.split("\n").forEach((line, i) => {
        if (/emaar\.com/i.test(line)) bad.push(`${path.slice(ROOT.length + 1)}:${i + 1} names emaar.com`);
        if (/href=\{[^}]*\}/.test(line) && [...line.matchAll(/href=\{([^}]*)\}/g)].some((m) => EMAAR_FIELDS.test(m[1]!))) bad.push(`${path.slice(ROOT.length + 1)}:${i + 1} links a source field`);
        if (/\b(emaarUrl|sourceUrl)\b/.test(line)) bad.push(`${path.slice(ROOT.length + 1)}:${i + 1} uses an Emaar address field`);
      });
    }
    expect(bad).toEqual([]);
  });

  it("FelicityBot knows no Emaar page address and cannot render one as a link (brochure and floor-plan PDFs only)", () => {
    const addresses = FELICITYBOT_SYSTEM.match(/https?:\/\/[^\s)"'>\]]+/g) ?? [];
    expect(addresses.filter((a) => /emaar\.com/i.test(a) && !/^https:\/\/www\.emaar\.com\/cms-media\/[^?#]+\.pdf$/i.test(a))).toEqual([]);
    expect(safeHref("https://www.emaar.com/en/properties/valia", SITE.whatsapp)).toBeNull();
    expect(safeHref("https://www.emaar.com/cms-media/uploads/valia-floor-plan.pdf", SITE.whatsapp)).not.toBeNull();
  });
});

// The one other website the pages link to is the operator's own, for Dubai Hills Estate (the owner, 12 Nov 2026).
describe("the footer's link to the operator's Dubai Hills site", () => {
  it("goes to that site in the page's language", () => {
    expect(dubaiHillsUrl()).toBe("https://www.dubaihillsoffplan.com");
    expect(LOCALES.map((l) => dubaiHillsUrl(l))).toEqual(["https://www.dubaihillsoffplan.com", "https://www.dubaihillsoffplan.com/ar", "https://www.dubaihillsoffplan.com/zh"]);
  });

  it("is an ordinary link search engines follow, in a new tab, that keeps the referrer", () => {
    const footer = readFileSync(join(ROOT, "src/components/showcase/shared.tsx"), "utf8");
    const links = footer.match(/<a href=\{dubaiHillsUrl\(t\.locale\)\}[^>]*>/g) ?? [];
    expect(links).toEqual(['<a href={dubaiHillsUrl(t.locale)} target="_blank" rel="noopener" className="underline underline-offset-4">']);
  });
});
