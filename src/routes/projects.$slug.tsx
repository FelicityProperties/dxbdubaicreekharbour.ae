import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, Download, ChevronRight, MapPin, ExternalLink, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PROJECTS, DISTRICT, SITE, type Project } from "@/data/projects";
import { salesFor, rentalsFor, salesCount12m, rentalsCount12m, TX } from "@/data/transactions";
import { ProjectCard, StatusBadge, WhatsApp, PlanBar, CtaBand, ProjectNotFound, projectMessage, sharingMeta, priceSummary, handoverText, SourceLink, ShareButton } from "@/components/showcase/shared";
import { ProjectGallery } from "@/components/showcase/ProjectGallery";
import { EnquirySection } from "@/components/enquiry/EnquirySection";
import { SalesTable, RentalsTable, ByBuildingTables, SourceNote, kindHelp } from "@/components/market/Market";
import { dateLong, num } from "@/lib/format";

function related(project: Project): Project[] {
  const rest = PROJECTS.filter((p) => p.slug !== project.slug);
  const same = rest.filter((p) => project.district && p.district === project.district);
  const status = rest.filter((p) => p.status === project.status && !same.includes(p));
  return [...same, ...status, ...rest.filter((p) => !same.includes(p) && !status.includes(p))].slice(0, 3);
}

export const Route = createFileRoute("/projects/$slug")({
  loader: ({ params }) => { const project = PROJECTS.find((p) => p.slug === params.slug); if (!project) throw notFound(); return project; },
  head: ({ loaderData: project }) => {
    if (!project) return { meta: [{ title: "Project unavailable | DXB Creek Harbour" }, { name: "description", content: "Explore current Dubai Creek Harbour projects with our independent property showcase." }, { name: "robots", content: "noindex" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] };
    const brandWord = project.brand?.replace(/^by\s+/i, "").trim();
    const appendBrand = project.brand?.startsWith("by ") && brandWord && !project.name.toLowerCase().includes(brandWord.toLowerCase());
    const fullName = `${project.name}${appendBrand ? ` ${project.brand}` : ""}`;
    const title = `${fullName}, Dubai Creek Harbour — Prices & Sales Data`;
    const price = priceSummary(project);
    const description = `${fullName} by Emaar at Dubai Creek Harbour. ${price.main}. ${project.bedrooms.includes("bedroom") ? project.bedrooms : `${project.bedrooms} bedrooms`}. ${handoverText(project)}. Registered sales and rents, payment plan, brochure. Enquire on WhatsApp.`;
    const canonicalUrl = `${SITE.url}/projects/${project.slug}`;
    const image = project.ogImage ? `${SITE.url}${project.ogImage}` : `${SITE.url}/og-image.png`;
    const ld = { "@context": "https://schema.org", "@graph": [
      { "@type": "ApartmentComplex", name: fullName, url: canonicalUrl, description: project.overview, image: project.images.slice(0, 3).map((i) => `${SITE.url}${i.base}-960.webp`), address: { "@type": "PostalAddress", addressLocality: "Dubai", streetAddress: `Dubai Creek Harbour${project.district ? `, ${project.district}` : ""}`, addressCountry: "AE" }, ...(project.lat && project.lng ? { geo: { "@type": "GeoCoordinates", latitude: project.lat, longitude: project.lng } } : {}) },
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE.url }, { "@type": "ListItem", position: 2, name: "Projects", item: `${SITE.url}/#projects` }, { "@type": "ListItem", position: 3, name: fullName, item: canonicalUrl }] },
    ] };
    return { meta: [{ title: `${title} | DXB Creek Harbour` }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: project.overview }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, ...sharingMeta(canonicalUrl, image)], links: [{ rel: "canonical", href: canonicalUrl }], scripts: [{ type: "application/ld+json", children: JSON.stringify(ld) }] };
  },
  component: ProjectPage, notFoundComponent: ProjectNotFound,
});

function ProjectPage() {
  const project = Route.useLoaderData();
  const others = related(project);
  const price = priceSummary(project);
  const sales = salesFor(project.slug), rentals = rentalsFor(project.slug);
  const sales12m = salesCount12m(project.slug), rentals12m = rentalsCount12m(project.slug);
  const hood = DISTRICT.neighbourhoods.find((n) => n.name === project.district);
  const bedroomsText = project.unitTypes.length ? project.unitTypes.join(" · ") : project.bedrooms.includes("bedroom") ? project.bedrooms : `${project.bedrooms} bedrooms`;
  return <main><div className="container"><nav className="breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><ChevronRight className="size-3" /><Link to="/" hash="projects">Projects</Link><ChevronRight className="size-3" /><span>{project.name}</span></nav>
    <header className="detail-heading"><span className="eyebrow">Dubai Creek Harbour{project.district ? ` · ${project.district}` : ""}</span><h1>{project.name}</h1>{project.brand && <p className="brand">{project.brand}</p>}<div className="badge-row"><StatusBadge project={project} /><span className="chip">by Emaar</span>{project.construction && <span className="chip">{project.construction === "completed" ? "Construction completed (DLD records)" : "Construction under way (DLD records)"}</span>}{project.district && <span className="chip brass">{project.district}</span>}</div></header>
    <ProjectGallery key={project.slug} project={project} />
    <div className="detail-layout"><div>
      <section className="detail-section"><span className="eyebrow">A closer look</span><h2>Life at {project.name}</h2><p>{project.overview}</p><ul className="highlight-list">{project.highlights.map((h) => <li key={h}><Check />{h}</li>)}</ul>{project.unitTypes.length > 0 && <p className="mt-5"><strong className="text-foreground font-medium">Unit types:</strong> {project.unitTypes.join(" · ")}</p>}{project.statusNote && <p className="mt-2">{project.statusNote}.</p>}</section>

      <section className="detail-section" id="plan"><h2>Payment plan</h2>{project.paymentPlan ? <><PlanBar steps={project.paymentPlan.steps} />{project.paymentPlan.schedule.length > 0 && <table className="plan-table schedule-table"><thead><tr><th scope="col">Instalment</th><th scope="col">Due</th><th scope="col">Share</th></tr></thead><tbody>{project.paymentPlan.schedule.map((s, i) => <tr key={`${s.label}-${i}`}><td>{s.label}</td><td>{dateLong(s.date)}</td><td>{s.percent}%</td></tr>)}</tbody></table>}<p className="fact-note mt-4">{project.paymentPlan.note} <SourceLink href={project.paymentPlan.source}>Source: Emaar</SourceLink></p></> : <><p className="mb-5">{project.status === "Now selling" ? (project.construction === "completed" ? "This is a completed building: Emaar's listed units are paid in full on transfer, with a mortgage if you need one. Ask us for today's terms on the unit you like." : "Emaar publishes the dated instalment schedule when you reserve a unit. Ask us for the current schedule and the next instalment dates.") : project.status === "Resale" ? "On a resale you reimburse the seller's paid instalments, agree any premium, and take over the remaining schedule with Emaar. We confirm the exact figures with Emaar before you commit." : "This is a completed building: you pay the full price on transfer, with a mortgage if you need one — UAE banks lend to residents and non-residents on completed homes."}</p><WhatsApp message={projectMessage(project.name)} variant="outline">Ask for the payment terms</WhatsApp></>}</section>

      <section className="detail-section" id="market"><span className="eyebrow">Registered with the Dubai Land Department</span><h2>What's selling and renting here</h2><p className="mb-5">{sales12m > 0 || rentals12m > 0 ? <>{TX.window.label}: {sales12m > 0 ? `${num(sales12m)} registered market sale${sales12m === 1 ? "" : "s"}` : "no registered market sales"} and {rentals12m > 0 ? `${num(rentals12m)} registered tenancy contract${rentals12m === 1 ? "" : "s"}` : "no registered tenancy contracts"} across {project.name}'s towers.</> : project.isNewLaunch ? <>New-launch registrations appear in the DLD register before they are assigned to a building, so {project.name} has no rows of its own yet. The community-wide off-plan table on the market page shows them as "not yet named".</> : <>No registered market sales or tenancy contracts for {project.name} in the 12-month window.</>}</p>
        <ByBuildingTables slug={project.slug} />
        {sales.length > 0 && <div className="market-block mt-8"><h3>Latest registered sales</h3><p className="block-note">The most recent rows in the snapshot. {kindHelp}</p><SalesTable rows={sales} initial={10} /></div>}
        {rentals.length > 0 && <div className="market-block mt-8"><h3>Latest tenancy contracts</h3><p className="block-note">Registered Ejari contracts; "New" is a new tenancy, "Renewal" a renewed one.</p><RentalsTable rows={rentals} initial={10} /></div>}
        <SourceNote compact /></section>

      <section className="detail-section" id="location"><h2>Location</h2>{hood ? <p>{project.district}: {hood.body}</p> : project.isNewLaunch ? <p>Emaar places {project.name} opposite the district's retail and entertainment hub, beside the canal and the future Blue Line metro station.</p> : <p>Within Emaar's Dubai Creek Harbour master plan, between Downtown Dubai and Dubai International Airport.</p>}{project.nearby && <div className="nearby-list">{project.nearby.map((n) => <span className="chip" key={n}>{n}</span>)}</div>}<div className="inline-links">{project.lat && project.lng && <a className="map-link" href={`https://www.google.com/maps/search/?api=1&query=${project.lat},${project.lng}`} target="_blank" rel="noopener noreferrer"><MapPin className="size-3.5" />Open in Google Maps (Emaar's map pin)</a>}<Link to="/area"><ExternalLink className="size-3.5" />About the area</Link></div></section>

      <EnquirySection project={project.name} />
      {project.amenities.length > 0 && <section className="detail-section"><h2>Amenities</h2><div className="amenity-grid">{project.amenities.map((a) => <span key={a} className="amenity">{a}</span>)}</div><p className="fact-note mt-3">As listed by Emaar.</p></section>}
      <section className="detail-section"><span className="eyebrow">Explore the details</span><h2>Brochure and floor plans</h2><div className="flex flex-wrap gap-3">{project.brochureUrl ? <Button asChild variant="outline"><a href={project.brochureUrl} target="_blank" rel="noopener noreferrer"><Download />Brochure (PDF)</a></Button> : <WhatsApp message={`Hi, please send me the ${project.name} brochure.`} variant="outline">Get the brochure on WhatsApp</WhatsApp>}{project.floorPlanUrl && <Button asChild variant="outline"><a href={project.floorPlanUrl} target="_blank" rel="noopener noreferrer"><Download />Floor plans (PDF)</a></Button>}<Button asChild variant="outline"><a href={project.emaarUrl} target="_blank" rel="noopener noreferrer"><ExternalLink />Emaar's page</a></Button></div><p className="image-note mt-3">Files published by Emaar; they open on Emaar's website.</p></section>
    </div>

    <aside className="fact-panel" aria-label="Project key facts"><h2>At a glance</h2>
      <div className="fact-item"><p className="fact-label">{project.pricesFrom ? "Prices from" : "Starting price"}</p><p className="fact-value fact-price">{price.main}</p>{price.note && <p className="fact-note">{price.note}</p>}</div>
      {project.sizes && <div className="fact-item"><p className="fact-label">Sizes</p><p className="fact-value">{project.sizes}</p>{project.sizesNote && <p className="fact-note">{project.sizesNote}</p>}</div>}
      <div className="fact-item"><p className="fact-label">Homes</p><p className="fact-value">{bedroomsText}</p></div>
      <div className="fact-item"><p className="fact-label">{project.construction === "completed" ? "Handover" : "Expected handover"}</p><p className="fact-value">{project.construction === "completed" ? "Completed" : project.handover ? `Estimated ${dateLong(project.handover.text)}` : handoverText(project)}</p>{project.handover && project.construction !== "completed" && <p className="fact-note">{project.handover.note}. Emaar's estimate for that unit; dates can change. <SourceLink href={project.handover.source}>Source: Emaar</SourceLink></p>}{project.construction && <p className="fact-note">Construction status: {project.construction === "completed" ? "completed" : "under way"} — {SITE.constructionSource}, checked {SITE.pricesCheckedOn}.</p>}</div>
      <div className="fact-item"><p className="fact-label">Status</p><p className="fact-value">{project.statusNote || project.status}</p></div>
      {project.district && <div className="fact-item"><p className="fact-label">Quarter</p><p className="fact-value">{project.district}</p></div>}
      {(sales12m > 0 || rentals12m > 0) && <div className="fact-item"><p className="fact-label">{TX.window.label}</p><p className="fact-value">{num(sales12m)} registered sales · {num(rentals12m)} tenancy contracts</p><p className="fact-note"><a href="#market" className="underline underline-offset-4">See the registered figures</a></p></div>}
      <div className="fact-actions"><WhatsApp className="enquiry-button" message={projectMessage(project.name)}>Ask about {project.name.length > 22 ? "this project" : project.name}</WhatsApp><Button asChild variant="outline"><a href="#enquire"><PenLine />Leave your details</a></Button><ShareButton title={`${project.name} at Dubai Creek Harbour`} url={`${SITE.url}/projects/${project.slug}`} text={`${project.name} by Emaar at Dubai Creek Harbour — ${price.main}`} /></div>
      <div className="fact-links">{project.brochureUrl && <a href={project.brochureUrl} target="_blank" rel="noopener noreferrer"><Download className="size-3.5" />Brochure (PDF)</a>}{project.floorPlanUrl && <a href={project.floorPlanUrl} target="_blank" rel="noopener noreferrer"><Download className="size-3.5" />Floor plans (PDF)</a>}<a href={project.emaarUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-3.5" />Emaar's project page</a></div>
    </aside></div></div>
    <CtaBand project={project} />
    <section className="section related"><div className="container"><div className="section-heading"><div><span className="eyebrow">Keep exploring</span><h2>{project.district ? `More in ${project.district}` : "Other projects in Dubai Creek Harbour"}</h2></div></div><div className="project-grid">{others.map((p) => <ProjectCard key={p.slug} project={p} index={PROJECTS.indexOf(p)} />)}</div></div></section></main>;
}
