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
  waClicks: 3, waVisits: 2,
  waRecent: [{ at: "2026-10-14T10:05:00.000Z", page: "Creek Haven · Arabic", project: "Creek Haven", place: "Floating button", source: "Instagram", country: "Saudi Arabia", device: "Phone" }],
  waByProject: [{ name: "Creek Haven", visits: 2 }], waByPlace: [{ name: "Floating button", visits: 3 }],
};
const asked: unknown[] = [];
let leadsAnswer: unknown = { status: "ok", leads: [] };
let visitsAnswer: unknown;
vi.mock("@/lib/enquiries.functions", async (orig) => ({
  ...(await orig<typeof import("@/lib/enquiries.functions")>()),
  getLeads: async () => leadsAnswer,
}));
vi.mock("@/lib/visits.functions", () => ({
  getVisitStats: async (o: { data: unknown }) => { asked.push(o.data); return visitsAnswer; },
}));

import { Route } from "@/routes/leads";
import { isCountingThisDevice } from "@/components/SiteAnalytics";

const Page = Route.options.component as () => React.ReactElement;

beforeEach(() => {
  localStorage.clear(); sessionStorage.clear(); asked.length = 0; leadsAnswer = { status: "ok", leads: [] };
  visitsAnswer = { status: "ok", stats, emailAlerts: true, separateAnalyticsDb: false };
});

describe("/leads", () => {
  it("says the password is right and how to connect the database when none is set", async () => {
    leadsAnswer = { status: "offline", problem: { kind: "not-set", detail: "", emailAlerts: true } };
    render(<Page />);
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "x".repeat(24) } });
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));
    await screen.findByText(/The password is right, but no database is connected to this site/);
    expect(screen.getByText(/new enquiries are still emailed to you/)).toBeTruthy();
    expect(screen.queryByText(/Database said/)).toBeNull();
  });
  it("shows a paused database with its own words, and warns when lead emails are off too", async () => {
    leadsAnswer = { status: "offline", problem: { kind: "paused", detail: "NeonDbError: Your project has exceeded the compute time quota.", emailAlerts: false } };
    render(<Page />);
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "x".repeat(24) } });
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));
    await screen.findByText(/free monthly allowance is used up/);
    expect(screen.getByText(/Database said: NeonDbError: Your project has exceeded/)).toBeTruthy();
    expect(screen.getByText(/Lead emails aren't switched on either/)).toBeTruthy();
  });
  it("shows the visitor numbers and stops counting this browser once the password is typed in", async () => {
    render(<Page />);
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "x".repeat(24) } });
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));
    await screen.findByText("42");
    expect(screen.getByText("54%")).toBeTruthy(); // 31 of 57 stayed 30 s+
    expect(screen.getByText("1 min 14 s")).toBeTruthy();
    expect(screen.getByText(/▲ 40% on the 7 days before · each person counted once a day/)).toBeTruthy();
    // WhatsApp taps: the figure, and each tap with the visit it came from (Dubai time).
    expect(screen.getByText("in 2 visits · 4% of visits")).toBeTruthy();
    expect(screen.getByText("14 Oct, 14:05")).toBeTruthy();
    expect(screen.getByText("Creek Haven · Arabic")).toBeTruthy();
    expect(screen.getByText("Saudi Arabia")).toBeTruthy();
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
  it("opens on the enquiries from the lead email's link", async () => {
    window.history.replaceState(null, "", "/leads?tab=enquiries");
    sessionStorage.setItem("dxbch-leads-password", "x".repeat(24));
    render(<Page />);
    await screen.findByText(/0 enquiries, newest first/);
    expect(screen.getByRole("button", { name: /^enquiries/i }).getAttribute("aria-pressed")).toBe("true");
    window.history.replaceState(null, "", "/");
  });
  it("gives a UAE number typed as 971… without the plus its WhatsApp and Call links", async () => {
    const lead = (id: string, phone: string, country: string | null) => ({
      id, created_at: "2026-11-14T08:00:00.000Z", name: `Buyer ${id}`, phone, email: null, country, language: null, project: null,
      looking_for: null, buy_as: null, bedrooms: null, budget: null, timing: null, funding: null, message: null, page: "/",
    });
    leadsAnswer = { status: "ok", total: 4, leads: [lead("1", "971 50 123 4567", null), lead("2", "971501234567", "UAE"), lead("3", "971-4-123-4567", "United Kingdom"), lead("4", "020 7946 0018", "United Kingdom")] };
    window.history.replaceState(null, "", "/leads?tab=enquiries");
    sessionStorage.setItem("dxbch-leads-password", "x".repeat(24));
    render(<Page />);
    await screen.findByText(/4 enquiries, newest first/);
    const hrefs = (selector: string) => [...document.querySelectorAll(selector)].map((a) => a.getAttribute("href"));
    expect(hrefs('a[href^="https://wa.me/"]')).toEqual(["https://wa.me/971501234567", "https://wa.me/971501234567", "https://wa.me/97141234567"]);
    expect(hrefs('a[href^="tel:"]')).toEqual(["tel:+971501234567", "tel:+971501234567", "tel:+97141234567"]);
    // A national number from abroad still can't be made international: it is shown as typed.
    expect(screen.getByText("020 7946 0018")).toBeTruthy();
    window.history.replaceState(null, "", "/");
  });
  it("drops a 0 typed after 971, and reads the bracketed plus a Chinese input method types", async () => {
    const lead = (id: string, phone: string, country: string | null) => ({
      id, created_at: "2026-11-14T08:00:00.000Z", name: `Buyer ${id}`, phone, email: null, country, language: null, project: null,
      looking_for: null, buy_as: null, bedrooms: null, budget: null, timing: null, funding: null, message: null, page: "/",
    });
    const leads = [lead("1", "971 050 123 4567", "United Kingdom"), lead("2", "+971 050 123 4567", null), lead("3", "00971 050 123 4567", "United Kingdom"), lead("4", "+44 (0)20 7946 0958", "United Kingdom"), lead("5", "(+86)13800138000", "China")];
    leadsAnswer = { status: "ok", total: leads.length, leads };
    window.history.replaceState(null, "", "/leads?tab=enquiries");
    sessionStorage.setItem("dxbch-leads-password", "x".repeat(24));
    render(<Page />);
    await screen.findByText(/5 enquiries, newest first/);
    const links = (name: string) => [...screen.getByRole("heading", { name }).closest("article")!.querySelectorAll("a")].map((a) => a.getAttribute("href"));
    for (const name of ["Buyer 1", "Buyer 2", "Buyer 3"]) expect(links(name), name).toEqual(["https://wa.me/971501234567", "tel:+971501234567"]);
    expect(links("Buyer 4")).toEqual(["https://wa.me/442079460958", "tel:+442079460958"]);
    expect(links("Buyer 5")).toEqual(["https://wa.me/8613800138000", "tel:+8613800138000"]);
    window.history.replaceState(null, "", "/");
  });
  it("asks for the visitor numbers' own database on a busy site, and stops asking once they have one", async () => {
    const busy = { ...stats, visits: 1400 }; // 200 a day over 7 days
    sessionStorage.setItem("dxbch-leads-password", "x".repeat(24));
    visitsAnswer = { status: "ok", stats: busy, emailAlerts: true, separateAnalyticsDb: false };
    const first = render(<Page />);
    await screen.findByText(/Your site is getting busy \(about 200 visits a day\)/);
    first.unmount();
    visitsAnswer = { status: "ok", stats: busy, emailAlerts: true, separateAnalyticsDb: true };
    render(<Page />);
    await screen.findByText(/each person counted once a day/);
    expect(screen.queryByText(/Your site is getting busy/)).toBeNull();
  });
  it("marks a browser from the /leads?me=1 link, without the password", async () => {
    window.history.replaceState(null, "", "/leads?me=1");
    render(<Page />);
    await screen.findByText(/this browser is now left out/i);
    expect(isCountingThisDevice()).toBe(false);
    window.history.replaceState(null, "", "/");
  });
});
