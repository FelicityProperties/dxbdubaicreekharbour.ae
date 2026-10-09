import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ArrowRight, ArrowDown, BedDouble, CalendarDays, Menu, X, PenLine, Mail } from "lucide-react";
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
export const projectMessage = (name: string) => `Hi, I'm interested in ${name} at Dubai Creek Harbour. Please send me Emaar's current price list and payment plan.`;
export const whatsappUrl = (message = GENERIC_MESSAGE) => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
export const DISCLAIMER = `DXB Creek Harbour is an independent property showcase run by a Dubai broker. The projects shown are developed by Emaar Properties PJSC; this website is not owned, operated or endorsed by Emaar. Prices, sizes, unit counts, payment plans and handover dates are Emaar's own published figures as checked on ${SITE.pricesCheckedOn}; all can change without notice and availability is limited — confirm current details before you commit. Registered sale and rental figures are Dubai Land Department records supplied by ${SITE.constructionSource}; they are shown as registered and are not valuations or advice. Images and brochures are Emaar's; project names belong to their owners.`;

/** The WhatsApp glyph (the phone-in-a-speech-bubble people recognise), as a plain SVG so it works anywhere an icon does. */
export function WhatsAppIcon({ className }: { className?: string | undefined }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>;
}
export function WhatsApp({ message = GENERIC_MESSAGE, children = "WhatsApp us", variant = "default", className = "" }: { message?: string; children?: React.ReactNode; variant?: "default" | "outline" | "brass" | "heroOutline"; className?: string }) {
  return <Button asChild variant={variant} className={className}><a href={whatsappUrl(message)} target="_blank" rel="noopener noreferrer"><WhatsAppIcon />{children}</a></Button>;
}
export const mailtoUrl = (subject = "Dubai Creek Harbour enquiry", body = "") => `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ""}`;
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
  return <header className="site-header"><div className="container header-inner"><Wordmark /><nav className="main-nav" aria-label="Main navigation"><NavLinks /><WhatsApp variant="outline" className="header-wa">Let's talk <ArrowUpRight /></WhatsApp></nav><Button variant="ghost" size="icon" className="mobile-toggle" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button></div>{open && <nav className="mobile-nav" aria-label="Mobile navigation"><NavLinks onPick={() => setOpen(false)} /><WhatsApp /><a href={mailtoUrl()} className="nav-link"><Mail className="inline size-3.5 mr-1.5" />{SITE.email}</a></nav>}</header>;
}
export function Footer() {
  return <><footer className="site-footer"><div className="container"><div className="footer-top"><Wordmark /><nav className="footer-nav" aria-label="Footer navigation"><Link to="/" hash="projects">Projects</Link><Link to="/market">Market data</Link><Link to="/area">The area</Link><Link to="/guide">Buying guide</Link><Link to="/guide" hash="faq">FAQs</Link><a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">WhatsApp <ArrowUpRight className="inline size-3" /></a><a href={mailtoUrl()}>Email <ArrowUpRight className="inline size-3" /></a></nav></div><p className="disclaimer">{DISCLAIMER}</p><p className="disclaimer" id="privacy">Privacy: the details you send through the enquiry form or WhatsApp are kept in our enquiry records and used only to answer your enquiry; the database and email services that run the site process them on our behalf. Email us at {SITE.email} to see or delete what we hold.</p>{SITE.dldPermit && <p className="disclaimer">DLD Permit No. {SITE.dldPermit}</p>}<div className="footer-bottom"><span>DXB Creek Harbour · Independent property showcase · WhatsApp {SITE.whatsappDisplay} · <a href={mailtoUrl()}>{SITE.email}</a></span><span>Dubai, United Arab Emirates</span></div></div></footer><Button asChild className="floating-wa" size="icon"><a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" title="Chat on WhatsApp"><WhatsAppIcon /></a></Button></>;
}
/** Phone-only bottom bar: the two things a visitor actually does on a phone. */
export function MobileBar() {
  return <div className="mobile-bar" role="navigation" aria-label="Quick contact"><Button asChild variant="outline"><a href="#enquire"><PenLine />Enquire</a></Button><Button asChild className="wa-green"><a href={whatsappUrl()} target="_blank" rel="noopener noreferrer"><WhatsAppIcon />WhatsApp</a></Button></div>;
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
  if (p.handover) return `Est. handover ${dateShort(p.handover.text)}`;
  if (p.construction === "under_construction") return "Under construction";
  return p.isNewLaunch ? "New launch" : "Handover date on request";
}
/** What a buyer can actually pay today: the lowest listed unit when Emaar lists units, else the advertised starting price. */
export function minPriceAed(p: Project): number | null {
  return p.pricesFromAed ?? p.startingPriceAed ?? null;
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
