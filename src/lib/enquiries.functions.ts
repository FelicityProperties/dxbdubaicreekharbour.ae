/**
 * Server side of the enquiry form and the private /leads page.
 *
 * Vercel-only layer: this file, src/components/enquiry/EnquirySection.tsx and
 * src/routes/leads.tsx are added when the Lovable project is copied into the
 * GitHub repo that Vercel deploys. Lovable never sees them, so a Lovable edit
 * can't overwrite them.
 *
 * Enquiries go to the Neon database Vercel provides as DATABASE_URL. The
 * table creates itself on first use, so a fresh database needs no setup.
 */
import { createServerFn } from "@tanstack/react-start";
import { PROJECTS } from "@/data/projects";

export const BUY_AS = ["A home to live in", "An investment", "Both / not sure"] as const;
export const BEDROOMS = ["Studio", "1 bedroom", "2 bedrooms", "3 bedrooms", "4+ bedrooms", "Townhouse", "Not sure"] as const;
export const BUDGETS = ["Under AED 2M", "AED 2M – 3M", "AED 3M – 5M", "AED 5M+", "Prefer not to say"] as const;
export const TIMINGS = ["Ready to buy now", "Within 3 months", "3 – 12 months", "Just researching"] as const;
export const FUNDING = ["Cash", "Mortgage", "Not sure yet"] as const;
export const ANY_PROJECT = "Any / not sure";
export const PROJECT_OPTIONS = [ANY_PROJECT, ...PROJECTS.map((p) => (p.brand?.startsWith("by ") ? `${p.name} ${p.brand}` : p.name))];

export type EnquiryInput = {
  name: string;
  phone: string;
  email: string;
  project: string;
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
  project: string | null;
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
 * 0-9 and dots become spaces, so "٠٥٠١٢٣٤٥٦٧" and "050.123.4567" pass.
 */
export function normalisePhone(raw: string): string {
  return raw
    .replace(/[\u0660-\u0669]/g, (c) => String(c.charCodeAt(0) - 0x660))
    .replace(/[\u06F0-\u06F9]/g, (c) => String(c.charCodeAt(0) - 0x6f0))
    .replace(/\./g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** An email that can't smuggle mailto parameters (?cc=, &body=, %, /, :). */
export const EMAIL_RE = /^[^\s@?&#%/:]+@[^\s@?&#%/:]+\.[^\s@?&#%/:]+$/;

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
      await sql`CREATE INDEX IF NOT EXISTS enquiries_created_at_idx ON enquiries (created_at DESC)`;
    })().catch((err) => {
      tableReady = null;
      throw err;
    });
  }
  return tableReady;
}

const asObject = <T,>(d: unknown): T => (d && typeof d === "object" ? d : {}) as T;

export const submitEnquiry = createServerFn({ method: "POST" })
  .validator((d: unknown) => asObject<EnquiryInput>(d))
  .handler(async ({ data }): Promise<EnquiryResult> => {
    // Honeypot: people never see this field; bots fill every input.
    if (text(data.hp_ref, 200)) {
      console.warn("enquiry: spam trap triggered — not saved");
      return { ok: true, firstName: "" };
    }

    const name = text(data.name, 120);
    const phone = normalisePhone(text(data.phone, 40));
    const email = text(data.email, 200);
    const message = text(data.message, 2000);

    if (name.length < 2) return { ok: false, reason: "invalid", message: "Please tell us your name." };
    if (phone.replace(/\D/g, "").length < 7 || !/^[+\d\s()-]+$/.test(phone))
      return { ok: false, reason: "invalid", message: "Please enter a phone number we can call or WhatsApp." };
    if (email && !EMAIL_RE.test(email))
      return { ok: false, reason: "invalid", message: "That email address doesn't look right — or leave it blank." };
    if (data.consent !== true)
      return { ok: false, reason: "invalid", message: "Please tick the box so we may contact you about your enquiry." };

    const url = databaseUrl();
    if (!url) {
      console.error("enquiry not saved: DATABASE_URL is not set");
      return { ok: false, reason: "offline" };
    }

    try {
      const sql = await connect(url);
      await ensureTable(sql);
      await sql`
        INSERT INTO enquiries (name, phone, email, project, buy_as, bedrooms, budget, timing, funding, message, page)
        VALUES (
          ${name}, ${phone}, ${email || null}, ${pick(data.project, PROJECT_OPTIONS)},
          ${pick(data.buy_as, BUY_AS)}, ${pick(data.bedrooms, BEDROOMS)}, ${pick(data.budget, BUDGETS)},
          ${pick(data.timing, TIMINGS)}, ${pick(data.funding, FUNDING)}, ${message || null}, ${text(data.page, 200) || null}
        )
      `;
    } catch (err) {
      console.error("enquiry not saved:", redact(err, url));
      return { ok: false, reason: "offline" };
    }

    return { ok: true, firstName: name.split(/\s+/)[0] ?? "" };
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
        SELECT id::text AS id, created_at, name, phone, email, project, buy_as, bedrooms, budget, timing, funding, message, page
        FROM enquiries ORDER BY created_at DESC LIMIT 500
      `) as Lead[];
      return { status: "ok", leads: rows.map((r) => ({ ...r, created_at: new Date(r.created_at).toISOString() })) };
    } catch (err) {
      console.error("leads read failed:", redact(err, url));
      return { status: "offline" };
    }
  });
