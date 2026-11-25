/**
 * The home page's AI viewings row: the Creek Harbour reel leads, and its title links each project it shows to that
 * project's page (a viewing of one project links its whole title to its page, as before).
 */
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, params, ...rest }: { children?: ReactNode; to?: string; params?: Record<string, string> } & Record<string, unknown>) => (
    <a href={params?.["slug"] ? String(to).replace("$slug", params["slug"]) : to} {...(rest as object)}>{children}</a>
  ),
  useRouter: () => ({ history: { subscribe: () => () => {}, back: () => {}, location: { hash: "" } }, subscribe: () => () => {}, state: { resolvedLocation: { hash: "" } }, navigate: () => {} }),
  useRouterState: () => "",
}));
// jsdom has no IntersectionObserver and no media playback; the player only needs them to exist.
vi.stubGlobal("IntersectionObserver", class { observe() {} disconnect() {} });
vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});

const { AiViewings } = await import("@/components/showcase/AiViewings");
const { AI_VIEWINGS, viewingLine } = await import("@/data/ai-viewings");

describe("AI viewings row", () => {
  it("leads with the reel, links each of its projects, and keeps every other viewing's link", () => {
    const { container } = render(<AiViewings />);
    const grid = container.querySelector(".aiv-grid")!;
    expect(grid.getAttribute("data-count")).toBe(String(AI_VIEWINGS.length));
    const titles = [...container.querySelectorAll(".aiv-card .aiv-project")];
    expect(titles.map((h) => h.textContent)).toEqual(AI_VIEWINGS.map((v) => viewingLine(v)));
    const links = (h: Element) => [...h.querySelectorAll("a")].map((a) => [a.textContent, a.getAttribute("href")]);
    expect(links(titles[0]!)).toEqual([["Creek Bay", "/projects/creek-bay"], ["Altan", "/projects/altan"], ["Lyvia by Palace", "/projects/lyvia-by-palace"]]);
    expect(links(titles[1]!)).toEqual([["Lyvia by Palace · Dubai Creek Harbour · Emaar", "/projects/lyvia-by-palace"]]);
    expect(container.querySelector(".aiv-card .aiv-permit")!.textContent).toBe("Felicity Properties · RERA ORN 33951 · DLD Permits: Creek Bay 1140397881 · Altan 1635543433 · Lyvia by Palace 2107900942");
  });
});
