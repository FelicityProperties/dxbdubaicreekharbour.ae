import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, Download, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PROJECTS, SITE } from "@/data/projects";
import { ProjectCard, StatusBadge, WhatsApp, PlanBar, CtaBand, ProjectNotFound, projectMessage, sharingMeta } from "@/components/showcase/shared";

import { ProjectGallery } from "@/components/showcase/ProjectGallery";
import { EnquirySection } from "@/components/enquiry/EnquirySection";

export const Route=createFileRoute("/projects/$slug")({
 loader:({params})=>{const project=PROJECTS.find(p=>p.slug===params.slug);if(!project)throw notFound();return project;},
 head:({loaderData:project})=>{
  if (!project) return {meta:[{title:"Project unavailable | DXB Creek Harbour"},{name:"description",content:"Explore current Dubai Creek Harbour projects with our independent property showcase."},{property:"og:title",content:"Project unavailable | DXB Creek Harbour"},{property:"og:description",content:"Find your next home at Dubai Creek Harbour."},{name:"robots",content:"noindex"},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]};
  const brandWord = project.brand?.replace(/^by\s+/i, "").trim();
  const appendBrand = brandWord && !project.name.toLowerCase().includes(brandWord.toLowerCase());
  const title = `${project.name}${appendBrand ? ` ${project.brand}` : ""} | DXB Creek Harbour`;
  const handoverText = project.handover.startsWith("Completed") ? project.handover : `Expected handover ${project.handover}`;
  const description = `${project.name} by Emaar at Dubai Creek Harbour. ${project.priceDisplay ?? "Price on request"}. ${project.bedrooms}. ${handoverText}. Enquire on WhatsApp.`;
  const canonicalUrl = `${SITE.url}/projects/${project.slug}`;
  return {meta:[{title},{name:"description",content:description},{property:"og:title",content:title},{property:"og:description",content:project.overview},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"},...sharingMeta(canonicalUrl)],links:[{rel:"canonical",href:canonicalUrl}]};
 },
 component:ProjectPage,notFoundComponent:ProjectNotFound,
});
function ProjectPage(){
 const project=Route.useLoaderData();
 const currentIndex = PROJECTS.findIndex(p => p.slug === project.slug);
 const others = [...PROJECTS.slice(currentIndex + 1), ...PROJECTS.slice(0, currentIndex)].slice(0, 3);
 return <main><div className="container"><nav className="breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><ChevronRight className="size-3"/><Link to="/" hash="projects">Projects</Link><ChevronRight className="size-3"/><span>{project.name}</span></nav><header className="detail-heading"><span className="eyebrow">Dubai Creek Harbour</span><h1>{project.name}</h1>{project.brand&&<p className="brand">{project.brand}</p>}<div className="detail-meta"><span>by Emaar</span><StatusBadge status={project.status}/></div></header><ProjectGallery key={project.slug} project={project}/>
 <div className="detail-layout"><div><section className="detail-section"><span className="eyebrow">A closer look</span><h2>Life at {project.name}</h2><p>{project.overview}</p><ul className="highlight-list">{project.highlights.map(h=><li key={h}><Check/>{h}</li>)}</ul></section>
 <section className="detail-section"><h2>Payment plan</h2>{project.paymentPlanNote&&<p className="mb-5">{project.paymentPlanNote}</p>}{project.paymentPlan?<><PlanBar steps={project.paymentPlan}/><table className="plan-table"><thead><tr><th scope="col">Payment stage</th><th scope="col">Percentage</th></tr></thead><tbody>{project.paymentPlan.map(s=><tr key={s.label}><td>{s.label}</td><td>{s.percent}%</td></tr>)}</tbody></table></>:<><p className="mb-5">Ask us for the current payment plan</p><WhatsApp message={projectMessage(project.name)} variant="outline"/></>}</section>
 <EnquirySection project={project.name}/>
 {project.amenities.length>0&&<section className="detail-section"><h2>Amenities</h2><div className="amenity-grid">{project.amenities.map(a=><span key={a} className="amenity">{a}</span>)}</div></section>}
 <section className="detail-section"><span className="eyebrow">Explore the details</span><h2>The brochure</h2>{project.brochureUrl?<><Button asChild variant="outline"><a href={project.brochureUrl} target="_blank" rel="noopener noreferrer"><Download/>Download brochure (PDF)</a></Button><p className="image-note">Brochure published by Emaar</p></>:<WhatsApp message={`Hi, please send me the ${project.name} brochure.`} variant="outline">Get the brochure on WhatsApp</WhatsApp>}</section></div>
 <aside className="fact-panel" aria-label="Project key facts"><h2>At a glance</h2><div className="fact-item"><p className="fact-label">Starting price</p><p className="fact-value fact-price">{project.priceDisplay??"Price on request — ask on WhatsApp"}</p>{project.priceNote&&<p className="fact-note">{project.priceNote}</p>}</div><div className="fact-item"><p className="fact-label">Bedrooms</p><p className="fact-value">{project.bedrooms}</p></div><div className="fact-item"><p className="fact-label">{project.status === "Ready" ? "Handover" : "Expected handover"}</p><p className="fact-value">{project.handover}</p>{project.status !== "Ready" && <p className="fact-note">developer's stated completion; dates can change</p>}</div>{project.launched && <div className="fact-item"><p className="fact-label">Launched</p><p className="fact-value">{project.launched}</p></div>}<div className="fact-item"><p className="fact-label">Status</p><p className="fact-value">{project.status}</p>{project.statusNote&&<p className="fact-note">{project.statusNote}</p>}</div><WhatsApp className="enquiry-button" message={projectMessage(project.name)}>Ask about {project.name.length>22?"this project":project.name}</WhatsApp></aside></div></div><CtaBand project={project}/><section className="section related"><div className="container"><div className="section-heading"><div><span className="eyebrow">Keep exploring</span><h2>Other projects in Dubai Creek Harbour</h2></div></div><div className="project-grid">{others.map(p=><ProjectCard key={p.slug} project={p} index={PROJECTS.indexOf(p)}/>)}</div></div></section></main>;
}
