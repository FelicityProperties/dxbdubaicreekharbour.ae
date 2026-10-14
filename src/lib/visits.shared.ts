/** Visitor numbers: what the browser reports and what /leads shows (no server code here). */

/** One visit as the browser reports it when the visitor leaves or switches away (sent again with the totals so far). */
export type VisitReport = {
  id: string;        // random, made in the visitor's tab; ties the reports of one visit together
  pages: string[];   // site pages opened, in order of first opening
  views: number;     // pages opened, counting repeats
  seconds: number;   // time the site was on screen and in use
  ref: string;       // the referring site's address when the visit began ("" if none)
  src: string;       // the utm_source tag of the first page, if any
  touch?: boolean;   // a touch screen (tells iPads, which describe themselves as Macs, from computers)
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
  enquiries: number | null; // null when they couldn't be read
  previous: { visitors: number; visits: number } | null; // the same stretch of time just before; null before tracking covered it
  daily: { day: string; visitors: number; visits: number; stayed: number }[];
  pages: Ranked[];
  sources: Ranked[];
  countries: Ranked[];
  devices: Ranked[];
};
export type VisitStatsResult = { status: "ok"; stats: VisitStats; emailAlerts: boolean } | { status: "not-configured" | "wrong-password" | "offline" };

/** Average visits a day above which the shared free database's monthly allowance gets tight (see VERCEL-LAYER.md). */
export const BUSY_VISITS_PER_DAY = 120;

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
    touch: r["touch"] === true,
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
const TAGS: Record<string, string> = {
  ig: "Instagram", instagram: "Instagram", "instagram.com": "Instagram", fb: "Facebook", facebook: "Facebook", "facebook.com": "Facebook", meta: "Facebook",
  google: "Google", linkedin: "LinkedIn", "linkedin.com": "LinkedIn", whatsapp: "WhatsApp", wa: "WhatsApp", tiktok: "TikTok", youtube: "YouTube",
  email: "Email", newsletter: "Email", chatgpt: "ChatGPT", "chatgpt.com": "ChatGPT", openai: "ChatGPT", perplexity: "Perplexity", "perplexity.ai": "Perplexity",
  propertyfinder: "Property Finder", bayut: "Bayut",
};
/** Android apps that report themselves as the referrer ("android-app://com.whatsapp/"). */
const APPS: Record<string, string> = { "com.whatsapp": "WhatsApp", "com.whatsapp.w4b": "WhatsApp", "com.instagram.android": "Instagram", "com.facebook.katana": "Facebook", "com.linkedin.android": "LinkedIn", "com.google.android.gm": "Email", "com.google.android.googlequicksearchbox": "Google" };

/** Where a visit came from, in words: a campaign tag wins over the referring site. */
export function sourceName(ref: string, src: string, ownHost: string): string {
  if (src) return Object.hasOwn(TAGS, src) ? TAGS[src]! : src.charAt(0).toUpperCase() + src.slice(1);
  let host = "";
  try { host = new URL(ref).hostname.toLowerCase().replace(/^www\./, ""); } catch { return "Direct"; }
  if (ref.startsWith("android-app://")) return Object.hasOwn(APPS, host) ? APPS[host]! : "Other app";
  if (!host || host === ownHost || host.endsWith(`.${ownHost}`)) return "Direct";
  for (const [re, name] of SOURCES) if (re.test(host)) return name;
  return host;
}

/** Phone, tablet or computer, from the browser's description of itself (an iPad says "Macintosh" but has a touch screen). */
export function deviceName(userAgent: string, touch = false): string {
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(userAgent) || (touch && /Macintosh/.test(userAgent))) return "Tablet";
  if (/Mobi|iPhone|iPod|Android/i.test(userAgent)) return "Phone";
  return "Computer";
}

/** Crawlers, link previews and scripts: not people. */
export const isRobot = (userAgent: string) => !userAgent || /bot|crawl|spider|slurp|headless|lighthouse|pingdom|uptime|monitor|preview|facebookexternalhit|whatsapp|curl|wget|python|axios|node-fetch|go-http|java\/|httpclient|scrapy|phantom|selenium|playwright|puppeteer/i.test(userAgent);
