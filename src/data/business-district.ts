/**
 * Dubai Square Business District: the office district Emaar announced on 9 November 2026, beside Dubai Square in
 * Dubai Creek Harbour. Every sentence rests on Emaar's press release of that day ("Dubai Square Business District:
 * The Address of Ambition"); its exact sentences are kept in design/business-district-sources.json, and a test checks
 * that every figure here appears in them. It is an announced plan: Emaar has published no launch date, office prices
 * or completion date, so the site shows none and says so. Never add a line that cannot be traced to that release or
 * to a later Emaar publication recorded the same way.
 */
import type { ProjectImage } from "@/data/projects";

export const BUSINESS_DISTRICT = {
  name: "Dubai Square Business District",
  /** The release's date (ISO). */
  announced: "2026-11-09",
  /** Where the figures come from: a record only, never shown as a link. */
  sourceUrl: "https://www.emaar.com/en/press-release-listing/dubai-square-business-district-the-address-of-ambition",
  intro: "Emaar has announced Dubai Square Business District: a new commercial and office district of 300,000 square metres planned beside Dubai Square in the heart of Dubai Creek Harbour, with a total development value of AED 12 billion.",
  facts: [
    { value: "300,000 sq m", label: "Premium commercial and office space" },
    { value: "AED 12 billion", label: "Total development value" },
    { value: "2", label: "Metro stations serving the business district" },
    { value: "4", label: "Hotels around Dubai Square" },
  ],
  points: [
    "In Emaar's plan, two metro stations serve the business district directly, and the office buildings are linked straight into them: Emaar describes stepping off the train and crossing a climate-controlled link into the lobby.",
    "In Emaar's plan, the office towers frame Dubai Square on every side. Emaar describes Dubai Square as a mall that extends into the city, with shopping, dining, entertainment, hospitality, residences and offices all woven into one living district.",
    "In Emaar's plan, four hotels stand around Dubai Square itself, and eight across the masterplan (Emaar's release does not name them). Three park \"hearts\" sit inside the business district, part of 15 parks across the masterplan.",
    "Emaar says the new Dubai Creek Tower, envisioned as an iconic global landmark, will give the business district a defining presence on the world stage.",
  ],
  note: "This is a plan Emaar has announced. Emaar has not published prices, rents, a launch date or a completion date.",
  image: { base: "/img/business-district/1", caption: "Street level in the planned Dubai Square Business District, with the metro line overhead — render (Emaar, 2026 announcement)", w: 1881, h: 1050, widths: [480, 960, 1600] } satisfies ProjectImage,
};
