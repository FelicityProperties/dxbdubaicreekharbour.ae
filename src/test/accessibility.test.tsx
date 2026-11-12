/**
 * What an automated accessibility scan (axe, WCAG 2.x A/AA) of every page type found on 12 Nov 2026, kept fixed:
 * - headings never skip a level: on /projects a heading for the list (for screen readers) sits between the page's
 *   h1 and the cards' h3 titles;
 * - a control's spoken name contains the words or number printed on it, in every language (FelicityBot's launcher;
 *   the gallery's cover, which shows the number of photos on phones).
 * The floating WhatsApp and e-mail buttons sit inside the footer landmark (src/components/showcase/shared.tsx).
 */
import { cleanup, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

// The collection only needs links that render and a router it can ask about Back; nothing navigates in this test.
vi.mock("@tanstack/react-router", async (original) => ({
  ...(await original<typeof import("@tanstack/react-router")>()),
  Link: ({ children, to, className }: { children?: ReactNode; to?: string; className?: string }) => (
    <a href={to ?? "#"} className={className}>
      {children}
    </a>
  ),
  useRouter: () => ({ history: { subscribe: () => () => {}, back: () => {}, location: { hash: "" } }, subscribe: () => () => {}, state: { location: { pathname: "/projects", hash: "" } } }),
  useRouterState: ({ select }: { select?: (s: { location: { pathname: string; hash: string } }) => unknown } = {}) => {
    const state = { location: { pathname: "/projects", hash: "" } };
    return select ? select(state) : state;
  },
}));

import { ProjectCollection } from "@/components/showcase/ProjectCollection";
import { LOCALES } from "@/i18n/locales";
import { loadMessages, tFor } from "@/i18n/messages";

// Arabic and Chinese are separate downloads, loaded before a page in that language is shown.
beforeAll(async () => {
  for (const locale of LOCALES) await loadMessages(locale);
});
afterEach(cleanup);

describe("heading levels on /projects", () => {
  it("puts an h2 between the page's h1 and the cards' h3 titles, and never skips a level", () => {
    const { container } = render(<ProjectCollection heading={false} />);
    const levels = [...container.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => Number(h.tagName[1]));
    expect(levels[0]).toBe(2);
    expect(levels).toContain(3);
    let previous = 1; // the page's own h1, above the collection
    for (const level of levels) {
      expect(level - previous).toBeLessThanOrEqual(1);
      previous = level;
    }
  });
});

describe("spoken names contain what is printed on the control", () => {
  it("FelicityBot's launcher, in every language", () => {
    for (const locale of LOCALES) {
      const t = tFor(locale);
      expect(t("Ask FelicityBot, our AI assistant"), locale).toContain(t("Ask FelicityBot"));
    }
  });

  it("the gallery's cover: its caption and the number of photos it shows on phones, in every language", () => {
    for (const locale of LOCALES) {
      const name = tFor(locale)("{caption} · {n} photos", { caption: "Valia at dusk", n: 7 });
      expect(name, locale).toContain("Valia at dusk");
      expect(name, locale).toContain("7");
    }
  });
});
