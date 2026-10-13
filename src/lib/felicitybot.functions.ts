/**
 * FelicityBot's server side. The visitor's browser sends the visible
 * conversation (plain text turns); this function adds the cached system prompt
 * (rules + knowledge rendered from the site's data files), calls Claude, and
 * runs the one tool it has: passing an interested visitor's details to the
 * broker through the same enquiry pipeline as the form.
 *
 * Earlier turns are replayed as plain text, without the model's thinking
 * blocks. Removing every thinking block is allowed (they may only be removed
 * from the front), so the history check never sees an edited block; within one
 * request the tool loop appends the model's own content unchanged.
 *
 * Switched on by ANTHROPIC_API_KEY in Vercel; FELICITYBOT_MODEL picks the model
 * (default claude-opus-5-5). Without a key the widget offers WhatsApp instead.
 * Nothing the visitor types is stored unless they ask to be contacted.
 */
import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";
import Anthropic from "@anthropic-ai/sdk";
import { FELICITYBOT_SYSTEM, SAVE_ENQUIRY_TOOL, supportsFallback, supportsSystemMessages } from "@/lib/felicitybot.knowledge";
import { PROJECT_OPTIONS, normalisePhone, recordEnquiry } from "@/lib/enquiries.functions";
import { PROJECTS } from "@/data/projects";
import { projectLabel } from "@/lib/format";
import { BOT_LIMITS, cleanTurns, type BotInput, type BotResult } from "@/lib/felicitybot.shared";

export type { BotTurn, BotInput, BotResult } from "@/lib/felicitybot.shared";

const DEFAULT_MODEL = "claude-opus-5-5";

/* Per-instance limits. Serverless instances are short-lived, so this is a brake, not a wall;
   the real ceiling is the monthly spend limit set in the Anthropic console. */
const WINDOW_MS = 10 * 60_000;
const PER_IP = 20;
const PER_INSTANCE = 300;
const hits = new Map<string, number[]>();
const saves = new Map<string, number[]>();
let instanceHits: number[] = [];
function allow(map: Map<string, number[]>, key: string, limit: number, now: number): boolean {
  const recent = (map.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= limit) { map.set(key, recent); return false; }
  recent.push(now); map.set(key, recent);
  if (map.size > 5000) map.clear();
  return true;
}

type SaveInput = { name?: unknown; phone?: unknown; email?: unknown; project?: unknown; request?: unknown; consent_to_contact?: unknown };
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

async function runSaveEnquiry(input: SaveInput, page: string, ip: string): Promise<{ text: string; isError: boolean; saved: boolean }> {
  if (input.consent_to_contact !== true) return { text: "Not saved: the visitor has not agreed to be contacted. Ask them first.", isError: true, saved: false };
  if (!allow(saves, ip, 3, Date.now())) return { text: "Not saved: too many requests from this visitor. Give them the WhatsApp number and email instead.", isError: true, saved: false };
  const projectText = str(input.project, 120);
  const named = PROJECTS.find((p) => projectText && (projectLabel(p).toLowerCase() === projectText.toLowerCase() || p.name.toLowerCase() === projectText.toLowerCase()));
  const project = named ? projectLabel(named) : null;
  const request = str(input.request, 1500);
  const result = await recordEnquiry({
    name: str(input.name, 120),
    phone: normalisePhone(str(input.phone, 40)),
    email: str(input.email, 200) || null,
    country: null, language: null,
    project: project && PROJECT_OPTIONS.includes(project) ? project : null,
    looking_for: null, buy_as: null, bedrooms: null, budget: null, timing: null, funding: null,
    message: `[Via FelicityBot] ${request}${projectText && !project ? ` (project mentioned: ${projectText})` : ""}`.slice(0, 2000),
    page: `FelicityBot · ${page}`.slice(0, 200),
  });
  if (result.ok) return { text: "Saved. The broker has the details and will contact the visitor.", isError: false, saved: true };
  if (result.reason === "invalid") return { text: `Not saved: ${result.message} Ask the visitor to correct it.`, isError: true, saved: false };
  return { text: "Not saved: the enquiry system is offline. Give the visitor the WhatsApp number and email instead.", isError: true, saved: false };
}

const FALLBACK_REPLY = "I can't help with that here. For anything about Dubai Creek Harbour, ask me another question or message the broker on WhatsApp.";

export const askFelicityBot = createServerFn({ method: "POST" })
  .validator((d: unknown) => (d && typeof d === "object" ? d : {}) as BotInput)
  .handler(async ({ data }): Promise<BotResult> => {
    if (typeof data.hp === "string" && data.hp.trim()) return { ok: false, reason: "invalid" }; // spam trap
    const turns = cleanTurns(data.turns);
    if (!turns) return { ok: false, reason: "invalid" };
    const page = typeof data.page === "string" && /^\/[\w\-/]*$/.test(data.page) ? data.page.slice(0, 120) : "/";

    const apiKey = process.env["ANTHROPIC_API_KEY"];
    if (!apiKey) return { ok: false, reason: "offline" };

    let ip = "unknown";
    try { ip = getRequestIP({ xForwardedFor: true }) ?? "unknown"; } catch { /* not behind a request */ }
    const now = Date.now();
    instanceHits = instanceHits.filter((t) => now - t < WINDOW_MS);
    if (instanceHits.length >= PER_INSTANCE || !allow(hits, ip, PER_IP, now)) return { ok: false, reason: "busy" };
    instanceHits.push(now);

    const model = process.env["FELICITYBOT_MODEL"] || DEFAULT_MODEL;
    const client = new Anthropic({ apiKey, maxRetries: 1, timeout: 45_000 });
    const today = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dubai", day: "numeric", month: "long", year: "numeric" }).format(new Date());
    const context = `Context: the visitor is on the page ${page} of dxbdubaicreekharbour.ae. Today is ${today} in Dubai.`;
    const messages: Anthropic.Beta.BetaMessageParam[] = turns.map((t) => ({ role: t.role, content: t.text }));
    // Operator context after the visitor's latest message (outside the cached prefix). Models without
    // mid-conversation system messages get it as a tagged block ahead of the question instead.
    if (supportsSystemMessages(model)) messages.push({ role: "system", content: context });
    else messages[messages.length - 1] = { role: "user", content: [{ type: "text", text: `<site_context>${context}</site_context>` }, { type: "text", text: turns[turns.length - 1]!.text }] };

    let saved = false;
    try {
      for (let round = 0; round < 3; round++) {
        const response = await client.beta.messages.create({
          model,
          max_tokens: 3000,
          system: [{ type: "text", text: FELICITYBOT_SYSTEM, cache_control: { type: "ephemeral" } }],
          messages,
          tools: [SAVE_ENQUIRY_TOOL],
          output_config: { effort: "low" },
          ...(supportsFallback(model) ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
        });
        if (response.stop_reason === "refusal") return { ok: true, reply: FALLBACK_REPLY, saved };
        if (response.stop_reason === "tool_use") {
          messages.push({ role: "assistant", content: response.content });
          const results: Anthropic.Beta.BetaToolResultBlockParam[] = [];
          for (const block of response.content) {
            if (block.type !== "tool_use") continue;
            const outcome = block.name === "save_enquiry"
              ? await runSaveEnquiry(block.input as SaveInput, page, ip)
              : { text: "Unknown tool.", isError: true, saved: false };
            saved = saved || outcome.saved;
            results.push({ type: "tool_result", tool_use_id: block.id, content: outcome.text, is_error: outcome.isError });
          }
          messages.push({ role: "user", content: results });
          continue;
        }
        const reply = response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("\n").trim();
        return { ok: true, reply: (reply || FALLBACK_REPLY).slice(0, BOT_LIMITS.maxAssistantChars), saved };
      }
      return { ok: true, reply: FALLBACK_REPLY, saved };
    } catch (err) {
      if (err instanceof Anthropic.RateLimitError) { console.warn("FelicityBot: rate limited by the API"); return { ok: false, reason: "busy" }; }
      if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) { console.error("FelicityBot: API key rejected — check ANTHROPIC_API_KEY in Vercel"); return { ok: false, reason: "offline" }; }
      if (err instanceof Anthropic.APIError) { console.error("FelicityBot: API error", err.status, err.message.slice(0, 300)); return { ok: false, reason: "offline" }; }
      console.error("FelicityBot: request failed", err instanceof Error ? err.message.slice(0, 300) : String(err));
      return { ok: false, reason: "offline" };
    }
  });
