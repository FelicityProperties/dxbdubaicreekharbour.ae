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

/**
 * Direction for a whole bubble, decided from all of its text: an Arabic answer whose lines start with
 * a Latin project name or "AED" still reads right to left (dir="auto" would look at the first letter only).
 */
export function bubbleDir(text: string): "rtl" | "ltr" | "auto" {
  const shown = text.replace(/\]\([^)]*\)/g, "]"); // link targets aren't read, only their labels
  const rtl = shown.match(/[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/g)?.length ?? 0;
  const latin = shown.match(/[A-Za-z]/g)?.length ?? 0;
  if (!rtl && !latin) return "auto";
  // English replies carry no Arabic letters, so a low bar is safe: Arabic text full of Latin project names still reads RTL.
  return rtl > 0 && rtl >= 0.2 * (rtl + latin) ? "rtl" : "ltr";
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

type Problem = "offline" | "busy" | "invalid" | "limit";

export function FelicityBot() {
  const location = useRouterState({ select: (s) => s.location });
  const path = location.pathname;
  const hash = location.hash;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sheet, setSheet] = useState(false); // a "#chat" history entry was added for the phone's full-screen sheet
  const [phoneNow, setPhoneNow] = useState(false); // the phone layout applies right now (it follows rotation)
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
  const refocus = useRef(false);
  const chatRun = useRef(0); // bumped by "New chat", so a reply to the old chat is dropped
  const modal = open && sheet && phoneNow;

  useEffect(() => {
    setTurns(load());
    // A reload while the phone sheet was open: open it again, so Back still closes it.
    if (window.location.hash !== "#chat") return;
    // Index 0 is a shared or bookmarked "#chat" link: there is nothing behind it to go back to.
    const index = window.history.state?.__TSR_index ?? 0;
    if (index > 0 && isPhone()) { setOpen(true); setSheet(true); }
    else if (index > 0) router.history.back();
    else void router.navigate({ href: `${window.location.pathname}${window.location.search}`, replace: true, resetScroll: false });
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
  // Phone Back: leaving the "#chat" entry closes the sheet, and focus goes back to the launcher.
  useEffect(() => {
    if (prevHash.current === "chat" && hash !== "chat" && open && sheet) { refocus.current = true; setOpen(false); setSheet(false); }
    prevHash.current = hash;
  }, [hash, open, sheet]);
  useEffect(() => { if (!open && refocus.current) { refocus.current = false; launcherRef.current?.focus(); } }, [open]);
  // Follow the layout while open: turning a phone upright makes the panel full-screen, so it gets its Back entry then.
  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia(PHONE);
    const onChange = () => {
      setPhoneNow(mq.matches);
      if (mq.matches && !sheet) pushChat();
      // No longer full-screen: drop the "#chat" entry so the floating panel behaves like the desktop one.
      // (sheet is cleared first, so the Back effect doesn't take this for a close.)
      else if (!mq.matches && sheet && window.location.hash === "#chat") { setSheet(false); router.history.back(); }
    };
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [open, sheet]); // eslint-disable-line react-hooks/exhaustive-deps
  // The full-screen sheet is modal: the page behind it is inert (screen readers and keyboards stay in the chat).
  useEffect(() => {
    const panel = panelRef.current;
    if (!modal || !panel?.parentElement) return;
    const others = [...panel.parentElement.children].filter((el) => el !== panel && !el.hasAttribute("inert"));
    others.forEach((el) => el.setAttribute("inert", ""));
    return () => others.forEach((el) => el.removeAttribute("inert"));
  }, [modal]);

  if (path.startsWith("/leads")) return null;

  const project = PROJECTS.find((p) => path === `/projects/${p.slug}`);
  const suggestions = [
    ...(project ? [`Tell me about ${project.name}`] : []),
    "Which projects have a payment plan?",
    "What do 1-bedroom apartments rent for?",
    "Can buying here get me a Golden Visa?",
    "What can I buy from under AED 2M?",
  ].slice(0, 4);

  /** Adds the "#chat" entry that Back removes. */
  function pushChat() {
    setSheet(true);
    if (window.location.hash === "#chat") return;
    // An entry made by a plain "#enquire" link has no router key, so the scroll position saved for it now
    // couldn't be found on return and the page would jump to the form; give it the router's key first.
    // Such an entry always has one before it, so its index is at least 1 (the header's Back arrow relies on it).
    const here = router.state.location;
    if (!window.history.state?.__TSR_key) window.history.replaceState({ ...here.state, __TSR_index: Math.max(1, here.state.__TSR_index ?? 0), __hashScrollIntoViewOptions: false }, "");
    void router.navigate({ href: `${here.pathname}${here.searchStr}#chat`, resetScroll: false, hashScrollIntoView: false });
  }
  function openPanel() {
    setOpen(true);
    if (isPhone()) pushChat();
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
    {open && <div ref={panelRef} tabIndex={-1} className="bot-panel" role="dialog" aria-modal={modal} aria-label="FelicityBot, AI assistant">
      <div className="bot-head">
        <img src="/favicon.svg?v=dhow" alt="" width={34} height={34} />
        <div><p className="bot-name">FelicityBot</p><p className="bot-sub">AI assistant · {SITE.company}</p></div>
        <button type="button" className="bot-close" onClick={close} aria-label="Close FelicityBot"><X /></button>
      </div>
      <div className="bot-list" ref={listRef} aria-live="polite">
        <div className="bot-msg bot-assistant"><p>{GREETING}</p></div>
        {turns.map((t, i) => <div key={i} dir={bubbleDir(t.text)} className={`bot-msg ${t.role === "user" ? "bot-user" : "bot-assistant"}`}>{t.role === "user" ? <p>{t.text}</p> : <Rich text={t.text} go={go} />}</div>)}
        {busy && <div className="bot-msg bot-assistant bot-typing" aria-label="FelicityBot is typing"><span /><span /><span /></div>}
        {problem && <div className="bot-problem" role="alert">
          {problem === "busy" ? "FelicityBot is getting a lot of questions right now. Please try again in a minute, or ask the broker directly." : problem === "limit" ? "FelicityBot has answered all the questions it can for now. The broker can answer you directly on WhatsApp." : problem === "invalid" ? "That chat can't be continued. Please start a new one, or ask the broker directly." : "FelicityBot isn't available right now. The broker can answer you directly."}
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
