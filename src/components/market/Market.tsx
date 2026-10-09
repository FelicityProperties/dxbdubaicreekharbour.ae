/**
 * Registered-transaction tables and summaries. Everything here reads the
 * PropertyIndex snapshot in src/data/transactions.json; nothing is computed
 * beyond adding up counts.
 */
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PROJECTS } from "@/data/projects";
import { TX, type SaleRow, type RentRow, type Basis } from "@/data/transactions";
import { aed, aedShort, num, dateShort, dateLong, dateRange } from "@/lib/format";

const UNASSIGNED = /not yet named/;
export const basisLabel = (b: Basis) => (b === "ready" ? "Ready homes" : "Off-plan");
export const kindHelp = "Resale: the previous owner sold to a new buyer. First registration: the first sale recorded for that unit — for off-plan, normally the developer's own sale. Related-party transfers and completion re-registrations are left out.";

function BuildingCell({ building, project }: { building: string; project: string | null }) {
  if (project && PROJECTS.some((p) => p.slug === project)) return <Link to="/projects/$slug" params={{ slug: project }}>{building}</Link>;
  return <span className={UNASSIGNED.test(building) ? "unassigned" : undefined}>{building}</span>;
}
function ShowMore({ total, initial, all, onToggle }: { total: number; initial: number; all: boolean; onToggle: () => void }) {
  if (total <= initial) return null;
  return <Button variant="outline" size="sm" className="show-more" onClick={onToggle}>{all ? "Show fewer" : `Show all ${total}`}</Button>;
}

export function SalesTable({ rows, initial = 20, showKind = true }: { rows: SaleRow[]; initial?: number; showKind?: boolean }) {
  const [all, setAll] = useState(false);
  if (rows.length === 0) return <p className="tx-empty">No registered sales in this snapshot.</p>;
  const shown = all ? rows : rows.slice(0, initial);
  return <>
    <div className="table-scroll"><table className="tx-table"><thead><tr><th scope="col">Registered</th><th scope="col">Building</th><th scope="col">Floor</th><th scope="col">Beds</th><th scope="col" className="num">Size (sq ft)</th><th scope="col" className="num">Price</th><th scope="col" className="num">AED / sq ft</th>{showKind && <th scope="col">Type</th>}</tr></thead>
      <tbody>{shown.map((r, i) => <tr key={`${r.date}-${i}`}><td>{dateShort(r.date)}</td><td><BuildingCell building={r.building} project={r.project} /></td><td>{r.floor ?? "—"}</td><td>{r.bedrooms ?? "—"}</td><td className="num">{num(r.sizeSqft)}</td><td className="num">{aed(r.price)}</td><td className="num">{num(r.psf)}</td>{showKind && <td><span className="kind">{r.kind}</span></td>}</tr>)}</tbody></table></div>
    <ShowMore total={rows.length} initial={initial} all={all} onToggle={() => setAll(!all)} />
  </>;
}

export function RentalsTable({ rows, initial = 20 }: { rows: RentRow[]; initial?: number }) {
  const [all, setAll] = useState(false);
  if (rows.length === 0) return <p className="tx-empty">No registered tenancy contracts in this snapshot.</p>;
  const shown = all ? rows : rows.slice(0, initial);
  return <>
    <div className="table-scroll"><table className="tx-table"><thead><tr><th scope="col">Registered</th><th scope="col">Building</th><th scope="col">Beds</th><th scope="col" className="num">Size (sq ft)</th><th scope="col" className="num">Annual rent</th><th scope="col" className="num">AED / sq ft / yr</th><th scope="col">Contract</th><th scope="col">Term</th></tr></thead>
      <tbody>{shown.map((r, i) => <tr key={`${r.registered}-${i}`}><td>{dateShort(r.registered)}</td><td><BuildingCell building={r.building} project={r.project} /></td><td>{r.bedrooms ?? "—"}</td><td className="num">{num(r.sizeSqft)}</td><td className="num">{aed(r.annualRent)}</td><td className="num">{num(r.rentPsf)}</td><td><span className="kind">{r.newContract ? "New" : "Renewal"}</span></td><td>{dateRange(r.start, r.end)}</td></tr>)}</tbody></table></div>
    <ShowMore total={rows.length} initial={initial} all={all} onToggle={() => setAll(!all)} />
  </>;
}

export function SourceNote({ compact = false }: { compact?: boolean }) {
  return <p className="source-note">Source: <a href={TX.source.communityUrl} target="_blank" rel="noopener noreferrer">PropertyIndex</a> — {TX.source.basis}; {TX.source.coverage}. Snapshot taken {dateLong(TX.source.snapshotDate)}.{compact ? "" : ` ${TX.source.filters}`} Figures are as registered with the Dubai Land Department; they are not valuations.</p>;
}

function Stat({ value, label, note }: { value: string; label: string; note?: string | undefined }) {
  return <div className="stat"><p className="stat-value">{value}</p><p className="stat-label">{label}</p>{note && <p className="stat-note">{note}</p>}</div>;
}
/** Community-wide figures for the 12-month window. */
export function MarketSnapshot() {
  const ready = TX.summary.sales.find((s) => s.basis === "ready");
  const off = TX.summary.sales.find((s) => s.basis === "offplan");
  const rentTotal = TX.summary.rentalsByBedroom.reduce((n, b) => n + b.count, 0);
  const one = TX.summary.rentalsByBedroom.find((b) => b.bedrooms === "1 Bed");
  const two = TX.summary.rentalsByBedroom.find((b) => b.bedrooms === "2 Bed");
  return <div className="stat-strip">
    <Stat value={num(ready?.count)} label="ready-home sales registered" note={`median ${num(ready?.medianPsf)} AED/sq ft · median price ${aedShort(ready?.medianPrice)}`} />
    <Stat value={num(off?.count)} label="off-plan sales registered" note={`median ${num(off?.medianPsf)} AED/sq ft · median price ${aedShort(off?.medianPrice)}`} />
    <Stat value={num(rentTotal)} label="tenancy contracts registered" note={`${num(TX.summary.rentalsNewVsRenewal.find((r) => r.newContract)?.count)} new contracts, the rest renewals`} />
    <Stat value={aed(one?.medianRent)} label="median 1-bed annual rent" note={`2-bed ${aed(two?.medianRent)} · 3-bed ${aed(TX.summary.rentalsByBedroom.find((b) => b.bedrooms === "3 Bed")?.medianRent)}`} />
  </div>;
}

export function ByBedroomTables() {
  const beds = Array.from(new Set(TX.summary.salesByBedroom.map((r) => r.bedrooms)));
  const cell = (basis: Basis, b: string) => TX.summary.salesByBedroom.find((r) => r.basis === basis && r.bedrooms === b);
  return <div className="market-layout">
    <div className="market-block"><h3>Apartment sales by bedroom</h3><p className="block-note">{TX.window.label}. Median registered price and price per square foot; counts are registered sales, not homes.</p>
      <div className="table-scroll"><table className="tx-table"><thead><tr><th scope="col">Bedrooms</th><th scope="col" className="num">Ready sales</th><th scope="col" className="num">Ready median price</th><th scope="col" className="num">Ready AED / sq ft</th><th scope="col" className="num">Off-plan sales</th><th scope="col" className="num">Off-plan median price</th><th scope="col" className="num">Off-plan AED / sq ft</th></tr></thead>
        <tbody>{beds.map((b) => { const r = cell("ready", b), o = cell("offplan", b); if ((r?.count ?? 0) + (o?.count ?? 0) < 5) return null; return <tr key={b}><td>{b}</td><td className="num">{num(r?.count ?? 0)}</td><td className="num">{aed(r?.medianPrice)}</td><td className="num">{num(r?.medianPsf)}</td><td className="num">{num(o?.count ?? 0)}</td><td className="num">{aed(o?.medianPrice)}</td><td className="num">{num(o?.medianPsf)}</td></tr>; })}</tbody></table></div></div>
    <div className="market-block"><h3>Apartment rents by bedroom</h3><p className="block-note">{TX.window.label}. Registered Ejari contracts, new and renewed; rent is the annualised contract amount.</p>
      <div className="table-scroll"><table className="tx-table"><thead><tr><th scope="col">Bedrooms</th><th scope="col" className="num">Contracts</th><th scope="col" className="num">Median annual rent</th><th scope="col" className="num">Middle half of rents</th><th scope="col" className="num">AED / sq ft / yr</th><th scope="col" className="num">Median size (sq ft)</th></tr></thead>
        <tbody>{TX.summary.rentalsByBedroom.map((r) => <tr key={r.bedrooms}><td>{r.bedrooms}</td><td className="num">{num(r.count)}</td><td className="num">{aed(r.medianRent)}</td><td className="num">{aedShort(r.p25Rent)} – {aedShort(r.p75Rent)}</td><td className="num">{num(r.medianRentPsf)}</td><td className="num">{num(r.medianSizeSqft)}</td></tr>)}</tbody></table></div></div>
  </div>;
}

export function ByBuildingTables({ slug, minCount = 1 }: { slug?: string; minCount?: number }) {
  const sales = TX.byBuilding.sales.filter((b) => (slug ? b.project === slug : b.count >= minCount));
  const rentals = TX.byBuilding.rentals.filter((b) => (slug ? b.project === slug : b.count >= minCount));
  const [allS, setAllS] = useState(Boolean(slug));
  const [allR, setAllR] = useState(Boolean(slug));
  const shownS = allS ? sales : sales.slice(0, 15), shownR = allR ? rentals : rentals.slice(0, 15);
  return <div className="market-layout">
    <div className="market-block"><h3>{slug ? "Sales by tower" : "Sales by building"}</h3><p className="block-note">{TX.window.label}. Ready and off-plan registrations are listed separately because they sell on different terms.</p>
      {sales.length === 0 ? <p className="tx-empty">{slug ? "No registered market sales for this project in the 12-month window — new-launch registrations are not yet assigned to a building in the DLD register." : "No rows."}</p> : <><div className="table-scroll"><table className="tx-table"><thead><tr><th scope="col">Building</th><th scope="col">Basis</th><th scope="col" className="num">Sales</th><th scope="col" className="num">Median AED / sq ft</th><th scope="col" className="num">Middle half AED / sq ft</th><th scope="col" className="num">Median price</th></tr></thead>
        <tbody>{shownS.map((b) => <tr key={`${b.building}-${b.basis}`}><td><BuildingCell building={b.building} project={b.project} /></td><td><span className="kind">{basisLabel(b.basis)}</span></td><td className="num">{num(b.count)}</td><td className="num">{num(b.medianPsf)}</td><td className="num">{num(b.p25Psf)} – {num(b.p75Psf)}</td><td className="num">{aed(b.medianPrice)}</td></tr>)}</tbody></table></div><ShowMore total={sales.length} initial={15} all={allS} onToggle={() => setAllS(!allS)} /></>}</div>
    <div className="market-block"><h3>{slug ? "Rents by tower" : "Rents by building"}</h3><p className="block-note">{TX.window.label}. Registered Ejari contracts, new and renewed.</p>
      {rentals.length === 0 ? <p className="tx-empty">No registered tenancy contracts for this project in the 12-month window.</p> : <><div className="table-scroll"><table className="tx-table"><thead><tr><th scope="col">Building</th><th scope="col" className="num">Contracts</th><th scope="col" className="num">Median annual rent</th><th scope="col" className="num">Middle half of rents</th><th scope="col" className="num">AED / sq ft / yr</th></tr></thead>
        <tbody>{shownR.map((b) => <tr key={b.building}><td><BuildingCell building={b.building} project={b.project} /></td><td className="num">{num(b.count)}</td><td className="num">{aed(b.medianRent)}</td><td className="num">{aedShort(b.p25Rent)} – {aedShort(b.p75Rent)}</td><td className="num">{b.medianRentPsf ? num(b.medianRentPsf) : "—"}</td></tr>)}</tbody></table></div><ShowMore total={rentals.length} initial={15} all={allR} onToggle={() => setAllR(!allR)} /></>}</div>
  </div>;
}

/** Tabbed latest-transactions block used on the home page and the market page. */
export function LatestTransactions({ initial = 10, showKind = true }: { initial?: number; showKind?: boolean }) {
  const [tab, setTab] = useState<"ready" | "offplan" | "rent">("ready");
  const ready = TX.sales.filter((s) => s.basis === "ready"), off = TX.sales.filter((s) => s.basis === "offplan");
  const tabs: { id: typeof tab; label: string; note: string }[] = [
    { id: "ready", label: "Ready homes", note: `The ${TX.recent.readySales.count} most recent registered market sales of completed homes in our snapshot (${dateRange(TX.recent.readySales.from, TX.recent.readySales.to)}).` },
    { id: "offplan", label: "Off-plan", note: `The ${TX.recent.offplanSales.count} most recent registered off-plan sales in our snapshot (${dateRange(TX.recent.offplanSales.from, TX.recent.offplanSales.to)}). Rows marked "not yet named" are new-launch registrations the DLD register has not yet assigned to a building.` },
    { id: "rent", label: "Tenancy contracts", note: `The ${TX.recent.rentals.count} most recent registered Ejari contracts in our snapshot (${TX.recent.rentals.newContracts} new, the rest renewals; ${dateRange(TX.recent.rentals.from, TX.recent.rentals.to)}).` },
  ];
  const current = tabs.find((t) => t.id === tab) ?? tabs[0]!;
  return <div>
    <div className="tabs" role="tablist" aria-label="Latest registered transactions">{tabs.map((t) => <button key={t.id} type="button" role="tab" className="tab-button" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>{t.label}</button>)}</div>
    <p className="block-note">{current.note}</p>
    {tab === "ready" && <SalesTable rows={ready} initial={initial} showKind={showKind} />}
    {tab === "offplan" && <SalesTable rows={off} initial={initial} showKind={showKind} />}
    {tab === "rent" && <RentalsTable rows={TX.rentals} initial={initial} />}
  </div>;
}
