/**
 * /llms.txt: the site described for AI assistants (the llmstxt.org format), in English Markdown. The format's shape:
 * the H1, the summary as a blockquote, free text with no headings, then H2 sections that are lists of links
 * ("- [name](url): notes"), one link per line.
 *
 * It is built from the data files on every request, so it never falls behind a data refresh, and it says only what
 * the pages say: the wording comes from the same helpers (statusLabel, priceSummary, handoverText, bedroomsLabel),
 * the market figures are the market page's, and a by-bedroom median is quoted only from five registrations or more, and
 * the same rules hold (AGENTS.md): figures from Emaar or the Dubai Land Department, each with its date; no other
 * source named; no link to Emaar's website.
 */
import { COSTS, PROJECTS, SITE, type Project, type Status } from "@/data/projects";
import { BUSINESS_DISTRICT as BD } from "@/data/business-district";
import { TX, LATEST_ROW } from "@/data/transactions";
import { aed, dateLong, num, projectLabel } from "@/lib/format";
import { pageUrl } from "@/lib/seo";
import { bedroomsLabel, handoverText, priceSummary, statusLabel } from "@/components/showcase/shared";

/** A name as Markdown link text: one line, brackets escaped. */
const linkText = (s: string) => s.replace(/\s+/g, " ").trim().replace(/[[\]\\]/g, "\\$&");
const count = (n: number, one: string, many: string) => `${num(n)} ${n === 1 ? one : many}`;
/** Studio first, then by number of bedrooms. */
const bedOrder = (b: string) => (b === "Studio" ? 0 : Number(/^(\d+)/.exec(b)?.[1] ?? 50));
/** The fewest registrations a by-bedroom median is quoted from (the market page drops a sales row under five). */
const MIN_ROWS = 5;

/** The project list's own groups, in its order (ProjectCollection): what each status means is the FAQ's wording. */
const GROUPS: { status: Status; heading: string }[] = [
  { status: "Now selling", heading: "Now selling from Emaar" },
  { status: "Resale", heading: "Resale, under construction" },
  { status: "Ready", heading: "Ready, resale" },
];

/**
 * One project as a link line: its status, the homes, the quarter, the price as the site words it (with what it is
 * and its date), the plan and the handover. The handover line is left out where the status already says it: a
 * completed building ("Ready · …"), "Resale · under construction", "New launch".
 */
function projectLine(p: Project): string {
  const price = priceSummary(p);
  const status = statusLabel(p);
  const when = handoverText(p);
  const facts = [
    status,
    bedroomsLabel(p),
    p.district,
    `${price.main}${price.note ? ` (${price.note})` : ""}`,
    p.paymentPlan && `${p.paymentPlan.steps.map((s) => s.percent).join("/")} payment plan`,
    p.construction !== "completed" && !status.toLowerCase().includes(when.toLowerCase()) && when,
  ].filter(Boolean);
  return `- [${linkText(projectLabel(p))}](${pageUrl(`/projects/${p.slug}`)}): ${facts.join("; ")}`;
}

/** The 12-month registered figures the market page shows (apartments): ready and off-plan, then by bedroom. */
function marketLines(): string[] {
  const beds = Array.from(new Set(TX.summary.salesByBedroom.map((r) => r.bedrooms))).sort((a, b) => bedOrder(a) - bedOrder(b));
  const cell = (basis: "ready" | "offplan", b: string) => TX.summary.salesByBedroom.find((r) => r.basis === basis && r.bedrooms === b);
  const side = (label: string, r: ReturnType<typeof cell>) => (r && r.count >= MIN_ROWS ? `${label} ${count(r.count, "sale", "sales")}, median ${aed(r.medianPrice)}` : null);
  const bedSales = beds
    .map((b) => [b, [side("ready", cell("ready", b)), side("off-plan", cell("offplan", b))].filter(Boolean).join("; ")] as const)
    .filter(([, sides]) => sides)
    .map(([b, sides]) => `${b}: ${sides}`);
  const rents = TX.summary.rentalsByBedroom
    .filter((r) => r.count >= MIN_ROWS)
    .sort((a, b) => bedOrder(a.bedrooms) - bedOrder(b.bedrooms))
    .map((r) => `${r.bedrooms}: ${count(r.count, "contract", "contracts")}, median ${aed(r.medianRent)} a year`);
  const list = (label: string, items: string[]) => (items.length ? [`- ${label}: ${items.join(". ")}.`] : []);
  return [
    ...TX.summary.sales.map((s) => `- ${s.basis === "ready" ? "Ready" : "Off-plan"} apartments: ${count(s.count, "registered sale", "registered sales")}, median ${num(s.medianPsf)} AED per sq ft, median price ${aed(s.medianPrice)}.`),
    ...list("Apartment sales by bedroom (median registered price)", bedSales),
    ...list("Apartment rents by bedroom (registered tenancy contracts, new and renewed; annual rent)", rents),
  ];
}

/** /llms.txt: the H1, the summary, plain facts with their sources and dates, then sections of links. */
export function llmsText(): string {
  const n = PROJECTS.length;
  const of = (status: Status) => PROJECTS.filter((p) => p.status === status);
  const plans = PROJECTS.filter((p) => p.paymentPlan).length;
  return [
    `# ${SITE.name}`,
    "",
    `> An independent showcase of Emaar's residential projects in Dubai Creek Harbour, Dubai: all ${n} projects side by side. Each project page gives Emaar's published prices, payment plan and handover date, together with the sales and rents registered with the Dubai Land Department (DLD). Run by ${SITE.company}, a RERA-licensed real-estate brokerage in Dubai (RERA ORN ${SITE.reraOrn}). In English, Arabic and Chinese.`,
    "",
    "**What the site holds, and where each figure comes from**",
    "",
    `- ${n} Emaar projects in Dubai Creek Harbour: ${of("Now selling").length} now selling, ${of("Resale").length} resale under construction and ${of("Ready").length} ready. Now selling means Emaar listed units for sale on its website when the site last checked, or is registering interest for a launch. Resale means Dubai Land Department records show construction under way and Emaar listed no units, so a buyer takes over an owner's contract and payment plan. Ready means the records show the building completed and Emaar lists no units, so a buyer buys from an owner.`,
    `- Prices, sizes, payment plans and handover dates are Emaar's own published figures, checked on ${SITE.pricesCheckedOn}. They can change, and where Emaar publishes no figure the site says "on request" rather than estimate one.`,
    `- Sales and rents are Dubai Land Department registration records. The 12-month summaries cover the ${TX.window.label}; the latest individual registrations run to ${dateLong(LATEST_ROW)}. They are registered transactions, not valuations or forecasts.`,
    `- The site is independent: it is not owned, operated or endorsed by Emaar, which has given ${SITE.company} its no-objection certificate (dated ${SITE.emaarNoc}) to market these projects.`,
    `- To ask about a project, today's availability or a viewing: WhatsApp ${SITE.whatsappDisplay} or ${SITE.email}. ${SITE.company} (${SITE.licence}), ${SITE.address}.`,
    "",
    `**Registered apartment sales and rents in Dubai Creek Harbour, ${TX.window.label} (Dubai Land Department)**`,
    "",
    ...marketLines(),
    "",
    `**Coming: ${BD.name} (Emaar's announcement of ${dateLong(BD.announced)})**`,
    "",
    BD.intro,
    "",
    `- Figures Emaar gives: ${BD.facts.map((f) => `${f.label}: ${f.value}`).join("; ")}.`,
    ...BD.points.map((p) => `- ${p}`),
    `- ${BD.note}`,
    "",
    `**${COSTS.title}**`,
    "",
    COSTS.note,
    "",
    ...COSTS.items.map((c) => `- ${c.label}: ${c.value}. ${c.detail}`),
    "",
    "## Main pages",
    "",
    `- [All ${n} Emaar projects](${pageUrl("/projects")}): every project compared: status, starting prices, bedrooms, sizes, handover dates and payment plans, with filters.`,
    `- [Payment plans](${pageUrl("/payment-plans")}): Emaar's published payment plans for ${plans} projects: the booking, construction and handover split, and every dated instalment.`,
    `- [Sales and rents (DLD records)](${pageUrl("/market")}): recent ready and off-plan sales and tenancy contracts as registered with the Dubai Land Department, by bedroom and by building.`,
    `- [Area guide](${pageUrl("/area")}): Dubai Creek Harbour quarter by quarter: Creek Island, Creek Beach and Green Gate, the marina, Central Park, Ras Al Khor and the Blue Line metro.`,
    `- [${BD.name}](${pageUrl("/area")}#business-district): the office district Emaar has announced beside Dubai Square, with the figures from its announcement.`,
    `- [Buying guide and FAQ](${pageUrl("/guide")}): how to buy an Emaar home in Dubai Creek Harbour, new or resale: the steps, fees on top of the price, mortgages, Golden Visa, escrow and renting out.`,
    ...GROUPS.flatMap((g) => (of(g.status).length ? ["", `## ${g.heading}`, "", ...of(g.status).map(projectLine)] : [])),
    "",
    "## Languages",
    "",
    `- [Arabic](${pageUrl("/", "ar")}): every page is also in Arabic, under ${pageUrl("/", "ar")} (for example ${pageUrl("/projects", "ar")}).`,
    `- [Chinese](${pageUrl("/", "zh")}): every page is also in Simplified Chinese, under ${pageUrl("/", "zh")} (for example ${pageUrl("/projects", "zh")}).`,
    "",
    "## Optional",
    "",
    `- [Terms of use](${pageUrl("/terms")}): what the figures are, and what they are not.`,
    `- [Privacy notice](${pageUrl("/privacy")}): what the site collects when you enquire.`,
    "",
  ].join("\n");
}

/** The response for /llms.txt. Only the bare address answers: /ar/llms.txt and /zh/llms.txt are not pages. */
export function llmsResponse(request: Request): Response {
  const type = { "content-type": "text/plain; charset=utf-8" };
  if (new URL(request.url).pathname !== "/llms.txt") return new Response("Not found", { status: 404, headers: type });
  return new Response(llmsText(), { headers: { ...type, "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" } });
}
