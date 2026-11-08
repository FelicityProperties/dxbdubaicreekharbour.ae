import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PROJECTS, type PaymentPlan } from "@/data/projects";
import { CtaBand, PlanBar, SourceCredit, WhatsApp, handoverSortKey, projectMessage } from "@/components/showcase/shared";
import { EnquirySection } from "@/components/enquiry/EnquirySection";
import { breadcrumbNode, descriptionMax, fitDescription, ldScript, pageHead } from "@/lib/seo";
import { dateLong } from "@/lib/format";
import { gap, tFor, useT } from "@/i18n/messages";

/** Every project with a published schedule, soonest handover first. Figures come only from projects.ts. */
const PLANS = PROJECTS.filter((p) => p.paymentPlan).sort((a, b) => handoverSortKey(a).localeCompare(handoverSortKey(b)));

export const Route = createFileRoute("/payment-plans")({
  head: ({ match }) => {
    const locale = match.context.locale;
    const t = tFor(locale);
    const intro = t("Emaar's published payment plans for {n} Dubai Creek Harbour projects: the booking, construction and handover split, and every dated instalment.", { n: PLANS.length });
    // One sentence: if a translation runs past the length limit, show it whole rather than no description at all.
    const description = fitDescription([intro], descriptionMax(locale)) || intro;
    return {
      ...pageHead({ locale, path: "/payment-plans", title: t("Dubai Creek Harbour Payment Plans: Every Emaar Schedule"), description }),
      scripts: [ldScript([breadcrumbNode([[t("Home"), "/"], [t("Payment plans"), "/payment-plans"]], locale)])],
    };
  },
  component: PaymentPlansPage,
});

/**
 * A plan's dated instalments. On phones they fold behind one tap (the bar and the split above stay in view), so ten
 * schedules do not make one long scroll; computers show every table open, as before. A screen reader hears the
 * button with its project's name (`describedBy`, the heading's id); the bare count beside the label is left out of
 * what it reads, as the open table gives the instalments themselves.
 */
function Schedule({ plan, id, describedBy }: { plan: PaymentPlan; id: string; describedBy: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  return <>
    <button type="button" className="plan-toggle hidden" aria-expanded={open} aria-controls={id} aria-describedby={describedBy} onClick={() => setOpen((o) => !o)}><span className="plan-toggle-label">{t("Instalment schedule")}</span><span className="plan-toggle-n" aria-hidden="true">{plan.schedule.length}</span><ChevronDown aria-hidden="true" /></button>
    <div id={id} className={`table-scroll plan-wrap${open ? " is-open" : ""}`}><table className="plan-table schedule-table"><thead><tr><th scope="col">{t("Instalment")}</th><th scope="col">{t("Due")}</th><th scope="col">{t("Share@@table column: the instalment's share of the price")}</th></tr></thead><tbody>{plan.schedule.map((s, i) => <tr key={`${s.label}-${i}`}><td>{t(s.label)}</td><td>{dateLong(s.date, t.locale)}</td><td>{s.percent}%</td></tr>)}</tbody></table></div>
  </>;
}

function PaymentPlansPage() {
  const t = useT();
  return <main className="page-plans">
    <section className="page-hero"><div className="container"><nav className="breadcrumb" aria-label={t("Breadcrumb")}><Link to="/">{t("Home")}</Link><ChevronRight className="size-3" /><span>{t("Payment plans")}</span></nav><span className="eyebrow">{t("Emaar's published schedules")}</span><h1>{t("Dubai Creek Harbour payment plans")}</h1><p>{t("The instalment schedules Emaar publishes for {n} projects at Dubai Creek Harbour, soonest handover first. Each one is the schedule Emaar's booking page showed for one listed unit on the date in its note; other units in the same project can differ, so confirm today's terms before you reserve. On a resale you take over the seller's remaining instalments instead.", { n: PLANS.length })}</p></div></section>
    <section className="section"><div className="container grid grid-cols-1 gap-12">
      <div className="plan-legend"><span><i className="legend-dot booking" />{t("Booking")}</span><span><i className="legend-dot construction" />{t("Construction")}</span><span><i className="legend-dot handover" />{t("Handover")}</span></div>
      {PLANS.map((p) => p.paymentPlan && <article key={p.slug} className="detail-section" id={p.slug}>
        <span className="eyebrow">{p.district ? `${t(p.district)} · ` : ""}{p.construction === "completed" ? t("Completed building") : p.handover ? t("Handover estimated {date}", { date: dateLong(p.handover.text, t.locale) }) : t("Handover date on request")}</span>
        <h2 id={`${p.slug}-name`}><Link to="/projects/$slug" params={{ slug: p.slug }}>{p.name}</Link></h2>
        <PlanBar steps={p.paymentPlan.steps} />
        {/* Step labels come from the data ("On booking"); lowercasing a translation changes nothing in Arabic or Chinese. */}
        <p className="mt-3">{p.paymentPlan.steps.map((s) => t("{percent}% {label}", { percent: s.percent, label: t(s.label).toLowerCase() })).join(" · ")}</p>
        {p.paymentPlan.schedule.length > 0 && <Schedule plan={p.paymentPlan} id={`${p.slug}-schedule`} describedBy={`${p.slug}-name`} />}
        <p className="fact-note mt-4">{t(p.paymentPlan.note)}{gap(t)}<SourceCredit>{t("Source: Emaar")}</SourceCredit></p>
        <div className="plan-actions flex flex-wrap gap-3 mt-5"><Button asChild variant="outline" size="sm" className="h-auto min-h-8 whitespace-normal py-1.5 text-start"><Link to="/projects/$slug" params={{ slug: p.slug }}>{t("{name}: prices and registered sales", { name: p.name })} <ArrowUpRight /></Link></Button><WhatsApp message={projectMessage(p.name, t)} className="text-xs" variant="outline">{t("Ask for today's plan")}</WhatsApp></div>
      </article>)}
    </div></section>
    <EnquirySection />
    <CtaBand />
  </main>;
}
