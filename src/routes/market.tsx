import { createFileRoute, Link } from "@tanstack/react-router";
import { TX, LATEST_ROW, windowLabel } from "@/data/transactions";
import { CtaBand, WhatsApp, waMessage } from "@/components/showcase/shared";
import { MarketSnapshot, LatestTransactions, ByBedroomTables, ByBuildingTables, SourceNote, kindHelp } from "@/components/market/Market";
import { EnquirySection } from "@/components/enquiry/EnquirySection";
import { dateLong } from "@/lib/format";
import { pageHead } from "@/lib/seo";
import { msg, tFor, useT } from "@/i18n/messages";

const UNIT_MESSAGE = msg("Hi, I'd like the registered sales and rents for a specific unit or building at Dubai Creek Harbour.");

// The head loads on every page: keep the transactions file out of it so it does not pull the whole snapshot in.
export const Route = createFileRoute("/market")({
  head: ({ match }) => {
    const t = tFor(match.context.locale);
    return pageHead({ locale: t.locale, path: "/market", title: t("Dubai Creek Harbour Sales & Rent Transactions (DLD)"), description: t("Recent ready and off-plan sales and tenancy contracts in Dubai Creek Harbour, as registered with the Dubai Land Department, by bedroom and by building.") });
  },
  component: MarketPage,
});

function MarketPage() {
  const t = useT();
  return <main className="page-market">
    <section className="page-hero"><div className="container"><span className="eyebrow">{t("Registered with the Dubai Land Department")}</span><h1>{t("What Dubai Creek Harbour homes actually sell and rent for")}</h1><p>{t("Not asking prices: the sales and tenancy contracts registered with the Dubai Land Department, shown exactly as registered. Snapshot taken {snapshot}; 12-month summaries to {date}, latest rows registered {latest}.", { snapshot: dateLong(TX.source.snapshotDate, t.locale), date: dateLong(TX.window.to, t.locale), latest: dateLong(LATEST_ROW, t.locale) })}</p></div></section>
    <section className="snapshot-section"><div className="container"><div className="snapshot-head"><div><span className="eyebrow">{windowLabel(t)}</span><h2>{t("The community in four numbers")}</h2></div></div><MarketSnapshot /><SourceNote /></div></section>
    <section className="section" id="latest"><div className="container"><div className="section-heading"><div><span className="eyebrow">{t("Row by row")}</span><h2>{t("Latest registered transactions")}</h2></div><p className="section-intro">{t("Ready homes and off-plan sales are separate tabs because they are different purchases; tenancy contracts show what homes let for.")}</p></div><LatestTransactions initial={25} /><p className="source-note">{t(kindHelp)}</p></div></section>
    <section className="section plans-section" id="by-bedroom"><div className="container"><div className="section-heading"><div><span className="eyebrow">{t("By home size")}</span><h2>{t("By bedroom")}</h2></div><p className="section-intro">{t("Medians across the whole community. A 1-bed in a Palace-branded tower and a 1-bed at Creek Beach are different homes — check the building tables below.")}</p></div><ByBedroomTables /><SourceNote compact /></div></section>
    <section className="section" id="by-building"><div className="container"><div className="section-heading"><div><span className="eyebrow">{t("Tower by tower")}</span><h2>{t("By building")}</h2></div><p className="section-intro">{t("Buildings with five or more registered rows in the window. Click a building to open its project page.")}</p></div><ByBuildingTables minCount={5} /><SourceNote compact /><div className="market-actions mt-8 flex flex-wrap gap-3"><WhatsApp message={waMessage(t, UNIT_MESSAGE)}>{t("Ask about a specific unit")}</WhatsApp><Link to="/projects" className="teaser-link">{t("All the projects")}</Link></div></div></section>
    <EnquirySection />
    <CtaBand />
  </main>;
}
