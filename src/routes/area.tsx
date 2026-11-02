import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PROJECTS, DISTRICT, districtImage } from "@/data/projects";
import { CtaBand, Picture, SourceLink, statusLabel } from "@/components/showcase/shared";
import { EnquirySection } from "@/components/enquiry/EnquirySection";
import { pageHead } from "@/lib/seo";
import { gap, tFor, useT } from "@/i18n/messages";
import { Rich } from "@/i18n/rich";

export const Route = createFileRoute("/area")({
  head: ({ match }) => {
    const t = tFor(match.context.locale);
    return pageHead({ locale: t.locale, path: "/area", title: t("Dubai Creek Harbour Area Guide: Quarters, Beach & Metro"), description: t("Dubai Creek Harbour quarter by quarter: Creek Island, Creek Beach and Green Gate, the marina, Central Park, Ras Al Khor and the Blue Line metro.") });
  },
  component: AreaPage,
});

/** A heading with one line break: translations keep the "|" where the line may break. */
function TwoLines({ text }: { text: string }) {
  const [a, b] = text.split("|");
  return <>{a}{b !== undefined && <><br />{b}</>}</>;
}

function AreaPage() {
  const t = useT();
  const hero = DISTRICT.images["creek-island"] ?? DISTRICT.images["hero"];
  const map = DISTRICT.images["map"];
  const beach = DISTRICT.images["creek-beach-aerial"];
  const green = DISTRICT.images["green-gate"];
  // The source links sit inside a translated sentence: the sentence keeps a {links} mark where they go.
  const [sourcesBefore, sourcesAfter = ""] = t("Descriptions follow Emaar's published guides to the district: {links}.").split("{links}");
  return <main>
    <section className="page-hero"><div className="container"><span className="eyebrow">{t("The neighbourhood")}</span><h1>{t("Dubai Creek Harbour, quarter by quarter")}</h1><p>{t(DISTRICT.intro)}</p></div></section>
    <section className="section"><div className="container">{hero && <figure className="project-cover"><Picture img={hero} sizes="(max-width: 1160px) 100vw, 1160px" width={1600} priority className="w-full rounded-[3px]" /><figcaption className="image-note">{t(hero.caption)}</figcaption></figure>}
      <div className="stat-strip mt-8">{DISTRICT.stats.map((s) => <div className="stat" key={s.label}><p className="stat-value">{t(s.value)}</p><p className="stat-label">{t(s.label)}</p></div>)}<div className="stat"><p className="stat-value">{PROJECTS.length}</p><p className="stat-label">{t("Emaar projects on this site")}</p><p className="stat-note">{t("{n} shown as completed in Dubai Land Department records", { n: PROJECTS.filter((p) => p.construction === "completed").length })}</p></div></div><p className="source-note">{t(DISTRICT.statsNote)}{gap(t)}<SourceLink href={DISTRICT.stats[0]?.source ?? "https://www.emaar.com"}>{t("Source: Emaar")}</SourceLink></p></div></section>

    <section className="section plans-section" id="quarters"><div className="container"><div className="section-heading"><div><span className="eyebrow">{t("Three quarters, three characters")}</span><h2>{t("Where in the district?")}</h2></div><p className="section-intro">{t("Each quarter has its own feel and its own price points. Projects are grouped as Emaar describes them.")}</p></div><div className="hood-grid">{DISTRICT.neighbourhoods.map((n) => { const list = PROJECTS.filter((p) => p.district === n.name); return <article className="hood" key={n.name}><h3>{t(n.name)}</h3><p>{t(n.body)}</p><ul>{list.map((p) => <li key={p.slug}><Link to="/projects/$slug" params={{ slug: p.slug }} className="chip">{p.name} · {statusLabel(p, t)}</Link></li>)}</ul></article>; })}</div><div className="two-col mt-10">{beach && <figure className="project-cover"><Picture img={beach} sizes="(max-width: 1000px) 100vw, 560px" /><figcaption className="image-note">{t(beach.caption)}</figcaption></figure>}{green && <figure className="project-cover"><Picture img={green} sizes="(max-width: 1000px) 100vw, 560px" /><figcaption className="image-note">{t(green.caption)}</figcaption></figure>}</div></div></section>

    <section className="section" id="places"><div className="container"><div className="section-heading"><div><span className="eyebrow">{t("Beyond your front door")}</span><h2>{t("The places that define it")}</h2></div><p className="section-intro">{t(DISTRICT.everyday)}</p></div><div className="place-grid">{DISTRICT.places.map((place) => { const img = districtImage(place.image); return <article className="place-card" key={place.title}>{img ? <Picture img={img} /> : <div className="place-art" aria-hidden="true" />}<div className="place-body"><h3>{t(place.title)}</h3><p>{t(place.body)}</p></div></article>; })}</div><p className="source-note">{sourcesBefore}{DISTRICT.placesSource.map((s, i) => <span key={s}>{i > 0 && " · "}<a href={s} target="_blank" rel="noopener noreferrer">{s.replace("https://www.emaar.com/en/blog/", "emaar.com/…/")}</a></span>)}{sourcesAfter}</p></div></section>

    <section className="section plans-section" id="getting-around"><div className="container two-col"><div><span className="eyebrow">{t("Getting around")}</span><h2><TwoLines text={t("Drive times|and the metro")} /></h2><ul className="drive-list mt-6">{DISTRICT.driveTimes.map((d) => <li key={d.place}><span>{t(d.place)}</span><span>{t("{n} min", { n: d.minutes })}</span></li>)}</ul><p className="source-note">{t(DISTRICT.driveTimesNote)} <Rich text={t("<source>Source: Emaar</source>. The Emaar Properties metro station on the Blue Line is planned for 2029 (Emaar).")} tags={{ source: (s) => <SourceLink href={DISTRICT.driveTimesSource}>{s}</SourceLink> }} /></p></div>{map && <figure className="project-cover"><Picture img={map} sizes="(max-width: 1000px) 100vw, 560px" /><figcaption className="image-note">{t(map.caption)}</figcaption></figure>}</div></section>

    <section className="section"><div className="container"><div className="section-heading"><div><span className="eyebrow">{t("Next step")}</span><h2>{t("Compare the projects")}</h2></div></div><Link to="/projects" className="teaser-link">{t("All {n} projects with filters for status, quarter, bedrooms and budget", { n: PROJECTS.length })} <ArrowRight className="size-3.5" /></Link></div></section>
    <EnquirySection />
    <CtaBand />
  </main>;
}
