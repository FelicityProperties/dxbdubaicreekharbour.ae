import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, ArrowRight } from "lucide-react";
import { GUIDE, COSTS, FAQ, SITE } from "@/data/projects";
import { CtaBand, sharingMeta, SourceLink, WhatsApp } from "@/components/showcase/shared";
import { EnquirySection } from "@/components/enquiry/EnquirySection";

const TITLE = "Buying in Dubai Creek Harbour: Steps, Costs & FAQ";
const DESCRIPTION = "How to buy an Emaar home at Dubai Creek Harbour, new or resale, from reservation to title deed: the steps, the fees on top of the price, mortgages, visas, escrow and renting out — using Emaar's published terms.";

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [{ title: `${TITLE} | DXB Creek Harbour` }, { name: "description", content: DESCRIPTION }, { property: "og:title", content: TITLE }, { property: "og:description", content: DESCRIPTION }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, ...sharingMeta(`${SITE.url}/guide`)],
    links: [{ rel: "canonical", href: `${SITE.url}/guide` }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }) }],
  }),
  component: GuidePage,
});

function Steps({ steps }: { steps: { step: string; body: string; source?: string }[] }) {
  return <ol className="guide-steps">{steps.map((s) => <li key={s.step}><div><h3>{s.step}</h3><p>{s.body}{s.source && <> <SourceLink href={s.source}>Source: Emaar</SourceLink></>}</p></div></li>)}</ol>;
}

function GuidePage() {
  return <main>
    <section className="page-hero"><div className="container"><span className="eyebrow">How buying works</span><h1>From reservation to title deed</h1><p>What happens, in what order, and what it costs — using Emaar's own published terms. {GUIDE.checked}. We walk every client through it personally; this is the map.</p></div></section>
    <section className="section" id="new"><div className="container guide-layout"><div><span className="eyebrow">Buying new from Emaar</span><h2>Seven steps</h2><div className="mt-6"><Steps steps={GUIDE.newFromEmaar} /></div></div>
      <div><div className="costs-box" id="costs"><h3>{COSTS.title}</h3><p className="block-note">{COSTS.note}</p>{COSTS.items.map((c) => <div className="cost-row" key={c.label}><span>{c.label}</span><span className="cost-value">{c.value}</span><span className="cost-detail">{c.detail} <SourceLink href={c.source}>Source</SourceLink></span></div>)}<p className="block-note mt-4">{COSTS.vat}</p></div>
        <div className="costs-box mt-6"><h3>Buying from overseas</h3><ul className="highlight-list">{GUIDE.overseas.map((o) => <li key={o}><span className="text-brass-text">—</span>{o}</li>)}</ul><p className="source-note">Per Emaar's published guidance: {GUIDE.overseasSource.map((s, i) => <span key={s}>{i > 0 && " · "}<a href={s} target="_blank" rel="noopener noreferrer">source {i + 1}</a></span>)}.</p></div></div></div></section>
    <section className="section plans-section" id="resale"><div className="container guide-layout"><div><span className="eyebrow">Buying a resale</span><h2>Sold-out tower? Buy from an owner.</h2><div className="mt-6"><Steps steps={GUIDE.resale} /></div></div><div><div className="costs-box"><h3>How we work</h3><p className="block-note">An independent Dubai broker, not Emaar.</p><ul className="highlight-list"><li><span className="text-brass-text">—</span>We check availability and prices with Emaar on the day, and confirm a seller's paid instalments before you commit to a resale.</li><li><span className="text-brass-text">—</span>We quote a building's RERA-approved service charge, never an estimate, and show registered sales and rents rather than asking prices.</li><li><span className="text-brass-text">—</span>Every payment goes to Emaar's project escrow account or the seller through DLD — never to us.</li></ul><div className="mt-5"><WhatsApp variant="outline">Ask us anything</WhatsApp></div></div></div></div></section>
    <section className="section faq-section" id="faq"><div className="container faq-layout"><div><span className="eyebrow">Good questions. Clear answers.</span><h2>Frequently asked</h2><Link to="/" hash="projects" className="teaser-link">Back to the projects <ArrowRight className="size-3.5" /></Link></div><div>{FAQ.map((item) => <details key={item.q} className="faq-item"><summary>{item.q}<Plus /></summary><p>{item.a}{"source" in item && item.source && <> <SourceLink href={item.source}>Source</SourceLink></>}</p></details>)}</div></div></section>
    <EnquirySection />
    <CtaBand />
  </main>;
}
