/**
 * Registered-transaction tables and summaries. Everything here reads the
 * Dubai Land Department snapshot in src/data/transactions.json; nothing is
 * computed beyond adding up counts.
 */
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PROJECTS } from "@/data/projects";
import { TX, LATEST_ROW, UNASSIGNED, windowLabel, type SaleRow, type RentRow, type Basis } from "@/data/transactions";
import { aed, aedShort, num, dateShort, dateLong, dateRange } from "@/lib/format";
import { msg, tFor, useT, type T } from "@/i18n/messages";
import { LOCALE_META } from "@/i18n/locales";

/** English, for code outside a page: basisLabel() defaults to it. */
const EN = tFor("en");

export const basisLabel = (b: Basis, t: T = EN) => (b === "ready" ? t("Ready homes") : t("Off-plan"));
/** English; pages show it with t(kindHelp). */
export const kindHelp = msg("Resale: the previous owner sold to a new buyer. First registration: the first sale recorded for that unit — for off-plan, normally the developer's own sale. Related-party transfers and completion re-registrations are left out.");

/**
 * An amount set inside right-to-left text, kept whole and in place (Unicode isolate): in "… AED 145,000 · 3 …" the
 * digits after the dot would otherwise join the amount before it and swap places with the "·". English is unchanged.
 */
const amountIn = (t: T, s: string) => (LOCALE_META[t.locale].dir === "rtl" ? `\u2066${s}\u2069` : s);

/** A bedroom label from the snapshot ("1 Bed"), in the page's language. */
const beds = (b: string | null, t: T) => (b == null ? "—" : t(b));

function BuildingCell({ building, project }: { building: string; project: string | null }) {
  const t = useT();
  const unnamed = UNASSIGNED.test(building);
  const label = unnamed ? t(building) : building;
  if (project && PROJECTS.some((p) => p.slug === project)) return <Link to="/projects/$slug" params={{ slug: project }}>{label}</Link>;
  return <span className={unnamed ? "unassigned" : undefined}>{label}</span>;
}
function ShowMore({ total, initial, all, onToggle }: { total: number; initial: number; all: boolean; onToggle: () => void }) {
  const t = useT();
  if (total <= initial) return null;
  return <Button variant="outline" size="sm" className="show-more" onClick={onToggle}>{all ? t("Show fewer") : t("Show all {n}", { n: total })}</Button>;
}

export function SalesTable({ rows, initial = 20, showKind = true }: { rows: SaleRow[]; initial?: number; showKind?: boolean }) {
  const t = useT();
  const [all, setAll] = useState(false);
  if (rows.length === 0) return <p className="tx-empty">{t("No registered sales in this snapshot.")}</p>;
  const shown = all ? rows : rows.slice(0, initial);
  return <>
    <div className="table-scroll"><table className="tx-table"><thead><tr><th scope="col">{t("Registered")}</th><th scope="col">{t("Building")}</th><th scope="col">{t("Floor")}</th><th scope="col">{t("Beds")}</th><th scope="col" className="num">{t("Size (sq ft)")}</th><th scope="col" className="num">{t("Price")}</th><th scope="col" className="num">{t("AED / sq ft")}</th>{showKind && <th scope="col">{t("Type")}</th>}</tr></thead>
      <tbody>{shown.map((r, i) => <tr key={`${r.date}-${i}`}><td>{dateShort(r.date, t.locale)}</td><td><BuildingCell building={r.building} project={r.project} /></td><td>{r.floor ?? "—"}</td><td>{beds(r.bedrooms, t)}</td><td className="num">{num(r.sizeSqft)}</td><td className="num">{aed(r.price)}</td><td className="num">{num(r.psf)}</td>{showKind && <td><span className="kind">{t(r.kind)}</span></td>}</tr>)}</tbody></table></div>
    <ShowMore total={rows.length} initial={initial} all={all} onToggle={() => setAll(!all)} />
  </>;
}

export function RentalsTable({ rows, initial = 20 }: { rows: RentRow[]; initial?: number }) {
  const t = useT();
  const [all, setAll] = useState(false);
  if (rows.length === 0) return <p className="tx-empty">{t("No registered tenancy contracts in this snapshot.")}</p>;
  const shown = all ? rows : rows.slice(0, initial);
  return <>
    <div className="table-scroll"><table className="tx-table"><thead><tr><th scope="col">{t("Registered")}</th><th scope="col">{t("Building")}</th><th scope="col">{t("Beds")}</th><th scope="col" className="num">{t("Size (sq ft)")}</th><th scope="col" className="num">{t("Annual rent")}</th><th scope="col" className="num">{t("AED / sq ft / yr")}</th><th scope="col">{t("Contract")}</th><th scope="col">{t("Term")}</th></tr></thead>
      <tbody>{shown.map((r, i) => <tr key={`${r.registered}-${i}`}><td>{dateShort(r.registered, t.locale)}</td><td><BuildingCell building={r.building} project={r.project} /></td><td>{beds(r.bedrooms, t)}</td><td className="num">{num(r.sizeSqft)}</td><td className="num">{aed(r.annualRent)}</td><td className="num">{num(r.rentPsf)}</td><td><span className="kind">{r.newContract ? t("New") : t("Renewal")}</span></td><td>{dateRange(r.start, r.end, t.locale)}</td></tr>)}</tbody></table></div>
    <ShowMore total={rows.length} initial={initial} all={all} onToggle={() => setAll(!all)} />
  </>;
}

export function SourceNote({ compact = false }: { compact?: boolean }) {
  const t = useT();
  const v = { source: t(TX.source.basis), date: dateLong(TX.window.to, t.locale), latest: dateLong(LATEST_ROW, t.locale), snapshot: dateLong(TX.source.snapshotDate, t.locale), filters: t(TX.source.filters) };
  return <p className="source-note">{compact
    ? t("Source: {source}; 12-month summaries to {date}, latest rows registered {latest}. Snapshot taken {snapshot}. Figures are as registered with the Dubai Land Department; they are not valuations.", v)
    : t("Source: {source}; 12-month summaries to {date}, latest rows registered {latest}. Snapshot taken {snapshot}. {filters} Figures are as registered with the Dubai Land Department; they are not valuations.", v)}</p>;
}

function Stat({ value, label, note }: { value: string; label: string; note?: string | undefined }) {
  return <div className="stat"><p className="stat-value">{value}</p><p className="stat-label">{label}</p>{note && <p className="stat-note">{note}</p>}</div>;
}
/** Community-wide figures for the 12-month window. */
export function MarketSnapshot() {
  const t = useT();
  const ready = TX.summary.sales.find((s) => s.basis === "ready");
  const off = TX.summary.sales.find((s) => s.basis === "offplan");
  const rentTotal = TX.summary.rentalsByBedroom.reduce((n, b) => n + b.count, 0);
  const one = TX.summary.rentalsByBedroom.find((b) => b.bedrooms === "1 Bed");
  const two = TX.summary.rentalsByBedroom.find((b) => b.bedrooms === "2 Bed");
  return <div className="stat-strip">
    <Stat value={num(ready?.count)} label={t("ready apartment sales registered")} note={t("median {psf} AED/sq ft · median price {price}", { psf: num(ready?.medianPsf), price: aedShort(ready?.medianPrice) })} />
    <Stat value={num(off?.count)} label={t("off-plan apartment sales registered")} note={t("median {psf} AED/sq ft · median price {price}", { psf: num(off?.medianPsf), price: aedShort(off?.medianPrice) })} />
    <Stat value={num(rentTotal)} label={t("apartment tenancy contracts registered")} note={t("{n} new contracts, the rest renewals", { n: num(TX.summary.rentalsNewVsRenewal.find((r) => r.newContract)?.count) })} />
    <Stat value={aed(one?.medianRent)} label={t("median 1-bed annual rent")} note={t("2-bed {two} · 3-bed {three}", { two: amountIn(t, aed(two?.medianRent)), three: amountIn(t, aed(TX.summary.rentalsByBedroom.find((b) => b.bedrooms === "3 Bed")?.medianRent)) })} />
  </div>;
}

export function ByBedroomTables() {
  const t = useT();
  const period = windowLabel(t);
  const bedrooms = Array.from(new Set(TX.summary.salesByBedroom.map((r) => r.bedrooms)));
  const cell = (basis: Basis, b: string) => TX.summary.salesByBedroom.find((r) => r.basis === basis && r.bedrooms === b);
  return <div className="market-layout">
    <div className="market-block"><h3>{t("Apartment sales by bedroom")}</h3><p className="block-note">{t("{window}. Median registered price and price per square foot; counts are registered sales, not homes.", { window: period })}</p>
      <div className="table-scroll"><table className="tx-table"><thead><tr><th scope="col">{t("Bedrooms")}</th><th scope="col" className="num">{t("Ready sales")}</th><th scope="col" className="num">{t("Ready median price")}</th><th scope="col" className="num">{t("Ready AED / sq ft")}</th><th scope="col" className="num">{t("Off-plan sales")}</th><th scope="col" className="num">{t("Off-plan median price")}</th><th scope="col" className="num">{t("Off-plan AED / sq ft")}</th></tr></thead>
        <tbody>{bedrooms.map((b) => { const r = cell("ready", b), o = cell("offplan", b); if ((r?.count ?? 0) + (o?.count ?? 0) < 5) return null; return <tr key={b}><td>{t(b)}</td><td className="num">{num(r?.count ?? 0)}</td><td className="num">{aed(r?.medianPrice)}</td><td className="num">{num(r?.medianPsf)}</td><td className="num">{num(o?.count ?? 0)}</td><td className="num">{aed(o?.medianPrice)}</td><td className="num">{num(o?.medianPsf)}</td></tr>; })}</tbody></table></div></div>
    <div className="market-block"><h3>{t("Apartment rents by bedroom")}</h3><p className="block-note">{t("{window}. Registered Ejari contracts, new and renewed; rent is the annualised contract amount.", { window: period })}</p>
      <div className="table-scroll"><table className="tx-table"><thead><tr><th scope="col">{t("Bedrooms")}</th><th scope="col" className="num">{t("Contracts")}</th><th scope="col" className="num">{t("Median annual rent")}</th><th scope="col" className="num">{t("Middle half of rents")}</th><th scope="col" className="num">{t("AED / sq ft / yr")}</th><th scope="col" className="num">{t("Median size (sq ft)")}</th></tr></thead>
        <tbody>{TX.summary.rentalsByBedroom.map((r) => <tr key={r.bedrooms}><td>{t(r.bedrooms)}</td><td className="num">{num(r.count)}</td><td className="num">{aed(r.medianRent)}</td><td className="num">{aedShort(r.p25Rent)} – {aedShort(r.p75Rent)}</td><td className="num">{num(r.medianRentPsf)}</td><td className="num">{num(r.medianSizeSqft)}</td></tr>)}</tbody></table></div></div>
  </div>;
}

export function ByBuildingTables({ slug, minCount = 1 }: { slug?: string; minCount?: number }) {
  const t = useT();
  const period = windowLabel(t);
  const sales = TX.byBuilding.sales.filter((b) => (slug ? b.project === slug : b.count >= minCount));
  const rentals = TX.byBuilding.rentals.filter((b) => (slug ? b.project === slug : b.count >= minCount));
  const [allS, setAllS] = useState(Boolean(slug));
  const [allR, setAllR] = useState(Boolean(slug));
  const shownS = allS ? sales : sales.slice(0, 15), shownR = allR ? rentals : rentals.slice(0, 15);
  return <div className="market-layout">
    <div className="market-block"><h3>{slug ? t("Sales by tower") : t("Sales by building")}</h3><p className="block-note">{t("{window}. Ready and off-plan registrations are listed separately because they sell on different terms.", { window: period })}</p>
      {sales.length === 0 ? <p className="tx-empty">{slug ? t("No registered market sales for this project in the 12-month window — new-launch registrations are not yet assigned to a building in the DLD register.") : t("No rows.")}</p> : <><div className="table-scroll"><table className="tx-table"><thead><tr><th scope="col">{t("Building")}</th><th scope="col">{t("Basis")}</th><th scope="col" className="num">{t("Sales")}</th><th scope="col" className="num">{t("Median AED / sq ft")}</th><th scope="col" className="num">{t("Middle half AED / sq ft")}</th><th scope="col" className="num">{t("Median price")}</th></tr></thead>
        <tbody>{shownS.map((b) => <tr key={`${b.building}-${b.basis}`}><td><BuildingCell building={b.building} project={b.project} /></td><td><span className="kind">{basisLabel(b.basis, t)}</span></td><td className="num">{num(b.count)}</td><td className="num">{num(b.medianPsf)}</td><td className="num">{num(b.p25Psf)} – {num(b.p75Psf)}</td><td className="num">{aed(b.medianPrice)}</td></tr>)}</tbody></table></div><ShowMore total={sales.length} initial={15} all={allS} onToggle={() => setAllS(!allS)} /></>}</div>
    <div className="market-block"><h3>{slug ? t("Rents by tower") : t("Rents by building")}</h3><p className="block-note">{t("{window}. Registered Ejari contracts, new and renewed.", { window: period })}</p>
      {rentals.length === 0 ? <p className="tx-empty">{t("No registered tenancy contracts for this project in the 12-month window.")}</p> : <><div className="table-scroll"><table className="tx-table"><thead><tr><th scope="col">{t("Building")}</th><th scope="col" className="num">{t("Contracts")}</th><th scope="col" className="num">{t("Median annual rent")}</th><th scope="col" className="num">{t("Middle half of rents")}</th><th scope="col" className="num">{t("AED / sq ft / yr")}</th></tr></thead>
        <tbody>{shownR.map((b) => <tr key={b.building}><td><BuildingCell building={b.building} project={b.project} /></td><td className="num">{num(b.count)}</td><td className="num">{aed(b.medianRent)}</td><td className="num">{aedShort(b.p25Rent)} – {aedShort(b.p75Rent)}</td><td className="num">{b.medianRentPsf ? num(b.medianRentPsf) : "—"}</td></tr>)}</tbody></table></div><ShowMore total={rentals.length} initial={15} all={allR} onToggle={() => setAllR(!allR)} /></>}</div>
  </div>;
}

/** Tabbed latest-transactions block used on the home page and the market page. */
export function LatestTransactions({ initial = 10, showKind = true }: { initial?: number; showKind?: boolean }) {
  const t = useT();
  const [tab, setTab] = useState<"ready" | "offplan" | "rent">("ready");
  const ready = TX.sales.filter((s) => s.basis === "ready"), off = TX.sales.filter((s) => s.basis === "offplan");
  const { readySales, offplanSales, rentals } = TX.recent;
  const tabs: { id: typeof tab; label: string; note: string }[] = [
    { id: "ready", label: t("Ready homes"), note: t("The {n} most recent registered market sales of completed homes in our snapshot ({range}).", { n: readySales.count, range: dateRange(readySales.from, readySales.to, t.locale) }) },
    { id: "offplan", label: t("Off-plan"), note: t("The {n} most recent registered off-plan sales in our snapshot ({range}). Rows marked \"not yet named\" are new-launch registrations the DLD register has not yet assigned to a building.", { n: offplanSales.count, range: dateRange(offplanSales.from, offplanSales.to, t.locale) }) },
    { id: "rent", label: t("Tenancy contracts"), note: t("The {n} most recent registered Ejari contracts in our snapshot ({newContracts} new, the rest renewals; {range}).", { n: rentals.count, newContracts: rentals.newContracts, range: dateRange(rentals.from, rentals.to, t.locale) }) },
  ];
  const current = tabs.find((x) => x.id === tab) ?? tabs[0]!;
  return <div>
    <div className="tabs" role="group" aria-label={t("Latest registered transactions")}>{tabs.map((x) => <button key={x.id} type="button" className="tab-button" aria-pressed={tab === x.id} onClick={() => setTab(x.id)}>{x.label}</button>)}</div>
    <p className="block-note">{current.note}</p>
    <div hidden={tab !== "ready"}><SalesTable rows={ready} initial={initial} showKind={showKind} /></div>
    <div hidden={tab !== "offplan"}><SalesTable rows={off} initial={initial} showKind={showKind} /></div>
    <div hidden={tab !== "rent"}><RentalsTable rows={TX.rentals} initial={initial} /></div>
  </div>;
}
