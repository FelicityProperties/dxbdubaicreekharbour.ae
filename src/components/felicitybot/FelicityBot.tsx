/**
 * FelicityBot: the site's AI assistant. A launcher button (above the WhatsApp
 * bubble on desktop, above the tab bar on phones) opens a chat panel. The
 * conversation lives in this tab only (sessionStorage) and is sent to
 * askFelicityBot on each question; replies are plain text with a few safe
 * markdown touches (links to this site, bold, bullet lines). See
 * src/lib/felicitybot.functions.ts for the server side.
 *
 * On phones the panel is a full-screen sheet: it adds a "#chat" history entry
 * so Back closes it instead of leaving the site, and the page behind it is
 * made inert for screen readers.
 */
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { ArrowUp, Sparkles, X } from "lucide-react";
import { PROJECTS, SITE } from "@/data/projects";
import { whatsappUrl, WhatsAppIcon, GENERIC_MESSAGE } from "@/components/showcase/shared";
import { askFelicityBot } from "@/lib/felicitybot.functions";
import { BOT_LIMITS, historyFor, safeHref, storedTurns, type BotResult, type BotTurn } from "@/lib/felicitybot.shared";

const STORE = "felicitybot:v2";
const GREETING = "Hi, I'm FelicityBot, the AI assistant of Felicity Properties. Ask me anything about Emaar's projects in Dubai Creek Harbour: prices, payment plans, handover dates, what homes have sold and rented for, or how buying works.";
const PHONE = "(max-width: 640px)";

function load(): BotTurn[] {
  try { return storedTurns(JSON.parse(sessionStorage.getItem(STORE) ?? "[]")); } catch { return []; }
}
function save(turns: BotTurn[]) {
  try { sessionStorage.setItem(STORE, JSON.stringify(turns)); } catch { /* private mode: keep in memory */ }
}
const isPhone = () => window.matchMedia(PHONE).matches;
/** A plain left click; anything else (new tab, new window, download) is left to the browser. */
const plainClick = (e: MouseEvent) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

function inline(text: string, go: (href: string) => void, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\[([^\]]{1,120})\]\(([^)\s]{1,300})\)|\*\*([^*]{1,200})\*\*/g;
  let last = 0, m: RegExpExecArray | null, i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] && m[2]) {
      const href = safeHref(m[2], SITE.whatsapp);
      if (!href) out.push(m[1]);
      else if (href.startsWith("/")) out.push(<a key={`${key}-${i++}`} href={href} onClick={(e) => { if (plainClick(e)) { e.preventDefault(); go(href); } }}>{m[1]}</a>);
      else out.push(<a key={`${key}-${i++}`} href={href} target="_blank" rel="noopener noreferrer">{m[1]}</a>);
    } else if (m[3]) out.push(<strong key={`${key}-${i++}`}>{m[3]}</strong>);
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/* dir="auto" on every block: an Arabic answer with Latin names and AED figures inside still reads right to left. */
function Rich({ text, go }: { text: string; go: (href: string) => void }) {
  const blocks = text.split(/\n{2,}/);
  return <>{blocks.map((block, b) => {
    const lines = block.split("\n").filter((l) => l.trim());
    if (lines.length && lines.every((l) => /^\s*[-•*]\s+/.test(l)))
      return <ul key={b} dir="auto">{lines.map((l, i) => <li key={i}>{inline(l.replace(/^\s*[-•*]\s+/, ""), go, `${b}-${i}`)}</li>)}</ul>;
    return <p key={b} dir="auto">{lines.map((l, i) => <span key={i}>{i > 0 && <br />}{inline(l, go, `${b}-${i}`)}</span>)}</p>;
  })}</>;
}

type Problem = "offline" | "busy" | "invalid";

export function FelicityBot() {
  const location = useRouterState({ select: (s) => s.location });
  const path = location.pathname;
  const hash = location.hash;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sheet, setSheet] = useState(false); // opened as the phone's full-screen sheet
  const [turns, setTurns] = useState<BotTurn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [hp, setHp] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const prevHash = useRef(hash);
  const chatRun = useRef(0); // bumped by "New chat", so a reply to the old chat is dropped

  useEffect(() => {
    setTurns(load());
    // A reload while the sheet was open leaves "#chat" in the address; tidy it away.
    if (window.location.hash === "#chat") void router.navigate({ href: `${window.location.pathname}${window.location.search}`, replace: true, resetScroll: false });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }); }, [turns, busy, open]);
  useEffect(() => {
    if (!open) return;
    // With a mouse, type straight away; on touch screens don't pop the keyboard over the suggestions.
    if (window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus();
    else panelRef.current?.focus();
  }, [open]);
  // Escape closes the panel wherever focus is, unless something else (a photo viewer) already handled it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !e.defaultPrevented && !e.isComposing) close(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });
  // Phone Back: leaving the "#chat" entry closes the sheet.
  useEffect(() => {
    if (prevHash.current === "chat" && hash !== "chat" && open && sheet) { setOpen(false); setSheet(false); }
    prevHash.current = hash;
  }, [hash, open, sheet]);
  // The full-screen sheet is modal: the page behind it is inert (screen readers and keyboards stay in the chat).
  useEffect(() => {
    const panel = panelRef.current;
    if (!open || !sheet || !panel?.parentElement) return;
    const others = [...panel.parentElement.children].filter((el) => el !== panel && !el.hasAttribute("inert"));
    others.forEach((el) => el.setAttribute("inert", ""));
    return () => others.forEach((el) => el.removeAttribute("inert"));
  }, [open, sheet]);

  if (path.startsWith("/leads")) return null;

  const project = PROJECTS.find((p) => path === `/projects/${p.slug}`);
  const suggestions = [
    ...(project ? [`Tell me about ${project.name}`] : []),
    "Which projects have a payment plan?",
    "What do 1-bedroom apartments rent for?",
    "Can buying here get me a Golden Visa?",
    "What can I buy from under AED 2M?",
  ].slice(0, 4);

  function openPanel() {
    const phone = isPhone();
    setOpen(true); setSheet(phone);
    if (phone && hash !== "chat") void router.navigate({ href: `${path}${location.searchStr}#chat`, resetScroll: false, hashScrollIntoView: false });
  }
  function close() {
    setOpen(false); setSheet(false);
    if (sheet && window.location.hash === "#chat") router.history.back();
    setTimeout(() => launcherRef.current?.focus(), 0);
  }
  const go = (href: string) => {
    if (sheet) { setOpen(false); setSheet(false); }
    // On the phone sheet the "#chat" entry is replaced, so Back from the new page returns to the page itself.
    void router.navigate({ href, replace: sheet && window.location.hash === "#chat" });
  };
  function newChat() { chatRun.current++; setTurns([]); save([]); setProblem(null); }

  async function ask(question: string) {
    const q = question.trim().slice(0, BOT_LIMITS.maxUserChars);
    if (!q || busy) return;
    const run = chatRun.current;
    let history = historyFor(turns, q);
    setTurns(history); save(history); setInput(""); setBusy(true); setProblem(null);
    // Keep the keyboard on the question box (with a mouse; on phones this would pop the keyboard up).
    if (window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus();
    let res: BotResult;
    try {
      res = await askFelicityBot({ data: { turns: history, page: path, hp } });
      // The site's key changed since these replies were written: carry on as a fresh chat.
      if (!res.ok && res.reason === "expired" && history.length > 1) {
        history = [{ role: "user", text: q }];
        if (run === chatRun.current) { setTurns(history); save(history); }
        res = await askFelicityBot({ data: { turns: history, page: path, hp } });
      }
    } catch {
      res = { ok: false, reason: "offline" };
    }
    setBusy(false);
    if (run !== chatRun.current) return; // "New chat" was pressed while waiting
    if (res.ok) {
      const next = [...history, { role: "assistant" as const, text: res.reply, sig: res.sig }];
      setTurns(next); save(next);
    } else {
      setProblem(res.reason === "expired" ? "invalid" : res.reason);
      const back = history.slice(0, -1);
      setTurns(back); save(back);
      setInput((current) => (current.trim() ? current : q)); // don't overwrite a follow-up typed while waiting
    }
  }

  const lastQuestion = input.trim() || [...turns].reverse().find((t) => t.role === "user")?.text;
  const waMessage = lastQuestion ? `Hi, I have a question about Dubai Creek Harbour: ${lastQuestion}` : GENERIC_MESSAGE;

  return <>
    {!open && <button ref={launcherRef} type="button" className="bot-launcher" onClick={openPanel} aria-haspopup="dialog" aria-label="Ask FelicityBot, our AI assistant"><Sparkles aria-hidden="true" /><span>Ask FelicityBot</span></button>}
    {open && <div ref={panelRef} tabIndex={-1} className="bot-panel" role="dialog" aria-modal={sheet} aria-label="FelicityBot, AI assistant">
      <div className="bot-head">
        <img src="/favicon.svg?v=dhow" alt="" width={34} height={34} />
        <div><p className="bot-name">FelicityBot</p><p className="bot-sub">AI assistant · {SITE.company}</p></div>
        <button type="button" className="bot-close" onClick={close} aria-label="Close FelicityBot"><X /></button>
      </div>
      <div className="bot-list" ref={listRef} aria-live="polite">
        <div className="bot-msg bot-assistant"><p>{GREETING}</p></div>
        {turns.map((t, i) => <div key={i} className={`bot-msg ${t.role === "user" ? "bot-user" : "bot-assistant"}`}>{t.role === "user" ? <p dir="auto">{t.text}</p> : <Rich text={t.text} go={go} />}</div>)}
        {busy && <div className="bot-msg bot-assistant bot-typing" aria-label="FelicityBot is typing"><span /><span /><span /></div>}
        {problem && <div className="bot-problem" role="alert">
          {problem === "busy" ? "FelicityBot is getting a lot of questions right now. Please try again in a minute, or ask the broker directly." : problem === "invalid" ? "That chat can't be continued. Please start a new one, or ask the broker directly." : "FelicityBot isn't available right now. The broker can answer you directly."}
          {problem === "invalid" && <button type="button" className="bot-restart" onClick={newChat}>Start a new chat</button>}
          <a href={whatsappUrl(waMessage)} target="_blank" rel="noopener noreferrer"><WhatsAppIcon />WhatsApp {SITE.whatsappDisplay}</a>
        </div>}
        {turns.length === 0 && !busy && <div className="bot-suggest">{suggestions.map((s) => <button key={s} type="button" onClick={() => void ask(s)}>{s}</button>)}</div>}
      </div>
      <form className="bot-form" onSubmit={(e) => { e.preventDefault(); void ask(input); }}>
        <input className="bot-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={hp} onChange={(e) => setHp(e.target.value)} />
        <textarea ref={inputRef} value={input} rows={1} dir="auto" maxLength={BOT_LIMITS.maxUserChars} placeholder="Ask about prices, plans, rents…" aria-label="Your question for FelicityBot"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void ask(input); } }} />
        <button type="submit" disabled={busy || !input.trim()} aria-label="Send"><ArrowUp /></button>
      </form>
      <p className="bot-note">FelicityBot is an AI. It answers from Emaar's published figures and Dubai Land Department records on this site and can make mistakes; it is not advice. <a href="/privacy" onClick={(e) => { if (plainClick(e)) { e.preventDefault(); go("/privacy"); } }}>Privacy</a>{turns.length > 0 && !busy && <> · <button type="button" onClick={newChat}>New chat</button></>}</p>
    </div>}
  </>;
}
