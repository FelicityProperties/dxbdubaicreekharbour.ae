/**
 * The filterable project collection (status, quarter, bedrooms, budget; cards or
 * compare table). Shown on the home page and on /projects.
 */
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PROJECTS, type Status, type Project } from "@/data/projects";
import { ProjectCard, statusLabel, priceSummary, handoverText, minPriceAed, bedroomRange, brandText } from "@/components/showcase/shared";
import { brandLine } from "@/lib/format";
import { gap, useT, type T } from "@/i18n/messages";
import { Rich } from "@/i18n/rich";
import { ltrLabel } from "@/i18n/locales";

const ORDER: Status[] = ["Now selling", "Resale", "Ready"];
const DISTRICTS = ["Creek Island", "Creek Beach", "Green Gate"] as const;
const BEDS = ["1", "2", "3", "4+"] as const;
/** Amounts are shown as they are in every language; only "Under …" is words. */
const BUDGETS: { id: string; amount: string; under?: true; test: (n: number) => boolean }[] = [
  { id: "u2", amount: "AED 2M", under: true, test: (n: number) => n < 2_000_000 },
  { id: "2-3", amount: "AED 2–3M", test: (n: number) => n >= 2_000_000 && n < 3_000_000 },
  { id: "3-5", amount: "AED 3–5M", test: (n: number) => n >= 3_000_000 && n < 5_000_000 },
  { id: "5+", amount: "AED 5M+", test: (n: number) => n >= 5_000_000 },
];

/** The status filter's chip text; the filter itself compares the English status values. */
function statusChip(s: Status | "All", t: T): string {
  if (s === "All") return t("All");
  if (s === "Ready") return t("Ready · resale");
  if (s === "Resale") return t("Resale · under construction");
  return t("Now selling");
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <Button className="filter-button" size="sm" variant={active ? "default" : "outline"} aria-pressed={active} onClick={onClick}>{children}</Button>;
}

function ProjectTable({ projects }: { projects: Project[] }) {
  const t = useT();
  return <div className="table-scroll"><table className="project-table"><thead><tr><th scope="col">{t("Project")}</th><th scope="col">{t("Status")}</th><th scope="col">{t("From")}</th><th scope="col">{t("Bedrooms")}</th><th scope="col">{t("Sizes")}</th><th scope="col">{t("Handover")}</th><th scope="col">{t("Plan")}</th><th scope="col">{t("Quarter")}</th></tr></thead>
    <tbody>{projects.map((p) => { const price = priceSummary(p, t); return <tr key={p.slug}><td className="name"><Link to="/projects/$slug" params={{ slug: p.slug }}>{p.name}</Link>{brandLine(p) && <div className="card-brand mt-1 mb-0 text-[11px]">{brandText(p, t)}</div>}</td><td>{statusLabel(p, t)}</td><td>{price.main}</td><td>{t(p.bedrooms)}</td><td>{p.sizes ? t(p.sizes) : "—"}</td><td>{handoverText(p, t)}</td><td>{p.paymentPlan ? p.paymentPlan.steps.map((s) => s.percent).join(" / ") : "—"}</td><td>{p.district ? t(p.district) : "—"}</td></tr>; })}</tbody></table></div>;
}

export function ProjectCollection({ heading = true, defaultView = "cards" }: { heading?: boolean; defaultView?: "cards" | "table" }) {
  const t = useT();
  const [status, setStatus] = useState<Status | "All">("All");
  const [district, setDistrict] = useState<string>("All");
  const [beds, setBeds] = useState<string>("All");
  const [budget, setBudget] = useState<string>("All");
  const [view, setView] = useState<"cards" | "table">(defaultView);
  const sorted = ORDER.flatMap((s) => PROJECTS.filter((p) => p.status === s));
  const projects = sorted.filter((p) => {
    if (status !== "All" && p.status !== status) return false;
    if (district !== "All" && p.district !== district) return false;
    if (beds !== "All") { const r = bedroomRange(p); if (!r) return false; if (beds === "4+" ? r[1] < 4 : !(Number(beds) >= r[0] && Number(beds) <= r[1])) return false; }
    if (budget !== "All") { const n = minPriceAed(p); const b = BUDGETS.find((x) => x.id === budget); if (n == null || !b || !b.test(n)) return false; }
    return true;
  });
  const reset = () => { setStatus("All"); setDistrict("All"); setBeds("All"); setBudget("All"); };
  const clear = (s: string) => <button type="button" className="underline underline-offset-4" onClick={reset}>{s}</button>;
  const counts = { n: projects.length, total: PROJECTS.length };
  return <>
    <section className="section" id="projects"><div className="container">{heading && <div className="section-heading"><div><span className="eyebrow">{t("Find your place by the water")}</span><h2>{t("The project collection")}</h2></div><p className="section-intro">{t("New launches, ready homes and resale towers.")}<br />{t("Emaar's published figures. Nothing invented.")}{gap(t)}<Link to="/projects" className="underline underline-offset-4">{t("Open the projects page")}</Link></p></div>}
      <div className="filters">
        <div className="filter-group" role="group" aria-label={t("Filter by status")}><span className="filter-label">{t("Status")}</span><div className="filter-chips">{(["All", ...ORDER] as const).map((s) => <Chip key={s} active={status === s} onClick={() => setStatus(s)}>{statusChip(s, t)}</Chip>)}</div></div>
        <div className="filter-group" role="group" aria-label={t("Filter by quarter")}><span className="filter-label">{t("Quarter")}</span><div className="filter-chips"><Chip active={district === "All"} onClick={() => setDistrict("All")}>{t("Anywhere")}</Chip>{DISTRICTS.map((d) => <Chip key={d} active={district === d} onClick={() => setDistrict(d)}>{t(d)}</Chip>)}</div></div>
        <div className="filter-group" role="group" aria-label={t("Filter by bedrooms")}><span className="filter-label">{t("Bedrooms")}</span><div className="filter-chips"><Chip active={beds === "All"} onClick={() => setBeds("All")}>{t("Any")}</Chip>{BEDS.map((b) => <Chip key={b} active={beds === b} onClick={() => setBeds(b)}>{ltrLabel(b, t.locale)}</Chip>)}</div></div>
        <div className="filter-group" role="group" aria-label={t("Filter by budget")}><span className="filter-label">{t("From")}</span><div className="filter-chips"><Chip active={budget === "All"} onClick={() => setBudget("All")}>{t("Any budget")}</Chip>{BUDGETS.map((b) => <Chip key={b.id} active={budget === b.id} onClick={() => setBudget(b.id)}>{b.under ? t("Under {amount}", { amount: ltrLabel(b.amount, t.locale) }) : ltrLabel(b.amount, t.locale)}</Chip>)}</div></div>
      </div>
      <div className="filter-bar"><span>{projects.length !== PROJECTS.length ? <Rich text={t("Showing {n} of {total} projects · <clear>clear filters</clear>.", counts)} tags={{ clear }} /> : t("Showing {n} of {total} projects.", counts)}{gap(t)}{t("Budget uses the lowest price of the units Emaar lists, or the project's advertised starting price where no units are listed.")}</span><div className="view-toggle" role="group" aria-label={t("View")}><button type="button" aria-pressed={view === "cards"} onClick={() => setView("cards")}><LayoutGrid className="inline size-3.5 me-1.5" />{t("Cards")}</button><button type="button" aria-pressed={view === "table"} onClick={() => setView("table")}><List className="inline size-3.5 me-1.5" />{t("Compare")}</button></div></div>
      {projects.length === 0 ? <p className="tx-empty"><Rich text={t("No project matches every filter. <clear>Clear the filters</clear> or tell us what you need on WhatsApp — resale and rental options exist in every tower.")} tags={{ clear }} /></p> : view === "cards" ? <div className="project-grid">{projects.map((project) => <ProjectCard key={project.slug} project={project} index={PROJECTS.indexOf(project)} />)}</div> : <ProjectTable projects={projects} />}
    </div></section>
  </>;
}
