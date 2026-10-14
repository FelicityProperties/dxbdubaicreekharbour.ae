// @vitest-environment node
/** Visit reports: what is accepted, how sources and devices are named, and what gets stored. */
import { beforeEach, describe, expect, it, vi } from "vitest";

const writes: { q: string; values: unknown[] }[] = [];
vi.mock("@neondatabase/serverless", () => ({
  neon: () => async (strings: TemplateStringsArray, ...values: unknown[]) => { writes.push({ q: strings.join("?"), values }); return []; },
}));

import { handleVisit } from "@/lib/visits.server";
import { cleanReport, deviceName, isRobot, sourceName } from "@/lib/visits.shared";
import { sitePath } from "@/lib/site-pages";

const PHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const report = { id: "0f8e2a3c-1d4b-4c55-9a6e-7b8c9d0e1f2a", pages: ["/", "/projects/creek-haven", "/nope", "/"], views: 4, seconds: 48, ref: "https://www.google.com/", src: "" };
const post = (body: unknown, headers: Record<string, string> = {}) =>
  handleVisit(new Request("https://dxbdubaicreekharbour.ae/api/visit", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body), headers: { "user-agent": PHONE, "x-forwarded-for": "203.0.113.7", "x-vercel-ip-country": "ae", ...headers } }));

beforeEach(() => { writes.length = 0; process.env["DATABASE_URL"] = "postgresql://u:p@db.example/x"; });

describe("Visit reports", () => {
  it("keeps only the site's own pages, once each, and sane totals", () => {
    expect(cleanReport(report, sitePath)).toEqual({ ...report, pages: ["/", "/projects/creek-haven"], src: "", touch: false });
    // Names every object has are not pages (they once crashed /leads).
    for (const fake of ["__proto__", "constructor", "toString", "hasOwnProperty"]) expect(sitePath(fake), fake).toBeNull();
    expect(cleanReport({ ...report, pages: ["__proto__", "constructor"] }, sitePath)).toBeNull();
    expect(cleanReport({ ...report, id: "x" }, sitePath)).toBeNull();
    expect(cleanReport({ ...report, pages: ["/leads"] }, sitePath)).toBeNull();
    expect(cleanReport({ ...report, seconds: 1e9, views: -5 }, sitePath)).toMatchObject({ seconds: 4 * 3600, views: 2 });
  });
  it("names where a visit came from", () => {
    expect(sourceName("https://www.google.com/", "", "dxbdubaicreekharbour.ae")).toBe("Google");
    expect(sourceName("https://l.instagram.com/?u=x", "", "dxbdubaicreekharbour.ae")).toBe("Instagram");
    expect(sourceName("https://dxbdubaicreekharbour.ae/market", "", "dxbdubaicreekharbour.ae")).toBe("Direct");
    expect(sourceName("", "", "dxbdubaicreekharbour.ae")).toBe("Direct");
    expect(sourceName("https://www.google.com/", "ig", "dxbdubaicreekharbour.ae")).toBe("Instagram");
    expect(sourceName("https://news.example.org/a", "", "dxbdubaicreekharbour.ae")).toBe("news.example.org");
    expect(sourceName("https://chatgpt.com/", "chatgpt.com", "dxbdubaicreekharbour.ae")).toBe("ChatGPT");
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
    const [id, day, visitor, pages, views, seconds, source, country, device] = insert.values;
    expect({ id, pages, views, seconds, source, country, device }).toEqual({ id: report.id, pages: ["/", "/projects/creek-haven"], views: 4, seconds: 48, source: "Google", country: "AE", device: "Phone" });
    expect(day).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(String(visitor)).toHaveLength(16);
    expect(JSON.stringify(insert.values)).not.toContain("203.0.113.7");
  });
  it("ignores robots, other sites and junk", async () => {
    await post(report, { "user-agent": "Googlebot/2.1" });
    await post(report, { origin: "https://evil.example" });
    await post("not json");
    await post({ ...report, pages: ["/leads"] });
    expect(writes.filter((w) => w.q.includes("INSERT INTO site_visits"))).toHaveLength(0);
  });
});
