/**
 * The visitor numbers on /leads: a range picker, headline figures, visits per
 * day, and where visitors went, came from, live and browse on. Data from
 * getVisitStats (src/lib/visits.functions.ts), behind the /leads password.
 */
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { getVisitStats } from "@/lib/visits.functions";
import { BUSY_VISITS_PER_DAY, STAYED_SECONDS, type Ranked, type VisitStats } from "@/lib/visits.shared";
import { isCountingThisDevice, setCountingThisDevice } from "@/components/SiteAnalytics";

const RANGES = [{ days: 1, label: "Today" }, { days: 7, label: "7 days" }, { days: 30, label: "30 days" }, { days: 90, label: "90 days" }] as const;
const thousands = new Intl.NumberFormat("en-GB");
const n = (v: number) => thousands.format(v);
const pct = (part: number, whole: number) => (whole ? `${Math.round((part / whole) * 100)}%` : "–");
const duration = (s: number) => (s < 60 ? `${s} s` : `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, "0")} s`);
const dayLabel = (iso: string, long = false) => new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", day: "numeric", month: "short", ...(long ? { weekday: "short" } : {}) }).format(new Date(`${iso}T00:00:00Z`));

/** Change on the same stretch of time just before, cut at the same clock time (null: nothing to compare with yet). */
function change(now: number, before: number | undefined, days: number): string | null {
  if (!before) return null;
  const d = Math.round(((now - before) / before) * 100);
  const span = days === 1 ? "yesterday by this time" : `the ${days} days before`;
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
  const [width, setWidth] = useState(600);
  const plot = useRef<HTMLDivElement>(null);
  const cols = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    const el = plot.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => setWidth(e!.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [asTable]);

  const ticks = axis(Math.max(...daily.map((d) => d.visits), 0));
  const top = ticks[ticks.length - 1]!;
  // As many date labels as fit (about 56px each), evenly spaced, each centred under its bar.
  const every = Math.max(1, Math.ceil(daily.length / Math.max(2, Math.floor(width / 56))));
  const labelled = daily.map((_, i) => i % every === 0);
  const point = active === null ? null : daily[active]!;
  const at = (i: number) => ((i + 0.5) / daily.length) * 100;
  const focusCol = (i: number) => { setActive(i); cols.current[i]?.focus(); };
  const onKey = (e: KeyboardEvent) => {
    const i = active ?? daily.length - 1;
    const next = e.key === "ArrowLeft" ? i - 1 : e.key === "ArrowRight" ? i + 1 : e.key === "Home" ? 0 : e.key === "End" ? daily.length - 1 : null;
    if (next === null) return;
    e.preventDefault();
    focusCol(Math.max(0, Math.min(daily.length - 1, next)));
  };
  const roving = active ?? daily.length - 1; // one tab stop for the whole chart; arrow keys move between days

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
        <div className="viz-chart" onPointerLeave={(e) => { if (e.pointerType !== "touch") setActive(null); }}>
          <div className="viz-plot" ref={plot}>
            {ticks.map((t) => <div key={t} className="viz-grid" style={{ bottom: `${(t / top) * 100}%` }}><span>{n(t)}</span></div>)}
            <div className="viz-cols" style={{ gap: daily.length > 45 ? 1 : 2 }} onKeyDown={onKey}>
              {daily.map((d, i) => (
                <button
                  key={d.day}
                  ref={(el) => { cols.current[i] = el; }}
                  type="button"
                  tabIndex={i === roving ? 0 : -1}
                  className={`viz-col${active === i ? " is-active" : ""}`}
                  aria-label={`${dayLabel(d.day, true)}: ${d.visits} visits, ${d.visitors} visitors, ${d.stayed} stayed ${STAYED_SECONDS} seconds or more`}
                  onPointerEnter={(e) => { if (e.pointerType !== "touch") setActive(i); }}
                  onClick={() => setActive(i)}
                  onFocus={() => setActive(i)}
                >
                  {d.visits > 0 && <span className="viz-bar" style={{ height: `${(d.visits / top) * 100}%` }} />}
                </button>
              ))}
            </div>
            {point && (
              <div className={`viz-tip${at(active!) < 15 ? " at-start" : at(active!) > 85 ? " at-end" : ""}`} style={{ left: `${at(active!)}%` }} aria-hidden="true">
                <p className="viz-tip-day">{dayLabel(point.day, true)}</p>
                <p><strong>{n(point.visits)}</strong> visits</p>
                <p><strong>{n(point.visitors)}</strong> visitors</p>
                <p><strong>{n(point.stayed)}</strong> stayed {STAYED_SECONDS} s+</p>
              </div>
            )}
          </div>
          <div className="viz-xaxis" aria-hidden="true">
            {daily.map((d, i) => labelled[i] && (
              <span key={d.day} className={at(i) < 6 ? "at-start" : at(i) > 94 ? "at-end" : undefined} style={{ left: `${at(i)}%` }}>{dayLabel(d.day)}</span>
            ))}
          </div>
        </div>
      )}
    </figure>
  );
}

function List({ title, rows, total, empty, note }: { title: string; rows: Ranked[]; total: number; empty: string; note?: string }) {
  const max = Math.max(...rows.map((r) => r.visits), 1);
  return (
    <section className="viz-card">
      <h2 className="viz-head"><strong>{title}</strong></h2>
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
      {note && rows.length > 0 && <p className="viz-foot mt-3">{note}</p>}
    </section>
  );
}

export function VisitorStats({ password, onSignedOut, onCountingChange }: { password: string; onSignedOut: () => void; onCountingChange?: () => void }) {
  const [days, setDays] = useState<number>(7);
  const [stats, setStats] = useState<VisitStats | null>(null);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [problem, setProblem] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [counted, setCounted] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => { setCounted(isCountingThisDevice()); }, []);
  useEffect(() => {
    if (!password) return;
    let live = true;
    setLoading(true);
    getVisitStats({ data: { password, days } })
      .then((res) => {
        if (!live) return;
        if (res.status === "ok") { setStats(res.stats); setEmailAlerts(res.emailAlerts); setProblem(null); return; }
        setStats(null); // never leave another period's numbers under this period's button
        if (res.status === "offline") setProblem("Couldn't read the visitor numbers from the database.");
        else onSignedOut();
      })
      .catch(() => { if (live) { setStats(null); setProblem("Couldn't load the visitor numbers. Check your connection."); } })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [password, days, attempt]); // eslint-disable-line react-hooks/exhaustive-deps

  const s = stats;
  const perDay = s ? s.visits / s.days : 0;
  return (
    <div className="viz-root">
      <div className="viz-ranges" role="group" aria-label="Period">
        {RANGES.map((r) => (
          <button key={r.days} type="button" aria-pressed={days === r.days} className={days === r.days ? "is-on" : ""} onClick={() => setDays(r.days)}>{r.label}</button>
        ))}
      </div>
      {problem && (
        <p className="mt-4 text-red-800">
          {problem}{" "}
          <button type="button" className="viz-link" onClick={() => setAttempt((a) => a + 1)}>Try again</button>
        </p>
      )}
      {s && !emailAlerts && (
        <p className="viz-warn">Lead emails aren't set up (RESEND_API_KEY in Vercel). They are the backup copy of every enquiry if the database is ever down.</p>
      )}
      {s && perDay > BUSY_VISITS_PER_DAY && (
        <p className="viz-warn">Your site is getting busy (about {n(Math.round(perDay))} visits a day). Ask for the visitor numbers to move to their own free database, so they can never use up the enquiries database's monthly allowance.</p>
      )}
      {s && (
        <div className={loading ? "viz-loading" : undefined} aria-busy={loading}>
          <div className="viz-tiles">
            <Tile label="Visitors" value={n(s.visitors)} note={[change(s.visitors, s.previous?.visitors, s.days), s.days > 1 ? "each person counted once a day" : "different people"].filter(Boolean).join(" · ")} />
            <Tile label="Visits" value={n(s.visits)} note={change(s.visits, s.previous?.visits, s.days) ?? `${n(s.pageViews)} pages opened`} />
            <Tile label={`Stayed ${STAYED_SECONDS} seconds or more`} value={pct(s.stayed, s.visits)} note={`${n(s.stayed)} of ${n(s.visits)} visits`} />
            <Tile label="Typical visit" value={s.visits ? duration(s.medianSeconds) : "–"} note="Half of visits were shorter, half longer" />
            <Tile
              label="Enquiries"
              value={s.enquiries === null ? "–" : n(s.enquiries)}
              note={s.enquiries === null ? "Couldn't read the enquiries" : s.enquiries && s.visits >= 2 * s.enquiries ? `1 for every ${n(Math.round(s.visits / s.enquiries))} visits` : "Form and FelicityBot"}
            />
          </div>
          {s.days > 1 && <DailyChart daily={s.daily} />}
          <div className="viz-lists">
            <List title="Pages they opened" rows={s.pages} total={s.visits} empty="No visits yet in this period." />
            <List title="Where they came from" rows={s.sources} total={s.visits} empty="No visits yet in this period." note="Direct: typed in, bookmarked, or opened from an app that doesn't say where from (WhatsApp often doesn't)." />
            <List title="Countries" rows={s.countries} total={s.visits} empty="No visits yet in this period." />
            <List title="Devices" rows={s.devices} total={s.visits} empty="No visits yet in this period." />
          </div>
          <p className="viz-foot">
            Time counts only while the site is on screen and in use; half an hour without use ends a visit. Visits show here once the
            visitor leaves or switches away. No cookies are used.
          </p>
          <p className="viz-foot">
            {counted ? "Your visits from this browser are counted." : "Your own visits from this browser are not counted."}{" "}
            <button type="button" className="viz-link" onClick={() => { setCounted(setCountingThisDevice(!counted)); onCountingChange?.(); }}>
              {counted ? "Don't count this browser" : "Count it again"}
            </button>
            <br />
            Sign in here once in each browser you use. For Instagram's or WhatsApp's built-in browser, open
            dxbdubaicreekharbour.ae/leads?me=1 there once. Private windows and the site's home-screen icon on iPhone are still counted.
          </p>
        </div>
      )}
      {!s && loading && !problem && <p className="mt-6 text-muted-foreground">Loading…</p>}
    </div>
  );
}
