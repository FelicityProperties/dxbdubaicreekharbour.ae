import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PROJECTS, SITE } from "@/data/projects";
import { CtaBand, PlanBar, SourceLink, WhatsApp, handoverSortKey, projectMessage, sharingMeta } from "@/components/showcase/shared";
import { EnquirySection } from "@/components/enquiry/EnquirySection";
import { breadcrumbNode, fitDescription, ldScript } from "@/lib/seo";
import { dateLong } from "@/lib/format";

/** Every project with a published schedule, soonest handover first. Figures come only from projects.ts. */
const PLANS = PROJECTS.filter((p) => p.paymentPlan).sort((a, b) => handoverSortKey(a).localeCompare(handoverSortKey(b)));
const TITLE = "Dubai Creek Harbour Payment Plans: Every Emaar Schedule";
const DESCRIPTION = fitDescription([`Emaar's published payment plans for ${PLANS.length} Dubai Creek Harbour projects: the booking, construction and handover split, and every dated instalment.`]);

export const Route = createFileRoute("/payment-plans")({
  head: () => ({
    meta: [{ title: TITLE }, { name: "description", content: DESCRIPTION }, { property: "og:title", content: TITLE }, { property: "og:description", content: DESCRIPTION }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, ...sharingMeta(`${SITE.url}/payment-plans`)],
    links: [{ rel: "canonical", href: `${SITE.url}/payment-plans` }],
    scripts: [ldScript([breadcrumbNode([["Home", "/"], ["Payment plans", "/payment-plans"]])])],
  }),
  component: PaymentPlansPage,
});

function PaymentPlansPage() {
  return <main>
    <section className="page-hero"><div className="container"><nav className="breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><ChevronRight className="size-3" /><span>Payment plans</span></nav><span className="eyebrow">Emaar's published schedules</span><h1>Dubai Creek Harbour payment plans</h1><p>The instalment schedules Emaar publishes for {PLANS.length} projects at Dubai Creek Harbour, soonest handover first. Each one is the schedule Emaar's booking page showed for one listed unit on the date in its note; other units in the same project can differ, so confirm today's terms before you reserve. On a resale you take over the seller's remaining instalments instead.</p></div></section>
    <section className="section"><div className="container grid grid-cols-1 gap-12">
      <div className="plan-legend"><span><i className="legend-dot booking" />Booking</span><span><i className="legend-dot construction" />Construction</span><span><i className="legend-dot handover" />Handover</span></div>
      {PLANS.map((p) => p.paymentPlan && <article key={p.slug} className="detail-section" id={p.slug}>
        <span className="eyebrow">{p.district ? `${p.district} · ` : ""}{p.construction === "completed" ? "Completed building" : p.handover ? `Handover estimated ${dateLong(p.handover.text)}` : "Handover date on request"}</span>
        <h2><Link to="/projects/$slug" params={{ slug: p.slug }}>{p.name}</Link></h2>
        <PlanBar steps={p.paymentPlan.steps} />
        <p className="mt-3">{p.paymentPlan.steps.map((s) => `${s.percent}% ${s.label.toLowerCase()}`).join(" · ")}</p>
        {p.paymentPlan.schedule.length > 0 && <div className="table-scroll"><table className="plan-table schedule-table"><thead><tr><th scope="col">Instalment</th><th scope="col">Due</th><th scope="col">Share</th></tr></thead><tbody>{p.paymentPlan.schedule.map((s, i) => <tr key={`${s.label}-${i}`}><td>{s.label}</td><td>{dateLong(s.date)}</td><td>{s.percent}%</td></tr>)}</tbody></table></div>}
        <p className="fact-note mt-4">{p.paymentPlan.note} <SourceLink href={p.paymentPlan.source}>Source: Emaar</SourceLink></p>
        <div className="flex flex-wrap gap-3 mt-5"><Button asChild variant="outline" size="sm" className="h-auto min-h-8 whitespace-normal py-1.5 text-left"><Link to="/projects/$slug" params={{ slug: p.slug }}>{p.name}: prices and registered sales <ArrowUpRight /></Link></Button><WhatsApp message={projectMessage(p.name)} className="text-xs" variant="outline">Ask for today's plan</WhatsApp></div>
      </article>)}
    </div></section>
    <EnquirySection />
    <CtaBand />
  </main>;
}
