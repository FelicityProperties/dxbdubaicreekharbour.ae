import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PROJECTS, DISTRICT, FAQ, SITE, HERO_IMAGE, DISTRICT_IMAGE, type Status } from "@/data/projects";
import { WhatsApp, ProjectCard, PlanBar, CtaBand, ArrowDown, sharingMeta } from "@/components/showcase/shared";
import { EnquirySection } from "@/components/enquiry/EnquirySection";

export const Route = createFileRoute("/")({
 head:()=>({meta:[
 {title:"DXB Creek Harbour | Compare Emaar's Waterfront Projects"},
 {name:"description",content:"Compare Emaar's Dubai Creek Harbour projects, published starting prices, payment plans and handover dates. Independent showcase. Enquire on WhatsApp."},
 {property:"og:title",content:"DXB Creek Harbour | Emaar's Projects, Side by Side"},
 {property:"og:description",content:"An independent collection of Dubai Creek Harbour residential projects. Compare current launches, resale options and ready homes."},
 {property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"},...sharingMeta(SITE.url)],links:[{rel:"canonical",href:SITE.url}]}),
 component:Home,
});
function Home(){
 const [filter,setFilter]=useState<Status|"All">("All");
 const order:Status[]=["Now selling","Resale","Ready"];
 const projects=order.flatMap(status=>PROJECTS.filter(p=>p.status===status)).filter(p=>filter==="All"||p.status===filter);
 return <main><section className="hero"><img src={HERO_IMAGE.src} alt={HERO_IMAGE.caption} className="hero-image" width={1920} height={1088} fetchPriority="high" loading="eager" decoding="async" ref={element=>{if(element?.complete && element.naturalWidth===0)element.hidden=true;}} onError={event=>{event.currentTarget.hidden=true;}}/><div className="container hero-content"><span className="eyebrow">Waterfront living. A considered choice.</span><h1>Emaar's Dubai Creek Harbour projects,<br/><em>side by side.</em></h1><p className="hero-description">Starting prices, payment plans and handover dates for every current launch — and resale options in the sold-out towers. Ask anything on WhatsApp.</p><div className="hero-actions"><Button asChild variant="brass"><Link to="/" hash="projects">View projects <ArrowDown/></Link></Button><WhatsApp variant="heroOutline"/></div></div><div className="container hero-bottom"><span>Dubai Creek Harbour · An independent collection</span><span>{HERO_IMAGE.caption}</span></div></section>
 <section className="section" id="projects"><div className="container"><div className="section-heading"><div><span className="eyebrow">Find your place by the water</span><h2>The project collection</h2></div><p className="section-intro">From the latest launches to ready homes.<br/>Published prices. Clear plans. All in one place.</p></div><div className="filter-list" role="group" aria-label="Filter projects by status">{(["All",...order] as const).map(status=><Button key={status} className="filter-button" size="sm" variant={filter===status?"default":"outline"} aria-pressed={filter===status} onClick={()=>setFilter(status)}>{status}</Button>)}</div><div className="project-grid">{projects.map(project=><ProjectCard key={project.slug} project={project} index={PROJECTS.indexOf(project)}/>)}</div></div></section>
 <section className="section plans-section" id="payment-plans"><div className="container plans-layout"><div><span className="eyebrow">The path to your new home</span><h2>Payment plans<br/>at a glance</h2><div className="plan-legend"><span><i className="legend-dot booking"/>Booking</span><span><i className="legend-dot construction"/>Construction</span><span><i className="legend-dot handover"/>Handover</span></div><p className="plan-context">Developer-published plans. For resale, confirm the seller's paid and remaining instalments.</p></div><div>{PROJECTS.filter(p=>p.paymentPlan).map(p=><div key={p.slug}><div className="plan-row"><Link className="plan-row-name" to="/projects/$slug" params={{slug:p.slug}}>{p.name}</Link>{p.paymentPlan&&<PlanBar steps={p.paymentPlan}/>}</div></div>)}</div></div></section>
 <section className="section" id="district"><div className="container district-layout"><div><span className="eyebrow">Beyond your front door</span><h2>About Dubai<br/>Creek Harbour</h2><p className="district-intro">{DISTRICT.intro}</p><img className="district-photo" src={DISTRICT_IMAGE.src} alt={DISTRICT_IMAGE.caption} width={1200} height={1008} loading="lazy" decoding="async" ref={element=>{if(element?.complete && element.naturalWidth===0)element.hidden=true;}} onError={event=>{event.currentTarget.hidden=true;}}/><p className="image-note">{DISTRICT_IMAGE.caption}</p></div><div>{DISTRICT.points.map(point=><div className="district-point" key={point.title}><h3>{point.title}</h3><p>{point.body}</p></div>)}</div></div></section>
 <EnquirySection/><section className="section faq-section" id="faq"><div className="container faq-layout"><div><span className="eyebrow">Good questions. Clear answers.</span><h2>Before you<br/>make your move</h2></div><div>{FAQ.map(item=><details key={item.q} className="faq-item"><summary>{item.q}<Plus/></summary><p>{item.a}</p></details>)}</div></div></section><CtaBand/></main>;
}
