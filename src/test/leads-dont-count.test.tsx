/** /leads: signing in leaves this browser out of the visitor numbers, and the numbers show behind the password. */
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { VisitStats } from "@/lib/visits.shared";

const stats: VisitStats = {
  days: 7, from: "2026-10-08", to: "2026-10-14", visitors: 42, visits: 57, pageViews: 130, stayed: 31, medianSeconds: 74, enquiries: 3,
  previous: { visitors: 30, visits: 40 },
  daily: Array.from({ length: 7 }, (_, i) => ({ day: `2026-10-${String(8 + i).padStart(2, "0")}`, visitors: 6, visits: 8, stayed: 4 })),
  pages: [{ name: "Creek Haven", visits: 20 }], sources: [{ name: "Google", visits: 30 }], countries: [{ name: "United Arab Emirates", visits: 40 }], devices: [{ name: "Phone", visits: 45 }],
};
const asked: unknown[] = [];
vi.mock("@/lib/enquiries.functions", async (orig) => ({
  ...(await orig<typeof import("@/lib/enquiries.functions")>()),
  getLeads: async () => ({ status: "ok", leads: [] }),
}));
vi.mock("@/lib/visits.functions", () => ({
  getVisitStats: async (o: { data: unknown }) => { asked.push(o.data); return { status: "ok", stats }; },
}));

import { Route } from "@/routes/leads";
import { isCountingThisDevice } from "@/components/SiteAnalytics";

const Page = Route.options.component as () => React.ReactElement;

beforeEach(() => { localStorage.clear(); sessionStorage.clear(); asked.length = 0; });

describe("/leads", () => {
  it("shows the visitor numbers and stops counting this browser once the password is typed in", async () => {
    render(<Page />);
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "x".repeat(24) } });
    fireEvent.click(screen.getByRole("button", { name: /show enquiries/i }));
    await screen.findByText("42");
    expect(screen.getByText("54%")).toBeTruthy(); // 31 of 57 stayed 30 s+
    expect(screen.getByText("1 min 14 s")).toBeTruthy();
    expect(asked[0]).toEqual({ password: "x".repeat(24), days: 7 });
    expect(isCountingThisDevice()).toBe(false);
    await screen.findByText(/Your own visits from this browser are not counted/);
    fireEvent.click(screen.getByRole("button", { name: /count it again/i }));
    expect(isCountingThisDevice()).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "30 days" }));
    await waitFor(() => expect(asked.at(-1)).toEqual({ password: "x".repeat(24), days: 30 }));
  });
  it("doesn't undo 'count it again' when the page reloads with the saved sign-in", async () => {
    sessionStorage.setItem("dxbch-leads-password", "x".repeat(24));
    render(<Page />);
    await screen.findByText(/Your visits from this browser are counted/);
    expect(isCountingThisDevice()).toBe(true);
  });
  it("marks a browser from the /leads?me=1 link, without the password", async () => {
    window.history.replaceState(null, "", "/leads?me=1");
    render(<Page />);
    await screen.findByText(/this browser is now left out/i);
    expect(isCountingThisDevice()).toBe(false);
    window.history.replaceState(null, "", "/");
  });
});
