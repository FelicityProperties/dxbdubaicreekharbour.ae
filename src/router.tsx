import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { localeFromHref, localizePath, splitLocale } from "./i18n/locales";
import { PHONE_QUERY } from "./lib/phone";

type ViewTransitionOptions = Exclude<NonNullable<Parameters<typeof createRouter>[0]["defaultViewTransition"]>, boolean>;

/** The top-level places of the phone's bottom bar: moving between them fades, as between an app's tabs. */
const TAB_PAGES = new Set(["/", "/projects", "/market"]);

/**
 * Page transitions, phones only: a short slide (forward deeper into the site, back the other way) or a fade between
 * the bottom bar's tabs, while the top bar and the bottom bar stay put (styles.css, PHONE APP: SHELL).
 * Only a change of page animates: a "#…" jump, a filter in the address or the language switch (a full page load)
 * does not, and nothing animates on wider screens or for visitors who ask for less motion. Browsers that cannot
 * tell transitions apart by type get none at all. When the phone has already animated a back or forward step itself
 * (a swipe from the screen's edge), the page does not slide in a second time.
 */
function pageTransitions(): ViewTransitionOptions | false {
  if (typeof window === "undefined" || typeof document.startViewTransition !== "function" || !window.CSS?.supports?.("selector(:active-view-transition-type(page))")) return false;
  // Heard before the router's own listener (capture), so the step it is about to show is known to be animated already.
  let swipedAt = -Infinity;
  window.addEventListener("popstate", (e) => { swipedAt = e.hasUAVisualTransition ? e.timeStamp : -Infinity; }, { capture: true });
  return {
    types: ({ fromLocation, toLocation, pathChanged }) => {
      const swiped = performance.now() - swipedAt < 1000;
      swipedAt = -Infinity;
      if (swiped || !pathChanged || !fromLocation) return false;
      if (!window.matchMedia(PHONE_QUERY).matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
      const back = (toLocation.state.__TSR_index ?? 0) < (fromLocation.state.__TSR_index ?? 0);
      return ["page", back ? "back" : TAB_PAGES.has(toLocation.pathname) ? "tab" : "forward"];
    },
  };
}

export const getRouter = () => {
  const queryClient = new QueryClient();

  // /ar/… and /zh/… show the same pages as the bare paths: the language prefix comes off before matching
  // and goes back on every link the router builds, in the language of the page being shown. Switching
  // language is a full page load (the switcher uses plain links), so that language is fixed per page.
  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultViewTransition: pageTransitions(),
    // The phone's swipe rows open at their first item on every new page. Without this the router carries a row's
    // sideways position over to the next page whose row sits at the same place in the page. Back still restores it.
    // One selector per row: the router resets the first element each one matches.
    scrollToTopSelectors: ["#projects .app-shelf", ".aiv-grid", ".benefit-grid", ".place-grid", ".gallery.app-shelf", ".related .app-shelf"],
    rewrite: {
      input: ({ url }) => {
        url.pathname = splitLocale(url.pathname).path;
        return url;
      },
      output: ({ url }) => {
        url.pathname = localizePath(url.pathname, localeFromHref(router.latestLocation?.publicHref));
        return url;
      },
    },
  });

  // Phones open each new page at its top at once, as an app does, rather than scrolling up to it once it shows (and a
  // page sliding in mid-scroll); back still returns to where the visitor was. A link to a section of another page
  // (/guide#faq, /#enquire) lands on it at once too, instead of sweeping down thousands of pixels after the page
  // appears. Wider screens keep today's behaviour.
  if (typeof window !== "undefined") {
    const phone = window.matchMedia(PHONE_QUERY);
    const follow = () => {
      router.options.scrollRestorationBehavior = phone.matches ? "instant" : "auto";
      router.options.defaultHashScrollIntoView = phone.matches ? { block: "start", behavior: "instant" } : true;
    };
    follow();
    phone.addEventListener?.("change", follow); // missing before Safari 14
  }

  return router;
};
