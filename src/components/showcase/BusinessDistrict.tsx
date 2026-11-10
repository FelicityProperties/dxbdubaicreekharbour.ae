/**
 * Dubai Square Business District: the office district Emaar announced on 9 November 2026 (src/data/business-district.ts).
 * "home" is the short announcement under the home page's hero; "area" is the full section on /area (#business-district).
 * Every figure and sentence comes from the data file, and Emaar is credited in plain text, never linked. WhatsApp taps
 * here count as "offices" on /leads (the business-district class; src/components/SiteAnalytics.tsx).
 */
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BUSINESS_DISTRICT as BD } from "@/data/business-district";
import { Picture, SourceCredit, WhatsApp, waMessage } from "@/components/showcase/shared";
import { dateLong } from "@/lib/format";
import { gap, msg, useT, type T } from "@/i18n/messages";

const OFFICES_MESSAGE = msg("Hi, I'm interested in offices at Dubai Square Business District in Dubai Creek Harbour. Please keep me updated.");
/** The WhatsApp message for the offices: the visitor's language with the English underneath. */
export const officesMessage = (t: T) => waMessage(t, OFFICES_MESSAGE);

function Facts({ t }: { t: T }) {
  return <div className="bd-facts">{BD.facts.map((f) => <div className="stat" key={f.label}><p className="stat-value">{t(f.value)}</p><p className="stat-label">{t(f.label)}</p></div>)}</div>;
}

export function BusinessDistrict({ variant }: { variant: "home" | "area" }) {
  const t = useT();
  const date = dateLong(BD.announced, t.locale).replace(/ /g, "\u00a0"); // "9 November 2026" never splits across lines
  const eyebrow = <span className="eyebrow">{t("Announced by Emaar · {date}", { date })}</span>;
  const status = <p className="bd-status">{t(BD.note)}{gap(t)}<SourceCredit>{t("Source: Emaar's press release, {date}", { date })}</SourceCredit></p>;
  const ask = <WhatsApp message={officesMessage(t)} className="bd-wa">{t("Ask about the offices")}</WhatsApp>;
  const figure = (sizes: string, priority = false) => <figure className="bd-figure"><Picture img={BD.image} sizes={sizes} width={960} eager={priority} /><figcaption className="image-note">{t(BD.image.caption)}</figcaption></figure>;

  if (variant === "home") {
    return <section className="section bd-band business-district" aria-labelledby="bd-home-h"><div className="container bd-layout">
      {figure("(max-width: 1023px) 100vw, 580px")}
      <div className="bd-copy">
        {eyebrow}
        <h2 id="bd-home-h">{t("Offices are coming to Dubai Creek Harbour")}</h2>
        <p className="bd-intro">{t(BD.intro)}</p>
        <Facts t={t} />
        {status}
        <div className="bd-actions">{ask}<Button asChild variant="outline"><Link to="/area" hash="business-district">{t("More about the business district")} <ArrowRight /></Link></Button></div>
      </div>
    </div></section>;
  }
  return <section className="section bd-area business-district" id="business-district" aria-labelledby="bd-h"><div className="container">
    <div className="section-heading"><div>{eyebrow}<h2 id="bd-h">{t("Offices are coming to Dubai Creek Harbour")}</h2></div><p className="section-intro">{t(BD.intro)}</p></div>
    {figure("(max-width: 1160px) 100vw, 1160px")}
    <Facts t={t} />
    <ul className="highlight-list bd-points">{BD.points.map((p) => <li key={p}><Check />{t(p)}</li>)}</ul>
    {status}
    <div className="bd-actions">{ask}</div>
  </div></section>;
}
