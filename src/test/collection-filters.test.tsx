/**
 * The project collection keeps its filters and its view in the address, replacing the history entry: Back from a
 * project shows the same list again (before the router puts the scroll position back), and an address that names
 * filters starts with that list. They stay on their own page: the page the visitor goes on to never gets them.
 */
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { Outlet, RouterProvider, createMemoryHistory, createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { ProjectCollection } from "@/components/showcase/ProjectCollection";
import { PROJECTS } from "@/data/projects";

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** A page whose code arrives a moment later, as the real routes' split chunks do: the page before stays on screen meanwhile. */
const pending = () => pause(80);

function openAt(url: string) {
  const root = createRootRoute({ component: Outlet });
  const home = createRoute({ getParentRoute: () => root, path: "/", loader: pending, component: () => <ProjectCollection shelf /> });
  const list = createRoute({ getParentRoute: () => root, path: "/projects", component: () => <ProjectCollection heading={false} /> });
  const project = createRoute({ getParentRoute: () => root, path: "/projects/$slug", loader: pending, component: () => <p>A project page</p> });
  const history = createMemoryHistory({ initialEntries: [url] });
  const router = createRouter({ routeTree: root.addChildren([home, list, project]), history });
  return { router, history, ...render(<RouterProvider router={router} />) };
}
const cards = (container: HTMLElement) => [...container.querySelectorAll(".project-grid .card-name")].map((el) => el.textContent?.trim());
const rows = (container: HTMLElement) => [...container.querySelectorAll(".project-table tbody td.name a")].map((el) => el.textContent?.trim());
const pressed = (container: HTMLElement) => [...container.querySelectorAll(".filters button[aria-pressed=true], .view-toggle button[aria-pressed=true]")].map((el) => el.textContent?.trim());

describe("The project collection's filters", () => {
  it("stay in the address, so Back from a project shows the same list", async () => {
    const { router, history, container } = openAt("/projects");
    await waitFor(() => expect(cards(container)).toHaveLength(PROJECTS.length));
    fireEvent.click(within(container.querySelector<HTMLElement>(".filters")!).getByRole("button", { name: "Ready · resale" }));
    const ready = PROJECTS.filter((p) => p.status === "Ready").map((p) => p.name);
    expect(cards(container)).toEqual(ready);
    await waitFor(() => expect(router.state.location.search).toEqual({ status: "Ready" }));
    expect(history.length).toBe(1); // the entry was replaced: no extra step for Back

    await router.navigate({ to: "/projects/$slug", params: { slug: PROJECTS.find((p) => p.status === "Ready")!.slug } });
    await screen.findByText("A project page");
    history.back();
    await waitFor(() => expect(cards(container)).toEqual(ready));
    expect(pressed(container)).toEqual(["Ready · resale", "Anywhere", "Any", "Any budget", "Cards"]);
  });

  it("show the list and view an address names, and keep its other parameters", async () => {
    const { router, container } = openAt("/projects?beds=2&budget=2-3&view=table&utm_source=ig");
    await waitFor(() => expect(rows(container).length).toBeGreaterThan(0));
    expect(rows(container).length).toBeLessThan(PROJECTS.length);
    expect(pressed(container)).toEqual(["All", "Anywhere", "2", "AED 2–3M", "Compare"]);
    fireEvent.click(screen.getByRole("button", { name: "Cards" }));
    await waitFor(() => expect(router.state.location.search).toEqual({ beds: 2, budget: "2-3", utm_source: "ig" }));
    expect(router.state.location.searchStr).toBe("?utm_source=ig&beds=2&budget=2-3");
    fireEvent.click(screen.getByRole("button", { name: "clear filters" }));
    await waitFor(() => expect(router.state.location.searchStr).toBe("?utm_source=ig"));
    expect(cards(container)).toHaveLength(PROJECTS.length);
  });

  it("ignore what an address names wrongly", async () => {
    const { container } = openAt("/projects?status=Sold&beds=9&budget=__proto__");
    await waitFor(() => expect(cards(container)).toHaveLength(PROJECTS.length));
    expect(pressed(container)).toEqual(["All", "Anywhere", "Any", "Any budget", "Cards"]);
  });

  it("stay on their own page: the project opened from the list gets none of them", async () => {
    const { router, container } = openAt("/projects");
    await waitFor(() => expect(cards(container)).toHaveLength(PROJECTS.length));
    fireEvent.click(within(container.querySelector<HTMLElement>(".filters")!).getByRole("button", { name: "Ready · resale" }));
    await waitFor(() => expect(router.state.location.search).toEqual({ status: "Ready" }));
    const slug = PROJECTS.find((p) => p.status === "Ready")!.slug;
    await router.navigate({ to: "/projects/$slug", params: { slug } });
    await screen.findByText("A project page");
    await pause(100); // longer than the collection takes to bring an address up to date
    expect(router.state.location.href).toBe(`/projects/${slug}`);
  });

  it("stay on their own page: the home page's collection does not take over those of /projects", async () => {
    const { router, container } = openAt("/projects?status=Ready");
    await waitFor(() => expect(cards(container)).toEqual(PROJECTS.filter((p) => p.status === "Ready").map((p) => p.name)));
    await router.navigate({ to: "/" }); // the logo
    await waitFor(() => expect(container.querySelector(".coll-shelf")).not.toBeNull());
    await pause(100);
    expect(router.state.location.href).toBe("/");
    expect(pressed(container)).toEqual(["All", "Anywhere", "Any", "Any budget", "Cards"]);
  });
});
