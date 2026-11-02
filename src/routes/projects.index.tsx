import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronRight } from "lucide-react";
import { PROJECTS, FAQ, SITE } from "@/data/projects";
import { CtaBand } from "@/components/showcase/shared";
import { ProjectCollection } from "@/components/showcase/ProjectCollection";
import { EnquirySection } from "@/components/enquiry/EnquirySection";
import { breadcrumbNode, descriptionMax, fitDescription, fitTitleFor, ldScript, pageHead, pageUrl } from "@/lib/seo";
import { dateText } from "@/lib/format";
import { tFor, useT } from "@/i18n/messages";

const STATUS_HELP = FAQ.find((f) => f.q.startsWith("What do 'Now selling'"));

export const Route = createFileRoute("/projects/")({
  head: ({ match }) => {
    const locale = match.context.locale;
    const t = tFor(locale);
    const n = PROJECTS.length;
    const title = fitTitleFor(locale, t("All {n} Emaar Projects in Dubai Creek Harbour: Prices & Plans", { n }), t("All {n} Emaar Projects in Dubai Creek Harbour", { n }));
    const intro = t("Compare all {n} Emaar projects in Dubai Creek Harbour: status, starting prices, bedrooms, sizes, handover dates and payment plans, with filters.", { n });
    // One sentence: if a translation runs past the length limit, show it whole rather than no description at all.
    const description = fitDescription([intro], descriptionMax(locale)) || intro;
    return {
      ...pageHead({ locale, path: "/projects", title, description }),
      scripts: [ldScript([
        breadcrumbNode([[t("Home"), "/"], [t("Projects"), "/projects"]], locale),
        { "@type": "ItemList", name: t("Emaar projects in Dubai Creek Harbour"), numberOfItems: n, itemListElement: PROJECTS.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.name, url: pageUrl(`/projects/${p.slug}`, locale) })) },
      ])],
    };
  },
  component: ProjectsPage,
});

function ProjectsPage() {
  const t = useT();
  return <main>
    <section className="page-hero"><div className="container"><nav className="breadcrumb" aria-label={t("Breadcrumb")}><Link to="/">{t("Home")}</Link><ChevronRight className="size-3" /><span>{t("Projects")}</span></nav><span className="eyebrow">{t("Emaar's published figures, side by side")}</span><h1>{t("All {n} Emaar projects in Dubai Creek Harbour", { n: PROJECTS.length })}</h1><p>{t("Every residential project Emaar lists at Dubai Creek Harbour, with the figures Emaar publishes: the starting price, the units it lists, sizes, the handover date and the payment plan, checked {date}. Filter by status, quarter, bedrooms and budget, or switch to Compare for one table.", { date: dateText(SITE.pricesCheckedOn, t.locale) })}</p></div></section>
    <ProjectCollection heading={false} />
    {STATUS_HELP && <section className="section pt-0"><div className="container"><div className="costs-box"><h2 className="text-[26px]">{t("How to read the status")}</h2><p className="block-note mt-3">{t(STATUS_HELP.a)}</p></div></div></section>}
    <section className="section plans-section"><div className="container two-col"><div><span className="eyebrow">{t("Next")}</span><h2>{t("Plans and registered prices")}</h2></div><div className="grid gap-3"><Link to="/payment-plans" className="teaser-link">{t("Every Emaar payment plan, instalment by instalment")} <ArrowRight className="size-3.5" /></Link><Link to="/market" className="teaser-link">{t("What homes here actually sold and rented for")} <ArrowRight className="size-3.5" /></Link><Link to="/area" className="teaser-link">{t("The three quarters, explained")} <ArrowRight className="size-3.5" /></Link></div></div></section>
    <EnquirySection />
    <CtaBand />
  </main>;
}
