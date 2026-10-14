/**
 * Server side of the enquiry form and the private /leads page.
 *
 * This file, src/components/enquiry/* and src/routes/leads.tsx are the
 * database layer: enquiries go to the Neon database Vercel provides as
 * DATABASE_URL. The table creates itself on first use, so a fresh database
 * needs no setup.
 */
import { createServerFn } from "@tanstack/react-start";
import { PROJECTS, SITE } from "@/data/projects";
import { projectLabel } from "@/lib/format";

export const BUY_AS = ["A home to live in", "An investment", "Both / not sure"] as const;
export const BEDROOMS = ["Studio", "1 bedroom", "2 bedrooms", "3 bedrooms", "4+ bedrooms", "Townhouse", "Not sure"] as const;
export const BUDGETS = ["Under AED 2M", "AED 2M – 3M", "AED 3M – 5M", "AED 5M+", "Prefer not to say"] as const;
export const TIMINGS = ["Ready to buy now", "Within 3 months", "3 – 12 months", "Just researching"] as const;
export const FUNDING = ["Cash", "Mortgage", "Not sure yet"] as const;
export const LOOKING_FOR = ["A new launch (off-plan)", "Ready to move in", "Resale while under construction", "Renting", "Not sure yet"] as const;
export const LANGUAGES = ["English", "Arabic", "Russian", "Chinese", "Hindi / Urdu", "French", "German", "Other"] as const;
export const ANY_PROJECT = "Any / not sure";
export const PROJECT_OPTIONS = [ANY_PROJECT, ...PROJECTS.map(projectLabel)];

export type EnquiryInput = {
  name: string;
  phone: string;
  email: string;
  country: string;
  language: string;
  project: string;
  looking_for: string;
  buy_as: string;
  bedrooms: string;
  budget: string;
  timing: string;
  funding: string;
  message: string;
  consent: boolean;
  hp_ref: string;
  page: string;
};

export type EnquiryResult =
  | { ok: true; firstName: string }
  | { ok: false; reason: "invalid"; message: string }
  | { ok: false; reason: "offline" };

export type Lead = {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  email: string | null;
  country: string | null;
  language: string | null;
  project: string | null;
  looking_for: string | null;
  buy_as: string | null;
  bedrooms: string | null;
  budget: string | null;
  timing: string | null;
  funding: string | null;
  message: string | null;
  page: string | null;
};

export type LeadsResult =
  | { status: "ok"; leads: Lead[] }
  | { status: "not-configured" }
  | { status: "wrong-password" }
  | { status: "offline" };

const text = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
const pick = (v: unknown, options: readonly string[]) => {
  const s = text(v, 80);
  return options.includes(s) ? s : null;
};

function databaseUrl(): string | null {
  return process.env["DATABASE_URL"] || process.env["POSTGRES_URL"] || null;
}

/** Shortest LEADS_PASSWORD accepted: long enough that guessing it online is hopeless. */
export const MIN_LEADS_PASSWORD = 20;

/**
 * Phone as typed, made checkable: Arabic-Indic and Persian digits become
 * 0-9, dots become spaces, Unicode dashes become "-", and the invisible
 * direction marks WhatsApp and contact apps add when copying are dropped, so
 * "٠٥٠١٢٣٤٥٦٧", "050.123.4567" and a pasted "\u202a+971 50 123 4567\u202c" pass.
 */
export function normalisePhone(raw: string): string {
  return raw
    .replace(/\p{Cf}/gu, "")
    .replace(/[\u2010-\u2015\u2212]/g, "-")
    .replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 0x660))
    .replace(/[۰-۹]/g, (c) => String(c.charCodeAt(0) - 0x6f0))
    .replace(/\./g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Browser-style email check that also keeps out the characters a mailto link
 * must not carry (?cc=, &body=, %, /, :), so a mistyped address is refused on
 * the form instead of silently dropping the alert email later.
 */
export const EMAIL_RE = /^[A-Za-z0-9.!$'*+=^_`{|}~-]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;

/** The Neon driver repeats the connection string, password included, in its errors. */
function redact(err: unknown, url: string | null): string {
  let msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
  if (url) msg = msg.split(url).join("<DATABASE_URL>");
  return msg.replace(/\/\/[^\s'"@/]*@/g, "//<credentials>@");
}

type Sql = Awaited<ReturnType<typeof connect>>;
async function connect(url: string) {
  const { neon } = await import("@neondatabase/serverless");
  return neon(url);
}

let tableReady: Promise<void> | null = null;
/**
 * Creates the table on first use. Two fresh server instances racing on an
 * empty database can trip Postgres's catalog unique index (23505) or find the
 * table just created (42P07); one retry settles it.
 */
async function ensureTable(sql: Sql): Promise<void> {
  try {
    await createTable(sql);
  } catch (err) {
    const code = (err as { code?: string }).code ?? "";
    if (code !== "23505" && code !== "42P07") throw err;
    await createTable(sql);
  }
}

function createTable(sql: Sql): Promise<void> {
  if (!tableReady) {
    tableReady = (async () => {
      await sql`CREATE TABLE IF NOT EXISTS enquiries (
        id BIGSERIAL PRIMARY KEY,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        project TEXT,
        buy_as TEXT,
        bedrooms TEXT,
        budget TEXT,
        timing TEXT,
        funding TEXT,
        message TEXT,
        page TEXT,
        status TEXT NOT NULL DEFAULT 'new'
      )`;
      await sql`ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS project TEXT`;
      // Added October 2026 with the longer form; older rows simply have NULLs here.
      await sql`ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS country TEXT`;
      await sql`ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS language TEXT`;
      await sql`ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS looking_for TEXT`;
      await sql`CREATE INDEX IF NOT EXISTS enquiries_created_at_idx ON enquiries (created_at DESC)`;
    })().catch((err) => {
      tableReady = null;
      throw err;
    });
  }
  return tableReady;
}

const asObject = <T,>(d: unknown): T => (d && typeof d === "object" ? d : {}) as T;

/**
 * Lead alert by email, through Resend's HTTP API (no SDK needed). Switched on
 * by RESEND_API_KEY in Vercel; goes to LEAD_EMAIL, or the site's own address
 * when that is unset. The sender is LEAD_FROM, or enquiries@felicitypro.com
 * (the domain the owner verifies in Resend); until that domain is verified,
 * Resend refuses it, so the alert falls back to Resend's own test sender,
 * which delivers only to the Resend account's email address. A failure here
 * is logged and never fails the enquiry — the enquiry is already saved and
 * visible on /leads.
 */
const DEFAULT_FROM = "DXB Creek Harbour <enquiries@felicitypro.com>";
const TEST_FROM = "DXB Creek Harbour <onboarding@resend.dev>";
async function emailLeadAlert(lead: Record<string, string | null>): Promise<void> {
  const key = process.env["RESEND_API_KEY"];
  if (!key) return;
  const to = process.env["LEAD_EMAIL"] || SITE.email;
  const preferred = process.env["LEAD_FROM"] || DEFAULT_FROM;
  const rows = Object.entries(lead).filter(([, v]) => v).map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`);
  const subject = `New enquiry: ${lead["name"]}${lead["project"] && lead["project"] !== ANY_PROJECT ? ` — ${lead["project"]}` : ""}`;
  try {
    for (const from of [preferred, TEST_FROM]) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: [to], subject, text: `${rows.join("\n")}\n\nAll enquiries: ${SITE.url}/leads`, ...(lead["email"] && EMAIL_RE.test(lead["email"]) ? { reply_to: lead["email"] } : {}) }),
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) return;
      const detail = (await res.text()).slice(0, 200);
      // 403 = sender domain not verified in Resend: try its test sender once; anything else is final.
      if (res.status === 403 && from !== TEST_FROM) { console.warn("lead alert: sender refused, retrying with Resend's test sender:", detail); continue; }
      console.error("lead alert not sent:", res.status, detail);
      return;
    }
  } catch (err) {
    console.error("lead alert not sent:", err instanceof Error ? err.message : String(err));
  }
}

/** One enquiry as stored: trimmed strings, null where not given. Shared by the form and FelicityBot. */
export type EnquiryRecord = {
  name: string;
  phone: string;
  email: string | null;
  country: string | null;
  language: string | null;
  project: string | null;
  looking_for: string | null;
  buy_as: string | null;
  bedrooms: string | null;
  budget: string | null;
  timing: string | null;
  funding: string | null;
  message: string | null;
  page: string | null;
};

let countersReady: Promise<unknown> | null = null;
/** Deletes question counts older than three days; quietly does nothing if the table doesn't exist yet. */
function cleanCounters(sql: Sql, url: string): Promise<unknown> {
  return sql`DELETE FROM site_counters WHERE updated_at < now() - interval '3 days'`.catch((err) => {
    if ((err as { code?: string }).code !== "42P01") console.error("counter cleanup failed:", redact(err, url));
  });
}
/**
 * Counts one use against each limit in turn and stops at the first one that
 * is used up, so a use turned away by an earlier limit doesn't count against
 * the later ones. Returns the key that refused, or "" when every limit had
 * room; null when the database is not configured, fails, or takes longer than
 * `timeoutMs` (callers then fall back to their own limits). Shared by every
 * server instance, unlike in-memory counts. Keys are names such as
 * "felicitybot:h:2026-10-14T09"; rows older than three days are deleted at
 * the start of each new hour, and whenever /leads is opened (so they go
 * even while the bot is switched off).
 */
export async function takeQuota(steps: { key: string; limit: number }[], timeoutMs = 2500): Promise<string | null> {
  const url = databaseUrl();
  if (!url || !steps.length) return null;
  const run = async (): Promise<string | null> => {
    const sql = await connect(url);
    if (!countersReady) {
      countersReady = sql`CREATE TABLE IF NOT EXISTS site_counters (
        key TEXT PRIMARY KEY,
        count INTEGER NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`.catch((err) => { countersReady = null; throw err; });
    }
    await countersReady;
    let fresh = false;
    try {
      for (const { key, limit } of steps) {
        const rows = (await sql`
          INSERT INTO site_counters (key, count) VALUES (${key}, 1)
          ON CONFLICT (key) DO UPDATE SET count = site_counters.count + 1, updated_at = now()
          RETURNING count
        `) as { count: number }[];
        const count = Number(rows[0]?.count ?? 0);
        fresh ||= count === 1 && !key.includes(":v:"); // a new hour or day, not each new visitor
        if (count > limit) return key;
      }
      return "";
    } finally {
      // A new period has started: clear out rows older than three days, without holding up the answer.
      if (fresh) void cleanCounters(sql, url);
    }
  };
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([run(), new Promise<null>((resolve) => { timer = setTimeout(() => resolve(null), timeoutMs); })]);
  } catch (err) {
    console.error("counter not updated:", redact(err, url));
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** What is wrong with a record, in words a visitor can act on; null when it can be saved. */
export function enquiryProblem(row: Pick<EnquiryRecord, "name" | "phone" | "email">): string | null {
  if (row.name.length < 2) return "Please tell us your name.";
  if (row.phone.replace(/\D/g, "").length < 7 || !/^[+\d\s()-]+$/.test(row.phone)) return "Please enter a phone number we can call or WhatsApp.";
  if (row.email && !EMAIL_RE.test(row.email)) return "That email address doesn't look right — or leave it blank.";
  return null;
}

/**
 * Saves an enquiry and sends the alert email. Consent and spam checks belong
 * to the caller (the form's tick-box and honeypot; FelicityBot's explicit yes).
 */
export async function recordEnquiry(row: EnquiryRecord): Promise<{ ok: true } | { ok: false; reason: "invalid"; message: string } | { ok: false; reason: "offline" }> {
  const problem = enquiryProblem(row);
  if (problem) return { ok: false, reason: "invalid", message: problem };

  const url = databaseUrl();
  if (!url) {
    console.error("enquiry not saved: DATABASE_URL is not set");
    return { ok: false, reason: "offline" };
  }
  try {
    const sql = await connect(url);
    await ensureTable(sql);
    await sql`
      INSERT INTO enquiries (name, phone, email, country, language, project, looking_for, buy_as, bedrooms, budget, timing, funding, message, page)
      VALUES (
        ${row.name}, ${row.phone}, ${row.email}, ${row.country}, ${row.language},
        ${row.project}, ${row.looking_for}, ${row.buy_as}, ${row.bedrooms}, ${row.budget},
        ${row.timing}, ${row.funding}, ${row.message}, ${row.page}
      )
    `;
  } catch (err) {
    console.error("enquiry not saved:", redact(err, url));
    return { ok: false, reason: "offline" };
  }
  await emailLeadAlert({ ...row });
  return { ok: true };
}

export const submitEnquiry = createServerFn({ method: "POST" })
  .validator((d: unknown) => asObject<EnquiryInput>(d))
  .handler(async ({ data }): Promise<EnquiryResult> => {
    // Honeypot: people never see this field; bots fill every input.
    if (text(data.hp_ref, 200)) {
      console.warn("enquiry: spam trap triggered — not saved");
      return { ok: true, firstName: "" };
    }

    const row: EnquiryRecord = {
      name: text(data.name, 120),
      phone: normalisePhone(text(data.phone, 40)),
      email: text(data.email, 200) || null,
      country: text(data.country, 80) || null,
      language: pick(data.language, LANGUAGES),
      project: pick(data.project, PROJECT_OPTIONS),
      looking_for: pick(data.looking_for, LOOKING_FOR),
      buy_as: pick(data.buy_as, BUY_AS),
      bedrooms: pick(data.bedrooms, BEDROOMS),
      budget: pick(data.budget, BUDGETS),
      timing: pick(data.timing, TIMINGS),
      funding: pick(data.funding, FUNDING),
      message: text(data.message, 2000) || null,
      page: text(data.page, 200) || null,
    };
    const problem = enquiryProblem(row);
    if (problem) return { ok: false, reason: "invalid", message: problem };
    if (data.consent !== true)
      return { ok: false, reason: "invalid", message: "Please tick the box so we may contact you about your enquiry." };

    const saved = await recordEnquiry(row);
    if (!saved.ok) return saved;
    return { ok: true, firstName: row.name.split(/\s+/)[0] ?? "" };
  });

export const getLeads = createServerFn({ method: "POST" })
  .validator((d: unknown) => asObject<{ password: string }>(d))
  .handler(async ({ data }): Promise<LeadsResult> => {
    // A short password could be guessed by brute force (there's no lockout on
    // serverless), so anything under MIN_LEADS_PASSWORD counts as not set up.
    const expected = process.env["LEADS_PASSWORD"];
    if (!expected || expected.length < MIN_LEADS_PASSWORD) return { status: "not-configured" };

    const { createHash, timingSafeEqual } = await import("node:crypto");
    // Hash both sides so the comparison is constant-time whatever the lengths.
    const a = createHash("sha256").update(String(data.password ?? "")).digest();
    const b = createHash("sha256").update(expected).digest();
    if (!timingSafeEqual(a, b)) return { status: "wrong-password" };

    const url = databaseUrl();
    if (!url) return { status: "offline" };
    try {
      const sql = await connect(url);
      await ensureTable(sql);
      const rows = (await sql`
        SELECT id::text AS id, created_at, name, phone, email, country, language, project, looking_for, buy_as, bedrooms, budget, timing, funding, message, page
        FROM enquiries ORDER BY created_at DESC LIMIT 500
      `) as Lead[];
      await cleanCounters(sql, url);
      return { status: "ok", leads: rows.map((r) => ({ ...r, created_at: new Date(r.created_at).toISOString() })) };
    } catch (err) {
      console.error("leads read failed:", redact(err, url));
      return { status: "offline" };
    }
  });
