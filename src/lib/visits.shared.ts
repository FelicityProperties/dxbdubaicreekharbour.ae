/** Visitor numbers: what the browser reports and what /leads shows (no server code here). */

/** One visit as the browser reports it when the visitor leaves or switches away (sent again with the totals so far). */
export type VisitReport = {
  id: string;        // random, made in the visitor's tab; ties the reports of one visit together
  pages: string[];   // site pages opened, in order of first opening
  views: number;     // pages opened, counting repeats
  seconds: number;   // time the site was on screen and in use
  ref: string;       // the referring site's address when the visit began ("" if none)
  src: string;       // the utm_source tag of the first page, if any
};

export const VISIT_LIMITS = { maxPages: 40, maxViews: 500, maxSeconds: 4 * 3600 } as const;

/** Visits of at least this many seconds count as "stayed". */
export const STAYED_SECONDS = 30;

export type Ranked = { name: string; visits: number };
export type VisitStats = {
  days: number;
  from: string; // Dubai dates, inclusive
  to: string;
  visitors: number;
  visits: number;
  pageViews: number;
  stayed: number;          // visits of STAYED_SECONDS or more
  medianSeconds: number;   // typical visit length
  enquiries: number;
  previous: { visitors: number; visits: number }; // the same number of days just before
  daily: { day: string; visitors: number; visits: number; stayed: number }[];
  pages: Ranked[];
  sources: Ranked[];
  countries: Ranked[];
  devices: Ranked[];
};
export type VisitStatsResult = { status: "ok"; stats: VisitStats } | { status: "not-configured" | "wrong-password" | "offline" };

const VISIT_ID = /^[A-Za-z0-9-]{16,40}$/;
const clampInt = (v: unknown, max: number) => (typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.min(max, Math.round(v))) : 0);

/** The report as the browser sent it, or null if it isn't one we accept. */
export function cleanReport(raw: unknown, isPage: (path: unknown) => string | null): VisitReport | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r["id"] !== "string" || !VISIT_ID.test(r["id"]) || !Array.isArray(r["pages"])) return null;
  const pages: string[] = [];
  for (const p of r["pages"].slice(0, VISIT_LIMITS.maxPages)) {
    const path = isPage(p);
    if (path && !pages.includes(path)) pages.push(path);
  }
  if (!pages.length) return null;
  return {
    id: r["id"],
    pages,
    views: Math.max(pages.length, clampInt(r["views"], VISIT_LIMITS.maxViews)),
    seconds: clampInt(r["seconds"], VISIT_LIMITS.maxSeconds),
    ref: typeof r["ref"] === "string" ? r["ref"].slice(0, 300) : "",
    src: typeof r["src"] === "string" ? r["src"].toLowerCase().replace(/[^a-z0-9 ._-]/g, "").slice(0, 40) : "",
  };
}

const SOURCES: [RegExp, string][] = [
  [/(^|\.)google\./, "Google"], [/(^|\.)bing\.com$/, "Bing"], [/(^|\.)(duckduckgo|yahoo|yandex|ecosia)\./, "Other search"],
  [/(^|\.)instagram\.com$/, "Instagram"], [/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, "Facebook"], [/(^|\.)(linkedin\.com|lnkd\.in)$/, "LinkedIn"],
  [/(^|\.)(t\.co|twitter\.com|x\.com)$/, "X (Twitter)"], [/(^|\.)(youtube\.com|youtu\.be)$/, "YouTube"], [/(^|\.)tiktok\.com$/, "TikTok"],
  [/(^|\.)(whatsapp\.com|wa\.me)$/, "WhatsApp"], [/(^|\.)snapchat\.com$/, "Snapchat"], [/(^|\.)propertyfinder\./, "Property Finder"],
  [/(^|\.)bayut\.com$/, "Bayut"], [/(^|\.)dubizzle\./, "Dubizzle"], [/(^|\.)(chatgpt\.com|openai\.com)$/, "ChatGPT"],
  [/(^|\.)perplexity\.ai$/, "Perplexity"], [/(^|\.)felicitypro\.com$/, "felicitypro.com"],
];
const TAGS: Record<string, string> = { ig: "Instagram", instagram: "Instagram", fb: "Facebook", facebook: "Facebook", meta: "Facebook", google: "Google", linkedin: "LinkedIn", whatsapp: "WhatsApp", wa: "WhatsApp", tiktok: "TikTok", youtube: "YouTube", email: "Email", newsletter: "Email" };

/** Where a visit came from, in words: a campaign tag wins over the referring site. */
export function sourceName(ref: string, src: string, ownHost: string): string {
  if (src) return TAGS[src] ?? src.charAt(0).toUpperCase() + src.slice(1);
  let host = "";
  try { host = new URL(ref).hostname.toLowerCase().replace(/^www\./, ""); } catch { return "Direct"; }
  if (!host || host === ownHost || host.endsWith(`.${ownHost}`)) return "Direct";
  for (const [re, name] of SOURCES) if (re.test(host)) return name;
  return host;
}

/** Phone, tablet or computer, from the browser's description of itself. */
export function deviceName(userAgent: string): string {
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(userAgent)) return "Tablet";
  if (/Mobi|iPhone|iPod|Android/i.test(userAgent)) return "Phone";
  return "Computer";
}

/** Crawlers, link previews and scripts: not people. */
export const isRobot = (userAgent: string) => !userAgent || /bot|crawl|spider|slurp|headless|lighthouse|pingdom|uptime|monitor|preview|facebookexternalhit|whatsapp|curl|wget|python|axios|node-fetch|go-http|java\/|httpclient|scrapy|phantom|selenium|playwright|puppeteer/i.test(userAgent);
