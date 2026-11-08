/**
 * The filterable project collection (status, quarter, bedrooms, budget; cards or
 * compare table). Shown on the home page and on /projects.
 *
 * Phones (640px and below) get an app-style layer over the same state: one row with a "Filters" button and the
 * active filters as removable chips (sticky under the top bar on /projects), a bottom sheet holding the four
 * groups, compare rows as stacked cards, and on the home page a sideways shelf of cards (or of compare cards). The
 * phone-only pieces carry Tailwind's `hidden`, which only the phone stylesheet overrides, so tablets and desktop
 * render as before. The sheet's code is fetched on phones only, and phone Back closes the sheet ("#filters").
 *
 * The swipe rows carry a data-scroll-restoration-id: the router finds them by that name when it puts their scroll
 * position back (Back, and a sheet closing), as their place in the page shifts while a sheet is open.
 */
import { useEffect, useId, useRef, useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { ArrowRight, LayoutGrid, List, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PHONE_QUERY, isPhone, loadDrawer, reloadForMissingCode, useBackCloses, type DrawerKit } from "@/lib/phone";
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
/** Card images in the home page's swipe row are 82% of a phone's width; the other widths are the cards' usual ones. */
const SHELF_SIZES = "(max-width: 640px) 82vw, (max-width: 1000px) 50vw, 33vw";

type Filters = { status: Status | "All"; district: string; beds: string; budget: string };
type SetFilters = (next: Partial<Filters>) => void;
const ANY: Filters = { status: "All", district: "All", beds: "All", budget: "All" };
const same = (a: Filters, b: Filters) => a.status === b.status && a.district === b.district && a.beds === b.beds && a.budget === b.budget;

/** The status filter's chip text; the filter itself compares the English status values. */
function statusChip(s: Status | "All", t: T): string {
  if (s === "All") return t("All");
  if (s === "Ready") return t("Ready · resale");
  if (s === "Resale") return t("Resale · under construction");
  return t("Now selling");
}
const budgetChip = (b: (typeof BUDGETS)[number], t: T): string => (b.under ? t("Under {amount}", { amount: ltrLabel(b.amount, t.locale) }) : ltrLabel(b.amount, t.locale));

/** The filters in use, each with the words its removable chip shows on phones. */
function activeFilters(f: Filters, t: T): { key: keyof Filters; label: string }[] {
  const on: { key: keyof Filters; label: string }[] = [];
  if (f.status !== "All") on.push({ key: "status", label: statusChip(f.status, t) });
  if (f.district !== "All") on.push({ key: "district", label: t(f.district) });
  if (f.beds !== "All") on.push({ key: "beds", label: t("{place}: {text}", { place: t("Bedrooms"), text: ltrLabel(f.beds, t.locale) }) });
  const b = BUDGETS.find((x) => x.id === f.budget);
  if (b) on.push({ key: "budget", label: budgetChip(b, t) });
  return on;
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <Button className="filter-button" size="sm" variant={active ? "default" : "outline"} aria-pressed={active} onClick={onClick}>{children}</Button>;
}

/** The four chip groups: in the page above 640px, in the filter sheet on phones. Both change the same state. */
function FilterGroups({ f, set }: { f: Filters; set: SetFilters }) {
  const t = useT();
  return <>
    <div className="filter-group" role="group" aria-label={t("Filter by status")}><span className="filter-label">{t("Status")}</span><div className="filter-chips">{(["All", ...ORDER] as const).map((s) => <Chip key={s} active={f.status === s} onClick={() => set({ status: s })}>{statusChip(s, t)}</Chip>)}</div></div>
    <div className="filter-group" role="group" aria-label={t("Filter by quarter")}><span className="filter-label">{t("Quarter")}</span><div className="filter-chips"><Chip active={f.district === "All"} onClick={() => set({ district: "All" })}>{t("Anywhere")}</Chip>{DISTRICTS.map((d) => <Chip key={d} active={f.district === d} onClick={() => set({ district: d })}>{t(d)}</Chip>)}</div></div>
    <div className="filter-group" role="group" aria-label={t("Filter by bedrooms")}><span className="filter-label">{t("Bedrooms")}</span><div className="filter-chips"><Chip active={f.beds === "All"} onClick={() => set({ beds: "All" })}>{t("Any")}</Chip>{BEDS.map((b) => <Chip key={b} active={f.beds === b} onClick={() => set({ beds: b })}>{ltrLabel(b, t.locale)}</Chip>)}</div></div>
    <div className="filter-group" role="group" aria-label={t("Filter by budget")}><span className="filter-label">{t("From")}</span><div className="filter-chips"><Chip active={f.budget === "All"} onClick={() => set({ budget: "All" })}>{t("Any budget")}</Chip>{BUDGETS.map((b) => <Chip key={b.id} active={f.budget === b.id} onClick={() => set({ budget: b.id })}>{budgetChip(b, t)}</Chip>)}</div></div>
  </>;
}

/**
 * One table above 640px; on phones each row is a card of label and value pairs (the labels come from data-label).
 * `shelf` (the home page) lines those cards up in a sideways swipe row, as the project cards are.
 */
function ProjectTable({ projects, shelf = false, rows }: { projects: Project[]; shelf?: boolean; rows?: React.Ref<HTMLTableSectionElement> }) {
  const t = useT();
  return <div className="table-scroll"><table className="project-table"><thead><tr><th scope="col">{t("Project")}</th><th scope="col">{t("Status")}</th><th scope="col">{t("From")}</th><th scope="col">{t("Bedrooms")}</th><th scope="col">{t("Sizes")}</th><th scope="col">{t("Handover")}</th><th scope="col">{t("Plan")}</th><th scope="col">{t("Quarter")}</th></tr></thead>
    <tbody ref={rows} data-scroll-restoration-id="coll-compare" className={shelf ? "app-shelf" : undefined}>{projects.map((p) => { const price = priceSummary(p, t); return <tr key={p.slug}><td className="name"><Link to="/projects/$slug" params={{ slug: p.slug }}>{p.name}</Link>{brandLine(p) && <div className="card-brand mt-1 mb-0 text-[11px]">{brandText(p, t)}</div>}</td><td data-label={t("Status")}>{statusLabel(p, t)}</td><td data-label={t("From")}>{price.main}</td><td data-label={t("Bedrooms")}>{t(p.bedrooms)}</td><td data-label={t("Sizes")}>{p.sizes ? t(p.sizes) : "—"}</td><td data-label={t("Handover")}>{handoverText(p, t)}</td><td data-label={t("Plan")}>{p.paymentPlan ? p.paymentPlan.steps.map((s) => s.percent).join(" / ") : "—"}</td><td data-label={t("Quarter")}>{p.district ? t(p.district) : "—"}</td></tr>; })}</tbody></table></div>;
}

/**
 * `shelf` marks the home page's copy: on phones its cards (or compare cards) become a sideways swipe row with "View all
 * projects" under it, while /projects keeps the vertical feed and pins the filter row under the top bar.
 */
export function ProjectCollection({ heading = true, defaultView = "cards", shelf = false }: { heading?: boolean; defaultView?: "cards" | "table"; shelf?: boolean }) {
  const t = useT();
  const router = useRouter();
  const [f, setFilters] = useState<Filters>(ANY);
  const set: SetFilters = (next) => setFilters((cur) => ({ ...cur, ...next }));
  const [view, setView] = useState<"cards" | "table">(defaultView);
  const [sheet, setSheet] = useState(false);
  const [kit, setKit] = useState<DrawerKit | null>(null); // the filter sheet's code, fetched on phones only
  const sheetId = useId();
  const [jump, setJump] = useState(0); // bumped to bring the first result back under the filter row
  const openedWith = useRef<{ f: Filters; reading: boolean }>({ f: ANY, reading: false });
  const mark = useRef<HTMLDivElement>(null); // where the filter row sits before it sticks: the start of the results
  const bar = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const rows = useRef<HTMLTableSectionElement>(null);
  const sorted = ORDER.flatMap((s) => PROJECTS.filter((p) => p.status === s));
  const projects = sorted.filter((p) => {
    if (f.status !== "All" && p.status !== f.status) return false;
    if (f.district !== "All" && p.district !== f.district) return false;
    if (f.beds !== "All") { const r = bedroomRange(p); if (!r) return false; if (f.beds === "4+" ? r[1] < 4 : !(Number(f.beds) >= r[0] && Number(f.beds) <= r[1])) return false; }
    if (f.budget !== "All") { const n = minPriceAed(p); const b = BUDGETS.find((x) => x.id === f.budget); if (n == null || !b || !b.test(n)) return false; }
    return true;
  });
  const reset = () => setFilters(ANY);
  const clear = (s: string) => <button type="button" className="underline underline-offset-4" onClick={reset}>{s}</button>;
  const counts = { n: projects.length, total: PROJECTS.length };
  const active = activeFilters(f, t);
  const n = projects.length;

  /** Where the results start, as a page scroll position: the filter row's own place, less the top bar it sticks under. */
  const resultsTop = () => {
    const m = mark.current, b = bar.current;
    return m && b ? Math.round(m.getBoundingClientRect().top + window.scrollY - (parseFloat(getComputedStyle(b).top) || 0)) : null;
  };
  /** Whether the visitor is down in the results (on /projects the filter row has stuck): new results then start at the top. */
  const reading = () => { const top = resultsTop(); return top != null && window.scrollY > top + 1; };
  /** Brings the first result back under the filter row. */
  const toResults = () => { const top = resultsTop(); if (top != null) window.scrollTo({ top, behavior: "instant" }); };
  // Two frames after the new list is laid out.
  useEffect(() => {
    if (!jump) return;
    requestAnimationFrame(() => requestAnimationFrame(toResults));
  }, [jump]);
  /** New results start the swipe row (cards or compare) at its first card (in either reading direction, 0 is the start). */
  const toStart = () => { for (const row of [grid.current, rows.current]) row?.scrollTo?.({ left: 0 }); };
  useEffect(toStart, [f]);
  // Phones fetch the sheet's code once the page is idle, so the first tap of Filters opens it at once (the menu shares
  // it). Computers never download it.
  useEffect(() => {
    if (!isPhone()) return;
    const fetchKit = () => { loadDrawer().then(setKit, () => {}); };
    if (typeof window.requestIdleCallback === "function") { const id = window.requestIdleCallback(fetchKit, { timeout: 4000 }); return () => window.cancelIdleCallback(id); }
    const id = window.setTimeout(fetchKit, 2000);
    return () => window.clearTimeout(id);
  }, []);
  // The sheet only exists on phones: turning a phone or widening a window past 640px closes it.
  useEffect(() => {
    if (!sheet) return;
    const mq = window.matchMedia(PHONE_QUERY);
    const onChange = () => { if (!mq.matches) setSheet(false); };
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [sheet]);
  // On /projects the filter row sticks under the top bar; once it does, it draws a hairline under itself.
  useEffect(() => {
    const m = mark.current, b = bar.current;
    if (shelf || !m || !b || typeof IntersectionObserver === "undefined") return;
    let io: IntersectionObserver | null = null;
    const watch = () => {
      io?.disconnect();
      const top = parseFloat(getComputedStyle(b).top) || 0;
      io = new IntersectionObserver(([e]) => { if (e) b.toggleAttribute("data-stuck", !e.isIntersecting && e.boundingClientRect.top < top + 1); }, { rootMargin: `${-Math.round(top + 1)}px 0px 0px 0px` });
      io.observe(m);
    };
    watch();
    const mq = window.matchMedia(PHONE_QUERY);
    mq.addEventListener?.("change", watch); // the top bar's height changes with the breakpoint
    return () => { io?.disconnect(); mq.removeEventListener?.("change", watch); };
  }, [shelf]);
  // Whether the visitor was reading the results is measured when the sheet opens: while it is open, the browser may
  // move the page to keep a card that stayed in the list in place. As the sheet closes, its "#filters" history entry
  // goes and the router puts the page's scroll positions back as they were when it opened; after that, changed
  // filters bring the results back to their start.
  const onSheet = (open: boolean) => {
    if (open) openedWith.current = { f, reading: reading() };
    else if (!same(openedWith.current.f, f)) { const back = openedWith.current.reading; afterRouter(() => { toStart(); if (back) toResults(); }); }
    setSheet(open);
  };
  /** Runs `go` two frames after the router has shown the page without the "#filters" entry (at once if it already has). */
  const afterRouter = (go: () => void) => {
    const frames = () => requestAnimationFrame(() => requestAnimationFrame(go));
    if (window.location.hash !== "#filters" && router.state.resolvedLocation?.hash !== "filters") { frames(); return; }
    const off = router.subscribe("onRendered", ({ toLocation }) => { if (toLocation.hash !== "filters") { off(); frames(); } });
  };
  /** Filters: the sheet opens once its code is here. If that code fails to load, the page reloads (once) to get it. */
  const openSheet = () => {
    if (kit) { onSheet(true); return; }
    loadDrawer().then((k) => { setKit(k); onSheet(true); }, () => { reloadForMissingCode(); });
  };
  // Phone Back closes the sheet rather than leaving the page.
  useBackCloses("filters", sheet, () => onSheet(false));
  /** A removable chip: the filter goes, and keyboard focus moves to the next chip (or back to Filters) rather than off the page. */
  const remove = (key: keyof Filters, chip: HTMLButtonElement) => {
    if (document.activeElement === chip) ((chip.nextElementSibling ?? chip.previousElementSibling) as HTMLElement | null)?.focus({ preventScroll: true });
    if (reading()) setJump((j) => j + 1);
    set({ [key]: ANY[key] } as Partial<Filters>);
  };

  return <>
    <section className={`section coll ${shelf ? "coll-shelf" : "coll-feed"}`} id="projects"><div className="container">{heading && <div className="section-heading"><div><span className="eyebrow">{t("Find your place by the water")}</span><h2>{t("The project collection")}</h2></div><p className="section-intro">{t("New launches, ready homes and resale towers.")}<br />{t("Emaar's published figures. Nothing invented.")}{gap(t)}<Link to="/projects" className="underline underline-offset-4">{t("Open the projects page")}</Link></p></div>}
      <div className="coll-mark hidden" ref={mark} aria-hidden="true" />
      <div className="coll-bar hidden" ref={bar}>
        <button ref={opener} type="button" className="coll-filter" aria-haspopup="dialog" aria-expanded={sheet} aria-controls={sheet ? sheetId : undefined} aria-label={active.length ? t("Filters, {n} active", { n: active.length }) : undefined} onClick={openSheet}><SlidersHorizontal aria-hidden="true" />{t("Filters")}{active.length > 0 && <span className="coll-count" aria-hidden="true">{active.length}</span>}</button>
        {active.map((a) => <button key={a.key} type="button" className="coll-pill" aria-label={t("Remove filter: {filter}", { filter: a.label })} onClick={(e) => remove(a.key, e.currentTarget)}>{a.label}<X aria-hidden="true" /></button>)}
      </div>
      {kit && <kit.Drawer open={sheet} onOpenChange={onSheet} autoFocus>
        <kit.DrawerContent id={sheetId} className="coll-sheet" aria-describedby={undefined} onCloseAutoFocus={(e) => { e.preventDefault(); opener.current?.focus({ preventScroll: true }); }}>
          <div className="coll-sheet-head"><kit.DrawerTitle className="coll-sheet-title">{t("Filters")}</kit.DrawerTitle><kit.DrawerClose className="coll-sheet-x" aria-label={t("Close")}><X aria-hidden="true" /></kit.DrawerClose></div>
          <div className="coll-sheet-body"><FilterGroups f={f} set={set} /></div>
          {/* No results: the visitor clears a filter here rather than closing the sheet onto an empty list. */}
          <div className="coll-sheet-foot"><button type="button" className="coll-sheet-clear" onClick={reset} disabled={!active.length}>{t("Clear all")}</button><kit.DrawerClose className="coll-sheet-show" disabled={n === 0}>{n === 1 ? t("Show {n} project", { n }) : t("Show {n} projects", { n })}</kit.DrawerClose></div>
        </kit.DrawerContent>
      </kit.Drawer>}
      <div className="filters"><FilterGroups f={f} set={set} /></div>
      <div className="filter-bar"><span>{projects.length !== PROJECTS.length ? <Rich text={t("Showing {n} of {total} projects · <clear>clear filters</clear>.", counts)} tags={{ clear }} /> : t("Showing {n} of {total} projects.", counts)}{gap(t)}{t("Budget uses the lowest price of the units Emaar lists, or the project's advertised starting price where no units are listed.")}</span><div className="view-toggle" role="group" aria-label={t("View")}><button type="button" aria-pressed={view === "cards"} onClick={() => setView("cards")}><LayoutGrid className="inline size-3.5 me-1.5" />{t("Cards")}</button><button type="button" aria-pressed={view === "table"} onClick={() => setView("table")}><List className="inline size-3.5 me-1.5" />{t("Compare")}</button></div></div>
      {projects.length === 0 ? <p className="tx-empty"><Rich text={t("No project matches every filter. <clear>Clear the filters</clear> or tell us what you need on WhatsApp — resale and rental options exist in every tower.")} tags={{ clear }} /></p> : view === "cards" ? <div ref={grid} data-scroll-restoration-id="coll-cards" className={`project-grid${shelf ? " app-shelf" : ""}`}>{projects.map((project) => <ProjectCard key={project.slug} project={project} index={PROJECTS.indexOf(project)} {...(shelf ? { sizes: SHELF_SIZES } : {})} />)}</div> : <ProjectTable projects={projects} shelf={shelf} rows={rows} />}
      {shelf && <Button asChild className="coll-all hidden"><Link to="/projects">{t("View all projects")} <ArrowRight /></Link></Button>}
    </div></section>
  </>;
}
