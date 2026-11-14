/**
 * Phone Back closes a sheet or viewer (useBackCloses in src/lib/phone.ts), also on a page opened from a link that still
 * ends in the overlay's "#…" (copied or shared while it was open): Back then stays on the page instead of leaving the
 * site. The language links never carry such a hash over.
 */
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { Outlet, RouterProvider, createBrowserHistory, createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { PHONE_QUERY, useBackCloses } from "@/lib/phone";
import { LanguageLinks } from "@/components/showcase/shared";

function Viewer() {
  const [open, setOpen] = useState(false);
  useBackCloses("photo", open, () => setOpen(false));
  return <main>
    <button type="button" onClick={() => setOpen(true)}>Open the photo</button>
    {open && <div role="dialog" aria-label="Photo"><button type="button" onClick={() => setOpen(false)}>Close</button></div>}
    <LanguageLinks />
  </main>;
}

/** The page as a browser opens it from a link: history index 0 unless `index` says the tab had pages of ours before. */
function openPage(url: string, index?: number) {
  window.history.replaceState(index === undefined ? null : { __TSR_index: index, __TSR_key: "earlier", key: "earlier" }, "", url);
  const root = createRootRoute({ component: Outlet });
  const page = createRoute({ getParentRoute: () => root, path: "/projects/$slug", component: Viewer });
  const router = createRouter({ routeTree: root.addChildren([page]), history: createBrowserHistory() });
  return { router, ...render(<RouterProvider router={router} />) };
}

const matchMedia = window.matchMedia;
beforeEach(() => {
  window.matchMedia = ((query: string) => ({ ...matchMedia(query), matches: query === PHONE_QUERY })) as typeof window.matchMedia;
});
afterEach(() => {
  window.matchMedia = matchMedia;
});

describe("Phone Back on a page opened from a link ending in the viewer's #photo", () => {
  it("drops the stale hash, so opening adds an entry and Back closes the viewer on the page", async () => {
    const { unmount } = openPage("/projects/valia#photo");
    await screen.findByRole("button", { name: "Open the photo" });
    await waitFor(() => expect(window.location.hash).toBe(""));
    expect(window.history.state?.__TSR_index).toBe(0);
    expect(window.location.pathname).toBe("/projects/valia");

    fireEvent.click(screen.getByRole("button", { name: "Open the photo" }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    // Its own entry: Back has a page of ours to go back to.
    await waitFor(() => expect(window.location.hash).toBe("#photo"));
    expect(window.history.state?.__TSR_index).toBe(1);

    act(() => window.history.back());
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(window.location.pathname).toBe("/projects/valia");
    expect(window.location.hash).toBe("");
    unmount();
  });

  it("after a reload with the viewer open, keeps the entry for the viewer and leaves the hash out of the language links", async () => {
    const { container, unmount } = openPage("/projects/valia#photo", 1);
    await screen.findByRole("button", { name: "Open the photo" });
    await new Promise((r) => setTimeout(r, 50));
    expect(window.location.hash).toBe("#photo");
    const hrefs = [...container.querySelectorAll<HTMLAnchorElement>(".lang-link")].map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(["/projects/valia", "/ar/projects/valia", "/zh/projects/valia"]);
    fireEvent.click(screen.getByRole("button", { name: "Open the photo" }));
    await new Promise((r) => setTimeout(r, 50));
    expect(window.history.state?.__TSR_index).toBe(1); // taken over, not added again
    unmount();
  });
});
