/**
 * The phone layout (the stylesheet's PHONE APP sections): one breakpoint for every script that needs it, and the
 * app-style Back behaviour of the phone's sheets and viewers.
 */
import { useEffect, useRef } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";

/** Phones: the same 640px as the stylesheet's phone sections. */
export const PHONE_QUERY = "(max-width: 640px)";
/** True on a phone-sized screen. False while rendering on the server. */
export const isPhone = (): boolean => typeof window !== "undefined" && window.matchMedia(PHONE_QUERY).matches;

/**
 * Phone Back closes an open sheet or viewer, as in an app, instead of leaving the page (FelicityBot's "#chat" does
 * the same). Opening it on a phone adds a "#<key>" history entry; leaving that entry (Back) closes it; closing it any
 * other way (its X, the backdrop, Escape, a swipe) removes the entry again. Wider screens are left alone.
 *
 * To go to another page from inside the overlay, call `leave()` first and navigate with `replace` set to what it
 * returns: the new page then takes the "#<key>" entry's place, so Back from it returns to the page underneath.
 */
export function useBackCloses(key: string, isOpen: boolean, close: () => void): { leave: () => boolean } {
  const router = useRouter();
  const hash = useRouterState({ select: (s) => s.location.hash });
  const added = useRef(false); // the overlay holds a "#<key>" entry that has not been removed yet
  const adopted = useRef(false); // that entry was already in the address when it opened (a reload), not added by it
  const prevHash = useRef(hash);
  const closeRef = useRef(close);
  closeRef.current = close;

  // A "#<key>" in the address of a closed overlay at history index 0 came with the link the page was opened from (one
  // copied or shared while the overlay was open, or a bookmark): there is no page of ours behind it to go back to, so
  // that entry could never close the overlay. Drop the hash where it is (as FelicityBot does for "#chat"); opening then
  // adds an entry of its own. Further along (a reload while the overlay was open) the entry behind is this page, and
  // opening takes the entry over.
  useEffect(() => {
    const here = router.state.location;
    if (isOpen || added.current || hash !== key || (here.state.__TSR_index ?? 0) > 0) return;
    void router.navigate({ href: `${here.pathname}${here.searchStr}`, replace: true, resetScroll: false, hashScrollIntoView: false, viewTransition: false });
  }, [hash, isOpen, key, router]);

  // Opened on a phone: add the entry.
  useEffect(() => {
    if (!isOpen || added.current || !isPhone()) return;
    added.current = true;
    adopted.current = window.location.hash === `#${key}`;
    if (adopted.current) return;
    // An entry made by a plain "#…" link has no router key, so the scroll position saved for it could not be found
    // on return; give it one first (as FelicityBot does). Its index is at least 1: there is a page behind it.
    const here = router.state.location;
    if (!window.history.state?.__TSR_key) window.history.replaceState({ ...here.state, __TSR_index: Math.max(1, here.state.__TSR_index ?? 0), __hashScrollIntoViewOptions: false }, "");
    void router.navigate({ href: `${here.pathname}${here.searchStr}#${key}`, resetScroll: false, hashScrollIntoView: false, viewTransition: false });
  }, [isOpen, key, router]);

  // Back: leaving the entry closes the overlay.
  useEffect(() => {
    if (prevHash.current === key && hash !== key && added.current) {
      added.current = false;
      if (isOpen) closeRef.current();
    }
    prevHash.current = hash;
  }, [hash, isOpen, key]);

  // Closed by its own controls: remove the entry.
  useEffect(() => {
    if (isOpen || !added.current) return;
    added.current = false;
    if (window.location.hash !== `#${key}`) return;
    if (!adopted.current) { router.history.back(); return; }
    // Taken over after a reload: drop the hash where it is (the page underneath may have been scrolled since).
    const here = router.state.location;
    void router.navigate({ href: `${here.pathname}${here.searchStr}`, replace: true, resetScroll: false, hashScrollIntoView: false, viewTransition: false });
  }, [isOpen, key, router]);

  return {
    leave: () => {
      const replace = added.current && window.location.hash === `#${key}`;
      added.current = false;
      return replace;
    },
  };
}

/**
 * The bottom sheet's code (vaul, src/components/ui/drawer.tsx), shared by the menu and the Filters sheet. It is
 * fetched only when a phone needs it (when the browser is idle, or on the first tap), so computers never load it.
 */
export type DrawerKit = typeof import("@/components/ui/drawer");
let drawerKit: Promise<DrawerKit> | null = null;
export const loadDrawer = (): Promise<DrawerKit> =>
  (drawerKit ??= import("@/components/ui/drawer").catch((error: unknown) => { drawerKit = null; throw error; }));

/**
 * A sheet's code failed to load. The usual cause is a site update since this page was opened (the old file is gone);
 * a reload brings the new one. Reload at most once per visit, only while online, and never while the visitor has
 * typed something into a form on the page. Returns whether it reloads.
 */
export function reloadForMissingCode(): boolean {
  try {
    if (!navigator.onLine || sessionStorage.getItem("dxbch-code-reload")) return false;
    const typed = [...document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("form input:not([type=hidden]):not([type=checkbox]):not([type=radio]), form textarea")].some((f) => f.value.trim() !== "");
    if (typed) return false;
    sessionStorage.setItem("dxbch-code-reload", "1");
  } catch {
    return false;
  }
  window.location.reload();
  return true;
}

/**
 * On phones, a swipe row with nothing focusable inside becomes a labelled, focusable region, so a keyboard can scroll
 * it (WCAG 2.1.1). Wider screens keep their tab order. Pass the id of the heading that names the row.
 */
export function usePhoneScrollRegion<T extends HTMLElement>(labelledBy: string) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia(PHONE_QUERY);
    const apply = () => {
      if (mq.matches) { el.tabIndex = 0; el.setAttribute("role", "region"); el.setAttribute("aria-labelledby", labelledBy); }
      else { el.removeAttribute("tabindex"); el.removeAttribute("role"); el.removeAttribute("aria-labelledby"); }
    };
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, [labelledBy]);
  return ref;
}
