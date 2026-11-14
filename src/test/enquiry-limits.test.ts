// @vitest-environment node
/**
 * The enquiry form's brakes on scripted floods (FelicityBot's saves count against
 * the same allowance), and the /api/visit route answering only the beacon's POST.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let ip = "203.0.113.7";
vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => {
    const b = {
      validator: () => b,
      handler: (fn: (o: { data: unknown }) => unknown) => (o: { data: unknown }) => fn({ data: o.data }),
    };
    return b;
  },
}));
vi.mock("@tanstack/react-start/server", () => ({ getRequestIP: () => ip }));
// A stand-in for the database, used once DATABASE_URL is set: the shared counters, and the enquiries saved.
const counters = new Map<string, number>();
const inserted: unknown[][] = [];
vi.mock("@neondatabase/serverless", () => ({
  neon: () => async (strings: TemplateStringsArray, ...values: unknown[]) => {
    const q = strings.join("?");
    if (q.includes("INSERT INTO site_counters")) { const key = String(values[0]); counters.set(key, (counters.get(key) ?? 0) + 1); return [{ count: counters.get(key) }]; }
    if (q.includes("INSERT INTO enquiries")) inserted.push(values);
    return [];
  },
}));

import { connectionOf, submitEnquiry } from "@/lib/enquiries.functions";
import { askFelicityBot } from "@/lib/felicitybot.functions";
import type { BotResult } from "@/lib/felicitybot.shared";
import { Route as VisitRoute } from "@/routes/api.visit";

const alerts: unknown[] = [];
const buyer = (n: number) => ({ name: `Buyer ${n}`, phone: "+971 50 123 4567", email: "", consent: true, hp_ref: "", page: "/" });
const send = (data: unknown) => (submitEnquiry as unknown as (o: { data: unknown }) => Promise<{ ok: boolean; reason?: string }>)({ data });

beforeEach(() => {
  alerts.length = 0;
  delete process.env["DATABASE_URL"];
  process.env["RESEND_API_KEY"] = "re_test";
  // Each accepted enquiry is emailed to the operator; the stand-in records it.
  vi.stubGlobal("fetch", async (_url: string, init: { body: string }) => { alerts.push(JSON.parse(init.body)); return new Response("{}", { status: 200 }); });
});
afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env["RESEND_API_KEY"];
});

describe("Enquiry form limits", () => {
  it("accepts a few enquiries from one connection, then shows the WhatsApp fallback", async () => {
    ip = "198.51.100.20";
    const results = [];
    for (let i = 0; i < 8; i++) results.push(await send(buyer(i)));
    expect(results.filter((r) => r.ok)).toHaveLength(5);
    expect(results.slice(5).every((r) => !r.ok && r.reason === "offline")).toBe(true);
    expect(alerts).toHaveLength(5);
    // Someone else is still welcome.
    ip = "198.51.100.21";
    expect((await send(buyer(9))).ok).toBe(true);
  });

  it("doesn't count an enquiry the visitor still has to correct", async () => {
    ip = "198.51.100.30";
    for (let i = 0; i < 6; i++) expect((await send({ ...buyer(i), phone: "12" })).ok).toBe(false);
    expect((await send(buyer(1))).ok).toBe(true);
  });

  it("treats one IPv6 /64 as one connection", async () => {
    expect(connectionOf("2001:db8:abcd:12:1::5")).toBe(connectionOf("2001:0db8:abcd:0012:ffff:1:2:3"));
    expect(connectionOf("2001:db8::1")).toBe("2001:db8:0:0::/64");
    expect(connectionOf("::ffff:203.0.113.7")).toBe("203.0.113.7");
    expect(connectionOf("203.0.113.7")).toBe("203.0.113.7");
    ip = "2001:db8:42:7::1";
    for (let i = 0; i < 5; i++) expect((await send(buyer(i))).ok).toBe(true);
    ip = "2001:db8:42:7:9:9:9:9";
    expect((await send(buyer(6))).ok).toBe(false);
  });

  it("counts FelicityBot's saves against the same allowance: 10 enquiries a day per connection, however they are sent", async () => {
    ip = "198.51.100.77";
    process.env["DATABASE_URL"] = "postgresql://u:p@db.example/x";
    process.env["LEADS_PASSWORD"] = "p".repeat(24);
    process.env["ANTHROPIC_API_KEY"] = "sk-ant-test";
    vi.useFakeTimers({ toFake: ["Date"] });
    let now = Date.parse("2026-11-14T01:00:00Z");
    vi.setSystemTime(now);
    // The Claude API asks to save the visitor's details, then answers; anything else is a lead alert email.
    const toolResults: unknown[] = [];
    const usage = { input_tokens: 10, output_tokens: 10, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 };
    const reply = (content: unknown[], stop_reason: string) => ({ id: "msg", type: "message", role: "assistant", model: "m", content, stop_reason, stop_sequence: null, stop_details: null, usage });
    vi.stubGlobal("fetch", async (url: string, init: { body: string }) => {
      const body = JSON.parse(init.body) as { messages?: { content: unknown }[] };
      if (!String(url).includes("anthropic")) { alerts.push(body); return new Response("{}", { status: 200 }); }
      const last = body.messages!.at(-1)!.content;
      const answered = Array.isArray(last) && (last as { type?: string }[]).some((b) => b.type === "tool_result");
      if (answered) toolResults.push(last);
      const next = answered
        ? reply([{ type: "text", text: "Done.", citations: null }], "end_turn")
        : reply([{ type: "tool_use", id: "toolu_1", name: "save_enquiry", input: { name: "Ali Hassan", phone: "+971 50 123 4567", email: "", project: "", request: "a call", consent_to_contact: true } }], "tool_use");
      return new Response(JSON.stringify(next), { status: 200, headers: { "content-type": "application/json" } });
    });
    const ask = () => (askFelicityBot as unknown as (o: { data: unknown }) => Promise<BotResult>)({ data: { turns: [{ role: "user", text: "I'm Ali, +971 50 123 4567, yes please call me" }], page: "/" } });
    try {
      // Three saves through FelicityBot every 11 minutes (its own brake allows three per 10 minutes), the same UTC day.
      const bot: BotResult[] = [];
      for (let round = 0; round < 3; round++) {
        for (let i = 0; i < 3; i++) bot.push(await ask());
        now += 11 * 60_000;
        vi.setSystemTime(now);
      }
      expect(bot.filter((r) => r.ok && r.saved)).toHaveLength(9);
      expect((await send(buyer(1))).ok).toBe(true); // the 10th of the day
      expect(await send(buyer(2))).toEqual({ ok: false, reason: "offline" }); // the form's WhatsApp fallback
      expect(await ask()).toMatchObject({ ok: true, saved: false });
      expect(JSON.stringify(toolResults.at(-1))).toContain("too many requests");
      expect(inserted).toHaveLength(10);
      expect(alerts).toHaveLength(10);
      expect([...counters].filter(([k]) => k.startsWith("enquiry:v:")).map(([, n]) => n)).toEqual([12]);
      // Another connection is still welcome.
      ip = "198.51.100.78";
      expect(await ask()).toMatchObject({ ok: true, saved: true });
      expect(inserted).toHaveLength(11);
    } finally {
      vi.useRealTimers();
      for (const k of ["DATABASE_URL", "LEADS_PASSWORD", "ANTHROPIC_API_KEY"]) delete process.env[k];
    }
  });
});

describe("/api/visit", () => {
  it("answers anything but POST with 405, not the site's page shell", async () => {
    const handlers = (VisitRoute.options as unknown as { server: { handlers: Record<string, () => Response> } }).server.handlers;
    expect(Object.keys(handlers).sort()).toEqual(["ANY", "POST"]);
    const res = handlers["ANY"]!();
    expect(res.status).toBe(405);
    expect(res.headers.get("allow")).toBe("POST");
    expect(res.headers.get("x-robots-tag")).toBe("noindex");
  });
});
