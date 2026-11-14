/** What route heads tell search engines and share previews, in each language. */
import { beforeAll, describe, expect, it } from "vitest";

import { Route as HomeRoute } from "@/routes/index";
import { loadMessages, tFor } from "@/i18n/messages";
import { LOCALES, type Locale } from "@/i18n/locales";

type Head = { meta?: Record<string, string>[]; scripts?: { type?: string; children?: string }[] };
const headOf = (route: { options: { head?: unknown } }, locale: Locale) => (route.options.head as (ctx: unknown) => Head)({ match: { context: { locale } } });

beforeAll(async () => {
  for (const locale of LOCALES) await loadMessages(locale);
});

describe("Home page structured data", () => {
  type LdNode = { "@type": string; inLanguage?: string; areaServed?: { name: string }; employee?: { jobTitle: string } };
  it("names the page's own language and gives the brokerage's labels in it", () => {
    for (const [locale, inLanguage] of [["en", "en"], ["ar", "ar"], ["zh", "zh-Hans"]] as const) {
      const t = tFor(locale);
      const ld = headOf(HomeRoute, locale).scripts!.find((s) => s.type === "application/ld+json")!.children!;
      const graph = (JSON.parse(ld) as { "@graph": LdNode[] })["@graph"];
      const node = (type: string) => graph.find((n) => n["@type"] === type)!;
      expect(node("WebSite").inLanguage, locale).toBe(inLanguage);
      expect(node("RealEstateAgent").areaServed?.name, locale).toBe(t("Dubai Creek Harbour, Dubai"));
      expect(node("RealEstateAgent").employee?.jobTitle, locale).toBe(t("Real estate broker"));
      if (locale !== "en") expect(node("RealEstateAgent").employee?.jobTitle, locale).not.toBe("Real estate broker");
    }
  });
});
