import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { BENEFITS } from "@/data/benefits";
import { dateText } from "@/lib/format";
import { msg, tFor, useT, type T } from "@/i18n/messages";
import { SourceCredit } from "./shared";

/** English, for code that runs outside a page (tests): dldCardBody(body) defaults to it. */
const EN = tFor("en");

/**
 * The DLD figures card is rewritten from the snapshot on every data refresh (src/data/benefits.ts), so it is not
 * a translation key: its figures are read back out of the English body through this template and put into the
 * translated template (src/i18n/README.md, "Text that changes with the data"). Reading them from the body keeps
 * the snapshot file off the pages that show the card. If a refresh ever changes the wording, the card shows the
 * English until the template is updated; src/test/i18n.test.ts fails first.
 */
export const DLD_CARD = msg("Dubai Land Department records for the 12 months to {date} show {newContracts} new tenancy contracts and {renewals} renewals registered for apartments in Dubai Creek Harbour, with a median rent of {rent} across {oneBedContracts} one-bedroom contracts. The same records show {readySales} ready-apartment sales registered in that window; these are registered contracts and sales, not valuations or forecasts.");
const DLD_SLOTS: string[] = [];
const DLD_PATTERN = new RegExp(`^${DLD_CARD.replace(/[.*+?^$()|[\]\\]/g, "\\$&").replace(/\{(\w+)\}/g, (_, k: string) => { DLD_SLOTS.push(k); return "(.+?)"; })}$`);
/** The figures in the card's English body, or null when the body no longer follows the template. */
export function dldCardFigures(english: string): Record<string, string> | null {
  const m = DLD_PATTERN.exec(english);
  return m ? Object.fromEntries(DLD_SLOTS.map((k, i) => [k, m[i + 1]!])) : null;
}
export function dldCardBody(english: string, t: T = EN): string {
  const v = dldCardFigures(english);
  return v ? t(DLD_CARD, { ...v, date: dateText(v["date"]!, t.locale) }) : english;
}

/** "Why Creek Harbour": every card rests on a sentence Emaar published or a figure in the DLD snapshot — see src/data/benefits.ts. */
export function WhyCreekHarbour({ compact = false }: { compact?: boolean }) {
  const t = useT();
  if (BENEFITS.length === 0) return null;
  const list = compact ? BENEFITS.slice(0, 4) : BENEFITS;
  return <section className="section benefits-section" id="why"><div className="container">
    <div className="section-heading"><div><span className="eyebrow">{t("Why buyers choose it")}</span><h2>{t("Why Dubai Creek Harbour")}</h2></div><p className="section-intro">{t("Freehold, visa-eligible, developer payment plans and a waterfront district between Downtown and the airport — in Emaar's words and the Land Department's numbers, not ours.")}</p></div>
    <div className="benefit-grid">{list.map((b, i) => <article className="benefit" key={b.title}><span className="benefit-n">{String(i + 1).padStart(2, "0")}</span><h3>{t(b.title)}</h3><p>{b.kind !== "dld-snapshot" ? t(b.body) : dldCardBody(b.body, t)}</p><p className="benefit-src">{b.kind === "dld-snapshot" ? t("Dubai Land Department records") : <SourceCredit>{t("Source: Emaar")}</SourceCredit>}</p></article>)}</div>
    {compact && <Link to="/guide" hash="why" className="teaser-link">{t("All {n} reasons, and how buying works", { n: BENEFITS.length })} <ArrowRight className="size-3.5" /></Link>}
  </div></section>;
}
