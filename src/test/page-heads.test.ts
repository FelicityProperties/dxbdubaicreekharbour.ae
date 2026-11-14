/** What route heads tell search engines, share previews and phones installing the site, in each language. */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

import { Route as RootRoute } from "@/routes/__root";
import { Route as HomeRoute } from "@/routes/index";
import { Route as ProjectsRoute } from "@/routes/projects.index";
import { Route as TermsRoute } from "@/routes/terms";
import { Route as PrivacyRoute } from "@/routes/privacy";
import { loadMessages, tFor } from "@/i18n/messages";
import { LOCALES, LOCALE_META, localizePath, type Locale } from "@/i18n/locales";

type Head = { meta?: Record<string, string>[]; links?: { rel: string; href: string }[]; scripts?: { type?: string; children?: string }[] };
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

describe("The app a phone installs", () => {
  type Shortcut = { name: string; short_name: string; url: string; icons: unknown };
  const manifest = (href: string) => JSON.parse(readFileSync(join(process.cwd(), "public", href), "utf8")) as Record<string, unknown>;
  it("opens in the language of the page it was installed from, with its shortcuts in that language", () => {
    const english = manifest("/site.webmanifest");
    const englishShortcuts = english["shortcuts"] as Shortcut[];
    for (const locale of LOCALES) {
      const t = tFor(locale);
      const root = headOf(RootRoute, locale);
      const links = (root.links ?? []).filter((l) => l.rel === "manifest");
      expect(links, locale).toHaveLength(1);
      const m = manifest(links[0]!.href);
      expect([m["start_url"], m["scope"]], locale).toEqual([localizePath("/", locale), "/"]);
      expect([m["lang"], m["dir"] ?? "ltr"], locale).toEqual([LOCALE_META[locale].htmlLang, LOCALE_META[locale].dir]);
      if (locale !== "en") {
        // Its own app (an English install stays English), described as the site's pages describe it in that language.
        expect(m["id"], locale).toBe(`/${locale}`);
        expect(m["description"], locale).toBe(pageMeta(root).get("description"));
        // The English app's shortcuts, named in this language and opening this language's pages.
        const shortcuts = m["shortcuts"] as Shortcut[];
        expect(shortcuts.map((s) => s.url), locale).toEqual(englishShortcuts.map((s) => localizePath(s.url, locale)));
        shortcuts.forEach((s, i) => {
          const en = englishShortcuts[i]!;
          expect(s.name, `${locale} ${en.name}`).toBe(t(en.name));
          expect([t(en.short_name), t(en.name)], `${locale} ${en.short_name}`).toContain(s.short_name);
          expect([s.name, s.short_name], `${locale} ${en.name}`).not.toContain(en.name);
          expect(s.short_name, `${locale} ${en.short_name}`).not.toBe(en.short_name);
          expect(s.icons, `${locale} ${en.name}`).toEqual(en.icons);
        });
      }
      for (const key of ["name", "short_name", "display", "orientation", "icons", "theme_color", "background_color"]) expect(m[key], `${locale} ${key}`).toEqual(english[key]);
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
