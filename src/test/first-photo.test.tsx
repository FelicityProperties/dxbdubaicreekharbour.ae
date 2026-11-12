/**
 * A page's first photo loads at once; the rest wait until they scroll into view (AGENTS.md, "lazy except the first
 * on a page"). On /projects the first card's cover is the page's largest image on phones, so a lazy cover there
 * delays the page; on the home page the list is a swipe row far down the page, so every cover there stays lazy.
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

const { ProjectCollection } = await import("@/components/showcase/ProjectCollection");

const covers = (container: HTMLElement) => [...container.querySelectorAll<HTMLImageElement>(".card-cover img")];

describe("Project list photos", () => {
  it("loads the first cover on /projects at once and leaves the rest until they are scrolled to", () => {
    const { container } = render(<ProjectCollection heading={false} />);
    const imgs = covers(container);
    expect(imgs.length).toBeGreaterThan(1);
    expect(imgs[0]!.getAttribute("loading")).toBe("eager");
    expect(imgs[0]!.getAttribute("fetchpriority")).toBe("high");
    for (const img of imgs.slice(1)) {
      expect(img.getAttribute("loading"), img.src).toBe("lazy");
      expect(img.getAttribute("fetchpriority"), img.src).toBe("auto");
    }
  });

  it("keeps every cover in the home page's swipe row lazy", () => {
    const { container } = render(<ProjectCollection shelf />);
    const imgs = covers(container);
    expect(imgs.length).toBeGreaterThan(1);
    for (const img of imgs) expect(img.getAttribute("loading"), img.src).toBe("lazy");
  });
});
