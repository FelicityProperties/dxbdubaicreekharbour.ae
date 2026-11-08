/**
 * The enquiry form that saves to Neon (see src/lib/enquiries.functions.ts).
 */
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PROJECTS } from "@/data/projects";
import { whatsappUrl, mailtoUrl, WhatsAppIcon } from "@/components/showcase/shared";
import { projectLabel } from "@/lib/format";
import { LOCALE_META, localizePath, type Locale, ltrLabel } from "@/i18n/locales";
import { useT, type T } from "@/i18n/messages";
import { Rich } from "@/i18n/rich";
import { isPhone } from "@/lib/phone";
import {
  ANY_PROJECT,
  BEDROOMS,
  BUDGETS,
  BUY_AS,
  FUNDING,
  LANGUAGES,
  LOOKING_FOR,
  PROJECT_OPTIONS,
  TIMINGS,
  submitEnquiry,
  type EnquiryInput,
} from "@/lib/enquiries.functions";

/** The option label for a project name ("Lyvia" → "Lyvia by Palace"). */
function projectOption(name?: string): string {
  if (!name) return ANY_PROJECT;
  const p = PROJECTS.find((x) => x.name === name);
  const label = p ? projectLabel(p) : name;
  return PROJECT_OPTIONS.includes(label) ? label : ANY_PROJECT;
}

/**
 * Arabic and Chinese pages preselect their own language. On English pages the visitor still chooses: reading
 * English says little about the language someone would rather be called in.
 */
function pageLanguage(locale: Locale): string {
  if (locale === "en") return "";
  const english = LOCALE_META[locale].english;
  return LANGUAGES.find((l) => l === english) ?? "";
}

/** A choice as the visitor reads it: amounts stay as they are, everything else is translated. */
function optionText(o: string, t: T): string {
  const under = /^Under (AED .+)$/.exec(o);
  if (under) return t("Under {amount}", { amount: ltrLabel(under[1]!, t.locale) });
  return /^AED /.test(o) ? ltrLabel(o, t.locale) : t(o);
}

/**
 * One choice: shown in the visitor's language, sent as the English value the server checks and /leads shows.
 * The value attribute is only written when the two differ (English pages keep plain options).
 */
const Choice = ({ value, label }: { value: string; label: string }) => <option value={label === value ? undefined : value}>{label}</option>;

/**
 * The field each of the server's messages is about (enquiries.functions.ts: enquiryProblem and the consent check),
 * so on phones the message shows under that field and the field gets focus. A message not listed here shows above
 * the send button, as before.
 */
const PROBLEM_FIELD: Record<string, "name" | "phone" | "email" | "consent"> = {
  "Please tell us your name.": "name",
  "Please enter a phone number we can call or WhatsApp.": "phone",
  "That email address doesn't look right — or leave it blank.": "email",
  "Please tick the box so we may contact you about your enquiry.": "consent",
};

/** "(optional)" after a label, without the label's capitals and letter-spacing. */
const NOTE = { note: (s: string) => <span className="normal-case tracking-normal">{s}</span> };

// tracking/weight reset: inputs inherit the label's uppercase letter-spacing otherwise.
// 16px on phones so iOS doesn't zoom into the field (enq-field: 48px tall there, styles.css PHONE APP: SHELL).
const field =
  "enq-field w-full min-h-11 rounded-[2px] border border-border bg-background px-3 py-2.5 text-[14px] max-sm:text-[16px] font-normal tracking-normal normal-case text-foreground focus:border-[color:var(--brass)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brass)]/30";
const labelCls = "grid gap-1.5 text-[12px] font-medium uppercase tracking-[1px] text-muted-foreground";

type State =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "invalid"; message: string }
  | { kind: "offline" }
  | { kind: "done"; firstName: string };

export function EnquiryForm({ project, compact = false }: { project?: string | undefined; compact?: boolean }) {
  const t = useT();
  const [v, setV] = useState<EnquiryInput>({
    name: "",
    phone: "",
    email: "",
    country: "",
    language: pageLanguage(t.locale),
    project: projectOption(project),
    looking_for: "",
    buy_as: "",
    bedrooms: "",
    budget: "",
    timing: "",
    funding: "",
    message: "",
    consent: false,
    hp_ref: "",
    page: "",
  });
  const [state, setState] = useState<State>({ kind: "idle" });
  const uid = useId();
  const problem = state.kind === "invalid" ? PROBLEM_FIELD[state.message] : undefined;
  // Phones: the field the message is about takes focus (its message shows right under it).
  useEffect(() => {
    if (state.kind !== "invalid" || !isPhone()) return;
    const at = PROBLEM_FIELD[state.message];
    if (at) document.getElementById(`${uid}-${at}`)?.focus();
  }, [state, uid]);
  // Guards double submits without disabling the button, which would drop keyboard focus to the page.
  const sending = useRef(false);
  // The form is replaced by the thank-you box: move focus there so it isn't lost.
  const doneRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (state.kind === "done") doneRef.current?.focus(); }, [state.kind]);
  const set = (k: keyof EnquiryInput) => (e: { target: { value: string } }) => setV({ ...v, [k]: e.target.value });
  /** The field's error state: marked invalid and described by its message. */
  const invalid = (k: "name" | "phone" | "email" | "consent") => (problem === k ? { "aria-invalid": true, "aria-describedby": `${uid}-error` } : {});
  /** Phones only: the message under the field it is about (wider screens keep it above the send button). */
  const fieldError = (k: "name" | "phone" | "email" | "consent") =>
    problem === k && state.kind === "invalid" ? (
      <span id={`${uid}-error`} className="enq-error hidden" role="alert">
        <CircleAlert aria-hidden="true" />
        {t(state.message)}
      </span>
    ) : null;
  /** Touch keyboards: the "next" key moves to the next field instead of sending a half-filled form. */
  const nextOnEnter = (e: KeyboardEvent<HTMLFormElement>) => {
    const el = e.target;
    if (e.key !== "Enter" || e.nativeEvent.isComposing || !(el instanceof HTMLInputElement) || el.enterKeyHint !== "next" || !window.matchMedia("(pointer: coarse)").matches) return;
    const fields = [...e.currentTarget.querySelectorAll<HTMLElement>("input, select, textarea")].filter((f) => f.tabIndex >= 0 && !(f instanceof HTMLInputElement && f.type === "checkbox"));
    const next = fields[fields.indexOf(el) + 1];
    if (next) {
      e.preventDefault();
      next.focus();
    }
  };

  // The broker's record of the enquiry (WhatsApp and email): English on every page, like the values it lists.
  const summary = () =>
    [
      `Hi, I'm ${v.name.trim() || "interested"}.`,
      v.project && v.project !== ANY_PROJECT ? `Project: ${v.project}.` : "Dubai Creek Harbour.",
      v.looking_for && `Looking for: ${v.looking_for}.`,
      v.buy_as && `Buying as: ${v.buy_as}.`,
      v.bedrooms && `Bedrooms: ${v.bedrooms}.`,
      v.budget && `Budget: ${v.budget}.`,
      v.timing && `When: ${v.timing}.`,
      v.funding && `Paying by: ${v.funding}.`,
      v.country.trim() && `Based in: ${v.country.trim()}.`,
      v.language && v.language !== "English" && `Preferred language: ${v.language}.`,
      v.message.trim(),
    ]
      .filter(Boolean)
      .join(" ");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sending.current) return;
    sending.current = true;
    setState({ kind: "sending" });
    try {
      const res = await submitEnquiry({ data: { ...v, page: window.location.pathname } });
      if (res.ok) setState({ kind: "done", firstName: res.firstName });
      else if (res.reason === "invalid") setState({ kind: "invalid", message: res.message });
      else setState({ kind: "offline" });
    } catch {
      setState({ kind: "offline" });
    } finally {
      sending.current = false;
    }
  }

  if (state.kind === "done") {
    return (
      <div ref={doneRef} tabIndex={-1} className="rounded-[3px] border border-border bg-background p-6 outline-none" role="status">
        {/* div, not p: the `.enquiry-card p` rule would shrink it to grey 13px. */}
        <div className="font-[family-name:var(--font-display)] text-[28px] leading-tight text-foreground">
          {state.firstName ? t("Thank you, {name}. We'll be in touch shortly.", { name: state.firstName }) : t("Thank you. We'll be in touch shortly.")}
        </div>
        <Button asChild variant="outline" className="mt-5">
          <a href={whatsappUrl(summary())} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon />
            {t("Also send it on WhatsApp")}
          </a>
        </Button>
      </div>
    );
  }

  // The compact form sits in a narrow column on project pages; two columns only on wide screens.
  const cols = compact ? "grid gap-4 xl:grid-cols-2" : "grid gap-4 sm:grid-cols-2";

  const select = (k: keyof EnquiryInput, title: string, options: readonly string[]) => (
    <label className={labelCls}>
      {title}
      <select className={field} value={String(v[k])} onChange={set(k)}>
        <option value="">{t("Choose one")}</option>
        {options.map((o) => (
          <Choice key={o} value={o} label={optionText(o, t)} />
        ))}
      </select>
    </label>
  );

  return (
    <form
      onSubmit={onSubmit}
      onKeyDown={nextOnEnter}
      className={`relative grid gap-4 rounded-[3px] border border-border bg-background p-5 sm:p-6 ${
        // No inner card where the form is narrow: phones, and project pages below xl.
        compact ? "max-xl:border-0 max-xl:bg-transparent max-xl:p-0" : "max-sm:border-0 max-sm:bg-transparent max-sm:p-0"
      }`}
      noValidate
    >
      <div className={cols}>
        <label className={labelCls}>
          {t("Name")}
          <input id={`${uid}-name`} className={field} value={v.name} onChange={set("name")} type="text" autoComplete="name" autoCapitalize="words" enterKeyHint="next" required maxLength={120} {...invalid("name")} />
        </label>
        {fieldError("name")}
        <label className={labelCls}>
          {t("Phone / WhatsApp")}
          <input id={`${uid}-phone`} className={field} value={v.phone} onChange={set("phone")} type="tel" inputMode="tel" autoComplete="tel" enterKeyHint="next" required maxLength={40} placeholder="+971 …" {...invalid("phone")} />
        </label>
        {fieldError("phone")}
      </div>
      <div className={cols}>
        <label className={labelCls}>
          <span>
            <Rich text={t("Email <note>(optional)</note>")} tags={NOTE} />
          </span>
          <input id={`${uid}-email`} className={field} value={v.email} onChange={set("email")} type="email" inputMode="email" autoComplete="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} enterKeyHint="next" maxLength={200} {...invalid("email")} />
        </label>
        {fieldError("email")}
        <label className={labelCls}>
          <span>
            <Rich text={t("Country you live in <note>(optional)</note>")} tags={NOTE} />
          </span>
          <input className={field} value={v.country} onChange={set("country")} type="text" autoComplete="country-name" autoCapitalize="words" enterKeyHint="next" maxLength={80} />
        </label>
      </div>
      <div className={cols}>
        <label className={labelCls}>
          {t("Project")}
          <select className={field} value={v.project} onChange={set("project")}>
            {PROJECT_OPTIONS.map((o) => (
              // Project names are never translated; only "Any / not sure" is.
              <Choice key={o} value={o} label={o === ANY_PROJECT ? t(ANY_PROJECT) : o} />
            ))}
          </select>
        </label>
        {select("looking_for", t("Looking for"), LOOKING_FOR)}
        {select("buy_as", t("Buying as"), BUY_AS)}
        {select("bedrooms", t("Bedrooms"), BEDROOMS)}
        {select("budget", t("Budget"), BUDGETS)}
        {select("timing", t("When"), TIMINGS)}
        {select("funding", t("Paying by"), FUNDING)}
        {select("language", t("Preferred language"), LANGUAGES)}
      </div>
      <label className={labelCls}>
        <span>
          <Rich text={t("Anything else? <note>(optional)</note>")} tags={NOTE} />
        </span>
        <textarea className={`${field} min-h-24`} value={v.message} onChange={set("message")} autoCapitalize="sentences" maxLength={2000} />
      </label>
      {/* Honeypot — hidden from people, filled by bots. Its name matches nothing
          a browser or password manager autofills. */}
      <div aria-hidden="true" className="enq-hp absolute -start-[9999px] h-0 w-0 overflow-hidden">
        <label>
          {t("Leave this empty")}
          <input name="hp_ref" tabIndex={-1} autoComplete="off" value={v.hp_ref} onChange={set("hp_ref")} />
        </label>
      </div>
      <label className="enq-consent flex items-start gap-2.5 text-[13px] text-muted-foreground">
        <input
          id={`${uid}-consent`}
          type="checkbox"
          checked={v.consent}
          onChange={(e) => setV({ ...v, consent: e.target.checked })}
          required
          className="enq-check mt-0.5 size-4 shrink-0 accent-[color:var(--brass)]"
          {...invalid("consent")}
        />
        <span>
          <Rich
            text={t("You may contact me by phone, WhatsApp or email about this enquiry. We use your details to answer it and to follow up about the projects you asked about — see our <privacy>Privacy Notice</privacy>.")}
            tags={{ privacy: (s) => <a className="underline underline-offset-4" href={localizePath("/privacy", t.locale)}>{s}</a> }}
          />
        </span>
      </label>
      {fieldError("consent")}
      {state.kind === "invalid" && (
        <div className={`rounded-[2px] bg-red-50 px-3 py-2.5 text-[13px] text-red-800${problem ? " enq-error-summary" : ""}`} role="alert">
          {t(state.message)}
        </div>
      )}
      {state.kind === "offline" && (
        <div className="grid gap-1 rounded-[2px] bg-red-50 px-3 py-2.5 text-[13px] text-red-800" role="alert">
          <span>{t("Our form is offline for a moment — please message us on WhatsApp instead.")}</span>
          <a className="inline-flex min-h-11 items-center font-medium underline underline-offset-4" href={whatsappUrl(summary())} target="_blank" rel="noopener noreferrer">
            {t("Open WhatsApp")}
          </a>
        </div>
      )}
      <div className="enq-actions flex flex-wrap items-center gap-3">
        <Button type="submit" aria-disabled={state.kind === "sending"} className="enq-submit min-h-11 aria-disabled:cursor-wait aria-disabled:opacity-50">
          {state.kind === "sending" ? t("Sending…") : t("Send enquiry")}
        </Button>
        <a
          className="inline-flex min-h-11 items-center text-[13px] text-muted-foreground underline underline-offset-4"
          href={whatsappUrl(summary())}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("or WhatsApp us instead")}
        </a>
        <a
          className="inline-flex min-h-11 items-center text-[13px] text-muted-foreground underline underline-offset-4"
          href={mailtoUrl(v.project && v.project !== ANY_PROJECT ? `Enquiry: ${v.project}` : "Dubai Creek Harbour enquiry", summary())}
        >
          {t("or email us")}
        </a>
      </div>
    </form>
  );
}
