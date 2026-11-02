import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, ArrowRight } from "lucide-react";
import { GUIDE, COSTS, FAQ } from "@/data/projects";
import { CtaBand, SourceCredit, WhatsApp } from "@/components/showcase/shared";
import { WhyCreekHarbour } from "@/components/showcase/Benefits";
import { EnquirySection } from "@/components/enquiry/EnquirySection";
import { pageHead } from "@/lib/seo";
import { gap, tFor, useT } from "@/i18n/messages";
import { Rich } from "@/i18n/rich";

export const Route = createFileRoute("/guide")({
  head: ({ match }) => {
    const locale = match.context.locale;
    const t = tFor(locale);
    return {
      ...pageHead({ locale, path: "/guide", title: t("Buying in Dubai Creek Harbour: Steps, Costs & FAQ"), description: t("How to buy an Emaar home in Dubai Creek Harbour, new or resale: the steps, fees on top of the price, mortgages, Golden Visa, escrow and renting out.") }),
      scripts: [{ type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map((f) => ({ "@type": "Question", name: t(f.q), acceptedAnswer: { "@type": "Answer", text: t(f.a) } })) }) }],
    };
  },
  component: GuidePage,
});

function Steps({ steps }: { steps: { step: string; body: string; source?: string }[] }) {
  const t = useT();
  return <ol className="guide-steps">{steps.map((s) => <li key={s.step}><div><h3>{t(s.step)}</h3><p>{t(s.body)}{s.source && <> <SourceCredit>{t("Source: Emaar")}</SourceCredit></>}</p></div></li>)}</ol>;
}

function GuidePage() {
  const t = useT();
  return <main>
    <section className="page-hero"><div className="container"><span className="eyebrow">{t("How buying works")}</span><h1>{t("Buying a home in Dubai Creek Harbour")}</h1><p>{t("What happens, in what order, and what it costs — using Emaar's own published terms. {checked}. We walk every client through it personally; this is the map.", { checked: t(GUIDE.checked) })}</p></div></section>
    <WhyCreekHarbour />
    {/* "Seven steps" is written out in words (as the English always was): if GUIDE.newFromEmaar changes length, change this heading too. */}
    <section className="section" id="new"><div className="container guide-layout"><div><span className="eyebrow">{t("Buying new from Emaar")}</span><h2>{t("Seven steps")}</h2><div className="mt-6"><Steps steps={GUIDE.newFromEmaar} /></div></div>
      <div><div className="costs-box" id="costs"><h3>{t(COSTS.title)}</h3><p className="block-note">{t(COSTS.note)}</p>{COSTS.items.map((c) => <div className="cost-row" key={c.label}><span>{t(c.label)}</span><span className="cost-value">{t(c.value)}</span><span className="cost-detail">{t(c.detail)}{gap(t)}<SourceCredit>{t("Source")}</SourceCredit></span></div>)}<p className="block-note mt-4">{t(COSTS.vat)}</p></div>
        <div className="costs-box mt-6"><h3>{t("Buying from overseas")}</h3><ul className="highlight-list">{GUIDE.overseas.map((o) => <li key={o}><span className="text-brass-text">—</span>{t(o)}</li>)}</ul><p className="source-note">{t("Per Emaar's published guidance.")}</p></div></div></div></section>
    <section className="section plans-section" id="resale"><div className="container guide-layout"><div><span className="eyebrow">{t("Buying a resale")}</span><h2>{t("No units with Emaar? Buy from an owner.")}</h2><div className="mt-6"><Steps steps={GUIDE.resale} /></div></div><div><div className="costs-box"><h3>{t("How we work")}</h3><p className="block-note">{t("An independent Dubai broker, not Emaar.")}</p><ul className="highlight-list"><li><span className="text-brass-text">—</span>{t("We check availability and prices with Emaar on the day, and confirm a seller's paid instalments before you commit to a resale.")}</li><li><span className="text-brass-text">—</span>{t("We quote a building's RERA-approved service charge, never an estimate, and show registered sales and rents rather than asking prices.")}</li><li><span className="text-brass-text">—</span>{t("Every payment goes to Emaar's project escrow account or the seller through DLD — never to us.")}</li></ul><div className="mt-5"><WhatsApp variant="outline">{t("Ask us anything")}</WhatsApp></div></div></div></div></section>
    <section className="section faq-section" id="faq"><div className="container faq-layout"><div><span className="eyebrow">{t("Good questions. Clear answers.")}</span><h2>{t("Frequently asked")}</h2><Link to="/projects" className="teaser-link">{t("All the projects")} <ArrowRight className="size-3.5" /></Link></div><div>{FAQ.map((item) => <details key={item.q} className="faq-item"><summary>{t(item.q)}<Plus /></summary><p>{t(item.a)}{"source" in item && item.source && <> <SourceCredit>{t("Source")}</SourceCredit></>}</p></details>)}</div></div></section>
    <EnquirySection />
    <CtaBand />
  </main>;
}
