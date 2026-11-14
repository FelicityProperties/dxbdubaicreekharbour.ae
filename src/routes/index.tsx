import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectCollection } from "@/components/showcase/ProjectCollection";
import { PROJECTS, DISTRICT, FAQ, COSTS, SITE, districtImage } from "@/data/projects";
import { TX } from "@/data/transactions";
import { WhatsApp, PlanBar, CtaBand, ArrowDown, Picture, handoverSortKey } from "@/components/showcase/shared";
import { descriptionMax, fitDescription, ldScript, organizationNode, pageHead, websiteNode } from "@/lib/seo";
import { MarketSnapshot, LatestTransactions, SourceNote } from "@/components/market/Market";
import { WhyCreekHarbour } from "@/components/showcase/Benefits";
import { EnquirySection } from "@/components/enquiry/EnquirySection";
import { AiViewings } from "@/components/showcase/AiViewings";
import { AI_VIEWINGS, videoObjectNode } from "@/data/ai-viewings";
import { dateLong, dateText } from "@/lib/format";
import { gap, tFor, useT } from "@/i18n/messages";
import { usePhoneScrollRegion } from "@/lib/phone";
import { BusinessDistrict } from "@/components/showcase/BusinessDistrict";

export const Route = createFileRoute("/")({
  head: ({ match }) => {
    const t = tFor(match.context.locale);
    const summary = t("All {n} Emaar projects in Dubai Creek Harbour side by side: published prices, payment plans, handover dates and DLD-registered sales and rents.", { n: PROJECTS.length });
    return {
      ...pageHead({ locale: t.locale, path: "/", title: t("Dubai Creek Harbour: Emaar Projects, Prices & DLD Sales"), description: fitDescription([summary], descriptionMax(t.locale)) || summary }),
      scripts: [ldScript([organizationNode(t), websiteNode(t.locale), ...AI_VIEWINGS.map((v) => videoObjectNode(v, t))])],
    };
  },
  component: Home,
});

/** A heading with one line break: translations keep the "|" where the line may break; the hero sets its second line in italics. */
function TwoLines({ text, em = false }: { text: string; em?: boolean }) {
  const [a, b] = text.split("|");
  return <>{a}{b !== undefined && <><br />{em ? <em>{b}</em> : b}</>}</>;
}

function Home() {
  const t = useT();
  const plans = PROJECTS.filter((p) => p.paymentPlan).sort((a, b) => handoverSortKey(a).localeCompare(handoverSortKey(b)));
  const hero = DISTRICT.images["hero"];
  const places = DISTRICT.places.slice(0, 3);
  const downtown = DISTRICT.driveTimes.find((d) => d.place.startsWith("Downtown"))?.minutes ?? "";
  const airport = DISTRICT.driveTimes.find((d) => d.place.includes("DXB"))?.minutes ?? "";
  // Phones: the places swipe row can be scrolled from the keyboard. Its data-scroll-restoration-id lets the router put it
  // back where it was after a sheet closes (see ProjectCollection.tsx).
  const placeRow = usePhoneScrollRegion<HTMLDivElement>("district-h");
  return <main className="page-home">
    <section className="hero">{hero && <Picture img={hero} className="hero-image" sizes="100vw" width={1600} priority />}<div className="container hero-content"><span className="eyebrow">{t("Dubai Creek Harbour · an independent broker's showcase")}</span><h1><TwoLines em text={t("Emaar's Dubai Creek Harbour projects,|side by side.")} /></h1><p className="hero-description">{t("{n} projects, with Emaar's published prices, payment plans and handover dates wherever Emaar publishes them — plus the sales and rents actually registered with the Dubai Land Department. Independent broker; ask anything on WhatsApp.", { n: PROJECTS.length })}</p><div className="hero-actions"><Button asChild variant="brass"><Link to="/" hash="projects">{t("View projects")} <ArrowDown /></Link></Button><WhatsApp variant="heroOutline" /></div></div><div className="container hero-bottom"><span>{t("Dubai Creek Harbour · {n} projects · prices checked {date}", { n: PROJECTS.length, date: dateText(SITE.pricesCheckedOn, t.locale) })}</span><span>{hero && t(hero.caption)}</span></div></section>

    <BusinessDistrict variant="home" />

    <AiViewings />

    <section className="snapshot-section" aria-labelledby="snapshot-h"><div className="container"><div className="snapshot-head"><div><span className="eyebrow">{t("Registered with the Dubai Land Department")}</span><h2 id="snapshot-h">{t("The Creek Harbour market, 12 months to {date}", { date: dateLong(TX.window.to, t.locale) })}</h2></div><Link to="/market" className="teaser-link">{t("All market data")} <ArrowRight className="size-3.5" /></Link></div><MarketSnapshot /><SourceNote compact /></div></section>

    <ProjectCollection shelf />

    <WhyCreekHarbour compact />

    <section className="section plans-section" id="payment-plans"><div className="container plans-layout"><div><span className="eyebrow">{t("The path to your new home")}</span><h2><TwoLines text={t("Payment plans|at a glance")} /></h2><div className="plan-legend"><span><i className="legend-dot booking" />{t("Booking")}</span><span><i className="legend-dot construction" />{t("Construction")}</span><span><i className="legend-dot handover" />{t("Handover")}</span></div><p className="plan-context">{t("Emaar's published instalment schedules, summarised here as booking / construction / handover and shown in handover order. Each project page has the dated schedule as Emaar publishes it. For resale, confirm the seller's paid and remaining instalments.")}</p><Link to="/payment-plans" className="teaser-link mt-5">{t("Every schedule, instalment by instalment")} <ArrowRight className="size-3.5" /></Link></div><div>{plans.map((p) => <div key={p.slug}><div className="plan-row"><Link className="plan-row-name" to="/projects/$slug" params={{ slug: p.slug }}>{p.name}{p.construction === "completed" ? <span className="block text-[11px] font-sans text-muted-foreground mt-1">{t("Completed building")}</span> : p.handover && <span className="block text-[11px] font-sans text-muted-foreground mt-1">{t("Handover {date}", { date: dateLong(p.handover.text, t.locale) })}</span>}</Link>{p.paymentPlan && <PlanBar steps={p.paymentPlan.steps} />}</div></div>)}</div></div></section>

    <section className="section" id="market"><div className="container"><div className="section-heading"><div><span className="eyebrow">{t("What actually changed hands")}</span><h2>{t("Latest registered sales and rents")}</h2></div><p className="section-intro">{t("Ready homes, off-plan and tenancy contracts across Dubai Creek Harbour, straight from the Land Department register.")}</p></div><LatestTransactions initial={10} /><SourceNote compact /><Link to="/market" className="teaser-link">{t("Full market data: by bedroom, by building, all recent rows")} <ArrowRight className="size-3.5" /></Link></div></section>

    <section className="section district-section" id="district"><div className="container"><div className="section-heading"><div><span className="eyebrow">{t("Beyond your front door")}</span><h2 id="district-h">{t("About Dubai Creek Harbour")}</h2></div><p className="section-intro">{t(DISTRICT.intro)}</p></div><div ref={placeRow} data-scroll-restoration-id="district-row" className="place-grid app-shelf">{places.map((place) => { const img = districtImage(place.image); return <article className="place-card" key={place.title}>{img && <Picture img={img} sizes="(max-width: 640px) 82vw, (max-width: 1000px) 50vw, 33vw" />}<div className="place-body"><h3>{t(place.title)}</h3><p>{t(place.body)}</p></div></article>; })}</div><div className="stat-strip mt-6">{DISTRICT.stats.map((s) => <div className="stat" key={s.label}><p className="stat-value">{t(s.value)}</p><p className="stat-label">{t(s.label)}</p></div>)}<div className="stat"><p className="stat-value">{t("{n} min", { n: downtown })}</p><p className="stat-label">{t("to Downtown Dubai by car")}</p><p className="stat-note">{t("{n} min to DXB airport", { n: airport })}</p></div></div><p className="source-note">{t(DISTRICT.statsNote)}{gap(t)}{t(DISTRICT.driveTimesNote)}</p><Link to="/area" className="teaser-link">{t("The three quarters, every landmark, drive times and the metro")} <ArrowRight className="size-3.5" /></Link></div></section>

    <section className="section guide-teaser" id="guide"><div className="container two-col"><div><span className="eyebrow">{t("How buying works")}</span><h2><TwoLines text={t("From reservation|to title deed")} /></h2><p className="district-intro">{t("Reserve a unit, pay the down payment into escrow, sign Emaar's sale agreement, register with the Land Department, then handover and your electronic title deed. Non-residents buy with a passport. Our step-by-step guide uses Emaar's published terms.")}</p><Link to="/guide" className="teaser-link">{t("Read the buying guide")} <ArrowRight className="size-3.5" /></Link></div><div className="costs-box"><h3>{t(COSTS.title)}</h3><p className="block-note">{t(COSTS.note)}</p>{COSTS.items.slice(0, 4).map((c) => <div className="cost-row" key={c.label}><span>{t(c.label)}</span><span className="cost-value">{t(c.value)}</span></div>)}<Link to="/guide" hash="costs" className="teaser-link">{t("All costs, with Emaar's sources")} <ArrowRight className="size-3.5" /></Link></div></div></section>

    <EnquirySection />
    <section className="section faq-section" id="faq"><div className="container faq-layout"><div><span className="eyebrow">{t("Good questions. Clear answers.")}</span><h2><TwoLines text={t("Before you|make your move")} /></h2><Link to="/guide" hash="faq" className="teaser-link">{t("All questions")} <ArrowRight className="size-3.5" /></Link></div><div>{FAQ.slice(0, 6).map((item) => <details key={item.q} className="faq-item"><summary>{t(item.q)}<Plus /></summary><p>{t(item.a)}</p></details>)}</div></div></section>
    <CtaBand />
  </main>;
}
