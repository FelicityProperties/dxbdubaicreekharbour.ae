/**
 * The visitor numbers on /leads: a range picker, headline figures, visits per
 * day, and where visitors went, came from, live and browse on. Data from
 * getVisitStats (src/lib/visits.functions.ts), behind the /leads password.
 */
import { useEffect, useState } from "react";
import { getVisitStats } from "@/lib/visits.functions";
import { STAYED_SECONDS, type Ranked, type VisitStats } from "@/lib/visits.shared";
import { isCountingThisDevice, setCountingThisDevice } from "@/components/SiteAnalytics";

const RANGES = [{ days: 1, label: "Today" }, { days: 7, label: "7 days" }, { days: 30, label: "30 days" }, { days: 90, label: "90 days" }] as const;
const thousands = new Intl.NumberFormat("en-GB");
const n = (v: number) => thousands.format(v);
const pct = (part: number, whole: number) => (whole ? `${Math.round((part / whole) * 100)}%` : "–");
const duration = (s: number) => (s < 60 ? `${s} s` : `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, "0")} s`);
const dayLabel = (iso: string, long = false) => new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", day: "numeric", month: "short", ...(long ? { weekday: "short" } : {}) }).format(new Date(`${iso}T00:00:00Z`));

function change(now: number, before: number, days: number): string | null {
  if (!before) return null;
  const d = Math.round(((now - before) / before) * 100);
  const span = days === 1 ? "yesterday" : `the ${days} days before`;
  return d === 0 ? `Same as ${span}` : `${d > 0 ? "▲" : "▼"} ${Math.abs(d)}% on ${span}`;
}

function Tile({ label, value, note }: { label: string; value: string; note?: string | null }) {
  return (
    <div className="viz-tile">
      <p className="viz-tile-label">{label}</p>
      <p className="viz-tile-value">{value}</p>
      {note && <p className="viz-tile-note">{note}</p>}
    </div>
  );
}

/** Rounded-up axis maximum and its ticks (0, ¼, ½, ¾, max), whole numbers only. */
function axis(max: number): number[] {
  if (max <= 4) return [0, 1, 2, 3, 4];
  const step = Math.pow(10, Math.floor(Math.log10(max / 4)));
  const nice = [1, 2, 2.5, 5, 10].map((m) => m * step).find((s) => s * 4 >= max) ?? step * 10;
  const s = Math.max(1, Math.ceil(nice));
  return [0, s, 2 * s, 3 * s, 4 * s];
}

function DailyChart({ daily }: { daily: VisitStats["daily"] }) {
  const [active, setActive] = useState<number | null>(null);
  const [asTable, setAsTable] = useState(false);
  const ticks = axis(Math.max(...daily.map((d) => d.visits), 0));
  const top = ticks[ticks.length - 1]!;
  const every = Math.ceil(daily.length / 7); // about seven date labels whatever the range
  const point = active === null ? null : daily[active]!;
  return (
    <figure className="viz-card">
      <figcaption className="viz-head">
        <span><strong>Visits per day</strong> <span className="viz-muted">Dubai time</span></span>
        <button type="button" className="viz-link" onClick={() => setAsTable(!asTable)}>{asTable ? "Show chart" : "Show as table"}</button>
      </figcaption>
      {asTable ? (
        <div className="viz-table-wrap">
          <table className="viz-table">
            <thead><tr><th scope="col">Day</th><th scope="col">Visitors</th><th scope="col">Visits</th><th scope="col">Stayed {STAYED_SECONDS} s+</th></tr></thead>
            <tbody>{[...daily].reverse().map((d) => <tr key={d.day}><td>{dayLabel(d.day, true)}</td><td>{n(d.visitors)}</td><td>{n(d.visits)}</td><td>{n(d.stayed)}</td></tr>)}</tbody>
          </table>
        </div>
      ) : (
        <div className="viz-chart" onPointerLeave={() => setActive(null)}>
          <div className="viz-plot">
            {ticks.map((t) => <div key={t} className="viz-grid" style={{ bottom: `${(t / top) * 100}%` }}><span>{n(t)}</span></div>)}
            <div className="viz-cols" style={{ gap: daily.length > 45 ? 1 : 2 }}>
              {daily.map((d, i) => (
                <button
                  key={d.day}
                  type="button"
                  className={`viz-col${active === i ? " is-active" : ""}`}
                  aria-label={`${dayLabel(d.day, true)}: ${d.visits} visits, ${d.visitors} visitors, ${d.stayed} stayed ${STAYED_SECONDS} seconds or more`}
                  onPointerEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                >
                  {d.visits > 0 && <span className="viz-bar" style={{ height: `${(d.visits / top) * 100}%` }} />}
                </button>
              ))}
            </div>
            {point && (
              <div
                className={`viz-tip${(active! + 0.5) / daily.length < 0.15 ? " at-start" : (active! + 0.5) / daily.length > 0.85 ? " at-end" : ""}`}
                style={{ left: `${((active! + 0.5) / daily.length) * 100}%` }}
                role="status"
              >
                <p className="viz-tip-day">{dayLabel(point.day, true)}</p>
                <p><strong>{n(point.visits)}</strong> visits</p>
                <p><strong>{n(point.visitors)}</strong> visitors</p>
                <p><strong>{n(point.stayed)}</strong> stayed {STAYED_SECONDS} s+</p>
              </div>
            )}
          </div>
          <div className="viz-xaxis">
            {daily.map((d, i) => <span key={d.day}>{i % every === 0 || i === daily.length - 1 ? dayLabel(d.day) : ""}</span>)}
          </div>
        </div>
      )}
    </figure>
  );
}

function List({ title, rows, total, empty }: { title: string; rows: Ranked[]; total: number; empty: string }) {
  const max = Math.max(...rows.map((r) => r.visits), 1);
  return (
    <section className="viz-card">
      <h3 className="viz-head"><strong>{title}</strong></h3>
      {rows.length === 0 ? <p className="viz-muted">{empty}</p> : (
        <ol className="viz-list">
          {rows.map((r) => (
            <li key={r.name}>
              <span className="viz-list-name">{r.name}</span>
              <span className="viz-list-track"><span className="viz-list-bar" style={{ width: `${(r.visits / max) * 100}%` }} /></span>
              <span className="viz-list-value">{n(r.visits)} <span className="viz-muted">· {pct(r.visits, total)}</span></span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function VisitorStats({ password }: { password: string }) {
  const [days, setDays] = useState<number>(7);
  const [stats, setStats] = useState<VisitStats | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [counted, setCounted] = useState(true);

  useEffect(() => { setCounted(isCountingThisDevice()); }, []);
  useEffect(() => {
    let live = true;
    setLoading(true);
    getVisitStats({ data: { password, days } })
      .then((res) => {
        if (!live) return;
        if (res.status === "ok") { setStats(res.stats); setProblem(null); }
        else setProblem(res.status === "offline" ? "Couldn't read the visitor numbers from the database. Try again in a minute." : "Please sign in again.");
      })
      .catch(() => live && setProblem("Couldn't load the visitor numbers. Check your connection and try again."))
      .finally(() => live && setLoading(false));
    return () => { live = false; };
  }, [password, days]);

  const s = stats;
  return (
    <div className="viz-root">
      <div className="viz-ranges" role="group" aria-label="Period">
        {RANGES.map((r) => (
          <button key={r.days} type="button" aria-pressed={days === r.days} className={days === r.days ? "is-on" : ""} onClick={() => setDays(r.days)}>{r.label}</button>
        ))}
      </div>
      {problem && <p className="mt-4 text-red-800">{problem}</p>}
      {s && (
        <div className={loading ? "viz-loading" : undefined} aria-busy={loading}>
          <div className="viz-tiles">
            <Tile label="Visitors" value={n(s.visitors)} note={change(s.visitors, s.previous.visitors, s.days) ?? "Different people, each counted once a day"} />
            <Tile label="Visits" value={n(s.visits)} note={change(s.visits, s.previous.visits, s.days) ?? `${n(s.pageViews)} pages opened`} />
            <Tile label={`Stayed ${STAYED_SECONDS} seconds or more`} value={pct(s.stayed, s.visits)} note={`${n(s.stayed)} of ${n(s.visits)} visits`} />
            <Tile label="Typical visit" value={s.visits ? duration(s.medianSeconds) : "–"} note="Half of visits were shorter, half longer" />
            <Tile label="Enquiries" value={n(s.enquiries)} note={s.enquiries && s.visits ? `1 for every ${n(Math.round(s.visits / s.enquiries))} visits` : "Form and FelicityBot"} />
          </div>
          {s.days > 1 && <DailyChart daily={s.daily} />}
          <div className="viz-lists">
            <List title="Pages they opened" rows={s.pages} total={s.visits} empty="No visits yet in this period." />
            <List title="Where they came from" rows={s.sources} total={s.visits} empty="No visits yet in this period." />
            <List title="Countries" rows={s.countries} total={s.visits} empty="No visits yet in this period." />
            <List title="Devices" rows={s.devices} total={s.visits} empty="No visits yet in this period." />
          </div>
          <p className="viz-foot">
            Time counts only while the site is on screen and in use. A visit ends after half an hour away. No cookies are used.{" "}
            {counted ? "Your visits from this browser are counted." : "Your own visits from this browser are not counted."}{" "}
            <button type="button" className="viz-link" onClick={() => setCounted(setCountingThisDevice(!counted))}>
              {counted ? "Don't count this browser" : "Count it again"}
            </button>
          </p>
        </div>
      )}
      {!s && loading && !problem && <p className="mt-6 text-muted-foreground">Loading…</p>}
    </div>
  );
}
