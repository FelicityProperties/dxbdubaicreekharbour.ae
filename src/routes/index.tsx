import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, ArrowRight, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PROJECTS, DISTRICT, FAQ, COSTS, SITE, districtImage, type Status, type Project } from "@/data/projects";
import { TX } from "@/data/transactions";
import { WhatsApp, ProjectCard, PlanBar, CtaBand, ArrowDown, sharingMeta, Picture, statusLabel, priceSummary, handoverText, minPriceAed, bedroomRange } from "@/components/showcase/shared";
import { MarketSnapshot, LatestTransactions, SourceNote } from "@/components/market/Market";
import { EnquirySection } from "@/components/enquiry/EnquirySection";
import { dateLong } from "@/lib/format";

const TITLE = "Dubai Creek Harbour Projects, Prices & Sales Data";
const DESCRIPTION = `Emaar's Dubai Creek Harbour projects side by side: published prices, payment plans, handover dates, and the sales and rents registered with the Dubai Land Department. Independent broker showcase — enquire on WhatsApp.`;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${TITLE} | DXB Creek Harbour` },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: "An independent collection of Dubai Creek Harbour projects: new launches, ready homes and resale, with registered market data." },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, ...sharingMeta(SITE.url),
    ],
    links: [{ rel: "canonical", href: SITE.url }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@graph": [
      { "@type": "WebSite", name: SITE.name, url: SITE.url },
      { "@type": "RealEstateAgent", name: SITE.name, url: SITE.url, telephone: `+${SITE.whatsapp}`, areaServed: "Dubai Creek Harbour, Dubai", address: { "@type": "PostalAddress", addressLocality: "Dubai", addressCountry: "AE" } },
      { "@type": "ItemList", name: "Dubai Creek Harbour projects", itemListElement: PROJECTS.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.name, url: `${SITE.url}/projects/${p.slug}` })) },
    ] }) }],
  }),
  component: Home,
});

const ORDER: Status[] = ["Now selling", "Resale", "Ready"];
const DISTRICTS = ["Creek Island", "Creek Beach", "Green Gate"] as const;
const BEDS = ["1", "2", "3", "4+"] as const;
const BUDGETS = [
  { id: "u2", label: "Under AED 2M", test: (n: number) => n < 2_000_000 },
  { id: "2-3", label: "AED 2–3M", test: (n: number) => n >= 2_000_000 && n < 3_000_000 },
  { id: "3-5", label: "AED 3–5M", test: (n: number) => n >= 3_000_000 && n < 5_000_000 },
  { id: "5+", label: "AED 5M+", test: (n: number) => n >= 5_000_000 },
] as const;

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <Button className="filter-button" size="sm" variant={active ? "default" : "outline"} aria-pressed={active} onClick={onClick}>{children}</Button>;
}

function ProjectTable({ projects }: { projects: Project[] }) {
  return <div className="table-scroll"><table className="project-table"><thead><tr><th scope="col">Project</th><th scope="col">Status</th><th scope="col">From</th><th scope="col">Bedrooms</th><th scope="col">Sizes</th><th scope="col">Handover</th><th scope="col">Plan</th><th scope="col">Quarter</th></tr></thead>
    <tbody>{projects.map((p) => { const price = priceSummary(p); return <tr key={p.slug}><td className="name"><Link to="/projects/$slug" params={{ slug: p.slug }}>{p.name}</Link>{p.brand && <div className="card-brand mt-1 mb-0 text-[11px]">{p.brand}</div>}</td><td>{statusLabel(p)}</td><td>{price.main}</td><td>{p.bedrooms}</td><td>{p.sizes ?? "—"}</td><td>{handoverText(p)}</td><td>{p.paymentPlan ? p.paymentPlan.steps.map((s) => s.percent).join(" / ") : "—"}</td><td>{p.district ?? "—"}</td></tr>; })}</tbody></table></div>;
}

function Home() {
  const [status, setStatus] = useState<Status | "All">("All");
  const [district, setDistrict] = useState<string>("All");
  const [beds, setBeds] = useState<string>("All");
  const [budget, setBudget] = useState<string>("All");
  const [view, setView] = useState<"cards" | "table">("cards");
  const sorted = ORDER.flatMap((s) => PROJECTS.filter((p) => p.status === s));
  const projects = sorted.filter((p) => {
    if (status !== "All" && p.status !== status) return false;
    if (district !== "All" && p.district !== district) return false;
    if (beds !== "All") { const r = bedroomRange(p); if (!r) return false; if (beds === "4+" ? r[1] < 4 : !(Number(beds) >= r[0] && Number(beds) <= r[1])) return false; }
    if (budget !== "All") { const n = minPriceAed(p); const b = BUDGETS.find((x) => x.id === budget); if (n == null || !b || !b.test(n)) return false; }
    return true;
  });
  const reset = () => { setStatus("All"); setDistrict("All"); setBeds("All"); setBudget("All"); };
  const plans = PROJECTS.filter((p) => p.paymentPlan).sort((a, b) => (a.handover?.text ?? "9999").localeCompare(b.handover?.text ?? "9999"));
  const hero = DISTRICT.images["hero"];
  const places = DISTRICT.places.slice(0, 3);
  return <main>
    <section className="hero">{hero && <Picture img={hero} className="hero-image" sizes="100vw" width={1600} priority />}<div className="container hero-content"><span className="eyebrow">Dubai Creek Harbour · an independent broker's showcase</span><h1>Emaar's Dubai Creek Harbour projects,<br /><em>side by side.</em></h1><p className="hero-description">{PROJECTS.length} projects with Emaar's published prices, payment plans and handover dates — plus the sales and rents actually registered with the Dubai Land Department. Independent broker; ask anything on WhatsApp.</p><div className="hero-actions"><Button asChild variant="brass"><Link to="/" hash="projects">View projects <ArrowDown /></Link></Button><WhatsApp variant="heroOutline" /></div></div><div className="container hero-bottom"><span>Dubai Creek Harbour · {PROJECTS.length} projects · prices checked {SITE.pricesCheckedOn}</span><span>{hero?.caption}</span></div></section>

    <section className="snapshot-section" aria-labelledby="snapshot-h"><div className="container"><div className="snapshot-head"><div><span className="eyebrow">Registered with the Dubai Land Department</span><h2 id="snapshot-h">The Creek Harbour market, {TX.window.label}</h2></div><Link to="/market" className="teaser-link">All market data <ArrowRight className="size-3.5" /></Link></div><MarketSnapshot /><SourceNote compact /></div></section>

    <section className="section" id="projects"><div className="container"><div className="section-heading"><div><span className="eyebrow">Find your place by the water</span><h2>The project collection</h2></div><p className="section-intro">New launches, ready homes and resale towers.<br />Emaar's published figures. Nothing invented.</p></div>
      <div className="filters">
        <div className="filter-group" role="group" aria-label="Filter by status"><span className="filter-label">Status</span>{(["All", ...ORDER] as const).map((s) => <Chip key={s} active={status === s} onClick={() => setStatus(s)}>{s === "All" ? "All" : s === "Ready" ? "Ready · resale" : s === "Resale" ? "Resale · under construction" : s}</Chip>)}</div>
        <div className="filter-group" role="group" aria-label="Filter by quarter"><span className="filter-label">Quarter</span><Chip active={district === "All"} onClick={() => setDistrict("All")}>Anywhere</Chip>{DISTRICTS.map((d) => <Chip key={d} active={district === d} onClick={() => setDistrict(d)}>{d}</Chip>)}</div>
        <div className="filter-group" role="group" aria-label="Filter by bedrooms"><span className="filter-label">Bedrooms</span><Chip active={beds === "All"} onClick={() => setBeds("All")}>Any</Chip>{BEDS.map((b) => <Chip key={b} active={beds === b} onClick={() => setBeds(b)}>{b}</Chip>)}</div>
        <div className="filter-group" role="group" aria-label="Filter by budget"><span className="filter-label">From</span><Chip active={budget === "All"} onClick={() => setBudget("All")}>Any budget</Chip>{BUDGETS.map((b) => <Chip key={b.id} active={budget === b.id} onClick={() => setBudget(b.id)}>{b.label}</Chip>)}</div>
      </div>
      <div className="filter-bar"><span>Showing {projects.length} of {PROJECTS.length} projects{projects.length !== PROJECTS.length && <> · <button type="button" className="underline underline-offset-4" onClick={reset}>clear filters</button></>}. Budget uses the lowest price of the units Emaar lists, or the project's advertised starting price where no units are listed.</span><div className="view-toggle" role="group" aria-label="View"><button type="button" aria-pressed={view === "cards"} onClick={() => setView("cards")}><LayoutGrid className="inline size-3.5 mr-1.5" />Cards</button><button type="button" aria-pressed={view === "table"} onClick={() => setView("table")}><List className="inline size-3.5 mr-1.5" />Compare</button></div></div>
      {projects.length === 0 ? <p className="tx-empty">No project matches every filter. <button type="button" className="underline underline-offset-4" onClick={reset}>Clear the filters</button> or tell us what you need on WhatsApp — resale and rental options exist in every tower.</p> : view === "cards" ? <div className="project-grid">{projects.map((project) => <ProjectCard key={project.slug} project={project} index={PROJECTS.indexOf(project)} />)}</div> : <ProjectTable projects={projects} />}
    </div></section>

    <section className="section plans-section" id="payment-plans"><div className="container plans-layout"><div><span className="eyebrow">The path to your new home</span><h2>Payment plans<br />at a glance</h2><div className="plan-legend"><span><i className="legend-dot booking" />Booking</span><span><i className="legend-dot construction" />Construction</span><span><i className="legend-dot handover" />Handover</span></div><p className="plan-context">Emaar's published instalment schedules, summarised here as booking / construction / handover and shown in handover order. Each project page has the dated schedule as Emaar publishes it. For resale, confirm the seller's paid and remaining instalments.</p></div><div>{plans.map((p) => <div key={p.slug}><div className="plan-row"><Link className="plan-row-name" to="/projects/$slug" params={{ slug: p.slug }}>{p.name}{p.handover && <span className="block text-[11px] font-sans text-muted-foreground mt-1">Handover {dateLong(p.handover.text)}</span>}</Link>{p.paymentPlan && <PlanBar steps={p.paymentPlan.steps} />}</div></div>)}</div></div></section>

    <section className="section" id="market"><div className="container"><div className="section-heading"><div><span className="eyebrow">What actually changed hands</span><h2>Latest registered sales and rents</h2></div><p className="section-intro">Ready homes, off-plan and tenancy contracts across Dubai Creek Harbour, straight from the Land Department register.</p></div><LatestTransactions initial={10} /><SourceNote compact /><Link to="/market" className="teaser-link">Full market data: by bedroom, by building, all recent rows <ArrowRight className="size-3.5" /></Link></div></section>

    <section className="section district-section" id="district"><div className="container"><div className="section-heading"><div><span className="eyebrow">Beyond your front door</span><h2>About Dubai Creek Harbour</h2></div><p className="section-intro">{DISTRICT.intro}</p></div><div className="place-grid">{places.map((place) => { const img = districtImage(place.image); return <article className="place-card" key={place.title}>{img && <Picture img={img} />}<div className="place-body"><h3>{place.title}</h3><p>{place.body}</p></div></article>; })}</div><div className="stat-strip mt-6">{DISTRICT.stats.map((s) => <div className="stat" key={s.label}><p className="stat-value">{s.value}</p><p className="stat-label">{s.label}</p></div>)}<div className="stat"><p className="stat-value">{DISTRICT.driveTimes.find((d) => d.place.startsWith("Downtown"))?.minutes} min</p><p className="stat-label">to Downtown Dubai by car</p><p className="stat-note">{DISTRICT.driveTimes.find((d) => d.place.includes("DXB"))?.minutes} min to DXB airport</p></div></div><p className="source-note">{DISTRICT.statsNote} {DISTRICT.driveTimesNote}</p><Link to="/area" className="teaser-link">The three quarters, every landmark, drive times and the metro <ArrowRight className="size-3.5" /></Link></div></section>

    <section className="section guide-teaser" id="guide"><div className="container two-col"><div><span className="eyebrow">How buying works</span><h2>From reservation<br />to title deed</h2><p className="district-intro">Reserve a unit, pay the down payment into escrow, sign Emaar's sale agreement, register with the Land Department, then handover and your electronic title deed. Non-residents buy with a passport. Our step-by-step guide uses Emaar's published terms.</p><Link to="/guide" className="teaser-link">Read the buying guide <ArrowRight className="size-3.5" /></Link></div><div className="costs-box"><h3>{COSTS.title}</h3><p className="block-note">{COSTS.note}</p>{COSTS.items.slice(0, 4).map((c) => <div className="cost-row" key={c.label}><span>{c.label}</span><span className="cost-value">{c.value}</span></div>)}<Link to="/guide" hash="costs" className="teaser-link">All costs, with Emaar's sources <ArrowRight className="size-3.5" /></Link></div></div></section>

    <EnquirySection />
    <section className="section faq-section" id="faq"><div className="container faq-layout"><div><span className="eyebrow">Good questions. Clear answers.</span><h2>Before you<br />make your move</h2><Link to="/guide" hash="faq" className="teaser-link">All questions <ArrowRight className="size-3.5" /></Link></div><div>{FAQ.slice(0, 6).map((item) => <details key={item.q} className="faq-item"><summary>{item.q}<Plus /></summary><p>{item.a}</p></details>)}</div></div></section>
    <CtaBand />
  </main>;
}
