/** Shapes and limits shared by FelicityBot's chat window and its server function (no server code here). */
export type BotTurn = { role: "user" | "assistant"; text: string };
export type BotInput = { turns: BotTurn[]; page: string; hp?: string };
export type BotResult = { ok: true; reply: string; saved: boolean } | { ok: false; reason: "offline" | "busy" | "invalid" };

export const BOT_LIMITS = { maxTurns: 30, maxUserChars: 1200, maxAssistantChars: 6000, maxTotalChars: 40_000 } as const;

/** The conversation as the browser sent it, or null if it isn't one we accept. */
export function cleanTurns(raw: unknown): BotTurn[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > BOT_LIMITS.maxTurns) return null;
  const turns: BotTurn[] = [];
  let total = 0;
  for (let i = 0; i < raw.length; i++) {
    const t = raw[i] as { role?: unknown; text?: unknown } | null;
    const role = i % 2 === 0 ? "user" : "assistant"; // strictly alternating, starting with the visitor
    if (!t || t.role !== role || typeof t.text !== "string") return null;
    const text = t.text.trim();
    const max = role === "user" ? BOT_LIMITS.maxUserChars : BOT_LIMITS.maxAssistantChars;
    if (!text || text.length > max) return null;
    total += text.length;
    turns.push({ role, text });
  }
  if (total > BOT_LIMITS.maxTotalChars || turns[turns.length - 1]!.role !== "user") return null;
  return turns;
}

