/** Signing in on /leads leaves that device out of the visitor numbers; the panel can count it again. */
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

vi.mock("@/lib/enquiries.functions", async (orig) => ({
  ...(await orig<typeof import("@/lib/enquiries.functions")>()),
  getLeads: async () => ({ status: "ok", leads: [] }),
}));

import { Route } from "@/routes/leads";
import { isCountingThisDevice } from "@/components/SiteAnalytics";

const Page = Route.options.component as () => React.ReactElement;

beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });

describe("/leads and visitor numbers", () => {
  it("stops counting this device once the password is typed in", async () => {
    render(<Page />);
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "x".repeat(24) } });
    fireEvent.click(screen.getByRole("button", { name: /show enquiries/i }));
    await screen.findByText(/This device is not counted/);
    expect(isCountingThisDevice()).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: /count it again/i }));
    expect(isCountingThisDevice()).toBe(true);
    await waitFor(() => expect(screen.getByText(/This device's visits are counted/)).toBeTruthy());
  });
  it("doesn't undo 'count it again' when the page reloads with the saved sign-in", async () => {
    sessionStorage.setItem("dxbch-leads-password", "x".repeat(24));
    render(<Page />);
    await screen.findByText(/This device's visits are counted/);
    expect(isCountingThisDevice()).toBe(true);
  });
});
