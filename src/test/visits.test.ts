// @vitest-environment node
/** Visit reports: what is accepted, how sources and devices are named, and what gets stored. */
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => {
    const b = {
      validator: () => b,
      handler: (fn: (o: { data: unknown }) => unknown) => (o: { data: unknown }) => fn({ data: o.data }),
    };
    return b;
  },
}));
const writes: { url: string; q: string; values: unknown[] }[] = [];
let noVisitsTable = ""; // a database whose site_visits table doesn't exist
let failingDeletes = ""; // a database whose deletes fail (a timeout, say)
vi.mock("@neondatabase/serverless", () => ({
  neon: (url: string) => async (strings: TemplateStringsArray, ...values: unknown[]) => {
    const q = strings.join("?");
    writes.push({ url, q, values });
    if (url === noVisitsTable && q.includes("site_visits")) throw Object.assign(new Error('relation "site_visits" does not exist'), { code: "42P01" });
    if (url === failingDeletes && q.startsWith("DELETE")) throw new Error("canceling statement due to statement timeout");
    return [];
  },
}));

import { handleVisit, ownAnalyticsDb } from "@/lib/visits.server";
import { getVisitStats } from "@/lib/visits.functions";
import { cleanReport, deviceName, isRobot, sourceName } from "@/lib/visits.shared";
import { sitePath } from "@/lib/site-pages";

const PHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const report = { id: "0f8e2a3c-1d4b-4c55-9a6e-7b8c9d0e1f2a", pages: ["/", "/projects/creek-haven", "/nope", "/"], views: 4, seconds: 48, ref: "https://www.google.com/", src: "" };
const post = (body: unknown, headers: Record<string, string> = {}, handle = handleVisit) =>
  handle(new Request("https://dxbdubaicreekharbour.ae/api/visit", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body), headers: { "user-agent": PHONE, "x-forwarded-for": "203.0.113.7", "x-vercel-ip-country": "ae", ...headers } }));
/** A fresh copy of the server module: its once-a-day clean-up starts afresh, whatever the tests before it did. */
async function freshHandleVisit() {
  vi.resetModules();
  return (await import("@/lib/visits.server")).handleVisit;
}
const deletes = () => writes.filter((w) => w.q.startsWith("DELETE FROM site_visits")).map((w) => w.url);

const ENQUIRIES_DB = "postgresql://u:p@db.example/x";
beforeEach(() => { writes.length = 0; process.env["DATABASE_URL"] = ENQUIRIES_DB; });

describe("Visit reports", () => {
  it("keeps only the site's own pages, once each, and sane totals", () => {
    expect(cleanReport(report, sitePath)).toEqual({ ...report, pages: ["/", "/projects/creek-haven"], src: "", touch: false, wa: [] });
    // Names every object has are not pages (they once crashed /leads).
    for (const fake of ["__proto__", "constructor", "toString", "hasOwnProperty"]) expect(sitePath(fake), fake).toBeNull();
    expect(cleanReport({ ...report, pages: ["__proto__", "constructor"] }, sitePath)).toBeNull();
    expect(cleanReport({ ...report, id: "x" }, sitePath)).toBeNull();
    expect(cleanReport({ ...report, pages: ["/leads"] }, sitePath)).toBeNull();
    expect(cleanReport({ ...report, seconds: 1e9, views: -5 }, sitePath)).toMatchObject({ seconds: 4 * 3600, views: 2 });
  });
  it("keeps WhatsApp taps on the site's pages, known buttons and known projects only", () => {
    const isProject = (s: string) => s === "creek-haven";
    const wa = [
      { at: 1793900000000, page: "/ar/projects/creek-haven", place: "floating", project: "creek-haven" },
      { at: 1793900001000, page: "/payment-plans", place: "card", project: "made-up" },     // unknown project: kept without it
      { at: 1793900002000, page: "/leads", place: "menu", project: null },                  // not a public page
      { at: 1793900003000, page: "/", place: "__proto__", project: null },                  // not a button
      { at: "soon", page: "/", place: "bar", project: null },                               // no time
      "junk",
    ];
    expect(cleanReport({ ...report, wa }, sitePath, isProject)!.wa).toEqual([
      { at: 1793900000000, page: "/ar/projects/creek-haven", place: "floating", project: "creek-haven" },
      { at: 1793900001000, page: "/payment-plans", place: "card", project: null },
    ]);
    const many = Array.from({ length: 50 }, (_, i) => ({ at: i, page: "/", place: "bar", project: null }));
    expect(cleanReport({ ...report, wa: many }, sitePath)!.wa).toHaveLength(20);
  });
  it("names where a visit came from", () => {
    expect(sourceName("https://www.google.com/", "", "dxbdubaicreekharbour.ae")).toBe("Google");
    expect(sourceName("https://l.instagram.com/?u=x", "", "dxbdubaicreekharbour.ae")).toBe("Instagram");
    expect(sourceName("https://dxbdubaicreekharbour.ae/market", "", "dxbdubaicreekharbour.ae")).toBe("Direct");
    expect(sourceName("", "", "dxbdubaicreekharbour.ae")).toBe("Direct");
    expect(sourceName("https://www.google.com/", "ig", "dxbdubaicreekharbour.ae")).toBe("Instagram");
    expect(sourceName("https://news.example.org/a", "", "dxbdubaicreekharbour.ae")).toBe("news.example.org");
    expect(sourceName("https://chatgpt.com/", "chatgpt.com", "dxbdubaicreekharbour.ae")).toBe("ChatGPT");
    // Google's AI assistant and its webmail aren't Google search.
    expect(sourceName("https://gemini.google.com/", "", "dxbdubaicreekharbour.ae")).toBe("Gemini");
    expect(sourceName("https://mail.google.com/", "", "dxbdubaicreekharbour.ae")).toBe("Email");
    expect(sourceName("https://www.google.com/", "", "dxbdubaicreekharbour.ae")).toBe("Google");
    expect(sourceName("https://www.google.ae/", "", "dxbdubaicreekharbour.ae")).toBe("Google");
    expect(sourceName("https://news.google.com/", "", "dxbdubaicreekharbour.ae")).toBe("Google");
    expect(sourceName("android-app://com.google.android.googlequicksearchbox/", "", "dxbdubaicreekharbour.ae")).toBe("Google");
    expect(sourceName("android-app://com.whatsapp/", "", "dxbdubaicreekharbour.ae")).toBe("WhatsApp");
    expect(sourceName("", "constructor", "dxbdubaicreekharbour.ae")).toBe("Constructor");
  });
  it("tells phones, tablets and computers apart, and robots from people", () => {
    expect(deviceName(PHONE)).toBe("Phone");
    expect(deviceName("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)")).toBe("Tablet");
    expect(deviceName("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0")).toBe("Computer");
    const mac = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15";
    expect(deviceName(mac)).toBe("Computer");
    expect(deviceName(mac, true)).toBe("Tablet"); // an iPad
    expect(isRobot("Googlebot/2.1")).toBe(true);
    expect(isRobot("Mozilla/5.0 HeadlessChrome/130")).toBe(true);
    expect(isRobot(PHONE)).toBe(false);
  });
  it("stores one row per visit without the IP address", async () => {
    expect((await post(report)).status).toBe(204);
    const insert = writes.find((w) => w.q.includes("INSERT INTO site_visits"))!;
    const [id, day, visitor, conn, pages, views, seconds, source, country, device] = insert.values;
    expect({ id, pages, views, seconds, source, country, device }).toEqual({ id: report.id, pages: ["/", "/projects/creek-haven"], views: 4, seconds: 48, source: "Google", country: "AE", device: "Phone" });
    expect(day).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(String(visitor)).toHaveLength(16);
    expect(String(conn)).toHaveLength(16);
    expect(JSON.stringify(insert.values)).not.toContain("203.0.113.7");
    expect(insert.values[10]).toBe("[]");
  });
  it("stores WhatsApp taps with the visit, at times no later than now", async () => {
    const future = Date.now() + 3_600_000;
    await post({ ...report, wa: [{ at: future, page: "/projects/creek-haven", place: "project", project: "creek-haven" }] });
    const insert = writes.find((w) => w.q.includes("INSERT INTO site_visits"))!;
    const taps = JSON.parse(String(insert.values[10])) as { at: string; page: string; place: string; project: string }[];
    expect(taps).toHaveLength(1);
    expect(taps[0]).toMatchObject({ page: "/projects/creek-haven", place: "project", project: "creek-haven" });
    expect(Date.parse(taps[0]!.at)).toBeLessThanOrEqual(Date.now());
    expect(insert.q).toContain("wa_clicks");
  });
  it("gives one connection the same connection code whatever browser it claims", async () => {
    const codes = async (ua: string, ip = "198.51.100.9") => {
      writes.length = 0;
      await post({ ...report, id: crypto.randomUUID() }, { "user-agent": ua, "x-forwarded-for": ip });
      const [, , visitor, conn] = writes.find((w) => w.q.includes("INSERT INTO site_visits"))!.values;
      return { visitor, conn };
    };
    const a = await codes(PHONE), b = await codes("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0");
    expect(a.visitor).not.toBe(b.visitor);
    expect(a.conn).toBe(b.conn);
    expect((await codes(PHONE, "198.51.100.10")).conn).not.toBe(a.conn);
  });
  it("after a move to ANALYTICS_DATABASE_URL, still deletes 13-month-old visits left in the enquiries database", async () => {
    const ANALYTICS_DB = "postgresql://u:p@analytics.example/y";
    const deletesOn = async (day: string) => {
      vi.setSystemTime(new Date(`${day}T12:00:00Z`)); // a new day: this server instance hasn't cleaned up yet
      writes.length = 0;
      await post({ ...report, id: crypto.randomUUID() });
      return writes.filter((w) => w.q.startsWith("DELETE FROM site_visits")).map((w) => w.url);
    };
    vi.useFakeTimers({ toFake: ["Date"] });
    try {
      expect(await deletesOn("2031-01-01")).toEqual([ENQUIRIES_DB]); // one database for everything
      process.env["ANALYTICS_DATABASE_URL"] = ANALYTICS_DB;
      expect(ownAnalyticsDb()).toBe(true);
      expect(await deletesOn("2031-01-02")).toEqual([ANALYTICS_DB, ENQUIRIES_DB]);
      // The enquiries database gets that one delete and nothing else: no table made, no visit written.
      expect(writes.filter((w) => w.url === ENQUIRIES_DB).map((w) => w.q)).toEqual(["DELETE FROM site_visits WHERE day < now()::date - 400"]);
      expect(writes.some((w) => w.url === ANALYTICS_DB && w.q.includes("INSERT INTO site_visits"))).toBe(true);
      // An enquiries database that never had the table: the visit is still recorded, and it is not asked again.
      noVisitsTable = ENQUIRIES_DB;
      expect(await deletesOn("2031-01-03")).toEqual([ANALYTICS_DB, ENQUIRIES_DB]);
      expect(writes.some((w) => w.url === ANALYTICS_DB && w.q.includes("INSERT INTO site_visits"))).toBe(true);
      expect(await deletesOn("2031-01-04")).toEqual([ANALYTICS_DB]);
      // The same address in both settings is still one database.
      process.env["ANALYTICS_DATABASE_URL"] = ENQUIRIES_DB;
      expect(ownAnalyticsDb()).toBe(false);
    } finally {
      vi.useRealTimers();
      noVisitsTable = "";
      delete process.env["ANALYTICS_DATABASE_URL"];
    }
  });
  it("tells /leads whether the numbers have a database of their own", async () => {
    process.env["LEADS_PASSWORD"] = "x".repeat(24);
    const ask = () => (getVisitStats as unknown as (o: { data: unknown }) => Promise<{ status: string; separateAnalyticsDb?: boolean }>)({ data: { password: "x".repeat(24), days: 7 } });
    try {
      expect(await ask()).toMatchObject({ status: "ok", separateAnalyticsDb: false });
      process.env["ANALYTICS_DATABASE_URL"] = "postgresql://u:p@analytics.example/y";
      expect(await ask()).toMatchObject({ status: "ok", separateAnalyticsDb: true });
    } finally {
      delete process.env["ANALYTICS_DATABASE_URL"];
      delete process.env["LEADS_PASSWORD"];
    }
  });
  it("asks the enquiries database about old visits once a day, even while the numbers' own database fails its delete", async () => {
    const ANALYTICS_DB = "postgresql://u:p@analytics.example/y";
    const handle = await freshHandleVisit();
    const reportsOn = async (day: string, n: number) => {
      vi.setSystemTime(new Date(`${day}T12:00:00Z`));
      writes.length = 0;
      for (let i = 0; i < n; i++) await post({ ...report, id: crypto.randomUUID() }, {}, handle);
      return deletes();
    };
    vi.useFakeTimers({ toFake: ["Date"] });
    process.env["ANALYTICS_DATABASE_URL"] = ANALYTICS_DB;
    failingDeletes = ANALYTICS_DB;
    try {
      // The failed delete is tried again with the next report; the enquiries database is left alone until tomorrow.
      expect(await reportsOn("2031-03-01", 3)).toEqual([ANALYTICS_DB, ENQUIRIES_DB, ANALYTICS_DB, ANALYTICS_DB]);
      failingDeletes = "";
      expect(await reportsOn("2031-03-02", 2)).toEqual([ANALYTICS_DB, ENQUIRIES_DB]);
    } finally {
      vi.useRealTimers();
      failingDeletes = "";
      delete process.env["ANALYTICS_DATABASE_URL"];
    }
  });
  it("knows one database under its pooled and direct addresses, whatever their options", async () => {
    const pooled = "postgresql://u:p@ep-quiet-sea-000000-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require";
    const direct = "postgresql://u:p@ep-quiet-sea-000000.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
    const handle = await freshHandleVisit();
    vi.useFakeTimers({ toFake: ["Date"] });
    try {
      process.env["DATABASE_URL"] = pooled;
      process.env["ANALYTICS_DATABASE_URL"] = direct;
      expect(ownAnalyticsDb()).toBe(false);
      vi.setSystemTime(new Date("2031-04-01T12:00:00Z"));
      await post({ ...report, id: crypto.randomUUID() }, {}, handle);
      expect(deletes()).toEqual([direct]); // one delete: it is one database
      process.env["ANALYTICS_DATABASE_URL"] = "postgresql://u:p@EP-QUIET-SEA-000000.eu-central-1.aws.neon.tech:5432/neondb";
      expect(ownAnalyticsDb()).toBe(false);
      // Another Neon project, or another database, is a database of its own.
      process.env["ANALYTICS_DATABASE_URL"] = "postgresql://u:p@ep-bold-lake-111111-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require";
      expect(ownAnalyticsDb()).toBe(true);
      process.env["ANALYTICS_DATABASE_URL"] = "postgresql://u:p@ep-quiet-sea-000000.eu-central-1.aws.neon.tech/visits";
      expect(ownAnalyticsDb()).toBe(true);
    } finally {
      vi.useRealTimers();
      delete process.env["ANALYTICS_DATABASE_URL"];
    }
  });
  it("ignores robots, other sites and junk", async () => {
    await post(report, { "user-agent": "Googlebot/2.1" });
    await post(report, { origin: "https://evil.example" });
    await post("not json");
    await post({ ...report, pages: ["/leads"] });
    expect(writes.filter((w) => w.q.includes("INSERT INTO site_visits"))).toHaveLength(0);
  });
});
