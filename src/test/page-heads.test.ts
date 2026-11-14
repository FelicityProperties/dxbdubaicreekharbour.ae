/** What route heads tell search engines and share previews, in each language. */
import { beforeAll, describe, expect, it } from "vitest";

import { Route as RootRoute } from "@/routes/__root";
import { Route as HomeRoute } from "@/routes/index";
import { Route as ProjectsRoute } from "@/routes/projects.index";
import { Route as TermsRoute } from "@/routes/terms";
import { Route as PrivacyRoute } from "@/routes/privacy";
import { loadMessages, tFor } from "@/i18n/messages";
import { LOCALES, type Locale } from "@/i18n/locales";

type Head = { meta?: Record<string, string>[]; scripts?: { type?: string; children?: string }[] };
const headOf = (route: { options: { head?: unknown } }, locale: Locale) => (route.options.head as (ctx: unknown) => Head)({ match: { context: { locale } } });

/**
 * The meta tags a page ends up with, as TanStack's HeadContent picks them: the deepest route's tag wins for each
 * name or property, so a page's own tag replaces the root route's.
 */
const pageMeta = (...heads: Head[]) => {
  const tags = new Map<string, string>();
  for (const head of [...heads].reverse()) for (const m of [...(head.meta ?? [])].reverse()) { const k = m["name"] ?? m["property"]; if (k && !tags.has(k)) tags.set(k, m["content"] ?? ""); }
  return tags;
};

beforeAll(async () => {
  for (const locale of LOCALES) await loadMessages(locale);
});

describe("Share previews", () => {
  it("give Terms and Privacy a small card in every language, and content pages a large one", () => {
    for (const locale of LOCALES) {
      const root = headOf(RootRoute, locale);
      for (const [page, route] of [["/terms", TermsRoute], ["/privacy", PrivacyRoute]] as const) expect(pageMeta(root, headOf(route, locale)).get("twitter:card"), `${page} ${locale}`).toBe("summary");
      for (const [page, route] of [["/", HomeRoute], ["/projects", ProjectsRoute]] as const) expect(pageMeta(root, headOf(route, locale)).get("twitter:card"), `${page} ${locale}`).toBe("summary_large_image");
    }
  });
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
