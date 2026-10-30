/**
 * Visitor numbers, server side: storing the browser's visit reports
 * (POST /api/visit) and adding them up for /leads.
 *
 * One row per visit in site_visits, written when the visitor leaves or
 * switches away (usually once or twice a visit), never per page, so the
 * database is woken as little as possible. No cookies and no IP address are
 * stored: "visitor" is a code made from the connection and browser that
 * changes every day, so a person counts once a day and can't be followed
 * from day to day. Rows older than 13 months are deleted.
 *
 * ANALYTICS_DATABASE_URL, if set, keeps the numbers in a separate database
 * from the enquiries; otherwise they share DATABASE_URL.
 */
import { createHmac, scryptSync } from "node:crypto";
import { connect, connectionOf, redact, type Sql } from "@/lib/enquiries.functions";
import { sitePath, pageName } from "@/lib/site-pages";
import { SITE } from "@/data/projects";
import { withTimeout } from "@/lib/with-timeout";
import { STAYED_SECONDS, cleanReport, deviceName, isRobot, sourceName, type Ranked, type VisitStats } from "@/lib/visits.shared";

const dbUrl = () => process.env["ANALYTICS_DATABASE_URL"] || process.env["DATABASE_URL"] || process.env["POSTGRES_URL"] || null;
const OWN_HOST = new URL(SITE.url).hostname.replace(/^www\./, "");
const dubaiDay = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dubai", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);

let tableReady: Promise<unknown> | null = null;
function ensureVisitsTable(sql: Sql): Promise<unknown> {
  if (!tableReady) {
    tableReady = (async () => {
      await sql`CREATE TABLE IF NOT EXISTS site_visits (
        id TEXT PRIMARY KEY,
        day DATE NOT NULL,
        started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        visitor TEXT NOT NULL,
        pages TEXT[] NOT NULL,
        page_views INTEGER NOT NULL,
        seconds INTEGER NOT NULL,
        source TEXT NOT NULL,
        country TEXT,
        device TEXT NOT NULL
      )`;
      await sql`CREATE INDEX IF NOT EXISTS site_visits_day_idx ON site_visits (day)`;
      // Added October 2026: the day's connection code, without the browser (older rows have none).
      await sql`ALTER TABLE site_visits ADD COLUMN IF NOT EXISTS conn TEXT`;
    })().catch((err) => { tableReady = null; throw err; });
  }
  return tableReady;
}

/* A brake on scripted floods: reports per connection per 10 minutes, per server instance (oldest connections
   are forgotten first when the list gets long, so a flood of addresses can't wipe everyone's count). */
const recent = new Map<string, number[]>();
function allowed(ip: string, now: number): boolean {
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < 600_000);
  if (hits.length >= 120) return false;
  hits.push(now); recent.delete(ip); recent.set(ip, hits);
  if (recent.size > 5000) for (const key of [...recent.keys()].slice(0, 1000)) recent.delete(key);
  return true;
}

/* The key for the daily visitor codes: derived slowly from a server secret, so a stored code can't be used to
   test guesses at that secret (the /leads password, unless ANALYTICS_SECRET is set). */
let visitKey: { from: string; key: Buffer } | null = null;
function keyFor(secret: string): Buffer {
  if (visitKey?.from !== secret) visitKey = { from: secret, key: scryptSync(secret, "dxbch-site-visits-v1", 32) };
  return visitKey.key;
}

/* Rows older than 13 months go: once a day per server instance, whether or not anyone opens /leads. */
let cleanedOn = "";
async function cleanOldVisits(sql: Sql, day: string) {
  if (cleanedOn === day) return;
  cleanedOn = day;
  await withTimeout(sql`DELETE FROM site_visits WHERE day < now()::date - 400`, 4000).catch(() => { cleanedOn = ""; });
}

/** POST /api/visit. Always answers 204: the browser has nothing to do with the answer. */
export async function handleVisit(request: Request): Promise<Response> {
  const done = new Response(null, { status: 204 });
  const url = dbUrl();
  const userAgent = request.headers.get("user-agent") ?? "";
  if (!url || isRobot(userAgent)) return done;
  // Only this site's own pages send reports.
  const host = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return "?"; } };
  const origin = request.headers.get("origin");
  if (origin && host(origin) !== host(request.url)) return done;
  const body = await request.text().catch(() => "");
  if (body.length > 4000) return done;
  let report;
  try { report = cleanReport(JSON.parse(body), sitePath); } catch { return done; }
  if (!report) return done;

  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0]!.trim() || "unknown";
  const now = new Date();
  if (!allowed(ip, now.getTime())) return done;
  const day = dubaiDay(now);
  const key = keyFor(process.env["ANALYTICS_SECRET"] || process.env["LEADS_PASSWORD"] || url);
  const visitor = createHmac("sha256", key).update(`${day}|${ip}|${userAgent}`).digest("base64url").slice(0, 16);
  // The same without the browser string (and an IPv6 address by its /64), which a script can change at will.
  const conn = createHmac("sha256", key).update(`conn|${day}|${connectionOf(ip)}`).digest("base64url").slice(0, 16);
  const country = (request.headers.get("x-vercel-ip-country") ?? "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2) || null;

  try {
    const sql = await connect(url);
    await withTimeout(ensureVisitsTable(sql), 4000);
    // The first report of a visit creates its row; later ones only raise the totals (a visit is reported again with
    // the totals so far each time the visitor switches away). Reports for visits older than a day are ignored.
    await withTimeout(sql`
      INSERT INTO site_visits (id, day, visitor, conn, pages, page_views, seconds, source, country, device)
      VALUES (${report.id}, ${day}, ${visitor}, ${conn}, ${report.pages}, ${report.views}, ${report.seconds},
              ${sourceName(report.ref, report.src, OWN_HOST)}, ${country}, ${deviceName(userAgent, report.touch)})
      ON CONFLICT (id) DO UPDATE SET
        pages = CASE WHEN cardinality(EXCLUDED.pages) > cardinality(site_visits.pages) THEN EXCLUDED.pages ELSE site_visits.pages END,
        page_views = GREATEST(site_visits.page_views, EXCLUDED.page_views),
        seconds = GREATEST(site_visits.seconds, EXCLUDED.seconds),
        updated_at = now()
      WHERE site_visits.started_at > now() - interval '1 day'
    `, 4000);
    await cleanOldVisits(sql, day);
  } catch (err) {
    console.error("visit not recorded:", redact(err, url));
  }
  return done;
}

const toRanked = (rows: { name: string | null; visits: number | string }[], rename: (n: string) => string = (n) => n): Ranked[] =>
  rows.map((r) => ({ name: r.name ? String(rename(String(r.name))) : "Unknown", visits: Number(r.visits) }));

/* Sources the site names itself; any other referring site or campaign tag is listed by name only once at
   least two different connections came from it in the period (one script can't fill the list with its own
   words, whatever browser it claims to be). */
const KNOWN_SOURCES = ["Direct", "Google", "Bing", "Other search", "Instagram", "Facebook", "LinkedIn", "X (Twitter)", "YouTube", "TikTok", "WhatsApp", "Snapchat", "Property Finder", "Bayut", "Dubizzle", "ChatGPT", "Gemini", "Perplexity", "Email", "felicitypro.com", "Other app"];

/** The numbers for the last `days` Dubai days (today included), or null when there is no database or it fails. */
export async function visitStats(days: number): Promise<Omit<VisitStats, "enquiries"> | null> {
  const url = dbUrl();
  if (!url) return null;
  const to = dubaiDay(new Date());
  const shift = (n: number) => { const d = new Date(`${to}T12:00:00Z`); d.setUTCDate(d.getUTCDate() - n); return d.toISOString().slice(0, 10); };
  const from = shift(days - 1), prevFrom = shift(2 * days - 1), prevTo = shift(days);
  try {
    const sql = await connect(url);
    await withTimeout(ensureVisitsTable(sql), 6000);
    const range = (q: Promise<unknown>) => withTimeout(q, 10_000) as Promise<Record<string, unknown>[]>;
    const [totals, prev, daily, pages, sources, countries, devices, start] = await Promise.all([
      range(sql`
        SELECT count(*) AS visits, count(DISTINCT (day, visitor)) AS visitors, coalesce(sum(page_views), 0) AS page_views,
               count(*) FILTER (WHERE seconds >= ${STAYED_SECONDS}) AS stayed,
               coalesce(percentile_cont(0.5) WITHIN GROUP (ORDER BY seconds), 0) AS median_seconds
        FROM site_visits WHERE day BETWEEN ${from} AND ${to}`),
      // The stretch just before, cut at the same clock time, so part of today is compared with the same part of a day.
      range(sql`SELECT count(*) AS visits, count(DISTINCT (day, visitor)) AS visitors FROM site_visits
                WHERE day BETWEEN ${prevFrom} AND ${prevTo} AND started_at <= now() - make_interval(days => ${days})`),
      range(sql`
        SELECT d::date::text AS day, count(v.id) AS visits, count(DISTINCT v.visitor) AS visitors,
               count(v.id) FILTER (WHERE v.seconds >= ${STAYED_SECONDS}) AS stayed
        FROM generate_series(${from}::date, ${to}::date, interval '1 day') AS d
        LEFT JOIN site_visits v ON v.day = d::date
        GROUP BY d ORDER BY d`),
      range(sql`SELECT p AS name, count(*) AS visits FROM site_visits, unnest(pages) AS p WHERE day BETWEEN ${from} AND ${to} AND p LIKE '/%' GROUP BY p ORDER BY 2 DESC, 1 LIMIT 10`),
      range(sql`
        SELECT name, sum(visits) AS visits FROM (
          SELECT CASE WHEN source = ANY(${KNOWN_SOURCES}::text[]) OR count(DISTINCT (day, coalesce(conn, visitor))) >= 2 THEN source ELSE 'Other sites' END AS name, count(*) AS visits
          FROM site_visits WHERE day BETWEEN ${from} AND ${to} GROUP BY source
        ) s GROUP BY name ORDER BY 2 DESC, 1 LIMIT 8`),
      range(sql`SELECT country AS name, count(*) AS visits FROM site_visits WHERE day BETWEEN ${from} AND ${to} GROUP BY country ORDER BY 2 DESC, 1 LIMIT 8`),
      range(sql`SELECT device AS name, count(*) AS visits FROM site_visits WHERE day BETWEEN ${from} AND ${to} GROUP BY device ORDER BY 2 DESC, 1`),
      range(sql`SELECT min(day)::text AS first FROM site_visits`),
    ]);
    await cleanOldVisits(sql, to);
    const t = totals[0] ?? {};
    // No comparison until counting had started before the earlier stretch began (else it shows made-up growth).
    // Strictly before: counting never starts at midnight, so the first day with data is only partly counted.
    const first = start[0]?.["first"] ? String(start[0]["first"]) : null;
    const previous = first && first < prevFrom ? { visitors: Number(prev[0]?.["visitors"] ?? 0), visits: Number(prev[0]?.["visits"] ?? 0) } : null;
    const countryName = (() => { try { const names = new Intl.DisplayNames(["en"], { type: "region" }); return (c: string) => names.of(c) ?? c; } catch { return (c: string) => c; } })();
    return {
      days, from, to,
      visitors: Number(t["visitors"] ?? 0),
      visits: Number(t["visits"] ?? 0),
      pageViews: Number(t["page_views"] ?? 0),
      stayed: Number(t["stayed"] ?? 0),
      medianSeconds: Math.round(Number(t["median_seconds"] ?? 0)),
      previous,
      daily: daily.map((r) => ({ day: String(r["day"]), visitors: Number(r["visitors"]), visits: Number(r["visits"]), stayed: Number(r["stayed"]) })),
      pages: toRanked(pages as { name: string; visits: number }[], pageName),
      sources: toRanked(sources as { name: string; visits: number }[]),
      countries: toRanked(countries as { name: string | null; visits: number }[], countryName),
      devices: toRanked(devices as { name: string; visits: number }[]),
    };
  } catch (err) {
    console.error("visit numbers not read:", redact(err, url));
    return null;
  }
}
