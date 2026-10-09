import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ArrowRight, ArrowDown, BedDouble, CalendarDays, Menu, X, MessageCircle, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE, imageSrc, imageSrcSet, type Project, type ProjectImage, type PlanStep } from "@/data/projects";
import { dateShort } from "@/lib/format";

export const sharingMeta = (canonicalUrl: string, image = `${SITE.url}/og-image.png`) => [
  { property: "og:image", content: image },
  { name: "twitter:image", content: image },
  { property: "og:image:width", content: "1200" },
  { property: "og:image:height", content: "630" },
  { property: "og:url", content: canonicalUrl },
];
export const GENERIC_MESSAGE = "Hi, I'm interested in Emaar's projects at Dubai Creek Harbour.";
export const projectMessage = (name: string) => `Hi, I'm interested in ${name} at Dubai Creek Harbour. Please send me the latest price list, payment plan and available units.`;
export const whatsappUrl = (message = GENERIC_MESSAGE) => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
export const DISCLAIMER = `DXB Creek Harbour is an independent property showcase run by a Dubai broker. The projects shown are developed by Emaar Properties PJSC; this website is not owned, operated or endorsed by Emaar. Prices, sizes, unit counts, payment plans and handover dates are Emaar's own published figures as checked on ${SITE.pricesCheckedOn}; all can change without notice and availability is limited — confirm current details before you commit. Registered sale and rental figures are Dubai Land Department records supplied by ${SITE.constructionSource}; they are shown as registered and are not valuations or advice. Images and brochures are Emaar's; project names belong to their owners.`;

export function WhatsApp({ message = GENERIC_MESSAGE, children = "WhatsApp us", variant = "default", className = "" }: { message?: string; children?: React.ReactNode; variant?: "default" | "outline" | "brass" | "heroOutline"; className?: string }) {
  return <Button asChild variant={variant} className={className}><a href={whatsappUrl(message)} target="_blank" rel="noopener noreferrer"><MessageCircle />{children}</a></Button>;
}
export function Wordmark() { return <Link to="/" className="dxbch-lockup" aria-label="DXB Creek Harbour, home"><svg className="dxbch-mark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 40" aria-hidden="true" focusable="false"><path className="dxbch-arch" d="M1 30V3A34.167 34.167 0 0 1 29 3V30H26V14.5A11 11 0 0 0 4 14.5V30ZM6 30V14.5A9 9 0 0 1 24 14.5V30H21V14.5A6 6 0 0 0 9 14.5V30Z"/><path className="dxbch-water" d="M0 33.5C10.5 31.5 19.5 31.5 30 33.5C19.5 35.5 10.5 35.5 0 33.5ZM15 38.75C19.9 37.083 24.1 37.083 29 38.75C24.1 40.417 19.9 40.417 15 38.75Z"/></svg><span className="dxbch-words"><span className="dxbch-dxb">DXB</span><span className="dxbch-sub">Creek Harbour</span></span></Link>; }

function NavLinks({ onPick }: { onPick?: () => void }) {
  return <>
    <Link to="/" hash="projects" className="nav-link" onClick={onPick}>Projects</Link>
    <Link to="/market" className="nav-link" onClick={onPick}>Market data</Link>
    <Link to="/area" className="nav-link" onClick={onPick}>The area</Link>
    <Link to="/guide" className="nav-link" onClick={onPick}>Buying guide</Link>
    <Link to="/" hash="enquire" className="nav-link" onClick={onPick}>Enquire</Link>
  </>;
}
export function Header() {
  const [open, setOpen] = useState(false);
  return <header className="site-header"><div className="container header-inner"><Wordmark /><nav className="main-nav" aria-label="Main navigation"><NavLinks /><WhatsApp variant="outline" className="header-wa">Let's talk <ArrowUpRight /></WhatsApp></nav><Button variant="ghost" size="icon" className="mobile-toggle" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button></div>{open && <nav className="mobile-nav" aria-label="Mobile navigation"><NavLinks onPick={() => setOpen(false)} /><WhatsApp /></nav>}</header>;
}
export function Footer() {
  return <><footer className="site-footer"><div className="container"><div className="footer-top"><Wordmark /><nav className="footer-nav" aria-label="Footer navigation"><Link to="/" hash="projects">Projects</Link><Link to="/market">Market data</Link><Link to="/area">The area</Link><Link to="/guide">Buying guide</Link><Link to="/guide" hash="faq">FAQs</Link><a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">WhatsApp <ArrowUpRight className="inline size-3" /></a></nav></div><p className="disclaimer">{DISCLAIMER}</p>{SITE.dldPermit && <p className="disclaimer">DLD Permit No. {SITE.dldPermit}</p>}<div className="footer-bottom"><span>DXB Creek Harbour · Independent property showcase · WhatsApp {SITE.whatsappDisplay}</span><span>Dubai, United Arab Emirates</span></div></div></footer><Button asChild className="floating-wa" size="icon"><a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" title="Chat on WhatsApp"><MessageCircle /></a></Button></>;
}
/** Phone-only bottom bar: the two things a visitor actually does on a phone. */
export function MobileBar() {
  return <div className="mobile-bar" role="navigation" aria-label="Quick contact"><Button asChild variant="outline"><a href="#enquire"><PenLine />Enquire</a></Button><Button asChild><a href={whatsappUrl()} target="_blank" rel="noopener noreferrer"><MessageCircle />WhatsApp</a></Button></div>;
}

/** One honest status line per project, from Emaar's listing and the DLD completion status. */
export function statusLabel(p: Project): string {
  if (p.isNewLaunch) return "New launch";
  if (p.status === "Now selling") return p.construction === "completed" ? "Ready · now selling" : "Now selling";
  if (p.status === "Ready") return "Ready · resale";
  return "Resale · under construction";
}
export function StatusBadge({ project }: { project: Project }) { return <span className="status-badge">{statusLabel(project)}</span>; }

export function priceSummary(p: Project): { main: string; note: string | null } {
  if (p.pricesFrom) {
    const units = p.unitsListed ? `${p.unitsListed} unit${p.unitsListed === 1 ? "" : "s"} listed by Emaar on ${SITE.pricesCheckedOn}` : p.pricesFromNote;
    return { main: `From ${p.pricesFrom}`, note: p.startingPrice ? `${units ?? ""}${units ? " · " : ""}project starting price ${p.startingPrice}` : units };
  }
  if (p.startingPrice) return { main: `From ${p.startingPrice}`, note: p.status === "Now selling" ? `Emaar's advertised starting price, checked ${SITE.pricesCheckedOn}` : "Emaar's advertised starting price at launch — resale prices on request" };
  return { main: "Price on request", note: p.status === "Ready" ? "Completed building — resale and rental options on request" : "Ask us for current availability" };
}
export function handoverText(p: Project): string {
  if (p.construction === "completed") return "Completed";
  if (p.handover) return `Handover ${dateShort(p.handover.text)}`;
  if (p.construction === "under_construction") return "Under construction";
  return p.isNewLaunch ? "New launch" : "Handover date on request";
}
export function minPriceAed(p: Project): number | null {
  const c = [p.pricesFromAed, p.startingPriceAed].filter((x): x is number => typeof x === "number");
  return c.length ? Math.min(...c) : null;
}
export function bedroomRange(p: Project): [number, number] | null {
  const d = p.bedrooms.match(/\d/g)?.map(Number) ?? [];
  return d.length ? [Math.min(...d), Math.max(...d)] : null;
}

export function Picture({ img, sizes = "(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw", priority = false, className, width = 960, onError }: { img: ProjectImage; sizes?: string; priority?: boolean; className?: string | undefined; width?: number; onError?: () => void }) {
  return <img src={imageSrc(img, width)} srcSet={imageSrcSet(img)} sizes={sizes} alt={img.caption} width={img.w} height={img.h} loading={priority ? "eager" : "lazy"} decoding="async" fetchPriority={priority ? "high" : "auto"} className={className} ref={(element) => { if (onError && element?.complete && element.naturalWidth === 0) onError(); }} onError={onError} />;
}
export function ProjectArt({ project, index = 0, large = false }: { project: Project; index?: number; large?: boolean }) { return <div className={`project-art ${index % 3 === 1 ? "tone-sand" : index % 3 === 2 ? "tone-ink" : ""} ${large ? "detail-banner" : ""}`}><span className="art-caption">Dubai Creek Harbour</span>{!large && <StatusBadge project={project} />}{large ? <p className="art-name">{project.name}</p> : <h3>{project.name}</h3>}{project.brand && <span className="brand">{project.brand}</span>}</div>; }
export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  const [failed, setFailed] = useState(false);
  const image = project.images[0];
  const price = priceSummary(project);
  return <article className="project-card">{image && !failed ? <div className="card-cover"><Picture img={image} onError={() => setFailed(true)} /><StatusBadge project={project} /></div> : <ProjectArt project={project} index={index} />}<div className="card-body">{image && !failed && <><h3 className="card-name">{project.name}</h3>{project.brand && <p className="card-brand">{project.brand}</p>}</>}{project.district && <div className="card-chips"><span className="chip">{project.district}</span></div>}<p className="card-price">{price.main}</p><p className="price-note">{price.note ?? ""}</p><div className="card-facts"><span><BedDouble />{project.bedrooms.includes("bedroom") ? project.bedrooms : `${project.bedrooms} bedrooms`}</span><span><CalendarDays />{handoverText(project)}</span></div><div className="card-actions"><Button asChild variant="outline" size="sm"><Link to="/projects/$slug" params={{ slug: project.slug }}>View project <ArrowUpRight /></Link></Button><WhatsApp message={projectMessage(project.name)} className="card-whatsapp text-xs">WhatsApp</WhatsApp></div></div></article>;
}
export function PlanBar({ steps }: { steps: PlanStep[] }) { return <div className="plan-bar" aria-label={steps.map((s) => `${s.label}: ${s.percent}%`).join(", ")}>{steps.map((step) => <div key={step.label} className={`plan-segment ${step.label.startsWith("On booking") ? "booking" : step.label.startsWith("On handover") ? "handover" : "construction"}`} style={{ flexGrow: step.percent, flexBasis: 0 }} title={`${step.label}: ${step.percent}%`}>{step.percent}%</div>)}</div>; }
export function CtaBand({ project }: { project?: Project }) { return <section className="cta-band"><div className="container cta-inner"><div><span className="eyebrow">A conversation, not a commitment</span><h2>{project ? `Interested in ${project.name}? Let's talk.` : "Tell us your budget and bedrooms — we'll send what's available today."}</h2></div><div className="flex flex-wrap gap-3"><WhatsApp variant="brass" message={project ? projectMessage(project.name) : GENERIC_MESSAGE}>WhatsApp us <ArrowUpRight /></WhatsApp><Button asChild variant="heroOutline"><a href="#enquire"><PenLine />Leave your details</a></Button></div></div></section>; }
export function ProjectNotFound() { return <main className="container unavailable"><span className="eyebrow">Project unavailable</span><h1>Let's find your place<br />at the Creek.</h1><p>We couldn't find that project. Explore the current collection or ask us on WhatsApp.</p><div className="flex flex-wrap gap-3"><Button asChild><Link to="/" hash="projects">View all projects <ArrowRight /></Link></Button><WhatsApp variant="outline" /></div></main>; }
export function SourceLink({ href, children = "Source" }: { href: string; children?: React.ReactNode }) { return <a className="src-link" href={href} target="_blank" rel="noopener noreferrer">{children}</a>; }
export { ArrowDown, ArrowUpRight, ArrowRight };
