/**
 * Everything the site says about itself, in one place.
 *
 * No operator is named yet. When one is, add the name and contact details
 * here (and a RERA ORN if it is a brokerage advertising property) and print
 * them in the footer and the privacy notice.
 */
export const SITE = {
  url: "https://dxbdubaicreekharbour.ae",
  name: "DXB Creek Harbour",
  tagline: "An independent buyer's guide to Dubai Creek Harbour",
} as const;

/**
 * Printed in the footer and repeated in the FAQ. The domain names the
 * district, so a visitor could take this for the developer's own site; this
 * sentence is what stops that. Do not shorten it away.
 */
export const INDEPENDENCE =
  "DXB Creek Harbour is an independent website. It is not the official Dubai Creek Harbour website and is not affiliated with, endorsed by or operated by Emaar Properties or any developer.";

/*
 * District copy. Qualitative on purpose: no prices, price per square foot,
 * yields, rents or transaction counts. Numbers on a page go stale silently;
 * buyers get current figures when someone answers their enquiry.
 */
export const DISTRICT = {
  overview:
    "Emaar's master-planned waterfront district on Dubai Creek, facing the Ras Al Khor wildlife sanctuary. It is planned around Dubai Creek Tower, with modern towers, wide promenades and one of the strongest master-plan stories in the city outside Downtown.",
  officialArea:
    "In Dubai Land Department records most of the district is registered under the area name Al Khairan First. Worth knowing when you look up past sales: searching \"Dubai Creek Harbour\" alone can miss deals.",
  living: [
    {
      title: "Creek Beach",
      body: "A family lagoon beach inside the district — swimming, cafés and a lawn, a walk from most towers.",
    },
    {
      title: "Creek Marina",
      body: "A yacht harbour with ferry links on the water, and promenade dining along the edge.",
    },
    {
      title: "The sanctuary on the doorstep",
      body: "Ras Al Khor's flamingo reserve sits across the water; the Viewing Point looks straight over it.",
    },
    {
      title: "Hotels and branded living",
      body: "Vida and Address hotels in the district, with branded residences such as Palace and Vida Residences.",
    },
  ],
  gettingAround: [
    { to: "Downtown Dubai", time: "about 15 minutes" },
    { to: "DXB airport", time: "about 15 minutes" },
    { to: "Dubai Marina", time: "about 25 minutes" },
  ],
  roads:
    "Ras Al Khor Road and Nad Al Hamar Road give direct access, and the internal boulevard grid on Creek Island is complete.",
  pipeline: [
    {
      title: "Dubai Metro Blue Line",
      body: "Under construction, with a Creek interchange station planned to anchor the district. The current target is around 2029.",
    },
    {
      title: "Dubai Creek Tower",
      body: "Redesigned and relaunched by Emaar. The timeline still has to be proven, so don't pay for it in today's price.",
    },
    {
      title: "Creek Marina Phase 2 and new island districts",
      body: "Further waterfront phases and a planned retail heart are still to come.",
    },
  ],
  landmarks: [
    "Creek Gate",
    "Harbour Views",
    "Address Harbour Point",
    "The Cove",
    "Creek Edge",
    "Palace Residences",
    "Vida Residences",
  ],
  suits: [
    {
      who: "Buying a home to live in",
      body: "New-build waterfront calm, close to the airport and Downtown. Expect some construction around you for a few more years as phases complete.",
    },
    {
      who: "Buying to invest",
      body: "Positioning ahead of the Blue Line and later phases, behind a strong master developer. A patient hold rather than a quick flip.",
    },
  ],
} as const;

/** The buyer's checklist on the home page — what to settle before an offer. */
export const BUYING_STEPS = [
  {
    title: "Pick the building, not just the district",
    body: "Towers differ on view (creek, sanctuary, Downtown skyline or another tower), handover date and service charges. Two flats of the same size can be far apart in value.",
  },
  {
    title: "Check what actually sold",
    body: "Asking prices on portals are wishes. Registered sales for the same building and size are what a bank valuer and a seller's agent will look at.",
  },
  {
    title: "Ready or off-plan",
    body: "Ready means you can move in or rent it out now. Off-plan resale can mean a lower entry and a payment plan, but you take on the handover date and the developer's transfer rules.",
  },
  {
    title: "Line up the money first",
    body: "Cash or mortgage, get it settled before you offer. A mortgage pre-approval makes a seller take you seriously and tells you what you can actually spend.",
  },
] as const;

export const BUY_AS = ["A home to live in", "An investment", "Both / not sure"] as const;
export const BEDROOMS = ["Studio", "1 bedroom", "2 bedrooms", "3 bedrooms", "4+ bedrooms", "Not sure"] as const;
export const BUDGETS = ["Under AED 1.5M", "AED 1.5M – 3M", "AED 3M – 5M", "AED 5M+", "Prefer not to say"] as const;
export const TIMINGS = ["Ready to buy now", "Within 3 months", "3 – 12 months", "Just researching"] as const;
export const FUNDING = ["Cash", "Mortgage", "Not sure yet"] as const;
