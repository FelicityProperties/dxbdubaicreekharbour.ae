import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { localeFromHref, localizePath, splitLocale } from "./i18n/locales";

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

  return router;
};
