/**
 * Visitors buy through us: no page, and no FelicityBot reply, links to Emaar's (or any developer's) website.
 * The data files keep Emaar's addresses as the record of where each figure came from; pages credit Emaar in
 * plain text and offer brochures, floor plans and price lists on WhatsApp instead.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { codeFiles } from "@/i18n/code-files";
import { FELICITYBOT_SYSTEM } from "@/lib/felicitybot.knowledge";
import { safeHref } from "@/lib/felicitybot.shared";
import { SITE } from "@/data/projects";

const ROOT = process.cwd();
/** Data fields that hold addresses on Emaar's website. */
const EMAAR_FIELDS = /\b(emaarUrl|brochureUrl|floorPlanUrl|sourceUrl|placesSource|overseasSource|driveTimesSource)\b|\.source\b(?!\.)/;

describe("no links to the developer's website", () => {
  it("page code never puts an Emaar address in a link", () => {
    const bad: string[] = [];
    for (const path of codeFiles(ROOT)) {
      if (!/src\/(components|routes)\//.test(path)) continue;
      const text = readFileSync(path, "utf8");
      text.split("\n").forEach((line, i) => {
        if (/emaar\.com/i.test(line)) bad.push(`${path.slice(ROOT.length + 1)}:${i + 1} names emaar.com`);
        if (/href=\{[^}]*\}/.test(line) && [...line.matchAll(/href=\{([^}]*)\}/g)].some((m) => EMAAR_FIELDS.test(m[1]!))) bad.push(`${path.slice(ROOT.length + 1)}:${i + 1} links a source field`);
        if (/\b(emaarUrl|brochureUrl|floorPlanUrl|sourceUrl)\b/.test(line)) bad.push(`${path.slice(ROOT.length + 1)}:${i + 1} uses an Emaar address field`);
      });
    }
    expect(bad).toEqual([]);
  });

  it("FelicityBot has no Emaar address to give and cannot render one as a link", () => {
    expect(FELICITYBOT_SYSTEM).not.toMatch(/emaar\.com/i);
    expect(safeHref("https://www.emaar.com/en/properties/valia", SITE.whatsapp)).toBeNull();
  });
});
