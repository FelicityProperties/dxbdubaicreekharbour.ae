/** What the visitor counting sends, and what it leaves out. */
import { beforeEach, describe, expect, it } from "vitest";
import { beforeSend, isCountingThisDevice, setCountingThisDevice } from "@/components/SiteAnalytics";

const view = (url: string) => ({ type: "pageview" as const, url });

beforeEach(() => localStorage.clear());

describe("Visitor counting", () => {
  it("counts a page without its #jump, keeping campaign tags", () => {
    expect(beforeSend(view("https://dxbdubaicreekharbour.ae/projects/creek-haven#chat"))).toEqual(view("https://dxbdubaicreekharbour.ae/projects/creek-haven"));
    expect(beforeSend(view("https://dxbdubaicreekharbour.ae/?utm_source=instagram#enquire"))).toEqual(view("https://dxbdubaicreekharbour.ae/?utm_source=instagram"));
  });
  it("never counts the private leads page, however it is spelt", () => {
    expect(beforeSend(view("https://dxbdubaicreekharbour.ae/leads"))).toBeNull();
    expect(beforeSend(view("https://dxbdubaicreekharbour.ae/LEADS?me=1"))).toBeNull();
  });
  it("leaves out a device marked as the owner's, until it is counted again", () => {
    expect(isCountingThisDevice()).toBe(true);
    expect(setCountingThisDevice(false)).toBe(false);
    expect(isCountingThisDevice()).toBe(false);
    expect(beforeSend(view("https://dxbdubaicreekharbour.ae/"))).toBeNull();
    setCountingThisDevice(true);
    expect(beforeSend(view("https://dxbdubaicreekharbour.ae/"))).not.toBeNull();
  });
});
