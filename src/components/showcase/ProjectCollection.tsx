/**
 * The filterable project collection (status, quarter, bedrooms, budget; cards or
 * compare table). Shown on the home page and on /projects.
 */
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PROJECTS, type Status, type Project } from "@/data/projects";
import { ProjectCard, statusLabel, priceSummary, handoverText, minPriceAed, bedroomRange } from "@/components/showcase/shared";
import { brandLine } from "@/lib/format";

const ORDER: Status[] = ["Now selling", "Resale", "Ready"];
const DISTRICTS = ["Creek Island", "Creek Beach", "Green Gate"] as const;
const BEDS = ["1", "2", "3", "4+"] as const;
const BUDGETS = [
  { id: "u2", label: "Under AED 2M", test: (n: number) => n < 2_000_000 },
  { id: "2-3", label: "AED 2–3M", test: (n: number) => n >= 2_000_000 && n < 3_000_000 },
  { id: "3-5", label: "AED 3–5M", test: (n: number) => n >= 3_000_000 && n < 5_000_000 },
  { id: "5+", label: "AED 5M+", test: (n: number) => n >= 5_000_000 },
] as const;

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <Button className="filter-button" size="sm" variant={active ? "default" : "outline"} aria-pressed={active} onClick={onClick}>{children}</Button>;
}

function ProjectTable({ projects }: { projects: Project[] }) {
  return <div className="table-scroll"><table className="project-table"><thead><tr><th scope="col">Project</th><th scope="col">Status</th><th scope="col">From</th><th scope="col">Bedrooms</th><th scope="col">Sizes</th><th scope="col">Handover</th><th scope="col">Plan</th><th scope="col">Quarter</th></tr></thead>
    <tbody>{projects.map((p) => { const price = priceSummary(p); return <tr key={p.slug}><td className="name"><Link to="/projects/$slug" params={{ slug: p.slug }}>{p.name}</Link>{brandLine(p) && <div className="card-brand mt-1 mb-0 text-[11px]">{brandLine(p)}</div>}</td><td>{statusLabel(p)}</td><td>{price.main}</td><td>{p.bedrooms}</td><td>{p.sizes ?? "—"}</td><td>{handoverText(p)}</td><td>{p.paymentPlan ? p.paymentPlan.steps.map((s) => s.percent).join(" / ") : "—"}</td><td>{p.district ?? "—"}</td></tr>; })}</tbody></table></div>;
}

export function ProjectCollection({ heading = true, defaultView = "cards" }: { heading?: boolean; defaultView?: "cards" | "table" }) {
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
  return <>
    <section className="section" id="projects"><div className="container">{heading && <div className="section-heading"><div><span className="eyebrow">Find your place by the water</span><h2>The project collection</h2></div><p className="section-intro">New launches, ready homes and resale towers.<br />Emaar's published figures. Nothing invented. <Link to="/projects" className="underline underline-offset-4">Open the projects page</Link></p></div>}
      <div className="filters">
        <div className="filter-group" role="group" aria-label="Filter by status"><span className="filter-label">Status</span><div className="filter-chips">{(["All", ...ORDER] as const).map((s) => <Chip key={s} active={status === s} onClick={() => setStatus(s)}>{s === "All" ? "All" : s === "Ready" ? "Ready · resale" : s === "Resale" ? "Resale · under construction" : s}</Chip>)}</div></div>
        <div className="filter-group" role="group" aria-label="Filter by quarter"><span className="filter-label">Quarter</span><div className="filter-chips"><Chip active={district === "All"} onClick={() => setDistrict("All")}>Anywhere</Chip>{DISTRICTS.map((d) => <Chip key={d} active={district === d} onClick={() => setDistrict(d)}>{d}</Chip>)}</div></div>
        <div className="filter-group" role="group" aria-label="Filter by bedrooms"><span className="filter-label">Bedrooms</span><div className="filter-chips"><Chip active={beds === "All"} onClick={() => setBeds("All")}>Any</Chip>{BEDS.map((b) => <Chip key={b} active={beds === b} onClick={() => setBeds(b)}>{b}</Chip>)}</div></div>
        <div className="filter-group" role="group" aria-label="Filter by budget"><span className="filter-label">From</span><div className="filter-chips"><Chip active={budget === "All"} onClick={() => setBudget("All")}>Any budget</Chip>{BUDGETS.map((b) => <Chip key={b.id} active={budget === b.id} onClick={() => setBudget(b.id)}>{b.label}</Chip>)}</div></div>
      </div>
      <div className="filter-bar"><span>Showing {projects.length} of {PROJECTS.length} projects{projects.length !== PROJECTS.length && <> · <button type="button" className="underline underline-offset-4" onClick={reset}>clear filters</button></>}. Budget uses the lowest price of the units Emaar lists, or the project's advertised starting price where no units are listed.</span><div className="view-toggle" role="group" aria-label="View"><button type="button" aria-pressed={view === "cards"} onClick={() => setView("cards")}><LayoutGrid className="inline size-3.5 mr-1.5" />Cards</button><button type="button" aria-pressed={view === "table"} onClick={() => setView("table")}><List className="inline size-3.5 mr-1.5" />Compare</button></div></div>
      {projects.length === 0 ? <p className="tx-empty">No project matches every filter. <button type="button" className="underline underline-offset-4" onClick={reset}>Clear the filters</button> or tell us what you need on WhatsApp — resale and rental options exist in every tower.</p> : view === "cards" ? <div className="project-grid">{projects.map((project) => <ProjectCard key={project.slug} project={project} index={PROJECTS.indexOf(project)} />)}</div> : <ProjectTable projects={projects} />}
    </div></section>
  </>;
}
