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
 * request the tool loop appends the model's own content unchanged (apart from
 * what the fallback rules say to leave out after a mid-output fallback).
 * Each reply is signed, and only signed replies are accepted back as the
 * bot's side of the conversation, so a visitor cannot script the bot's turns.
 *
 * Switched on by ANTHROPIC_API_KEY in Vercel; FELICITYBOT_MODEL picks the model
 * (default claude-opus-5-5). Without a key the widget offers WhatsApp instead.
 * Nothing the visitor types is stored unless they ask to be contacted.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";
import Anthropic from "@anthropic-ai/sdk";
import { FELICITYBOT_SYSTEM, SAVE_ENQUIRY_TOOL, supportsFallback, supportsSystemMessages } from "@/lib/felicitybot.knowledge";
import { PROJECT_OPTIONS, bumpCounters, enquiryProblem, normalisePhone, recordEnquiry, type EnquiryRecord } from "@/lib/enquiries.functions";
import { PROJECTS, SITE } from "@/data/projects";
import { projectLabel } from "@/lib/format";
import { BOT_LIMITS, cleanTurns, clip, type BotInput, type BotResult, type BotTurn } from "@/lib/felicitybot.shared";

export type { BotTurn, BotInput, BotResult } from "@/lib/felicitybot.shared";

const DEFAULT_MODEL = "claude-opus-5-5";
/* Vercel stops the function at 60 s (vite.config.ts); model calls must finish well inside that,
   leaving room for saving an enquiry and answering. */
const DEADLINE_MS = 50_000;
const MIN_CALL_MS = 8_000;
const MAX_ROUNDS = 3;

/* Brakes. The per-visitor count lives in this server instance's memory; the site-wide hourly and
   daily counts live in the database so they hold across instances. The hard ceiling on spend is
   the monthly limit set in the Anthropic console. */
const WINDOW_MS = 10 * 60_000;
const PER_IP = 20;
const SAVES_PER_IP = 3;
const hits = new Map<string, number[]>();
const saves = new Map<string, number[]>();
function allow(map: Map<string, number[]>, key: string, limit: number, now: number): boolean {
  const recent = (map.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= limit) { map.set(key, recent); return false; }
  recent.push(now); map.set(key, recent);
  if (map.size > 5000) map.clear();
  return true;
}
const envLimit = (name: string, fallback: number) => {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};
async function withinSiteLimits(now: Date): Promise<boolean> {
  const hour = `felicitybot:h:${now.toISOString().slice(0, 13)}`;
  const day = `felicitybot:d:${now.toISOString().slice(0, 10)}`;
  const counts = await bumpCounters([hour, day]);
  if (!counts) return true; // no database: the per-visitor brake and the console limit still apply
  const ok = (counts[hour] ?? 0) <= envLimit("FELICITYBOT_HOURLY_LIMIT", 120) && (counts[day] ?? 0) <= envLimit("FELICITYBOT_DAILY_LIMIT", 600);
  if (!ok) console.warn("FelicityBot: site-wide question limit reached", counts);
  return ok;
}

/* Replies are signed with a key derived from the API key, so they verify across instances
   and stop verifying (and the chat restarts) if the key is rotated. */
const signer = (apiKey: string) => createHmac("sha256", apiKey).update("felicitybot-reply-signature-v1").digest();
const sign = (key: Buffer, text: string) => createHmac("sha256", key).update(text).digest("base64url");
function signedHistory(turns: BotTurn[], key: Buffer): boolean {
  return turns.every((t) => {
    if (t.role !== "assistant") return true;
    const want = Buffer.from(sign(key, t.text));
    const got = Buffer.from(t.sig ?? "");
    return got.length === want.length && timingSafeEqual(got, want);
  });
}

/** Pages the visitor can be on; anything else (a made-up URL) is reported as the home page. */
const PAGES = new Set(["/", "/projects", "/payment-plans", "/market", "/area", "/guide", "/terms", "/privacy", ...PROJECTS.map((p) => `/projects/${p.slug}`)]);
function pageOf(raw: unknown): string {
  if (typeof raw !== "string") return "/";
  const path = raw.length > 1 ? raw.replace(/\/+$/, "") : raw;
  return PAGES.has(path) ? path : "/";
}

type SaveInput = { name?: unknown; phone?: unknown; email?: unknown; project?: unknown; request?: unknown; consent_to_contact?: unknown };
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

async function runSaveEnquiry(input: SaveInput, page: string, ip: string): Promise<{ text: string; isError: boolean; saved: boolean }> {
  if (input.consent_to_contact !== true) return { text: "Not saved: the visitor has not agreed to be contacted. Ask them first.", isError: true, saved: false };
  const projectText = str(input.project, 120);
  const named = PROJECTS.find((p) => projectText && (projectLabel(p).toLowerCase() === projectText.toLowerCase() || p.name.toLowerCase() === projectText.toLowerCase()));
  const project = named ? projectLabel(named) : null;
  const request = str(input.request, 1500);
  const row: EnquiryRecord = {
    name: str(input.name, 120),
    phone: normalisePhone(str(input.phone, 40)),
    email: str(input.email, 200) || null,
    country: null, language: null,
    project: project && PROJECT_OPTIONS.includes(project) ? project : null,
    looking_for: null, buy_as: null, bedrooms: null, budget: null, timing: null, funding: null,
    message: `[Via FelicityBot] ${request}${projectText && !project ? ` (project mentioned: ${projectText})` : ""}`.slice(0, 2000),
    page: `FelicityBot · ${page}`.slice(0, 200),
  };
  // A detail the visitor needs to correct doesn't use up one of their saves.
  const problem = enquiryProblem(row);
  if (problem) return { text: `Not saved: ${problem} Ask the visitor to correct it.`, isError: true, saved: false };
  if (!allow(saves, ip, SAVES_PER_IP, Date.now())) return { text: "Not saved: too many requests from this visitor. Give them the WhatsApp number and email instead.", isError: true, saved: false };
  const result = await recordEnquiry(row);
  if (result.ok) return { text: "Saved. The broker has the details and will contact the visitor.", isError: false, saved: true };
  if (result.reason === "invalid") return { text: `Not saved: ${result.message} Ask the visitor to correct it.`, isError: true, saved: false };
  return { text: "Not saved: the enquiry system is offline. Give the visitor the WhatsApp number and email instead.", isError: true, saved: false };
}

const FALLBACK_REPLY = `I can't help with that here. Ask me about Dubai Creek Harbour, or message the broker on WhatsApp at ${SITE.whatsappDisplay}.`;
const SAVED_REPLY = `Thank you, your details are with ${SITE.broker} at ${SITE.company}, who will be in touch. You can also WhatsApp ${SITE.whatsappDisplay} or email ${SITE.email}.`;
const TOO_LONG_REPLY = `That needs a longer answer than I can give here. Could you narrow it down, for example to one project or one budget? Or message the broker on WhatsApp at ${SITE.whatsappDisplay}.`;
const STOPPED_REPLY = `I couldn't finish that one. Please ask again, or message the broker on WhatsApp at ${SITE.whatsappDisplay}.`;

/**
 * The response's content as it may be sent back in the next round. After a
 * mid-output fallback, model-internal blocks before the last fallback marker
 * are left out (text stays); otherwise the content goes back unchanged.
 */
function echoable(content: Anthropic.Beta.BetaContentBlock[]): Anthropic.Beta.BetaContentBlockParam[] {
  const boundary = content.map((b) => b.type).lastIndexOf("fallback");
  if (boundary < 0) return content as Anthropic.Beta.BetaContentBlockParam[];
  return content.filter((b, i) => i > boundary || b.type === "text") as Anthropic.Beta.BetaContentBlockParam[];
}

export const askFelicityBot = createServerFn({ method: "POST" })
  .validator((d: unknown) => (d && typeof d === "object" ? d : {}) as BotInput)
  .handler(async ({ data }): Promise<BotResult> => {
    const started = Date.now();
    if (typeof data.hp === "string" && data.hp.trim()) return { ok: false, reason: "invalid" }; // spam trap
    const turns = cleanTurns(data.turns);
    if (!turns) return { ok: false, reason: "invalid" };
    const page = pageOf(data.page);

    const apiKey = process.env["ANTHROPIC_API_KEY"];
    if (!apiKey) return { ok: false, reason: "offline" };
    const key = signer(apiKey);
    if (!signedHistory(turns, key)) return { ok: false, reason: "expired" };

    let ip = "unknown";
    try { ip = getRequestIP({ xForwardedFor: true }) ?? "unknown"; } catch { /* not behind a request */ }
    if (!allow(hits, ip, PER_IP, started)) return { ok: false, reason: "busy" };
    if (!(await withinSiteLimits(new Date(started)))) return { ok: false, reason: "busy" };

    const model = process.env["FELICITYBOT_MODEL"] || DEFAULT_MODEL;
    const client = new Anthropic({ apiKey, maxRetries: 1 });
    const today = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dubai", day: "numeric", month: "long", year: "numeric" }).format(new Date(started));
    const context = `Context: the visitor is on the page ${page} of dxbdubaicreekharbour.ae. Today is ${today} in Dubai.`;
    const messages: Anthropic.Beta.BetaMessageParam[] = turns.map((t) => ({ role: t.role, content: t.text }));
    // Operator context after the visitor's latest message (outside the cached prefix). Models without
    // mid-conversation system messages get it as a tagged block ahead of the question instead.
    if (supportsSystemMessages(model)) messages.push({ role: "system", content: context });
    else messages[messages.length - 1] = { role: "user", content: [{ type: "text", text: `<site_context>${context}</site_context>` }, { type: "text", text: turns[turns.length - 1]!.text }] };

    let saved = false;
    const answer = (text: string): BotResult => {
      const reply = clip(text.trim(), BOT_LIMITS.maxAssistantChars);
      return { ok: true, reply, sig: sign(key, reply), saved };
    };
    // Once the enquiry is saved, the visitor hears so whatever happens next (no "try again" that saves it twice).
    const fail = (reason: "busy" | "offline"): BotResult => (saved ? answer(SAVED_REPLY) : { ok: false, reason });

    try {
      for (let round = 0; round < MAX_ROUNDS; round++) {
        const remaining = DEADLINE_MS - (Date.now() - started);
        if (remaining < MIN_CALL_MS) { console.warn("FelicityBot: out of time after", round, "rounds"); return fail("busy"); }
        const response = await client.beta.messages.create({
          model,
          max_tokens: 3000,
          system: [{ type: "text", text: FELICITYBOT_SYSTEM, cache_control: { type: "ephemeral" } }],
          messages,
          tools: [SAVE_ENQUIRY_TOOL],
          output_config: { effort: "low" },
          ...(supportsFallback(model) ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
        }, { timeout: remaining, signal: AbortSignal.timeout(remaining) });
        const text = response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("\n\n").trim();

        if (response.stop_reason === "refusal") {
          console.warn("FelicityBot: refused", response.stop_details?.category ?? "");
          return answer(saved ? SAVED_REPLY : FALLBACK_REPLY);
        }
        if (response.stop_reason === "max_tokens") {
          // Thinking counts toward max_tokens; a cut-off tool call is never run.
          console.warn("FelicityBot: hit max_tokens", response.usage.output_tokens);
          if (saved) return answer(SAVED_REPLY);
          return answer(text.length > 200 ? `${text}…\n\n(That answer was cut short. Ask me about one part of it for more.)` : TOO_LONG_REPLY);
        }
        // Tool calls after the last fallback marker are the ones being sent back, so those are the ones to answer.
        const calls = response.content.slice(response.content.map((b) => b.type).lastIndexOf("fallback") + 1).filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use");
        if (response.stop_reason === "tool_use" && calls.length) {
          if (round === MAX_ROUNDS - 1) { console.warn("FelicityBot: tool round limit reached"); return answer(saved ? SAVED_REPLY : STOPPED_REPLY); }
          messages.push({ role: "assistant", content: echoable(response.content) });
          const results: Anthropic.Beta.BetaToolResultBlockParam[] = [];
          for (const block of calls) {
            const outcome: { text: string; isError: boolean; saved: boolean } = block.name === "save_enquiry" && !saved
              ? await runSaveEnquiry(block.input as SaveInput, page, ip)
              : block.name === "save_enquiry"
                ? { text: "Already saved in this conversation; nothing more to do.", isError: false, saved: true }
                : { text: "Unknown tool.", isError: true, saved: false };
            saved = saved || outcome.saved;
            results.push({ type: "tool_result", tool_use_id: block.id, content: outcome.text, is_error: outcome.isError });
          }
          messages.push({ role: "user", content: results });
          continue;
        }
        if (!text) { console.warn("FelicityBot: empty reply, stop_reason", response.stop_reason); return answer(saved ? SAVED_REPLY : STOPPED_REPLY); }
        return answer(text);
      }
      return answer(saved ? SAVED_REPLY : STOPPED_REPLY);
    } catch (err) {
      if (err instanceof Anthropic.RateLimitError) { console.warn("FelicityBot: rate limited by the API"); return fail("busy"); }
      if (err instanceof Anthropic.AuthenticationError) { console.error("FelicityBot: API key rejected (401), check ANTHROPIC_API_KEY in Vercel:", err.message.slice(0, 300)); return fail("offline"); }
      if (err instanceof Anthropic.PermissionDeniedError) { console.error("FelicityBot: API access denied (403):", err.message.slice(0, 300)); return fail("offline"); }
      if (err instanceof Anthropic.InternalServerError || err instanceof Anthropic.APIConnectionError || err instanceof Anthropic.APIUserAbortError) {
        console.warn("FelicityBot: API busy or slow:", err.name, err instanceof Anthropic.APIError ? err.status ?? "" : "", err.message.slice(0, 200));
        return fail("busy");
      }
      if (err instanceof Anthropic.APIError) { console.error("FelicityBot: API error", err.status, err.message.slice(0, 300)); return fail("offline"); }
      console.error("FelicityBot: request failed", err instanceof Error ? err.message.slice(0, 300) : String(err));
      return fail("offline");
    }
  });
