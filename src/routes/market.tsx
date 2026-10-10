import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE } from "@/data/projects";
import { TX } from "@/data/transactions";
import { CtaBand, sharingMeta, WhatsApp } from "@/components/showcase/shared";
import { MarketSnapshot, LatestTransactions, ByBedroomTables, ByBuildingTables, SourceNote, kindHelp } from "@/components/market/Market";
import { EnquirySection } from "@/components/enquiry/EnquirySection";
import { dateLong } from "@/lib/format";

const TITLE = "Dubai Creek Harbour Sales & Rents: Registered Transactions";
const DESCRIPTION = `Recent sales of ready and off-plan homes and recent tenancy contracts in Dubai Creek Harbour, as registered with the Dubai Land Department — by bedroom and by building, ${TX.window.label}.`;

export const Route = createFileRoute("/market")({
  head: () => ({
    meta: [{ title: `${TITLE} | DXB Creek Harbour` }, { name: "description", content: DESCRIPTION }, { property: "og:title", content: TITLE }, { property: "og:description", content: DESCRIPTION }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, ...sharingMeta(`${SITE.url}/market`)],
    links: [{ rel: "canonical", href: `${SITE.url}/market` }],
  }),
  component: MarketPage,
});

function MarketPage() {
  return <main>
    <section className="page-hero"><div className="container"><span className="eyebrow">Registered with the Dubai Land Department</span><h1>What Dubai Creek Harbour homes actually sell and rent for</h1><p>Not asking prices: the sales and tenancy contracts registered with the Dubai Land Department, shown exactly as registered. Snapshot taken {dateLong(TX.source.snapshotDate)}; {TX.source.coverage}.</p></div></section>
    <section className="snapshot-section"><div className="container"><div className="snapshot-head"><div><span className="eyebrow">{TX.window.label}</span><h2>The community in four numbers</h2></div></div><MarketSnapshot /><SourceNote /></div></section>
    <section className="section" id="latest"><div className="container"><div className="section-heading"><div><span className="eyebrow">Row by row</span><h2>Latest registered transactions</h2></div><p className="section-intro">Ready homes and off-plan sales are separate tabs because they are different purchases; tenancy contracts show what homes let for.</p></div><LatestTransactions initial={25} /><p className="source-note">{kindHelp}</p></div></section>
    <section className="section plans-section" id="by-bedroom"><div className="container"><div className="section-heading"><div><span className="eyebrow">By home size</span><h2>By bedroom</h2></div><p className="section-intro">Medians across the whole community. A 1-bed in a Palace-branded tower and a 1-bed at Creek Beach are different homes — check the building tables below.</p></div><ByBedroomTables /><SourceNote compact /></div></section>
    <section className="section" id="by-building"><div className="container"><div className="section-heading"><div><span className="eyebrow">Tower by tower</span><h2>By building</h2></div><p className="section-intro">Buildings with five or more registered rows in the window. Click a building to open its project page.</p></div><ByBuildingTables minCount={5} /><SourceNote compact /><div className="mt-8 flex flex-wrap gap-3"><WhatsApp message="Hi, I'd like the registered sales and rents for a specific unit or building at Dubai Creek Harbour.">Ask about a specific unit</WhatsApp><Link to="/" hash="projects" className="teaser-link">Back to the projects</Link></div></div></section>
    <EnquirySection />
    <CtaBand />
  </main>;
}
