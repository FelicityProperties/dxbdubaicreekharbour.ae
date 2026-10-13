/**
 * FelicityBot: the site's AI assistant. A launcher button (above the WhatsApp
 * bubble on desktop, above the tab bar on phones) opens a chat panel. The
 * conversation lives in this tab only (sessionStorage) and is sent to
 * askFelicityBot on each question; replies are plain text with a few safe
 * markdown touches (links to this site, bold, bullet lines). See
 * src/lib/felicitybot.functions.ts for the server side.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { ArrowUp, Sparkles, X } from "lucide-react";
import { PROJECTS, SITE } from "@/data/projects";
import { whatsappUrl, WhatsAppIcon, GENERIC_MESSAGE } from "@/components/showcase/shared";
import { askFelicityBot } from "@/lib/felicitybot.functions";
import { BOT_LIMITS, type BotTurn } from "@/lib/felicitybot.shared";

const STORE = "felicitybot:v1";
const GREETING = "Hi, I'm FelicityBot, the AI assistant of Felicity Properties. Ask me anything about Emaar's projects in Dubai Creek Harbour: prices, payment plans, handover dates, what homes have sold and rented for, or how buying works.";

function load(): BotTurn[] {
  try { const v = JSON.parse(sessionStorage.getItem(STORE) ?? "[]"); return Array.isArray(v) ? (v as BotTurn[]) : []; } catch { return []; }
}
function save(turns: BotTurn[]) {
  try { sessionStorage.setItem(STORE, JSON.stringify(turns)); } catch { /* private mode: keep in memory */ }
}

/** Links the bot may render: this site's paths, Emaar, WhatsApp. Everything else stays plain text. */
const safeHref = (href: string) => (/^\/[\w\-/#?=&.]*$/.test(href) || /^https:\/\/(www\.)?(emaar\.com|wa\.me)\//.test(href) ? href : null);

function inline(text: string, go: (href: string) => void, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\[([^\]]{1,120})\]\(([^)\s]{1,300})\)|\*\*([^*]{1,200})\*\*/g;
  let last = 0, m: RegExpExecArray | null, i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] && m[2]) {
      const href = safeHref(m[2]);
      if (!href) out.push(m[1]);
      else if (href.startsWith("/")) out.push(<a key={`${key}-${i++}`} href={href} onClick={(e) => { e.preventDefault(); go(href); }}>{m[1]}</a>);
      else out.push(<a key={`${key}-${i++}`} href={href} target="_blank" rel="noopener noreferrer">{m[1]}</a>);
    } else if (m[3]) out.push(<strong key={`${key}-${i++}`}>{m[3]}</strong>);
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function Rich({ text, go }: { text: string; go: (href: string) => void }) {
  const blocks = text.split(/\n{2,}/);
  return <>{blocks.map((block, b) => {
    const lines = block.split("\n").filter((l) => l.trim());
    if (lines.length && lines.every((l) => /^\s*[-•*]\s+/.test(l)))
      return <ul key={b}>{lines.map((l, i) => <li key={i}>{inline(l.replace(/^\s*[-•*]\s+/, ""), go, `${b}-${i}`)}</li>)}</ul>;
    return <p key={b}>{lines.map((l, i) => <span key={i}>{i > 0 && <br />}{inline(l, go, `${b}-${i}`)}</span>)}</p>;
  })}</>;
}

export function FelicityBot() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<BotTurn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<null | "offline" | "busy" | "invalid">(null);
  const [hp, setHp] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { setTurns(load()); }, []);
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }); }, [turns, busy, open]);
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);
  // Escape closes the panel wherever focus is (a clicked suggestion disappears and leaves focus on the page).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); setTimeout(() => launcherRef.current?.focus(), 0); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (path.startsWith("/leads")) return null;

  const project = PROJECTS.find((p) => path === `/projects/${p.slug}`);
  const suggestions = [
    ...(project ? [`Tell me about ${project.name}`] : []),
    "Which projects have a payment plan?",
    "What do 1-bedroom apartments rent for?",
    "Can buying here get me a Golden Visa?",
    "What can I buy from under AED 2M?",
  ].slice(0, 4);

  const close = () => { setOpen(false); setTimeout(() => launcherRef.current?.focus(), 0); };
  const go = (href: string) => { router.history.push(href); if (window.matchMedia("(max-width: 640px)").matches) setOpen(false); };

  async function ask(question: string) {
    const q = question.trim().slice(0, BOT_LIMITS.maxUserChars);
    if (!q || busy) return;
    // Keep the most recent part of a long chat within the server's limits (whole pairs, starting with a question).
    let history = [...turns, { role: "user" as const, text: q }];
    while (history.length > BOT_LIMITS.maxTurns || history.reduce((n, t) => n + t.text.length, 0) > BOT_LIMITS.maxTotalChars) history = history.slice(2);
    setTurns(history); save(history); setInput(""); setBusy(true); setProblem(null);
    // Keep the keyboard on the question box (with a mouse; on phones this would pop the keyboard up).
    if (window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus();
    try {
      const res = await askFelicityBot({ data: { turns: history, page: path, hp } });
      if (res.ok) { const next = [...history, { role: "assistant" as const, text: res.reply }]; setTurns(next); save(next); }
      else { setProblem(res.reason); const back = history.slice(0, -1); setTurns(back); save(back); setInput(q); }
    } catch {
      setProblem("offline"); const back = history.slice(0, -1); setTurns(back); save(back); setInput(q);
    } finally { setBusy(false); }
  }

  // A failed question is put back in the box, so prefer that over the last one answered.
  const lastQuestion = input.trim() || [...turns].reverse().find((t) => t.role === "user")?.text;
  const waMessage = lastQuestion ? `Hi, I have a question about Dubai Creek Harbour: ${lastQuestion}` : GENERIC_MESSAGE;

  return <>
    {!open && <button ref={launcherRef} type="button" className="bot-launcher" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-label="Ask FelicityBot, our AI assistant"><Sparkles aria-hidden="true" /><span>Ask FelicityBot</span></button>}
    {open && <div className="bot-panel" role="dialog" aria-modal="false" aria-label="FelicityBot, AI assistant">
      <div className="bot-head">
        <img src="/favicon.svg?v=dhow" alt="" width={34} height={34} />
        <div><p className="bot-name">FelicityBot</p><p className="bot-sub">AI assistant · {SITE.company}</p></div>
        <button type="button" className="bot-close" onClick={close} aria-label="Close FelicityBot"><X /></button>
      </div>
      <div className="bot-list" ref={listRef} aria-live="polite">
        <div className="bot-msg bot-assistant"><p>{GREETING}</p></div>
        {turns.map((t, i) => <div key={i} className={`bot-msg ${t.role === "user" ? "bot-user" : "bot-assistant"}`}>{t.role === "user" ? <p>{t.text}</p> : <Rich text={t.text} go={go} />}</div>)}
        {busy && <div className="bot-msg bot-assistant bot-typing" aria-label="FelicityBot is typing"><span /><span /><span /></div>}
        {problem && <div className="bot-problem" role="alert">
          {problem === "busy" ? "FelicityBot is getting a lot of questions right now. Please try again in a minute, or ask the broker directly." : problem === "invalid" ? "That message couldn't be sent. Please shorten it or start a new chat." : "FelicityBot isn't available right now. The broker can answer you directly."}
          <a href={whatsappUrl(waMessage)} target="_blank" rel="noopener noreferrer"><WhatsAppIcon />WhatsApp {SITE.whatsappDisplay}</a>
        </div>}
        {turns.length === 0 && !busy && <div className="bot-suggest">{suggestions.map((s) => <button key={s} type="button" onClick={() => void ask(s)}>{s}</button>)}</div>}
      </div>
      <form className="bot-form" onSubmit={(e) => { e.preventDefault(); void ask(input); }}>
        <input className="bot-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={hp} onChange={(e) => setHp(e.target.value)} />
        <textarea ref={inputRef} value={input} rows={1} maxLength={BOT_LIMITS.maxUserChars} placeholder="Ask about prices, plans, rents…" aria-label="Your question for FelicityBot"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void ask(input); } }} />
        <button type="submit" disabled={busy || !input.trim()} aria-label="Send"><ArrowUp /></button>
      </form>
      <p className="bot-note">FelicityBot is an AI. It answers from Emaar's published figures and Dubai Land Department records on this site and can make mistakes; it is not advice. <a href="/privacy">Privacy</a>{turns.length > 0 && <> · <button type="button" onClick={() => { setTurns([]); save([]); setProblem(null); }}>New chat</button></>}</p>
    </div>}
  </>;
}
