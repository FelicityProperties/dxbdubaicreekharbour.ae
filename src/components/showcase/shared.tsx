import { useEffect, useState } from "react";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight, ArrowRight, ArrowDown, ArrowLeft, BedDouble, CalendarDays, Menu, X, PenLine, Mail, Home, Building2, TrendingUp, Share2, Smartphone, Languages } from "lucide-react";
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
export const disclaimer = (t: T = EN) => t("DXB Creek Harbour is an independent property showcase run by {company}, a Dubai real-estate brokerage registered with the Real Estate Regulatory Agency. The projects shown are developed by Emaar Properties PJSC; this website is not owned, operated or endorsed by Emaar, which has given {company} its no-objection certificate (dated {noc}) to market these projects. Prices, sizes, unit counts, payment plans and handover dates are Emaar's own published figures as checked on {checked}; all can change without notice and availability is limited — confirm current details before you commit. Registered sale and rental figures and construction status are {constructionSource}; they are shown as registered and are not valuations or advice. Images and brochures are Emaar's; project names belong to their owners.", { company: SITE.company, noc: dateText(SITE.emaarNoc, t.locale), checked: dateText(SITE.pricesCheckedOn, t.locale), constructionSource: t(SITE.constructionSource) });
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
export function Wordmark() { return <Link to="/" className="dxbch-lockup" lang="en" dir="ltr"><svg className="dxbch-mark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 40" aria-hidden="true" focusable="false"><path className="dxbch-arch" d="M1 30V3A34.167 34.167 0 0 1 29 3V30H26V14.5A11 11 0 0 0 4 14.5V30ZM6 30V14.5A9 9 0 0 1 24 14.5V30H21V14.5A6 6 0 0 0 9 14.5V30Z"/><path className="dxbch-water" d="M0 33.5C10.5 31.5 19.5 31.5 30 33.5C19.5 35.5 10.5 35.5 0 33.5ZM15 38.75C19.9 37.083 24.1 37.083 29 38.75C24.1 40.417 19.9 40.417 15 38.75Z"/></svg><span className="dxbch-words"><span className="dxbch-dxb">DXB</span>{" "}<span className="dxbch-sub">Creek Harbour</span></span></Link>; }

/**
 * The same page in the other languages. Plain links, so switching is a full page load: the page comes back
 * already in the new language, and search engines see real links between the language versions.
 */
export function LanguageLinks({ compact = false, onPick }: { compact?: boolean; onPick?: () => void }) {
  const locale = useLocale();
  const at = useRouterState({ select: (s) => `${s.location.pathname}${s.location.searchStr}` });
  const hash = useRouterState({ select: (s) => s.location.hash });
  // The server never sees an address's #hash, so the first render leaves it out (as the server's HTML did: React keeps
  // the server's href when hydrating) and adds it once the page is live.
  const [live, setLive] = useState(false);
  useEffect(() => setLive(true), []);
  // An address the router could not take a language off (/zh/leads, a mistyped /ar/ar/…) has no other-language version: offer the home pages.
  const here = /^\/(ar|zh)(\/|$)/.test(at) ? "/" : `${at}${live && hash ? `#${hash}` : ""}`;
  // Nor has an English-only page (/leads): its Arabic and Chinese links go to those home pages too.
  const hrefFor = (l: Locale) => { const href = localizePath(here, l); return l !== "en" && href === here ? localizePath("/", l) : href; };
  const shown: readonly Locale[] = compact ? LOCALES.filter((l) => l !== locale) : LOCALES;
  return <span className={`lang-links${compact ? " compact" : ""}`}>{compact && <Languages className="lang-icon" aria-hidden="true" />}{shown.map((l) => <a key={l} href={hrefFor(l)} lang={LOCALE_META[l].htmlLang} hrefLang={LOCALE_META[l].hreflang} className={`nav-link lang-link${l === locale ? " active" : ""}`} aria-current={l === locale ? "true" : undefined} onClick={onPick}>{LOCALE_META[l].label}</a>)}</span>;
}

/** Pages that render an enquiry section: "Enquire" jumps to it there (keeping the project prefilled); everything else (terms, privacy, leads, 404s) goes to the home form. */
const pageHasForm = (path: string) => ["/", "/projects", "/payment-plans", "/market", "/area", "/guide"].includes(path) || PROJECTS.some((p) => path === `/projects/${p.slug}`);
function NavLinks({ onPick }: { onPick?: () => void }) {
  const t = useT();
  const path = useRouterState({ select: (s) => s.location.pathname });
  return <>
    <Link to="/projects" className="nav-link" onClick={onPick}>{t("Projects")}</Link>
    <Link to="/market" className="nav-link" onClick={onPick}>{t("Market data")}</Link>
    <Link to="/area" className="nav-link" onClick={onPick}>{t("The area")}</Link>
    <Link to="/guide" className="nav-link" onClick={onPick}>{t("Buying guide")}</Link>
    {pageHasForm(path) ? <a href="#enquire" className="nav-link" onClick={onPick}>{t("Enquire")}</a> : <Link to="/" hash="enquire" className="nav-link" onClick={onPick}>{t("Enquire")}</Link>}
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
  if (prompt) return <button type="button" className="nav-link install-hint" onClick={() => { const p = prompt; deferredInstall = null; setPrompt(null); void p.prompt(); }}><Smartphone className="inline size-3.5 me-1.5" />{t("Add to home screen")}</button>;
  if (mode === "ios") return <span className="install-hint nav-note"><Smartphone className="inline size-3.5 me-1.5" />{t("Add to your home screen: tap Share, then \"Add to Home Screen\".")}</span>;
  return null;
}
export function Header() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const router = useRouter();
  // Any navigation closes the phone menu: wordmark, back arrow and bottom bar all change the path.
  useEffect(() => { setOpen(false); }, [path]);
  return <header className="site-header"><div className="container header-inner">{path !== "/" && <button type="button" className="mobile-back" aria-label={t("Back")} onClick={() => { if (router.history.canGoBack() || window.history.state == null) router.history.back(); else void router.navigate({ to: "/" }); }}><ArrowLeft /></button>}<Wordmark /><nav className="main-nav" aria-label={t("Main navigation")}><NavLinks /><LanguageLinks compact /><WhatsApp variant="outline" className="header-wa">{t("Let's talk")} <ArrowUpRight /></WhatsApp></nav><Button variant="ghost" size="icon" className="mobile-toggle" aria-label={open ? t("Close navigation") : t("Open navigation")} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button></div>{open && <nav className="mobile-nav" aria-label={t("Mobile navigation")}><NavLinks onPick={() => setOpen(false)} /><WhatsApp /><a href={mailtoUrl()} className="nav-link"><Mail className="inline size-3.5 me-1.5" /><span dir="ltr">{SITE.email}</span></a><InstallHint /><LanguageLinks onPick={() => setOpen(false)} /><div className="nav-small"><Link to="/terms" onClick={() => setOpen(false)}>{t("Terms")}</Link><Link to="/privacy" onClick={() => setOpen(false)}>{t("Privacy")}</Link></div></nav>}</header>;
}
export function Footer() {
  const t = useT();
  return <><footer className="site-footer"><div className="container"><div className="footer-top"><Wordmark /><nav className="footer-nav" aria-label={t("Footer navigation")}><Link to="/projects">{t("Projects")}</Link><Link to="/payment-plans">{t("Payment plans")}</Link><Link to="/market">{t("Market data")}</Link><Link to="/area">{t("The area")}</Link><Link to="/guide">{t("Buying guide")}</Link><Link to="/guide" hash="faq">{t("FAQs")}</Link><Link to="/terms">{t("Terms")}</Link><Link to="/privacy">{t("Privacy")}</Link><a href={whatsappUrl(genericMessage(t))} target="_blank" rel="noopener noreferrer">WhatsApp <ArrowUpRight className="inline size-3" /></a><a href={mailtoUrl()}>{t("Email")} <ArrowUpRight className="inline size-3" /></a></nav></div><LanguageLinks /><p className="disclaimer">{disclaimer(t)}</p><p className="disclaimer"><Rich text={t("We use the details you send us to answer your enquiry and to follow up on it — see the <privacy>Privacy Notice</privacy> and <terms>Terms of Use</terms>.")} tags={{ privacy: (s) => <Link to="/privacy">{s}</Link>, terms: (s) => <Link to="/terms">{s}</Link> }} />{SITE.company && `${gap(t)}${SITE.licence ? t("Operated by {company} ({licence}).", { company: SITE.company, licence: t(SITE.licence) }) : t("Operated by {company}.", { company: SITE.company })}`}</p>{SITE.dldPermit && <p className="disclaimer">{t("Advertising permit (Trakheesi) No. {permit}", { permit: SITE.dldPermit })}</p>}<div className="footer-bottom"><span>DXB Creek Harbour · {SITE.company} · WhatsApp <span dir="ltr">{SITE.whatsappDisplay}</span> · <a href={mailtoUrl()}>{SITE.email}</a></span><span>{t("{address}, United Arab Emirates", { address: t(SITE.address) })}</span></div></div></footer><Button asChild className="floating-wa" size="icon"><a href={whatsappUrl(genericMessage(t))} target="_blank" rel="noopener noreferrer" aria-label={t("Chat on WhatsApp")} title={t("Chat on WhatsApp")}><WhatsAppIcon /></a></Button><Button asChild className="floating-mail" size="icon"><a href={mailtoUrl()} aria-label={t("Email us at {email}", { email: SITE.email })} title={t("Email us: {email}", { email: SITE.email })}><Mail /></a></Button></>;
}
/** Phone-only bottom tab bar, app style: the three places people go plus the two things they do. */
export function MobileBar() {
  const t = useT();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const cls = (active: boolean) => `tab${active ? " active" : ""}`;
  const hasForm = pageHasForm(path);
  // activeProps={{}} keeps the router from adding its own "active" class, so only cls() decides the highlight.
  return <nav className="mobile-bar" aria-label={t("Quick navigation")}>
    <Link to="/" activeProps={{}} className={cls(path === "/")}><Home />{t("Home")}</Link>
    <Link to="/projects" activeProps={{}} className={cls(path.startsWith("/projects"))}><Building2 />{t("Projects")}</Link>
    <Link to="/market" activeProps={{}} className={cls(path.startsWith("/market"))}><TrendingUp />{t("Market")}</Link>
    {hasForm ? <a href="#enquire" className="tab"><PenLine />{t("Enquire")}</a> : <Link to="/" hash="enquire" className="tab"><PenLine />{t("Enquire")}</Link>}
    <a href={whatsappUrl(genericMessage(t))} target="_blank" rel="noopener noreferrer" className="tab tab-wa"><WhatsAppIcon />WhatsApp</a>
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
export function ProjectArt({ project, index = 0, large = false }: { project: Project; index?: number; large?: boolean }) { const t = useT(); return <div className={`project-art ${index % 3 === 1 ? "tone-sand" : index % 3 === 2 ? "tone-ink" : ""} ${large ? "detail-banner" : ""}`}><span className="art-caption">{t("Dubai Creek Harbour")}</span>{!large && <StatusBadge project={project} />}{large ? <p className="art-name">{project.name}</p> : <h3>{project.name}</h3>}{brandLine(project) && <span className="brand">{brandText(project, t)}</span>}</div>; }
export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  const t = useT();
  const [failed, setFailed] = useState(false);
  const image = project.images[0];
  const price = priceSummary(project, t);
  return <article className="project-card">{image && !failed ? <div className="card-cover"><Picture img={image} onError={() => setFailed(true)} /><StatusBadge project={project} /></div> : <ProjectArt project={project} index={index} />}<div className="card-body">{image && !failed && <><h3 className="card-name"><Link to="/projects/$slug" params={{ slug: project.slug }}>{project.name}</Link></h3>{brandLine(project) && <p className="card-brand">{brandText(project, t)}</p>}</>}{project.district && <div className="card-chips"><span className="chip">{t(project.district)}</span></div>}<p className="card-price">{price.main}</p><p className="price-note">{price.note ?? ""}</p><div className="card-facts"><span><BedDouble />{bedroomsLabel(project, t)}</span><span><CalendarDays />{handoverText(project, t)}</span></div><div className="card-actions"><Button asChild variant="outline" size="sm"><Link to="/projects/$slug" params={{ slug: project.slug }}>{t("View project")}<span className="sr-only">{t(": {name}@@after the \"View project\" button text, read only by screen readers", { name: project.name })}</span> <ArrowUpRight /></Link></Button><WhatsApp message={projectMessage(project.name, t)} className="card-whatsapp text-xs">WhatsApp</WhatsApp></div></div></article>;
}
export function PlanBar({ steps }: { steps: PlanStep[] }) { const t = useT(); return <div className="plan-bar" role="img" aria-label={steps.map((s) => t("{place}: {text}", { place: t(s.label), text: `${s.percent}%` })).join(t(", "))}>{steps.map((step) => <div key={step.label} className={`plan-segment ${step.label.startsWith("On booking") ? "booking" : step.label.startsWith("On handover") ? "handover" : "construction"}`} style={{ flexGrow: step.percent, flexBasis: 0 }} title={t("{place}: {text}", { place: t(step.label), text: `${step.percent}%` })}>{step.percent}%</div>)}</div>; }
export function CtaBand({ project }: { project?: Project }) { const t = useT(); return <section className="cta-band"><div className="container cta-inner"><div><span className="eyebrow">{t("A conversation, not a commitment")}</span><h2>{project ? t("Interested in {name}? Let's talk.", { name: project.name }) : t("Tell us your budget and bedrooms — we'll send what's available today.")}</h2></div><div className="flex flex-wrap gap-3"><WhatsApp variant="brass" message={project ? projectMessage(project.name, t) : genericMessage(t)}>{t("WhatsApp us")} <ArrowUpRight /></WhatsApp><Button asChild variant="heroOutline"><a href="#enquire"><PenLine />{t("Leave your details")}</a></Button></div></div></section>; }
/** A heading with one line break: translations keep the "|" where the line may break. */
function TwoLines({ text }: { text: string }) { const [a, b] = text.split("|"); return <>{a}{b !== undefined && <><br />{b}</>}</>; }
export function ProjectNotFound() { const t = useT(); return <main className="container unavailable"><span className="eyebrow">{t("Project unavailable")}</span><h1><TwoLines text={t("Let's find your place|at the Creek.")} /></h1><p>{t("We couldn't find that project. Explore the current collection or ask us on WhatsApp.")}</p><div className="flex flex-wrap gap-3"><Button asChild><Link to="/projects">{t("View all projects")} <ArrowRight /></Link></Button><WhatsApp variant="outline" /></div></main>; }
export function PageNotFound() { const t = useT(); return <main className="container unavailable"><span className="eyebrow">{t("Page not found")}</span><h1><TwoLines text={t("Let's find your place|at the Creek.")} /></h1><p>{t("That page doesn't exist. Explore the current collection or ask us on WhatsApp.")}</p><div className="flex flex-wrap gap-3"><Button asChild><Link to="/projects">{t("View all projects")} <ArrowRight /></Link></Button><WhatsApp variant="outline" /></div></main>; }
export function SourceLink({ href, children }: { href: string; children?: React.ReactNode }) { const t = useT(); return <a className="src-link" href={href} target="_blank" rel="noopener noreferrer">{children ?? t("Source")}</a>; }
export { ArrowDown, ArrowUpRight, ArrowRight };
