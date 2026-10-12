import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronRight } from "lucide-react";
import { PROJECTS, FAQ, SITE } from "@/data/projects";
import { CtaBand, sharingMeta } from "@/components/showcase/shared";
import { ProjectCollection } from "@/components/showcase/ProjectCollection";
import { EnquirySection } from "@/components/enquiry/EnquirySection";
import { breadcrumbNode, fitDescription, fitTitle, ldScript } from "@/lib/seo";

const TITLE = fitTitle(`All ${PROJECTS.length} Emaar Projects in Dubai Creek Harbour: Prices & Plans`, `All ${PROJECTS.length} Emaar Projects in Dubai Creek Harbour`);
const DESCRIPTION = fitDescription([`Compare all ${PROJECTS.length} Emaar projects in Dubai Creek Harbour: status, starting prices, bedrooms, sizes, handover dates and payment plans, with filters.`]);
const STATUS_HELP = FAQ.find((f) => f.q.startsWith("What do 'Now selling'"));

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [{ title: TITLE }, { name: "description", content: DESCRIPTION }, { property: "og:title", content: TITLE }, { property: "og:description", content: DESCRIPTION }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, ...sharingMeta(`${SITE.url}/projects`)],
    links: [{ rel: "canonical", href: `${SITE.url}/projects` }],
    scripts: [ldScript([
      breadcrumbNode([["Home", "/"], ["Projects", "/projects"]]),
      { "@type": "ItemList", name: "Emaar projects in Dubai Creek Harbour", numberOfItems: PROJECTS.length, itemListElement: PROJECTS.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.name, url: `${SITE.url}/projects/${p.slug}` })) },
    ])],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  return <main>
    <section className="page-hero"><div className="container"><nav className="breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><ChevronRight className="size-3" /><span>Projects</span></nav><span className="eyebrow">Emaar's published figures, side by side</span><h1>All {PROJECTS.length} Emaar projects in Dubai Creek Harbour</h1><p>Every residential project Emaar lists at Dubai Creek Harbour, with the figures Emaar publishes: the starting price, the units it lists, sizes, the handover date and the payment plan, checked {SITE.pricesCheckedOn}. Filter by status, quarter, bedrooms and budget, or switch to Compare for one table.</p></div></section>
    <ProjectCollection heading={false} />
    {STATUS_HELP && <section className="section pt-0"><div className="container"><div className="costs-box"><h2 className="text-[26px]">How to read the status</h2><p className="block-note mt-3">{STATUS_HELP.a}</p></div></div></section>}
    <section className="section plans-section"><div className="container two-col"><div><span className="eyebrow">Next</span><h2>Plans and registered prices</h2></div><div className="grid gap-3"><Link to="/payment-plans" className="teaser-link">Every Emaar payment plan, instalment by instalment <ArrowRight className="size-3.5" /></Link><Link to="/market" className="teaser-link">What homes here actually sold and rented for <ArrowRight className="size-3.5" /></Link><Link to="/area" className="teaser-link">The three quarters, explained <ArrowRight className="size-3.5" /></Link></div></div></section>
    <EnquirySection />
    <CtaBand />
  </main>;
}
