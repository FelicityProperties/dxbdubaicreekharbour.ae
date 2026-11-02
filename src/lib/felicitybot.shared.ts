/** Shapes and limits shared by FelicityBot's chat window and its server function (no server code here). */
import { SITE } from "@/data/projects";
import { msg, tFor, type T } from "@/i18n/messages";
import type { Locale } from "@/i18n/locales";

/** `sig` is the server's signature on one of its own replies; the browser keeps it with the turn and sends it back. */
export type BotTurn = { role: "user" | "assistant"; text: string; sig?: string };
/** `page` is the router's path without the language prefix; `lang` is the language of the page (the server checks it). */
export type BotInput = { turns: BotTurn[]; page: string; hp?: string; lang?: Locale };
/** "expired": the replies' signatures no longer check out (new server key); start a fresh chat.
    "limit": this visitor's or the site's allowance of questions is used up for now. */
export type BotResult = { ok: true; reply: string; sig: string; saved: boolean } | { ok: false; reason: "offline" | "busy" | "invalid" | "expired" | "limit" };

/**
 * FelicityBot's fixed replies, written by the server rather than the model. The server sends and signs them in
 * English (that English is what comes back as history); the chat window shows them in the page's language
 * through shownReply().
 */
export const FIXED_REPLIES = {
  fallback: msg("I can't help with that here. Ask me about Dubai Creek Harbour, or message the broker on WhatsApp at {whatsapp}."),
  saved: msg("Thank you, your details are with {broker} at {company}, who will be in touch. You can also WhatsApp {whatsapp} or email {email}."),
  tooLong: msg("That needs a longer answer than I can give here. Could you narrow it down, for example to one project or one budget? Or message the broker on WhatsApp at {whatsapp}."),
  notPassed: msg("I couldn't pass your details on just then. Please send your name and number again, or WhatsApp {whatsapp}."),
  stopped: msg("I couldn't finish that one. Please ask again, or message the broker on WhatsApp at {whatsapp}."),
} as const;
/** Added under an answer that hit the length limit. */
export const CUT_NOTE = msg("(That answer was cut short. Ask me about one part of it for more.)");
const REPLY_VARS = { whatsapp: SITE.whatsappDisplay, broker: SITE.broker, company: SITE.company, email: SITE.email };
const EN = tFor("en");
/** A fixed reply, filled in: English (as the server sends it) unless a translator is given. */
export const fixedReply = (which: keyof typeof FIXED_REPLIES, t: T = EN): string => t(FIXED_REPLIES[which], REPLY_VARS);

/**
 * A reply as the chat window shows it. The model already answers in the visitor's language, so its words are
 * shown as they are; the server's fixed replies and the cut-short note are shown in the page's language.
 */
export function shownReply(text: string, t: T): string {
  if (t.locale === "en") return text;
  for (const which of Object.keys(FIXED_REPLIES) as (keyof typeof FIXED_REPLIES)[]) if (text === fixedReply(which)) return fixedReply(which, t);
  return text.endsWith(`\n\n${CUT_NOTE}`) ? `${text.slice(0, -CUT_NOTE.length)}${t(CUT_NOTE)}` : text;
}

/* Sized for two-to-six-sentence answers and a few rounds of follow-ups. Smaller bodies also cap what one
   request can cost; the chat window trims older turns to stay inside these limits. */
export const BOT_LIMITS = { maxTurns: 24, maxUserChars: 1200, maxAssistantChars: 3000, maxTotalChars: 16_000 } as const;

/**
 * The conversation as the browser sent it, or null if it isn't one we accept:
 * strictly alternating, starting and ending with the visitor, within the limits.
 */
export function cleanTurns(raw: unknown): BotTurn[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > BOT_LIMITS.maxTurns) return null;
  const turns: BotTurn[] = [];
  let total = 0;
  for (let i = 0; i < raw.length; i++) {
    const t = raw[i] as { role?: unknown; text?: unknown; sig?: unknown } | null;
    const role = i % 2 === 0 ? "user" : "assistant";
    if (!t || t.role !== role || typeof t.text !== "string") return null;
    const text = t.text.trim();
    const max = role === "user" ? BOT_LIMITS.maxUserChars : BOT_LIMITS.maxAssistantChars;
    if (!text || text.length > max) return null;
    total += text.length;
    if (role === "assistant") {
      if (typeof t.sig !== "string" || t.sig.length > 100) return null;
      turns.push({ role, text, sig: t.sig });
    } else turns.push({ role, text });
  }
  if (total > BOT_LIMITS.maxTotalChars || turns[turns.length - 1]!.role !== "user") return null;
  return turns;
}

/**
 * A stored conversation the chat window can safely continue: the longest
 * well-formed alternating prefix of answered pairs (an unanswered question
 * left by a reload is dropped), or nothing.
 */
export function storedTurns(raw: unknown): BotTurn[] {
  if (!Array.isArray(raw)) return [];
  const out: BotTurn[] = [];
  for (let i = 0; i < raw.length; i++) {
    const t = raw[i] as { role?: unknown; text?: unknown; sig?: unknown } | null;
    const role = i % 2 === 0 ? "user" : "assistant";
    if (!t || t.role !== role || typeof t.text !== "string" || !t.text.trim()) break;
    if (role === "assistant" && typeof t.sig !== "string") break;
    out.push(role === "assistant" ? { role, text: t.text, sig: t.sig as string } : { role, text: t.text });
  }
  return out.length % 2 === 1 ? out.slice(0, -1) : out;
}

/**
 * The history to send with a new question: answered pairs only, oldest pairs
 * dropped until the request fits the limits.
 */
export function historyFor(turns: BotTurn[], question: string): BotTurn[] {
  let base = turns.length % 2 === 1 ? turns.slice(0, -1) : turns;
  const size = (ts: BotTurn[]) => ts.reduce((n, t) => n + t.text.length, 0) + question.length;
  while (base.length && (base.length + 1 > BOT_LIMITS.maxTurns || size(base) > BOT_LIMITS.maxTotalChars)) base = base.slice(2);
  return [...base, { role: "user", text: question }];
}

/**
 * Links FelicityBot may render: this site's own paths (never "//host", which
 * browsers read as another site) and the broker's WhatsApp. Everything else,
 * Emaar's website included, stays plain text: visitors buy through us.
 */
export function safeHref(href: string, whatsapp: string): string | null {
  if (/^\/(?![/\\])[\w\-/#?=&.%]*$/.test(href)) return href;
  if (new RegExp(`^https://wa\\.me/${whatsapp}(\\?[^\\s"'<>]*)?$`).test(href)) return href;
  return null;
}

/** Cut a reply to the limit at a sentence or line end, marking the cut. */
export function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const at = Math.max(cut.lastIndexOf("\n"), cut.lastIndexOf(". "), cut.lastIndexOf("。"), cut.lastIndexOf("؟ "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  return `${(at > max / 2 ? cut.slice(0, at + 1) : cut).trimEnd()}…`;
}
