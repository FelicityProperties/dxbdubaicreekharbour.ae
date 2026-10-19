import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectCollection } from "@/components/showcase/ProjectCollection";
import { PROJECTS, DISTRICT, FAQ, COSTS, SITE, districtImage } from "@/data/projects";
import { TX } from "@/data/transactions";
import { WhatsApp, PlanBar, CtaBand, ArrowDown, sharingMeta, Picture } from "@/components/showcase/shared";
import { fitDescription, ldScript, organizationNode, websiteNode } from "@/lib/seo";
import { MarketSnapshot, LatestTransactions, SourceNote } from "@/components/market/Market";
import { WhyCreekHarbour } from "@/components/showcase/Benefits";
import { EnquirySection } from "@/components/enquiry/EnquirySection";
import { AiViewings } from "@/components/showcase/AiViewings";
import { AI_VIEWINGS, videoObjectNode } from "@/data/ai-viewings";
import { dateLong } from "@/lib/format";

const TITLE = "Dubai Creek Harbour: Emaar Projects, Prices & DLD Sales";
const DESCRIPTION = fitDescription([`All ${PROJECTS.length} Emaar projects in Dubai Creek Harbour side by side: published prices, payment plans, handover dates and DLD-registered sales and rents.`]);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, ...sharingMeta(SITE.url),
    ],
    links: [{ rel: "canonical", href: SITE.url }],
    scripts: [ldScript([organizationNode(), websiteNode(), ...AI_VIEWINGS.map(videoObjectNode)])],
  }),
  component: Home,
});

function Home() {
  const plans = PROJECTS.filter((p) => p.paymentPlan).sort((a, b) => (a.handover?.text ?? "9999").localeCompare(b.handover?.text ?? "9999"));
  const hero = DISTRICT.images["hero"];
  const places = DISTRICT.places.slice(0, 3);
  return <main>
    <section className="hero">{hero && <Picture img={hero} className="hero-image" sizes="100vw" width={1600} priority />}<div className="container hero-content"><span className="eyebrow">Dubai Creek Harbour · an independent broker's showcase</span><h1>Emaar's Dubai Creek Harbour projects,<br /><em>side by side.</em></h1><p className="hero-description">{PROJECTS.length} projects, with Emaar's published prices, payment plans and handover dates wherever Emaar publishes them — plus the sales and rents actually registered with the Dubai Land Department. Independent broker; ask anything on WhatsApp.</p><div className="hero-actions"><Button asChild variant="brass"><Link to="/" hash="projects">View projects <ArrowDown /></Link></Button><WhatsApp variant="heroOutline" /></div></div><div className="container hero-bottom"><span>Dubai Creek Harbour · {PROJECTS.length} projects · prices checked {SITE.pricesCheckedOn}</span><span>{hero?.caption}</span></div></section>

    <AiViewings />

    <section className="snapshot-section" aria-labelledby="snapshot-h"><div className="container"><div className="snapshot-head"><div><span className="eyebrow">Registered with the Dubai Land Department</span><h2 id="snapshot-h">The Creek Harbour market, {TX.window.label}</h2></div><Link to="/market" className="teaser-link">All market data <ArrowRight className="size-3.5" /></Link></div><MarketSnapshot /><SourceNote compact /></div></section>

    <ProjectCollection />

    <WhyCreekHarbour compact />

    <section className="section plans-section" id="payment-plans"><div className="container plans-layout"><div><span className="eyebrow">The path to your new home</span><h2>Payment plans<br />at a glance</h2><div className="plan-legend"><span><i className="legend-dot booking" />Booking</span><span><i className="legend-dot construction" />Construction</span><span><i className="legend-dot handover" />Handover</span></div><p className="plan-context">Emaar's published instalment schedules, summarised here as booking / construction / handover and shown in handover order. Each project page has the dated schedule as Emaar publishes it. For resale, confirm the seller's paid and remaining instalments.</p><Link to="/payment-plans" className="teaser-link mt-5">Every schedule, instalment by instalment <ArrowRight className="size-3.5" /></Link></div><div>{plans.map((p) => <div key={p.slug}><div className="plan-row"><Link className="plan-row-name" to="/projects/$slug" params={{ slug: p.slug }}>{p.name}{p.handover && <span className="block text-[11px] font-sans text-muted-foreground mt-1">Handover {dateLong(p.handover.text)}</span>}</Link>{p.paymentPlan && <PlanBar steps={p.paymentPlan.steps} />}</div></div>)}</div></div></section>

    <section className="section" id="market"><div className="container"><div className="section-heading"><div><span className="eyebrow">What actually changed hands</span><h2>Latest registered sales and rents</h2></div><p className="section-intro">Ready homes, off-plan and tenancy contracts across Dubai Creek Harbour, straight from the Land Department register.</p></div><LatestTransactions initial={10} /><SourceNote compact /><Link to="/market" className="teaser-link">Full market data: by bedroom, by building, all recent rows <ArrowRight className="size-3.5" /></Link></div></section>

    <section className="section district-section" id="district"><div className="container"><div className="section-heading"><div><span className="eyebrow">Beyond your front door</span><h2>About Dubai Creek Harbour</h2></div><p className="section-intro">{DISTRICT.intro}</p></div><div className="place-grid">{places.map((place) => { const img = districtImage(place.image); return <article className="place-card" key={place.title}>{img && <Picture img={img} />}<div className="place-body"><h3>{place.title}</h3><p>{place.body}</p></div></article>; })}</div><div className="stat-strip mt-6">{DISTRICT.stats.map((s) => <div className="stat" key={s.label}><p className="stat-value">{s.value}</p><p className="stat-label">{s.label}</p></div>)}<div className="stat"><p className="stat-value">{DISTRICT.driveTimes.find((d) => d.place.startsWith("Downtown"))?.minutes} min</p><p className="stat-label">to Downtown Dubai by car</p><p className="stat-note">{DISTRICT.driveTimes.find((d) => d.place.includes("DXB"))?.minutes} min to DXB airport</p></div></div><p className="source-note">{DISTRICT.statsNote} {DISTRICT.driveTimesNote}</p><Link to="/area" className="teaser-link">The three quarters, every landmark, drive times and the metro <ArrowRight className="size-3.5" /></Link></div></section>

    <section className="section guide-teaser" id="guide"><div className="container two-col"><div><span className="eyebrow">How buying works</span><h2>From reservation<br />to title deed</h2><p className="district-intro">Reserve a unit, pay the down payment into escrow, sign Emaar's sale agreement, register with the Land Department, then handover and your electronic title deed. Non-residents buy with a passport. Our step-by-step guide uses Emaar's published terms.</p><Link to="/guide" className="teaser-link">Read the buying guide <ArrowRight className="size-3.5" /></Link></div><div className="costs-box"><h3>{COSTS.title}</h3><p className="block-note">{COSTS.note}</p>{COSTS.items.slice(0, 4).map((c) => <div className="cost-row" key={c.label}><span>{c.label}</span><span className="cost-value">{c.value}</span></div>)}<Link to="/guide" hash="costs" className="teaser-link">All costs, with Emaar's sources <ArrowRight className="size-3.5" /></Link></div></div></section>

    <EnquirySection />
    <section className="section faq-section" id="faq"><div className="container faq-layout"><div><span className="eyebrow">Good questions. Clear answers.</span><h2>Before you<br />make your move</h2><Link to="/guide" hash="faq" className="teaser-link">All questions <ArrowRight className="size-3.5" /></Link></div><div>{FAQ.slice(0, 6).map((item) => <details key={item.q} className="faq-item"><summary>{item.q}<Plus /></summary><p>{item.a}</p></details>)}</div></div></section>
    <CtaBand />
  </main>;
}
