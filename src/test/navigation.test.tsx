/** "Enquire" in the header, the phone menu and the phone tab bar only ever jumps within the page you are on (AGENTS.md: no /#section links). */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

let path = "/";
vi.mock("@tanstack/react-router", async (original) => ({
  ...(await original<typeof import("@tanstack/react-router")>()),
  // A link as the router writes it: the path, then any #hash.
  Link: ({ children, to, hash, className }: { children?: React.ReactNode; to?: string; hash?: string; className?: string }) => <a href={`${to ?? ""}${hash ? `#${hash}` : ""}`} className={className}>{children}</a>,
  useRouterState: ({ select }: { select: (s: unknown) => unknown }) => select({ location: { pathname: path, searchStr: "", hash: "", publicHref: path, state: {} } }),
  useRouter: () => ({ state: { location: { pathname: path, searchStr: "", hash: "", state: {} } }, latestLocation: { publicHref: path }, history: { canGoBack: () => false, back: () => {} }, navigate: () => Promise.resolve() }),
}));

import { Header, MobileBar } from "@/components/showcase/shared";
import { PROJECTS } from "@/data/projects";
import { KNOWLEDGE } from "@/lib/felicitybot.knowledge";

afterEach(cleanup);

const project = PROJECTS[0]!.slug;
/** Each page, and whether it has an enquiry form of its own. */
const PAGES: [string, boolean][] = [["/", true], ["/projects", true], [`/projects/${project}`, true], ["/market", true], ["/guide", true], ["/terms", false], ["/privacy", false], ["/projects/no-such-project", false], ["/no-such-page", false], ["/leads", false]];
const hrefs = (root: ParentNode) => [...root.querySelectorAll("a")].map((a) => a.getAttribute("href") ?? "");

describe("'Enquire'", () => {
  it("jumps to the form on the page itself in the header and the tab bar, and is left out on a page without one", () => {
    for (const [page, hasForm] of PAGES) {
      path = page;
      const { container } = render(<><Header /><MobileBar /></>);
      const links = hrefs(container);
      expect(links.filter((h) => h.includes("#enquire") && h !== "#enquire"), page).toEqual([]);
      expect(links.filter((h) => h === "#enquire"), page).toHaveLength(hasForm ? 2 : 0); // the header's and the tab bar's (a project's contact bar)
      // Without "Enquire" the tab bar keeps its other four tabs, WhatsApp among them; a project page has its contact bar.
      if (page !== `/projects/${project}`) expect([...container.querySelectorAll(".mobile-bar .tab")].map((a) => a.textContent), page).toEqual(["Home", "Projects", "Market", ...(hasForm ? ["Enquire"] : []), "WhatsApp"]);
      cleanup();
    }
  });

  it("is a row of the phone menu only where the page has a form, as a jump within it", async () => {
    for (const [page, hasForm] of PAGES) {
      path = page;
      render(<Header />);
      fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
      const menu = await screen.findByRole("dialog");
      const links = hrefs(menu);
      expect(links.filter((h) => h.includes("#enquire") && h !== "#enquire"), page).toEqual([]);
      expect(links.filter((h) => h === "#enquire"), page).toHaveLength(hasForm ? 1 : 0);
      expect(links.filter((h) => h.startsWith("https://wa.me/")), page).toHaveLength(1); // WhatsApp stays on every page
      cleanup();
    }
  });

  it("is not a link FelicityBot is given", () => {
    expect(KNOWLEDGE).not.toContain("/#enquire");
    expect(KNOWLEDGE).not.toContain("#enquire");
  });
});
