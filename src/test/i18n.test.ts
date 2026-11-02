/**
 * The Arabic and Chinese versions: every text the site shows is translated, translations keep every figure,
 * placeholder and link tag of the English, and nothing names the data supplier. src/i18n/README.md explains
 * the moving parts; `npm run i18n:keys` lists what is missing.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { extractKeys } from "@/i18n/extract";
import { codeFiles } from "@/i18n/code-files";
import { dataStrings, legalStrings } from "@/i18n/data-strings";
import { localizePath, splitLocale, type Locale } from "@/i18n/locales";
import { dateLong, dateRange, dateShort, dateText, monthYear } from "@/lib/format";
import { pageHead, pageUrl } from "@/lib/seo";
import { SITE } from "@/data/projects";
import { BENEFITS } from "@/data/benefits";
import { TX, coverageLabel, windowLabel } from "@/data/transactions";
import { dldCardBody, dldCardFigures } from "@/components/showcase/Benefits";
import { tFor } from "@/i18n/messages";

const ROOT = process.cwd();
const PARTS = ["ui", "data", "legal"] as const;
const LANGS = ["ar", "zh"] as const;
const dict = (l: string, part: string) => JSON.parse(readFileSync(join(ROOT, `src/i18n/${l}/${part}.json`), "utf8")) as Record<string, string>;
const keysFile = () => JSON.parse(readFileSync(join(ROOT, "src/i18n/keys.json"), "utf8")) as Record<(typeof PARTS)[number], string[]>;

const SCALE: [RegExp, number][] = [[/(\d+(?:\.\d+)?)\s*million\b/gi, 1e6], [/(\d+(?:\.\d+)?)\s*(?:مليون|ملايين)/g, 1e6], [/(\d+(?:\.\d+)?)\s*万/g, 1e4], [/(\d+(?:\.\d+)?)\s*亿/g, 1e8]];
/** Every number in a text: "AED 1,960,000" → "1960000", "1,2 & 3" → 1, 2, 3, and "7.4 million" = "740万" = 7400000. */
const numbers = (s: string) => {
  for (const [re, k] of SCALE) s = s.replace(re, (_, n: string) => String(Math.round(Number(n) * k)));
  return (s.match(/\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?/g) ?? []).map((n) => n.replace(/,/g, "")).sort();
};
const placeholders = (s: string) => (s.match(/\{\{?\w+\}?\}/g) ?? []).sort();
const tags = (s: string) => (s.match(/<\/?\w+>/g) ?? []).sort();
const MONTH = /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\b/;

describe("translation keys", () => {
  it("keys.json lists exactly the keys in the code and data (run npm run i18n:keys after a change)", () => {
    const files = codeFiles(ROOT).map((p) => ({ path: p.slice(ROOT.length + 1), text: readFileSync(p, "utf8") }));
    const { keys, problems } = extractKeys(files);
    expect(problems).toEqual([]);
    const now = { ui: [...keys.keys()].sort(), data: dataStrings(), legal: legalStrings() };
    expect(keysFile()).toEqual(now);
  });

  for (const l of LANGS) {
    for (const part of PARTS) {
      it(`${l}/${part}.json translates every key, and only current keys`, () => {
        const keys = keysFile()[part];
        const d = dict(l, part);
        expect(keys.filter((k) => typeof d[k] !== "string" || !d[k]!.trim()), "untranslated").toEqual([]);
        expect(Object.keys(d).filter((k) => !keys.includes(k)), "no longer used").toEqual([]);
      });

      it(`${l}/${part}.json keeps every figure, placeholder and tag of the English`, () => {
        const bad: string[] = [];
        for (const [en, tr] of Object.entries(dict(l, part))) {
          if (JSON.stringify(placeholders(en)) !== JSON.stringify(placeholders(tr))) bad.push(`placeholders: ${en} → ${tr}`);
          if (JSON.stringify(tags(en)) !== JSON.stringify(tags(tr))) bad.push(`tags: ${en} → ${tr}`);
          if ((en.match(/\|/g) ?? []).length !== (tr.match(/\|/g) ?? []).length) bad.push(`line break mark: ${en} → ${tr}`);
          // Every figure of the English is in the translation. The translation may add only small numbers: a
          // month written as a number (Chinese dates) or a number the English spells out ("four hotels").
          const want = numbers(en), got = numbers(tr);
          const rest = [...got];
          for (const n of want) { const i = rest.indexOf(n); if (i < 0) { bad.push(`figure ${n} missing: ${en} → ${tr}`); break; } rest.splice(i, 1); }
          const extra = rest.filter((n) => !(Number(n) >= 1 && Number(n) <= 12 && (MONTH.test(en) || /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|first|second|third|half|once|twice|single|double)\b/i.test(en))));
          if (extra.length) bad.push(`figures added (${extra.join(", ")}): ${en} → ${tr}`);
        }
        expect(bad).toEqual([]);
      });
    }
  }

  it("no translation names the data supplier (the site credits the DLD and Emaar only)", () => {
    for (const l of LANGS) for (const part of PARTS) expect(JSON.stringify(dict(l, part))).not.toMatch(/property[ _-]?index|\bPIX\b/i);
  });
});

describe("text that changes with the data", () => {
  // A data refresh rewrites these in English; the pages rebuild them from templates, so the English templates
  // must reproduce the snapshot's own wording exactly. If one fails, update the template (and its translations).
  it("rebuilds the 12-month window and coverage labels from the snapshot dates", () => {
    expect(windowLabel()).toBe(TX.window.label);
    expect(coverageLabel()).toBe(TX.source.coverage);
  });
  it("reads the DLD figures card back through its template", () => {
    const card = BENEFITS.find((b) => b.kind === "dld-snapshot");
    if (!card) return;
    expect(dldCardFigures(card.body), "the card's wording no longer matches DLD_CARD in Benefits.tsx").not.toBeNull();
    expect(dldCardBody(card.body)).toBe(card.body);
    const zh = dldCardBody(card.body, tFor("zh"));
    for (const n of (card.body.match(/\d[\d,]*/g) ?? []).filter((n) => n.length > 2)) expect(zh).toContain(n);
  });
  it("shows the text before a translator's note (@@) and never the note", () => {
    expect(tFor("en")("Share@@table column: the instalment's share of the price")).toBe("Share");
    expect(tFor("ar")("Nothing translated@@note")).toBe("Nothing translated");
  });
});

describe("language plumbing", () => {
  it("maps addresses to languages and back", () => {
    expect(splitLocale("/ar/projects/valia")).toEqual({ locale: "ar", path: "/projects/valia" });
    expect(splitLocale("/zh")).toEqual({ locale: "zh", path: "/" });
    expect(splitLocale("/area")).toEqual({ locale: "en", path: "/area" });
    expect(splitLocale("/arabic")).toEqual({ locale: "en", path: "/arabic" });
    expect(splitLocale("/zh/leads")).toEqual({ locale: "en", path: "/zh/leads" }); // English only: no Chinese /leads
    expect(localizePath("/", "ar")).toBe("/ar");
    expect(localizePath("/#enquire", "zh")).toBe("/zh#enquire");
    expect(localizePath("/projects?x=1", "ar")).toBe("/ar/projects?x=1");
    expect(localizePath("/leads", "ar")).toBe("/leads");
    expect(localizePath("https://wa.me/1", "ar")).toBe("https://wa.me/1");
    expect(localizePath("/guide", "en")).toBe("/guide");
  });

  it("writes dates in each language with the same digits", () => {
    expect(dateLong("2026-10-07")).toBe("7 October 2026");
    expect(dateShort("2026-10-07")).toBe("7 Oct 2026");
    expect(dateRange("2026-07-13", "2026-10-07")).toBe("13 Jul – 7 Oct 2026");
    expect(dateLong("2026-10-07", "ar")).toBe("7 أكتوبر 2026");
    expect(dateLong("2026-10-07", "zh")).toBe("2026年10月7日");
    expect(dateRange("2026-07-13", "2026-10-07", "zh")).toBe("2026年7月13日至10月7日");
    expect(dateRange("2025-11-01", "2026-10-31", "ar")).toBe("1 نوفمبر 2025 – 31 أكتوبر 2026");
    expect(monthYear("2026-10", "ar")).toBe("أكتوبر 2026");
    expect(dateText("9 October 2026", "zh")).toBe("2026年10月9日");
    expect(dateText("9 October 2026", "en")).toBe("9 October 2026");
    expect(dateText("on request", "ar")).toBe("on request");
  });

  it("gives every page a canonical address and its three language versions", () => {
    const head = pageHead({ locale: "ar" as Locale, path: "/projects", title: "t", description: "d" });
    const links = head.links as { rel: string; href: string; hrefLang?: string }[];
    expect(links.find((l) => l.rel === "canonical")?.href).toBe(`${SITE.url}/ar/projects`);
    expect(links.filter((l) => l.rel === "alternate").map((l) => [l.hrefLang, l.href])).toEqual([
      ["en", `${SITE.url}/projects`], ["ar", `${SITE.url}/ar/projects`], ["zh-Hans", `${SITE.url}/zh/projects`], ["x-default", `${SITE.url}/projects`],
    ]);
    expect(pageUrl("/", "en")).toBe(SITE.url);
    expect(pageUrl("/", "zh")).toBe(`${SITE.url}/zh`);
  });
});
