// @vitest-environment node
/** The shared question allowances (takeQuota) against an in-memory stand-in for the database. */
import { beforeEach, describe, expect, it, vi } from "vitest";

const table = new Map<string, number>();
let hang = false;
vi.mock("@neondatabase/serverless", () => ({
  neon: () => async (strings: TemplateStringsArray, ...values: unknown[]) => {
    if (hang) return new Promise(() => {});
    const q = strings.join("?");
    if (q.includes("INSERT INTO site_counters")) {
      const key = String(values[0]);
      table.set(key, (table.get(key) ?? 0) + 1);
      return [{ count: table.get(key) }];
    }
    return [];
  },
}));

import { takeQuota } from "@/lib/enquiries.functions";

const steps = (v: number, h: number, d: number) => [{ key: "v", limit: v }, { key: "h", limit: h }, { key: "d", limit: d }];

beforeEach(() => { table.clear(); hang = false; process.env["DATABASE_URL"] = "postgresql://u:p@db.example/x"; });

describe("Question allowances", () => {
  it("lets questions through until a limit is used up, and names the limit", async () => {
    for (let i = 0; i < 3; i++) expect(await takeQuota(steps(3, 10, 10))).toBe("");
    expect(await takeQuota(steps(3, 10, 10))).toBe("v");
  });
  it("doesn't count a refused question against the later limits", async () => {
    for (let i = 0; i < 10; i++) await takeQuota(steps(2, 100, 100));
    expect(table.get("v")).toBe(10);
    expect(table.get("h")).toBe(2);
    expect(table.get("d")).toBe(2);
  });
  it("gives up quickly on a database that doesn't answer", async () => {
    hang = true;
    const t = Date.now();
    expect(await takeQuota(steps(1, 1, 1), 50)).toBeNull();
    expect(Date.now() - t).toBeLessThan(1000);
  });
  it("does nothing without a database", async () => {
    delete process.env["DATABASE_URL"];
    delete process.env["POSTGRES_URL"];
    expect(await takeQuota(steps(1, 1, 1))).toBeNull();
  });
});
