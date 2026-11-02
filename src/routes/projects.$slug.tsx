import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, Download, ChevronRight, MapPin, ExternalLink, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PROJECTS, DISTRICT, SITE, type Project } from "@/data/projects";
import { salesFor, rentalsFor, salesCount12m, rentalsCount12m, windowLabel } from "@/data/transactions";
import { ProjectCard, StatusBadge, WhatsApp, PlanBar, CtaBand, ProjectNotFound, projectMessage, whatsappUrl, priceSummary, handoverText, noPlanText, bedroomsLabel, waMessage, SourceCredit, ShareButton, brandText } from "@/components/showcase/shared";
import { ProjectGallery } from "@/components/showcase/ProjectGallery";
import { EnquirySection } from "@/components/enquiry/EnquirySection";
import { ProjectViewing } from "@/components/showcase/AiViewings";
import { aiViewingFor, videoObjectNode } from "@/data/ai-viewings";
import { SalesTable, RentalsTable, ByBuildingTables, SourceNote, kindHelp } from "@/components/market/Market";
import { dateLong, dateText, num, brandLine, projectLabel } from "@/lib/format";
import { breadcrumbNode, pageHead, pageUrl, projectDescription, projectTitle } from "@/lib/seo";
import { gap, msg, tFor, useT, type T } from "@/i18n/messages";

function related(project: Project): Project[] {
  const rest = PROJECTS.filter((p) => p.slug !== project.slug);
  const same = rest.filter((p) => project.district && p.district === project.district);
  const status = rest.filter((p) => p.status === project.status && !same.includes(p));
  return [...same, ...status, ...rest.filter((p) => !same.includes(p) && !status.includes(p))].slice(0, 3);
}

/** "…: 12 registered market sales and 1 registered tenancy contract across Valia's towers." — one whole sentence per case. */
function marketLine(t: T, sales: number, rentals: number, name: string): string {
  const v = { window: windowLabel(t), sales: num(sales), rentals: num(rentals), name };
  if (sales === 0) return rentals === 1 ? t("{window}: no registered market sales and {rentals} registered tenancy contract across {name}'s towers.", v) : t("{window}: no registered market sales and {rentals} registered tenancy contracts across {name}'s towers.", v);
  if (sales === 1) {
    if (rentals === 0) return t("{window}: {sales} registered market sale and no registered tenancy contracts across {name}'s towers.", v);
    return rentals === 1 ? t("{window}: {sales} registered market sale and {rentals} registered tenancy contract across {name}'s towers.", v) : t("{window}: {sales} registered market sale and {rentals} registered tenancy contracts across {name}'s towers.", v);
  }
  if (rentals === 0) return t("{window}: {sales} registered market sales and no registered tenancy contracts across {name}'s towers.", v);
  return rentals === 1 ? t("{window}: {sales} registered market sales and {rentals} registered tenancy contract across {name}'s towers.", v) : t("{window}: {sales} registered market sales and {rentals} registered tenancy contracts across {name}'s towers.", v);
}

/** The project's status word when it has no status note (the data holds the English enum). */
function statusWord(p: Project, t: T): string {
  if (p.status === "Now selling") return t("Now selling");
  return p.status === "Ready" ? t("Ready") : t("Resale");
}

export const Route = createFileRoute("/projects/$slug")({
  loader: ({ params }) => { const project = PROJECTS.find((p) => p.slug === params.slug); if (!project) throw notFound(); return project; },
  head: ({ match, loaderData: project }) => {
    const locale = match.context.locale;
    const t = tFor(locale);
    if (!project) return { meta: [{ title: t("Project unavailable | {site}", { site: SITE.name }) }, { name: "description", content: t("Explore current Dubai Creek Harbour projects with our independent property showcase.") }, { name: "robots", content: "noindex" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] };
    const fullName = projectLabel(project);
    const path = `/projects/${project.slug}`;
    const overview = t(project.overview);
    const image = project.ogImage ? `${SITE.url}${project.ogImage}` : `${SITE.url}/og-image.png`;
    const viewing = aiViewingFor(project.slug);
    const ld = { "@context": "https://schema.org", "@graph": [
      { "@type": "ApartmentComplex", name: fullName, url: pageUrl(path, locale), description: overview, image: project.images.slice(0, 3).map((i) => `${SITE.url}${i.base}-960.webp`), address: { "@type": "PostalAddress", addressLocality: "Dubai", streetAddress: project.district ? t("Dubai Creek Harbour, {district}", { district: t(project.district) }) : t("Dubai Creek Harbour"), addressCountry: "AE" }, ...(project.lat && project.lng ? { geo: { "@type": "GeoCoordinates", latitude: project.lat, longitude: project.lng } } : {}) },
      breadcrumbNode([[t("Home"), "/"], [t("Projects"), "/projects"], [fullName, path]], locale),
      ...(viewing ? [videoObjectNode(viewing, t)] : []),
    ] };
    return {
      ...pageHead({ locale, path, title: projectTitle(project, t), description: projectDescription(project, handoverText(project, t), t), shareDescription: overview, image }),
      scripts: [{ type: "application/ld+json", children: JSON.stringify(ld) }],
    };
  },
  component: ProjectPage, notFoundComponent: ProjectNotFound,
});

function ProjectPage() {
  const t = useT();
  const project = Route.useLoaderData();
  const others = related(project);
  const price = priceSummary(project, t);
  const sales = salesFor(project.slug), rentals = rentalsFor(project.slug);
  const sales12m = salesCount12m(project.slug), rentals12m = rentalsCount12m(project.slug);
  const hood = DISTRICT.neighbourhoods.find((n) => n.name === project.district);
  const viewing = aiViewingFor(project.slug);
  // English for the comparison below (it reads the data's own words); the page shows the translation.
  const bedroomsText = project.unitTypes.length ? project.unitTypes.join(" · ") : project.bedrooms.includes("bedroom") ? project.bedrooms : `${project.bedrooms} bedrooms`;
  const bedroomsShown = project.unitTypes.length ? project.unitTypes.map((u) => t(u)).join(" · ") : bedroomsLabel(project, t);
  // Only call it "expected" when something points forward; a building DLD has no status for is simply not stated.
  const forward = project.construction === "under_construction" || !!project.handover || project.isNewLaunch;
  const name = project.name;
  // Emaar's brochure and floor-plan PDFs download directly; where Emaar publishes none, visitors ask us on WhatsApp.
  const brochureMessage = waMessage(t, `Hi, please send me the ${project.name} brochure.`, msg("Hi, please send me the {name} brochure."), { name });
  const floorPlanMessage = waMessage(t, `Hi, please send me the ${project.name} floor plans.`, msg("Hi, please send me the {name} floor plans."), { name });
  return <main><div className="container"><nav className="breadcrumb" aria-label={t("Breadcrumb")}><Link to="/">{t("Home")}</Link><ChevronRight className="size-3" /><Link to="/projects">{t("Projects")}</Link><ChevronRight className="size-3" /><span>{project.name}</span></nav>
    <header className="detail-heading"><span className="eyebrow">{t("Dubai Creek Harbour")}{project.district ? ` · ${t(project.district)}` : ""}</span><h1>{project.name}</h1>{brandLine(project) && <p className="brand">{brandText(project, t)}</p>}<div className="badge-row"><StatusBadge project={project} /><span className="chip">{t("by Emaar")}</span>{project.construction && <span className="chip">{project.construction === "completed" ? t("Construction completed (DLD records)") : t("Construction under way (DLD records)")}</span>}{project.district && <span className="chip brass">{t(project.district)}</span>}</div></header>
    <ProjectGallery key={project.slug} project={project} />
    <div className="detail-layout"><div>
      <section className="detail-section"><span className="eyebrow">{t("A closer look")}</span><h2>{t("Life at {name}", { name })}</h2><p>{t(project.overview)}</p><ul className="highlight-list">{project.highlights.map((h) => <li key={h}><Check />{t(h)}</li>)}</ul>{project.unitTypes.length > 0 && <p className="mt-5"><strong className="text-foreground font-medium">{t("Unit types:")}</strong>{gap(t)}{project.unitTypes.map((u) => t(u)).join(" · ")}</p>}{project.statusNote && <p className="mt-2">{t("{text}.", { text: t(project.statusNote) })}</p>}</section>

      {viewing && <ProjectViewing key={`viewing-${project.slug}`} viewing={viewing} />}

      <section className="detail-section" id="plan"><h2>{t("Payment plan")}</h2>{project.paymentPlan ? <><PlanBar steps={project.paymentPlan.steps} />{project.paymentPlan.schedule.length > 0 && <table className="plan-table schedule-table"><thead><tr><th scope="col">{t("Instalment")}</th><th scope="col">{t("Due")}</th><th scope="col">{t("Share@@table column: the instalment's share of the price")}</th></tr></thead><tbody>{project.paymentPlan.schedule.map((s, i) => <tr key={`${s.label}-${i}`}><td>{t(s.label)}</td><td>{dateLong(s.date, t.locale)}</td><td>{s.percent}%</td></tr>)}</tbody></table>}<p className="fact-note mt-4">{t(project.paymentPlan.note)}{gap(t)}<SourceCredit>{t("Source: Emaar")}</SourceCredit></p></> : <><p className="mb-5">{noPlanText(project, t)}</p><WhatsApp message={projectMessage(project.name, t)} variant="outline">{t("Ask for the payment terms")}</WhatsApp></>}</section>

      <section key={`market-${project.slug}`} className="detail-section" id="market"><span className="eyebrow">{t("Registered with the Dubai Land Department")}</span><h2>{t("What's selling and renting here")}</h2><p className="mb-5">{sales12m > 0 || rentals12m > 0 ? marketLine(t, sales12m, rentals12m, name) : project.isNewLaunch ? t("New-launch registrations appear in the DLD register before they are assigned to a building, so {name} has no rows of its own yet. The community-wide off-plan table on the market page shows them as \"not yet named\".", { name }) : t("No registered market sales or tenancy contracts for {name} in the 12-month window.", { name })}</p>
        <ByBuildingTables slug={project.slug} />
        {sales.length > 0 && <div className="market-block mt-8"><h3>{t("Latest registered sales")}</h3><p className="block-note">{t("The most recent rows in the snapshot.")}{gap(t)}{t(kindHelp)}</p><SalesTable rows={sales} initial={10} /></div>}
        {rentals.length > 0 && <div className="market-block mt-8"><h3>{t("Latest tenancy contracts")}</h3><p className="block-note">{t("Registered Ejari contracts; \"New\" is a new tenancy, \"Renewal\" a renewed one.")}</p><RentalsTable rows={rentals} initial={10} /></div>}
        <SourceNote compact /></section>

      <section className="detail-section" id="location"><h2>{t("Location")}</h2>{hood && project.district ? <p>{t("{place}: {text}", { place: t(project.district), text: t(hood.body) })}</p> : project.isNewLaunch ? <p>{t("Emaar places {name} opposite the district's retail and entertainment hub, beside the canal and the future Blue Line metro station.", { name })}</p> : <p>{t("Within Emaar's Dubai Creek Harbour master plan, between Downtown Dubai and Dubai International Airport.")}</p>}{project.nearby && <div className="nearby-list">{project.nearby.map((n) => <span className="chip" key={n}>{t(n)}</span>)}</div>}<div className="inline-links">{project.lat && project.lng && <a className="map-link" href={`https://www.google.com/maps/search/?api=1&query=${project.lat},${project.lng}`} target="_blank" rel="noopener noreferrer"><MapPin className="size-3.5" />{t("Open in Google Maps (Emaar's map pin)")}</a>}<Link to="/area"><ExternalLink className="size-3.5" />{t("About the area")}</Link></div></section>

      <EnquirySection key={`enquire-${project.slug}`} project={project.name} />
      {project.amenities.length > 0 && <section className="detail-section"><h2>{t("Amenities")}</h2><div className="amenity-grid">{project.amenities.map((a) => <span key={a} className="amenity">{t(a)}</span>)}</div><p className="fact-note mt-3">{t("As listed by Emaar.")}</p></section>}
      <section className="detail-section"><span className="eyebrow">{t("Explore the details")}</span><h2>{t("Brochure and floor plans")}</h2><div className="flex flex-wrap gap-3">{project.brochureUrl ? <Button asChild variant="outline"><a href={project.brochureUrl} target="_blank" rel="noopener noreferrer"><Download />{t("Brochure (PDF)")}</a></Button> : <WhatsApp message={brochureMessage} variant="outline">{t("Get the brochure on WhatsApp")}</WhatsApp>}{project.floorPlanUrl ? <Button asChild variant="outline"><a href={project.floorPlanUrl} target="_blank" rel="noopener noreferrer"><Download />{t("Floor plans (PDF)")}</a></Button> : <WhatsApp message={floorPlanMessage} variant="outline">{t("Get the floor plans on WhatsApp")}</WhatsApp>}</div><p className="image-note mt-3">{t("Emaar's official brochure and floor plans, as PDF files.")}</p></section>
    </div>

    <aside className="fact-panel" aria-label={t("Project key facts")}><h2>{t("At a glance")}</h2>
      <div className="fact-item"><p className="fact-label">{project.pricesFrom ? t("Prices from") : t("Starting price")}</p><p className="fact-value fact-price">{price.main}</p>{price.note && <p className="fact-note">{price.note}</p>}</div>
      {project.sizes && <div className="fact-item"><p className="fact-label">{t("Sizes")}</p><p className="fact-value">{t(project.sizes)}</p>{project.sizesNote && <p className="fact-note">{t(project.sizesNote)}</p>}</div>}
      <div className="fact-item"><p className="fact-label">{t("Homes")}</p><p className="fact-value">{bedroomsShown}</p>{project.propertyTypes && !bedroomsText.toLowerCase().includes(project.propertyTypes.toLowerCase()) && <p className="fact-note">{t(project.propertyTypes)}</p>}</div>
      <div className="fact-item"><p className="fact-label">{forward && project.construction !== "completed" ? t("Expected handover") : t("Handover")}</p><p className="fact-value">{project.construction === "completed" ? t("Completed") : project.handover ? t("Estimated {date}", { date: dateLong(project.handover.text, t.locale) }) : forward ? handoverText(project, t) : t("Not stated in DLD records — ask us")}</p>{project.handover && project.construction !== "completed" && <p className="fact-note">{t("{note}. Emaar's estimate for that unit; dates can change.", { note: t(project.handover.note) })}{gap(t)}<SourceCredit>{t("Source: Emaar")}</SourceCredit></p>}{project.construction && <p className="fact-note">{project.construction === "completed" ? t("Construction status: completed — {source}, checked {date}.", { source: t(SITE.constructionSource), date: dateText(SITE.pricesCheckedOn, t.locale) }) : t("Construction status: under way — {source}, checked {date}.", { source: t(SITE.constructionSource), date: dateText(SITE.pricesCheckedOn, t.locale) })}</p>}</div>
      <div className="fact-item"><p className="fact-label">{t("Status")}</p><p className="fact-value">{project.statusNote ? t(project.statusNote) : statusWord(project, t)}</p></div>
      {project.district && <div className="fact-item"><p className="fact-label">{t("Quarter")}</p><p className="fact-value">{t(project.district)}</p></div>}
      {(sales12m > 0 || rentals12m > 0) && <div className="fact-item"><p className="fact-label">{windowLabel(t)}</p><p className="fact-value">{t("{sales} registered sales · {rentals} tenancy contracts", { sales: num(sales12m), rentals: num(rentals12m) })}</p><p className="fact-note"><a href="#market" className="underline underline-offset-4">{t("See the registered figures")}</a></p></div>}
      <div className="fact-actions"><WhatsApp className="enquiry-button" message={projectMessage(project.name, t)}>{project.name.length > 22 ? t("Ask about this project") : t("Ask about {name}", { name })}</WhatsApp><Button asChild variant="outline"><a href="#enquire"><PenLine />{t("Leave your details")}</a></Button><ShareButton title={t("{name} at Dubai Creek Harbour", { name })} url={pageUrl(`/projects/${project.slug}`, t.locale)} text={t("{name} by Emaar at Dubai Creek Harbour — {price}", { name, price: price.main })} /></div>
      <div className="fact-links">{project.brochureUrl && <a href={project.brochureUrl} target="_blank" rel="noopener noreferrer"><Download className="size-3.5" />{t("Brochure (PDF)")}</a>}{project.floorPlanUrl && <a href={project.floorPlanUrl} target="_blank" rel="noopener noreferrer"><Download className="size-3.5" />{t("Floor plans (PDF)")}</a>}{!project.brochureUrl && !project.floorPlanUrl && <a href={whatsappUrl(brochureMessage)} target="_blank" rel="noopener noreferrer"><Download className="size-3.5" />{t("Brochure and floor plans on WhatsApp")}</a>}</div>
    </aside></div></div>
    <CtaBand project={project} />
    <section className="section related"><div className="container"><div className="section-heading"><div><span className="eyebrow">{t("Keep exploring")}</span><h2>{project.district && others.every((p) => p.district === project.district) ? t("More in {district}", { district: t(project.district) }) : t("Other projects in Dubai Creek Harbour")}</h2></div></div><div className="project-grid">{others.map((p) => <ProjectCard key={p.slug} project={p} index={PROJECTS.indexOf(p)} />)}</div></div></section></main>;
}
