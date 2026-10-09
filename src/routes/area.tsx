import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PROJECTS, DISTRICT, SITE, districtImage } from "@/data/projects";
import { CtaBand, Picture, sharingMeta, SourceLink, statusLabel } from "@/components/showcase/shared";
import { EnquirySection } from "@/components/enquiry/EnquirySection";

const TITLE = "Dubai Creek Harbour Area Guide: Creek Island, Creek Beach, Green Gate";
const DESCRIPTION = "Dubai Creek Harbour explained: the three quarters, Creek Beach, the Viewing Point, Creek Marina, Central Park, the Ras Al Khor sanctuary, the Blue Line metro station and drive times — with Emaar's published figures.";

export const Route = createFileRoute("/area")({
  head: () => ({
    meta: [{ title: `${TITLE} | DXB Creek Harbour` }, { name: "description", content: DESCRIPTION }, { property: "og:title", content: TITLE }, { property: "og:description", content: DESCRIPTION }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, ...sharingMeta(`${SITE.url}/area`)],
    links: [{ rel: "canonical", href: `${SITE.url}/area` }],
  }),
  component: AreaPage,
});

function AreaPage() {
  const hero = DISTRICT.images["creek-island"] ?? DISTRICT.images["hero"];
  const map = DISTRICT.images["map"];
  const beach = DISTRICT.images["creek-beach-aerial"];
  const green = DISTRICT.images["green-gate"];
  return <main>
    <section className="page-hero"><div className="container"><span className="eyebrow">The neighbourhood</span><h1>Dubai Creek Harbour, quarter by quarter</h1><p>{DISTRICT.intro}</p></div></section>
    <section className="section"><div className="container">{hero && <figure className="project-cover"><Picture img={hero} sizes="(max-width: 1160px) 100vw, 1160px" width={1600} priority className="w-full rounded-[3px]" /><figcaption className="image-note">{hero.caption}</figcaption></figure>}
      <div className="stat-strip mt-8">{DISTRICT.stats.map((s) => <div className="stat" key={s.label}><p className="stat-value">{s.value}</p><p className="stat-label">{s.label}</p></div>)}<div className="stat"><p className="stat-value">{PROJECTS.length}</p><p className="stat-label">Emaar projects on this site</p><p className="stat-note">{PROJECTS.filter((p) => p.construction === "completed").length} with construction shown as completed on PropertyIndex</p></div></div><p className="source-note">{DISTRICT.statsNote} <SourceLink href={DISTRICT.stats[0]?.source ?? "https://www.emaar.com"}>Source: Emaar</SourceLink></p></div></section>

    <section className="section plans-section" id="quarters"><div className="container"><div className="section-heading"><div><span className="eyebrow">Three quarters, three characters</span><h2>Where in the district?</h2></div><p className="section-intro">Each quarter has its own feel and its own price points. Projects are grouped as Emaar describes them.</p></div><div className="hood-grid">{DISTRICT.neighbourhoods.map((n) => { const list = PROJECTS.filter((p) => p.district === n.name); return <article className="hood" key={n.name}><h3>{n.name}</h3><p>{n.body}</p><ul>{list.map((p) => <li key={p.slug}><Link to="/projects/$slug" params={{ slug: p.slug }} className="chip">{p.name} · {statusLabel(p)}</Link></li>)}</ul></article>; })}</div><div className="two-col mt-10">{beach && <figure className="project-cover"><Picture img={beach} sizes="(max-width: 1000px) 100vw, 560px" /><figcaption className="image-note">{beach.caption}</figcaption></figure>}{green && <figure className="project-cover"><Picture img={green} sizes="(max-width: 1000px) 100vw, 560px" /><figcaption className="image-note">{green.caption}</figcaption></figure>}</div></div></section>

    <section className="section" id="places"><div className="container"><div className="section-heading"><div><span className="eyebrow">Beyond your front door</span><h2>The places that define it</h2></div><p className="section-intro">{DISTRICT.everyday}</p></div><div className="place-grid">{DISTRICT.places.map((place) => { const img = districtImage(place.image); return <article className="place-card" key={place.title}>{img && <Picture img={img} />}<div className="place-body"><h3>{place.title}</h3><p>{place.body}</p></div></article>; })}</div><p className="source-note">Descriptions follow Emaar's published guides to the district: {DISTRICT.placesSource.map((s, i) => <span key={s}>{i > 0 && " · "}<a href={s} target="_blank" rel="noopener noreferrer">{s.replace("https://www.emaar.com/en/blog/", "emaar.com/…/")}</a></span>)}.</p></div></section>

    <section className="section plans-section" id="getting-around"><div className="container two-col"><div><span className="eyebrow">Getting around</span><h2>Drive times<br />and the metro</h2><ul className="drive-list mt-6">{DISTRICT.driveTimes.map((d) => <li key={d.place}><span>{d.place}</span><span>{d.minutes} min</span></li>)}</ul><p className="source-note">{DISTRICT.driveTimesNote} <SourceLink href={DISTRICT.driveTimesSource}>Source: Emaar</SourceLink>. The Emaar Properties metro station on the Blue Line is planned for 2029 (Emaar).</p></div>{map && <figure className="project-cover"><Picture img={map} sizes="(max-width: 1000px) 100vw, 560px" /><figcaption className="image-note">{map.caption}</figcaption></figure>}</div></section>

    <section className="section"><div className="container"><div className="section-heading"><div><span className="eyebrow">Next step</span><h2>Compare the projects</h2></div></div><Link to="/" hash="projects" className="teaser-link">All {PROJECTS.length} projects with filters for status, quarter, bedrooms and budget <ArrowRight className="size-3.5" /></Link></div></section>
    <EnquirySection />
    <CtaBand />
  </main>;
}
