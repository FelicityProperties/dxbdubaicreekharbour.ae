// @vitest-environment node
/**
 * The enquiry form's brakes on scripted floods, and the /api/visit route answering
 * only the beacon's POST.
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

import { connectionOf, submitEnquiry } from "@/lib/enquiries.functions";
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
