import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { PHONE_QUERY, isPhone, loadDrawer, reloadForMissingCode, useBackCloses, type DrawerKit } from "@/lib/phone";
import { ArrowUpRight, ArrowRight, ArrowDown, ArrowLeft, BedDouble, CalendarDays, Menu, X, PenLine, Mail, Home, Building2, TrendingUp, Share2, Smartphone, Languages, ChevronRight, Wallet, MapPin, BookOpen, CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE, PROJECTS, imageSrc, imageSrcSet, type Project, type ProjectImage, type PlanStep } from "@/data/projects";
import { dateShort, dateText, brandLine } from "@/lib/format";
import { LOCALES, LOCALE_META, localizePath, type Locale } from "@/i18n/locales";
import { gap, msg, tFor, useLocale, useT, type T } from "@/i18n/messages";
import { Rich } from "@/i18n/rich";

/** English, for code that runs outside a page (FelicityBot's knowledge, tests): every helper below defaults to it. */
const EN = tFor("en");

export const sharingMeta = (canonicalUrl: string, image = `${SITE.url}/og-image.png`) => [
  { property: "og:image", content: image },
  { name: "twitter:image", content: image },
  { property: "og:image:width", content: "1200" },
  { property: "og:image:height", content: "630" },
  { property: "og:url", content: canonicalUrl },
];
/**
 * The operator's site for Dubai Hills Estate, in the page's language (it has the same three). The footer links to it
 * from every page, as an ordinary link that keeps the referrer: visitors and search engines find the other site, and
 * its visitor numbers name this one as the source.
 */
const DUBAI_HILLS_SITE = "https://www.dubaihillsoffplan.com";
export const dubaiHillsUrl = (locale: Locale = "en"): string => (locale === "en" ? DUBAI_HILLS_SITE : `${DUBAI_HILLS_SITE}/${locale}`);
export const GENERIC_MESSAGE = msg("Hi, I'm interested in Emaar's projects at Dubai Creek Harbour.");
/**
 * A WhatsApp message in the visitor's language, with the English underneath on Arabic and Chinese pages so
 * the broker can always read what was asked.
 */
export const waMessage = (t: T, english: string, template: string = english, vars?: Record<string, string>) =>
  t.locale === "en" ? english : `${t(template, vars)}\n\n${english}`;
export const genericMessage = (t: T = EN) => waMessage(t, GENERIC_MESSAGE);
export const projectMessage = (name: string, t: T = EN) => waMessage(t, `Hi, I'm interested in ${name} at Dubai Creek Harbour. Please send me Emaar's current price list and payment plan.`, msg("Hi, I'm interested in {name} at Dubai Creek Harbour. Please send me Emaar's current price list and payment plan."), { name });
export const whatsappUrl = (message = GENERIC_MESSAGE) => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
export const disclaimer = (t: T = EN) => t("DXB Creek Harbour is an independent property showcase run by {company}, a Dubai real-estate brokerage registered with the Real Estate Regulatory Agency. The projects shown are developed by Emaar Properties PJSC; this website is not owned, operated or endorsed by Emaar, which has given {company} its no-objection certificate (dated {noc}) to market these projects. Prices, sizes, unit counts, payment plans and handover dates are Emaar's own published figures as checked on {checked}, unless the project page gives another date or says the price was advertised at launch; all can change without notice and availability is limited — confirm current details before you commit. Registered sale and rental figures are Dubai Land Department records, dated where they are shown, and construction status is from {constructionSource}; all are shown as registered and are not valuations or advice. Images and brochures are Emaar's; project names belong to their owners.", { company: SITE.company, noc: dateText(SITE.emaarNoc, t.locale), checked: dateText(SITE.pricesCheckedOn, t.locale), constructionSource: t(SITE.constructionSource) });
export const DISCLAIMER = disclaimer();

/** The WhatsApp glyph (the phone-in-a-speech-bubble people recognise), as a plain SVG so it works anywhere an icon does. */
export function WhatsAppIcon({ className }: { className?: string | undefined }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>;
}
export function WhatsApp({ message, children, variant = "default", className = "" }: { message?: string; children?: React.ReactNode; variant?: "default" | "outline" | "brass" | "heroOutline"; className?: string }) {
  const t = useT();
  return <Button asChild variant={variant} className={className}><a href={whatsappUrl(message ?? genericMessage(t))} target="_blank" rel="noopener noreferrer"><WhatsAppIcon />{children ?? t("WhatsApp us")}</a></Button>;
}
export const mailtoUrl = (subject = "Dubai Creek Harbour enquiry", body = "") => `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ""}`;
export function Wordmark() { const home = useRouterState({ select: (s) => s.location.pathname === "/" }); return <Link to="/" {...(home ? { search: true as const } : {})} className="dxbch-lockup" lang="en" dir="ltr"><svg className="dxbch-mark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 40" aria-hidden="true" focusable="false"><path className="dxbch-arch" d="M1 30V3A34.167 34.167 0 0 1 29 3V30H26V14.5A11 11 0 0 0 4 14.5V30ZM6 30V14.5A9 9 0 0 1 24 14.5V30H21V14.5A6 6 0 0 0 9 14.5V30Z"/><path className="dxbch-water" d="M0 33.5C10.5 31.5 19.5 31.5 30 33.5C19.5 35.5 10.5 35.5 0 33.5ZM15 38.75C19.9 37.083 24.1 37.083 29 38.75C24.1 40.417 19.9 40.417 15 38.75Z"/></svg><span className="dxbch-words"><span className="dxbch-dxb">DXB</span>{" "}<span className="dxbch-sub">Creek Harbour</span></span></Link>; }

/**
 * The same page in the other languages. Plain links, so switching is a full page load: the page comes back
 * already in the new language, and search engines see real links between the language versions.
 */
export function LanguageLinks({ compact = false, onPick }: { compact?: boolean; onPick?: (e: MouseEvent<HTMLAnchorElement>) => void }) {
  const locale = useLocale();
  const at = useRouterState({ select: (s) => `${s.location.pathname}${s.location.searchStr}` });
  const hash = useRouterState({ select: (s) => s.location.hash });
  // The server never sees an address's #hash, so the first render leaves it out (as the server's HTML did: React keeps
  // the server's href when hydrating) and adds it once the page is live. While a phone sheet or viewer is open the address
  // ends in its "#menu", "#filters", "#photo" or "#chat" (so phone Back closes it): the links keep the hash of the page
  // under it, and never carry those over.
  const [pageHash, setPageHash] = useState("");
  useEffect(() => { if (!["menu", "filters", "photo", "chat"].includes(hash)) setPageHash(hash); }, [hash]);
  // An address the router could not take a language off (/zh/leads, a mistyped /ar/ar/…) has no other-language version: offer the home pages.
  const here = /^\/(ar|zh)(\/|$)/.test(at) ? "/" : `${at}${pageHash ? `#${pageHash}` : ""}`;
  // Nor has an English-only page (/leads): its Arabic and Chinese links go to those home pages too.
  const hrefFor = (l: Locale) => { const href = localizePath(here, l); return l !== "en" && href === here ? localizePath("/", l) : href; };
  const shown: readonly Locale[] = compact ? LOCALES.filter((l) => l !== locale) : LOCALES;
  return <span className={`lang-links${compact ? " compact" : ""}`}>{compact && <Languages className="lang-icon" aria-hidden="true" />}{shown.map((l) => <a key={l} href={hrefFor(l)} lang={LOCALE_META[l].htmlLang} hrefLang={LOCALE_META[l].hreflang} className={`nav-link lang-link${l === locale ? " active" : ""}`} aria-current={l === locale ? "true" : undefined} onClick={onPick}>{LOCALE_META[l].label}</a>)}</span>;
}

/**
 * Pages that render an enquiry section: "Enquire" jumps to it there (keeping the project prefilled). The others (terms,
 * privacy, leads, 404s) show no "Enquire": navigation never links to another page's #section.
 */
const pageHasForm = (path: string) => ["/", "/projects", "/payment-plans", "/market", "/area", "/guide"].includes(path) || PROJECTS.some((p) => path === `/projects/${p.slug}`);
function NavLinks({ onPick }: { onPick?: () => void }) {
  const t = useT();
  const path = useRouterState({ select: (s) => s.location.pathname });
  return <>
    <Link to="/projects" {...(path === "/projects" ? { search: true as const } : {})} className="nav-link" onClick={onPick}>{t("Projects")}</Link>
    <Link to="/market" className="nav-link" onClick={onPick}>{t("Market data")}</Link>
    <Link to="/area" className="nav-link" onClick={onPick}>{t("The area")}</Link>
    <Link to="/guide" className="nav-link" onClick={onPick}>{t("Buying guide")}</Link>
    {pageHasForm(path) && <a href="#enquire" className="nav-link" onClick={onPick}>{t("Enquire")}</a>}
  </>;
}
type InstallPromptEvent = Event & { prompt: () => Promise<void> };
/** Chrome fires beforeinstallprompt once, soon after load, and only to listeners already attached — so catch it when this module loads, before any menu opens. */
let deferredInstall: InstallPromptEvent | null = null;
if (typeof window !== "undefined") window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferredInstall = e as InstallPromptEvent; });
/** "Add to home screen": the real install prompt where the browser offers one (Android/Chrome), a one-line hint on iPhone, nothing once installed. */
function InstallHint() {
  const t = useT();
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [mode, setMode] = useState<"unknown" | "installed" | "ios" | "other">("unknown");
  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setMode(standalone ? "installed" : /iPhone|iPad|iPod/.test(navigator.userAgent) ? "ios" : "other");
    setPrompt(deferredInstall);
    const onPrompt = (e: Event) => { e.preventDefault(); deferredInstall = e as InstallPromptEvent; setPrompt(deferredInstall); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);
  if (mode === "installed") return null;
  if (prompt) return <div className="app-menu-group"><button type="button" className="app-menu-row install-hint" onClick={() => { const p = prompt; deferredInstall = null; setPrompt(null); void p.prompt(); }}><Smartphone aria-hidden="true" /><span className="app-menu-label">{t("Add to home screen")}</span></button></div>;
  if (mode === "ios") return <p className="app-menu-note install-hint"><Smartphone aria-hidden="true" /><span>{t("Add to your home screen: tap Share, then \"Add to Home Screen\".")}</span></p>;
  return null;
}

/* ── The phone app shell: top bar, menu sheet, bottom bar ───────────────────────────────────────────────────── */
/** A plain tap or left click; a new tab or window is left to the browser. */
const plainClick = (e: MouseEvent) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
const scrollToTop = () => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
/** The open menu sheet, for the menu button's aria-controls. */
const MENU_ID = "app-menu-sheet";

/**
 * iOS-style large title: once an inner page's heading has scrolled up under the top bar, the bar shows it in place
 * of the logo (phones only; the home page keeps the logo). Watches the page's own h1 again after every navigation.
 */
function useBarTitle(path: string) {
  const [bar, setBar] = useState({ text: "", shown: false });
  useEffect(() => {
    setBar({ text: "", shown: false });
    if (path === "/" || !isPhone() || typeof IntersectionObserver === "undefined") return;
    let observer: IntersectionObserver | undefined;
    let frame = 0;
    let tries = 0;
    const watch = () => {
      const h1 = document.querySelector<HTMLElement>("main h1");
      if (!h1) { if (++tries < 60) frame = requestAnimationFrame(watch); return; }
      const text = h1.innerText.replace(/\s+/g, " ").trim();
      const top = Math.round(document.querySelector(".site-header")?.getBoundingClientRect().bottom ?? 56);
      observer = new IntersectionObserver(([entry]) => { if (entry) setBar({ text, shown: !entry.isIntersecting && entry.boundingClientRect.top < top }); }, { rootMargin: `-${top}px 0px 0px 0px` });
      observer.observe(h1);
    };
    watch();
    return () => { cancelAnimationFrame(frame); observer?.disconnect(); };
  }, [path]);
  return bar;
}

type MenuPage = "/projects" | "/payment-plans" | "/market" | "/area" | "/guide" | "/terms" | "/privacy";
/**
 * The phone menu: a bottom sheet of the site's pages, the ways to reach us, the languages and the legal pages.
 * Phone Back closes it (the "#menu" history entry, see Header). A row that leaves the page calls leave() first, and the
 * next page or "#…" jump takes the place of that entry, so Back from it returns to the page the menu was opened on.
 */
function AppMenu({ kit, open, onOpenChange, onClosed, leave }: { kit: DrawerKit; open: boolean; onOpenChange: (open: boolean) => void; onClosed: () => void; leave: () => boolean }) {
  const t = useT();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const router = useRouter();
  const content = useRef<HTMLDivElement>(null);
  const { Drawer, DrawerContent, DrawerTitle, DrawerClose } = kit;
  const close = () => onOpenChange(false);
  // A "#…" jump waits until the sheet has gone: while it is open the page behind it is held still, which would cancel the scroll.
  const jump = useRef<(() => void) | null>(null);
  const after = (go: (replace: boolean) => void) => (e: MouseEvent) => { if (!plainClick(e)) return; e.preventDefault(); const replace = leave(); jump.current = () => go(replace); close(); };
  const toEnquire = (replace: boolean) => { if (window.location.hash === "#enquire") document.getElementById("enquire")?.scrollIntoView(); else if (replace) window.location.replace("#enquire"); else window.location.hash = "enquire"; };
  // The router ignores a link to the address already shown, so on /guide#faq the FAQs row scrolls there itself.
  const toFaq = (replace: boolean) => { const l = router.state.location; if (l.pathname === "/guide" && l.hash === "faq") document.getElementById("faq")?.scrollIntoView(); else void router.navigate({ to: "/guide", hash: "faq", replace, viewTransition: false }); };
  // Another page: the sheet itself is the transition (the page changes under it as it slides away). This page's own row only closes the sheet.
  const goTo = (to: MenuPage) => (e: MouseEvent) => {
    if (plainClick(e)) { e.preventDefault(); if (to !== path) void router.navigate({ to, replace: leave(), viewTransition: false }); }
    close();
  };
  const chevron = <ChevronRight className="app-menu-end" aria-hidden="true" />;
  const outward = <ArrowUpRight className="app-menu-end" aria-hidden="true" />;
  const row = (to: MenuPage, icon: ReactNode, label: string) => <li><Link to={to} className="app-menu-row" onClick={goTo(to)}>{icon}<span className="app-menu-label">{label}</span>{chevron}</Link></li>;
  const enquire = <><PenLine aria-hidden="true" /><span className="app-menu-label">{t("Enquire")}</span>{chevron}</>;
  return <Drawer open={open} onOpenChange={onOpenChange}>
    <DrawerContent ref={content} id={MENU_ID} className="app-menu" overlayClassName="app-menu-overlay" aria-describedby={undefined}
      onOpenAutoFocus={(e) => { e.preventDefault(); content.current?.focus({ preventScroll: true }); }}
      onCloseAutoFocus={(e) => { e.preventDefault(); const go = jump.current; jump.current = null; if (go) go(); else onClosed(); }}>
      <div className="app-menu-head"><DrawerTitle className="app-menu-title">{t("Menu")}</DrawerTitle><DrawerClose className="app-menu-close" aria-label={t("Close navigation")}><X aria-hidden="true" /></DrawerClose></div>
      <div className="app-menu-body">
        <nav aria-label={t("Mobile navigation")}><ul className="app-menu-group">
          {row("/projects", <Building2 aria-hidden="true" />, t("Projects"))}
          {row("/payment-plans", <Wallet aria-hidden="true" />, t("Payment plans"))}
          {row("/market", <TrendingUp aria-hidden="true" />, t("Market data"))}
          {row("/area", <MapPin aria-hidden="true" />, t("The area"))}
          {row("/guide", <BookOpen aria-hidden="true" />, t("Buying guide"))}
          <li><Link to="/guide" hash="faq" activeProps={{}} activeOptions={{ includeHash: true }} className="app-menu-row" onClick={after(toFaq)}><CircleHelp aria-hidden="true" /><span className="app-menu-label">{t("FAQs")}</span>{chevron}</Link></li>
        </ul></nav>
        <ul className="app-menu-group">
          <li><a href={whatsappUrl(genericMessage(t))} target="_blank" rel="noopener noreferrer" className="app-menu-row app-menu-wa" onClick={close}><WhatsAppIcon /><span className="app-menu-label">{t("WhatsApp us")}<span className="app-menu-sub"><span dir="ltr">{SITE.whatsappDisplay}</span></span></span>{outward}</a></li>
          <li><a href={mailtoUrl()} className="app-menu-row" onClick={close}><Mail aria-hidden="true" /><span className="app-menu-label">{t("Email")}<span className="app-menu-sub"><span dir="ltr">{SITE.email}</span></span></span>{outward}</a></li>
          {pageHasForm(path) && <li><a href="#enquire" className="app-menu-row" onClick={after(toEnquire)}>{enquire}</a></li>}
        </ul>
        {/* A full page load: it too takes the place of the "#menu" entry. */}
        <div className="app-menu-lang"><Languages aria-hidden="true" /><LanguageLinks onPick={(e) => { if (plainClick(e) && leave()) { e.preventDefault(); window.location.replace(e.currentTarget.href); } else close(); }} /></div>
        <InstallHint />
        <p className="app-menu-legal"><Link to="/terms" onClick={goTo("/terms")}>{t("Terms")}</Link><Link to="/privacy" onClick={goTo("/privacy")}>{t("Privacy")}</Link></p>
      </div>
    </DrawerContent>
  </Drawer>;
}

export function Header() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [kit, setKit] = useState<DrawerKit | null>(null);
  const [used, setUsed] = useState(false); // the sheet is only mounted once it has been opened
  const path = useRouterState({ select: (s) => s.location.pathname });
  // The page on screen (the address changes before the next page has rendered).
  const shown = useRouterState({ select: (s) => (s.resolvedLocation ?? s.location).pathname });
  const router = useRouter();
  const toggle = useRef<HTMLButtonElement>(null);
  const bar = useBarTitle(shown);
  // The fixed pages show their short menu names in the bar (their headings are whole sentences); project pages and the rest show their heading.
  const short: Partial<Record<string, string>> = { "/projects": t("Projects"), "/payment-plans": t("Payment plans"), "/market": t("Market data"), "/area": t("The area"), "/guide": t("Buying guide"), "/terms": t("Terms"), "/privacy": t("Privacy") };
  // Phone Back closes the open menu instead of leaving the page.
  const { leave } = useBackCloses("menu", open, () => setOpen(false));
  // Any navigation closes the phone menu: wordmark, back arrow and bottom bar all change the path.
  useEffect(() => { setOpen(false); }, [path]);
  // Phones fetch the menu sheet once the page is idle, so the first tap opens it at once.
  useEffect(() => {
    if (!isPhone()) return;
    const fetchKit = () => { loadDrawer().then(setKit, () => {}); };
    if (typeof window.requestIdleCallback === "function") { const id = window.requestIdleCallback(fetchKit, { timeout: 4000 }); return () => window.cancelIdleCallback(id); }
    const id = window.setTimeout(fetchKit, 2000);
    return () => window.clearTimeout(id);
  }, []);
  // Turned past the phone layout (a tablet rotated), the sheet closes: the full navigation shows again.
  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia(PHONE_QUERY);
    const onChange = () => { if (!mq.matches) setOpen(false); };
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [open]);
  // The sheet's code did not arrive (a patchy connection, or a site update since this page loaded removed the old file).
  // The browser keeps that failure for this page, so only a reload brings the code: reloadForMissingCode() reloads once
  // per visit, and never while something typed into a form would be lost.
  const openMenu = () => {
    if (kit) { setUsed(true); setOpen(true); return; }
    loadDrawer().then((k) => { setKit(k); setUsed(true); setOpen(true); }, () => { reloadForMissingCode(); });
  };
  return <header className={`site-header${bar.shown ? " has-title" : ""}`}><div className="container header-inner">{path !== "/" && <button type="button" className="mobile-back" aria-label={t("Back")} onClick={() => { if (router.history.canGoBack() || window.history.state == null) router.history.back(); else void router.navigate({ to: "/" }); }}><ArrowLeft /></button>}<Wordmark /><nav className="main-nav" aria-label={t("Main navigation")}><NavLinks /><LanguageLinks compact /><WhatsApp variant="outline" className="header-wa">{t("Let's talk")} <ArrowUpRight /></WhatsApp></nav><p className="app-bar-title hidden" aria-hidden="true"><span>{short[shown] ?? bar.text}</span></p><Button ref={toggle} variant="ghost" size="icon" className="mobile-toggle" aria-label={t("Open navigation")} aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? MENU_ID : undefined} onClick={openMenu}><Menu /></Button></div>{kit && used && <AppMenu kit={kit} open={open} onOpenChange={setOpen} onClosed={() => toggle.current?.focus({ preventScroll: true })} leave={leave} />}</header>;
}
export function Footer() {
  const t = useT();
  const path = useRouterState({ select: (s) => s.location.pathname });
  // The floating WhatsApp and e-mail buttons sit inside the footer: fixed to the screen all the same, but part of
  // the page's contact landmark, so no content is left outside every landmark for screen-reader users.
  return <><footer className="site-footer"><div className="container"><div className="footer-top"><Wordmark /><nav className="footer-nav" aria-label={t("Footer navigation")}><Link to="/projects" {...(path === "/projects" ? { search: true as const } : {})}>{t("Projects")}</Link><Link to="/payment-plans">{t("Payment plans")}</Link><Link to="/market">{t("Market data")}</Link><Link to="/area">{t("The area")}</Link><Link to="/guide">{t("Buying guide")}</Link><Link to="/guide" hash="faq">{t("FAQs")}</Link><Link to="/terms">{t("Terms")}</Link><Link to="/privacy">{t("Privacy")}</Link><a href={whatsappUrl(genericMessage(t))} target="_blank" rel="noopener noreferrer">WhatsApp <ArrowUpRight className="inline size-3" /></a><a href={mailtoUrl()}>{t("Email")} <ArrowUpRight className="inline size-3" /></a></nav></div><LanguageLinks /><p className="disclaimer">{disclaimer(t)}</p><p className="disclaimer"><Rich text={t("We use the details you send us to answer your enquiry and to follow up on it — see the <privacy>Privacy Notice</privacy> and <terms>Terms of Use</terms>.")} tags={{ privacy: (s) => <Link to="/privacy">{s}</Link>, terms: (s) => <Link to="/terms">{s}</Link> }} />{SITE.company && `${gap(t)}${SITE.licence ? t("Operated by {company} ({licence}).", { company: SITE.company, licence: t(SITE.licence) }) : t("Operated by {company}.", { company: SITE.company })}`}</p>{SITE.dldPermit && <p className="disclaimer">{t("Advertising permit (Trakheesi) No. {permit}", { permit: SITE.dldPermit })}</p>}{SITE.company && <p className="disclaimer"><Rich text={t("Also from {company}: <site>DXB Dubai Hills, every Dubai Hills Estate project, off-plan and ready</site>.", { company: SITE.company })} tags={{ site: (s) => <a href={dubaiHillsUrl(t.locale)} target="_blank" rel="noopener" className="underline underline-offset-4">{s}</a> }} /></p>}<div className="footer-bottom"><span>DXB Creek Harbour · {SITE.company} · WhatsApp <span dir="ltr">{SITE.whatsappDisplay}</span> · <a href={mailtoUrl()}>{SITE.email}</a></span><span>{t("{address}, United Arab Emirates", { address: t(SITE.address) })}</span></div></div><Button asChild className="floating-wa" size="icon"><a href={whatsappUrl(genericMessage(t))} target="_blank" rel="noopener noreferrer" aria-label={t("Chat on WhatsApp")} title={t("Chat on WhatsApp")}><WhatsAppIcon /></a></Button><Button asChild className="floating-mail" size="icon"><a href={mailtoUrl()} aria-label={t("Email us at {email}", { email: SITE.email })} title={t("Email us: {email}", { email: SITE.email })}><Mail /></a></Button></footer></>;
}
/**
 * Phone-only bottom tab bar, app style: the three places people go plus the two things they do. Tapping the tab
 * you are on scrolls back to the top. On a project's page it becomes that project's contact bar. A page without an
 * enquiry form leaves "Enquire" out (no link to another page's #enquire), and its four tabs spread across the bar.
 */
export function MobileBar() {
  const t = useT();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const project = PROJECTS.find((p) => path === `/projects/${p.slug}`);
  if (project) return <ProjectBar project={project} />;
  const hasForm = pageHasForm(path);
  // activeProps={{}} keeps the router from adding its own "active" class, so only tab() decides the highlight
  // (the router still marks the active link aria-current="page").
  const tab = (active: boolean, here: boolean) => ({ className: `tab${active ? " active" : ""}`, onClick: (e: MouseEvent) => { if (here && plainClick(e)) { e.preventDefault(); scrollToTop(); } } });
  const icon = (glyph: ReactNode, label: string) => <><span className="tab-icon">{glyph}</span><span className="tab-label">{label}</span></>;
  return <nav className="mobile-bar" aria-label={t("Quick navigation")}>
    <Link to="/" activeProps={{}} {...tab(path === "/", path === "/")}>{icon(<Home />, t("Home"))}</Link>
    <Link to="/projects" activeProps={{}} {...tab(path.startsWith("/projects"), path === "/projects")}>{icon(<Building2 />, t("Projects"))}</Link>
    <Link to="/market" activeProps={{}} {...tab(path.startsWith("/market"), path === "/market")}>{icon(<TrendingUp />, t("Market"))}</Link>
    {hasForm && <a href="#enquire" className="tab">{icon(<PenLine />, t("Enquire"))}</a>}
    <a href={whatsappUrl(genericMessage(t))} target="_blank" rel="noopener noreferrer" className="tab tab-wa">{icon(<WhatsAppIcon />, "WhatsApp")}</a>
  </nav>;
}
/** A project's page: its price line and name, then Enquire and WhatsApp. Still the .mobile-bar, so a WhatsApp tap here counts as the bar's. */
function ProjectBar({ project }: { project: Project }) {
  const t = useT();
  // The bar has no room for the price's note, so it shows a figure only when it is today's price (units Emaar lists, or a
  // project Emaar is selling now). A resale project's launch price stays on the page, with its note.
  const current = !!project.pricesFrom || project.status === "Now selling";
  return <nav className="mobile-bar project-bar" aria-label={t("Quick navigation")}>
    <p className="pbar-info"><span className="pbar-price">{current ? priceSummary(project, t).main : t("Price on request")}</span><span className="pbar-name">{project.name}</span></p>
    <a href="#enquire" className="pbar-enquire"><PenLine aria-hidden="true" />{t("Enquire")}</a>
    <a href={whatsappUrl(projectMessage(project.name, t))} target="_blank" rel="noopener noreferrer" className="pbar-wa" aria-label={t("Chat on WhatsApp")}><WhatsAppIcon /></a>
  </nav>;
}
/** Native share sheet on phones; copies the link elsewhere. */
export function ShareButton({ title, url, text }: { title: string; url: string; text?: string }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  return <Button variant="outline" onClick={async () => {
    try {
      if (typeof navigator.share === "function") await navigator.share({ title, url, ...(text ? { text } : {}) });
      else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    } catch { /* the person closed the share sheet */ }
  }}><Share2 />{copied ? t("Link copied") : t("Share")}</Button>;
}

/** One honest status line per project, from Emaar's listing and the DLD completion status. */
export function statusLabel(p: Project, t: T = EN): string {
  if (p.isNewLaunch) return t("New launch");
  if (p.status === "Now selling") return p.construction === "completed" ? t("Ready · now selling") : t("Now selling");
  if (p.status === "Ready") return t("Ready · resale");
  return t("Resale · under construction");
}
export function StatusBadge({ project }: { project: Project }) { const t = useT(); return <span className="status-badge">{statusLabel(project, t)}</span>; }

export function priceSummary(p: Project, t: T = EN): { main: string; note: string | null } {
  const checked = dateText(SITE.pricesCheckedOn, t.locale);
  if (p.pricesFrom) {
    const units = p.unitsListed ? (p.unitsListed === 1 ? t("{n} unit listed by Emaar on {date}", { n: 1, date: checked }) : t("{n} units listed by Emaar on {date}", { n: p.unitsListed, date: checked })) : p.pricesFromNote && t(p.pricesFromNote);
    const start = p.startingPrice && t("project starting price {price}", { price: p.startingPrice });
    return { main: t("From {price}", { price: p.pricesFrom }), note: start ? `${units || ""}${units ? " · " : ""}${start}` : units || null };
  }
  if (p.startingPrice) return { main: t("From {price}", { price: p.startingPrice }), note: p.status === "Now selling" ? t("Emaar's advertised starting price, checked {date}", { date: checked }) : t("Emaar's advertised starting price at launch — resale prices on request") };
  return { main: t("Price on request"), note: p.status === "Ready" ? t("Completed building — resale and rental options on request") : t("Ask us for current availability") };
}
export function handoverText(p: Project, t: T = EN): string {
  if (p.construction === "completed") return t("Completed");
  if (p.handover) return t("Est. handover {date}", { date: dateShort(p.handover.text, t.locale) });
  if (p.construction === "under_construction") return t("Under construction");
  return p.isNewLaunch ? t("New launch") : t("Construction status on request");
}
/** The brand line in the page's language: "Palace-branded" is a description ("{brand}-branded"); "by Palace" is part of the name and stays. */
export function brandText(p: { name: string; brand: string | null }, t: T = EN): string | null {
  const b = brandLine(p);
  const m = b && /^(.+)-branded$/.exec(b);
  return m ? t("{brand}-branded", { brand: m[1]! }) : b;
}
/** "1–4 bedrooms", or the data's own wording when it already says bedrooms ("1–3 bedrooms, 4-bedroom penthouses"). */
export const bedroomsLabel = (p: Project, t: T = EN): string => (p.bedrooms.includes("bedroom") ? t(p.bedrooms) : t("{range} bedrooms", { range: p.bedrooms }));
/** Sort key for "soonest handover first": completed buildings lead, then Emaar's estimated dates, then the rest. */
export const handoverSortKey = (p: Project) => (p.construction === "completed" ? "0000" : p.handover?.text ?? "9999");
/** How a project without a published Emaar instalment plan is paid, by status (project page and FelicityBot). */
export function noPlanText(p: Project, t: T = EN): string {
  if (p.status === "Now selling") {
    if (p.construction === "completed") return t("This is a completed building: Emaar's listed units are paid in full on transfer, with a mortgage if you need one. Ask us for today's terms on the unit you like.");
    if (p.construction === "under_construction" || p.isNewLaunch) return t("Emaar publishes the dated instalment schedule when you reserve a unit. Ask us for the current schedule and the next instalment dates.");
    return t("Ask us for today's terms on the unit you like — DLD records do not state this building's construction status.");
  }
  if (p.status === "Resale") return t("On a resale you reimburse the seller's paid instalments, agree any premium, and take over the remaining schedule with Emaar. We confirm the exact figures with Emaar before you commit.");
  return t("This is a completed building: you pay the full price on transfer, with a mortgage if you need one — UAE banks lend to residents and non-residents on completed homes.");
}
/** What a buyer can actually pay today: the lowest listed unit when Emaar lists units, else the advertised starting price. */
export function minPriceAed(p: Project): number | null {
  return p.pricesFromAed ?? p.startingPriceAed ?? null;
}
export function bedroomRange(p: Project): [number, number] | null {
  const d = p.bedrooms.match(/\d/g)?.map(Number) ?? [];
  return d.length ? [Math.min(...d), Math.max(...d)] : null;
}

export function Picture({ img, sizes = "(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw", priority = false, eager = false, className, width = 960, onError }: { img: ProjectImage; sizes?: string; priority?: boolean; eager?: boolean; className?: string | undefined; width?: number; onError?: () => void }) {
  const t = useT();
  return <img src={imageSrc(img, width)} srcSet={imageSrcSet(img)} sizes={sizes} alt={t(img.caption)} width={img.w} height={img.h} loading={priority || eager ? "eager" : "lazy"} decoding="async" fetchPriority={priority ? "high" : "auto"} className={className} ref={(element) => { if (onError && element?.complete && element.naturalWidth === 0) onError(); }} onError={onError} />;
}
/** A project's drawn panel: the page banner (`large`), or a card's cover when its photo fails, where the name links to the project. */
export function ProjectArt({ project, index = 0, large = false }: { project: Project; index?: number; large?: boolean }) { const t = useT(); return <div className={`project-art ${index % 3 === 1 ? "tone-sand" : index % 3 === 2 ? "tone-ink" : ""} ${large ? "detail-banner" : ""}`}><span className="art-caption">{t("Dubai Creek Harbour")}</span>{!large && <StatusBadge project={project} />}{large ? <p className="art-name">{project.name}</p> : <h3><Link to="/projects/$slug" params={{ slug: project.slug }}>{project.name}</Link></h3>}{brandLine(project) && <span className="brand">{brandText(project, t)}</span>}</div>; }
/**
 * A project in a list. On phones the whole card opens the project: the name's link is stretched over it in
 * src/styles.css, and the two buttons sit above that. `sizes` overrides the cover's image sizes (the home page's
 * swipe row shows cards narrower than the screen). `priority`: the cover is the page's largest image (the first
 * card on /projects), so it loads at once instead of waiting until it scrolls into view.
 */
export function ProjectCard({ project, index = 0, sizes, priority = false }: { project: Project; index?: number; sizes?: string; priority?: boolean }) {
  const t = useT();
  const [failed, setFailed] = useState(false);
  const image = project.images[0];
  const price = priceSummary(project, t);
  return <article className="project-card">{image && !failed ? <div className="card-cover"><Picture img={image} priority={priority} onError={() => setFailed(true)} {...(sizes ? { sizes } : {})} /><StatusBadge project={project} /></div> : <ProjectArt project={project} index={index} />}<div className="card-body">{image && !failed && <><h3 className="card-name"><Link to="/projects/$slug" params={{ slug: project.slug }}>{project.name}</Link></h3>{brandLine(project) && <p className="card-brand">{brandText(project, t)}</p>}</>}{project.district && <div className="card-chips"><span className="chip">{t(project.district)}</span></div>}<p className="card-price">{price.main}</p><p className="price-note">{price.note ?? ""}</p><div className="card-facts"><span><BedDouble />{bedroomsLabel(project, t)}</span><span><CalendarDays />{handoverText(project, t)}</span></div><div className="card-actions"><Button asChild variant="outline" size="sm"><Link to="/projects/$slug" params={{ slug: project.slug }}>{t("View project")}<span className="sr-only">{t(": {name}@@after the \"View project\" button text, read only by screen readers", { name: project.name })}</span> <ArrowUpRight /></Link></Button><WhatsApp message={projectMessage(project.name, t)} className="card-whatsapp text-xs">WhatsApp</WhatsApp></div></div></article>;
}
export function PlanBar({ steps }: { steps: PlanStep[] }) { const t = useT(); return <div className="plan-bar" role="img" aria-label={steps.map((s) => t("{place}: {text}", { place: t(s.label), text: `${s.percent}%` })).join(t(", "))}>{steps.map((step) => <div key={step.label} className={`plan-segment ${step.label.startsWith("On booking") ? "booking" : step.label.startsWith("On handover") ? "handover" : "construction"}`} style={{ flexGrow: step.percent, flexBasis: 0 }} title={t("{place}: {text}", { place: t(step.label), text: `${step.percent}%` })}>{step.percent}%</div>)}</div>; }
export function CtaBand({ project }: { project?: Project }) { const t = useT(); return <section className="cta-band"><div className="container cta-inner"><div><span className="eyebrow">{t("A conversation, not a commitment")}</span><h2>{project ? t("Interested in {name}? Let's talk.", { name: project.name }) : t("Tell us your budget and bedrooms — we'll send what's available today.")}</h2></div><div className="flex flex-wrap gap-3"><WhatsApp variant="brass" message={project ? projectMessage(project.name, t) : genericMessage(t)}>{t("WhatsApp us")} <ArrowUpRight /></WhatsApp><Button asChild variant="heroOutline"><a href="#enquire"><PenLine />{t("Leave your details")}</a></Button></div></div></section>; }
/** A heading with one line break: translations keep the "|" where the line may break. */
function TwoLines({ text }: { text: string }) { const [a, b] = text.split("|"); return <>{a}{b !== undefined && <><br />{b}</>}</>; }
export function ProjectNotFound() { const t = useT(); return <main className="container unavailable"><span className="eyebrow">{t("Project unavailable")}</span><h1><TwoLines text={t("Let's find your place|at the Creek.")} /></h1><p>{t("We couldn't find that project. Explore the current collection or ask us on WhatsApp.")}</p><div className="flex flex-wrap gap-3"><Button asChild><Link to="/projects">{t("View all projects")} <ArrowRight /></Link></Button><WhatsApp variant="outline" /></div></main>; }
export function PageNotFound() { const t = useT(); return <main className="container unavailable"><span className="eyebrow">{t("Page not found")}</span><h1><TwoLines text={t("Let's find your place|at the Creek.")} /></h1><p>{t("That page doesn't exist. Explore the current collection or ask us on WhatsApp.")}</p><div className="flex flex-wrap gap-3"><Button asChild><Link to="/projects">{t("View all projects")} <ArrowRight /></Link></Button><WhatsApp variant="outline" /></div></main>; }
/**
 * Credits a figure or text to its publisher ("Source: Emaar") as plain text. The site never links to Emaar's or
 * any developer's website: visitors ask us for brochures, floor plans and price lists on WhatsApp instead.
 */
export function SourceCredit({ children }: { children?: React.ReactNode }) { const t = useT(); return <span className="src-note">{children ?? t("Source")}</span>; }
export { ArrowDown, ArrowUpRight, ArrowRight };
