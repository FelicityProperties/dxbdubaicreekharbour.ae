/**
 * The enquiry form that saves to Neon (see src/lib/enquiries.functions.ts).
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PROJECTS } from "@/data/projects";
import { whatsappUrl, mailtoUrl, WhatsAppIcon } from "@/components/showcase/shared";
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
  const label = p?.brand?.startsWith("by ") ? `${p.name} ${p.brand}` : (p?.name ?? name);
  return PROJECT_OPTIONS.includes(label) ? label : ANY_PROJECT;
}

// tracking/weight reset: inputs inherit the label's uppercase letter-spacing otherwise.
// 16px on phones so iOS doesn't zoom into the field.
const field =
  "w-full min-h-11 rounded-[2px] border border-border bg-background px-3 py-2.5 text-[14px] max-sm:text-[16px] font-normal tracking-normal normal-case text-foreground focus:border-[color:var(--brass)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brass)]/30";
const labelCls = "grid gap-1.5 text-[12px] font-medium uppercase tracking-[1px] text-muted-foreground";

type State =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "invalid"; message: string }
  | { kind: "offline" }
  | { kind: "done"; firstName: string };

export function EnquiryForm({ project, compact = false }: { project?: string | undefined; compact?: boolean }) {
  const [v, setV] = useState<EnquiryInput>({
    name: "",
    phone: "",
    email: "",
    country: "",
    language: "",
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
  const set = (k: keyof EnquiryInput) => (e: { target: { value: string } }) => setV({ ...v, [k]: e.target.value });

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
    setState({ kind: "sending" });
    try {
      const res = await submitEnquiry({ data: { ...v, page: window.location.pathname } });
      if (res.ok) setState({ kind: "done", firstName: res.firstName });
      else if (res.reason === "invalid") setState({ kind: "invalid", message: res.message });
      else setState({ kind: "offline" });
    } catch {
      setState({ kind: "offline" });
    }
  }

  if (state.kind === "done") {
    return (
      <div className="rounded-[3px] border border-border bg-background p-6" role="status">
        {/* div, not p: the `.enquiry-card p` rule would shrink it to grey 13px. */}
        <div className="font-[family-name:var(--font-display)] text-[28px] leading-tight text-foreground">
          Thank you{state.firstName ? `, ${state.firstName}` : ""}. We'll be in touch shortly.
        </div>
        <Button asChild variant="outline" className="mt-5">
          <a href={whatsappUrl(summary())} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon />
            Also send it on WhatsApp
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
        <option value="">Choose one</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );

  return (
    <form
      onSubmit={onSubmit}
      className={`relative grid gap-4 rounded-[3px] border border-border bg-background p-5 sm:p-6 ${
        // No inner card where the form is narrow: phones, and project pages below xl.
        compact ? "max-xl:border-0 max-xl:bg-transparent max-xl:p-0" : "max-sm:border-0 max-sm:bg-transparent max-sm:p-0"
      }`}
      noValidate
    >
      <div className={cols}>
        <label className={labelCls}>
          Name
          <input className={field} value={v.name} onChange={set("name")} autoComplete="name" required maxLength={120} />
        </label>
        <label className={labelCls}>
          Phone / WhatsApp
          <input className={field} value={v.phone} onChange={set("phone")} type="tel" autoComplete="tel" required maxLength={40} placeholder="+971 …" />
        </label>
      </div>
      <div className={cols}>
        <label className={labelCls}>
          <span>
            Email <span className="normal-case tracking-normal">(optional)</span>
          </span>
          <input className={field} value={v.email} onChange={set("email")} type="email" autoComplete="email" maxLength={200} />
        </label>
        <label className={labelCls}>
          <span>
            Country you live in <span className="normal-case tracking-normal">(optional)</span>
          </span>
          <input className={field} value={v.country} onChange={set("country")} autoComplete="country-name" maxLength={80} />
        </label>
      </div>
      <div className={cols}>
        <label className={labelCls}>
          Project
          <select className={field} value={v.project} onChange={set("project")}>
            {PROJECT_OPTIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
        {select("looking_for", "Looking for", LOOKING_FOR)}
        {select("buy_as", "Buying as", BUY_AS)}
        {select("bedrooms", "Bedrooms", BEDROOMS)}
        {select("budget", "Budget", BUDGETS)}
        {select("timing", "When", TIMINGS)}
        {select("funding", "Paying by", FUNDING)}
        {select("language", "Preferred language", LANGUAGES)}
      </div>
      <label className={labelCls}>
        <span>
          Anything else? <span className="normal-case tracking-normal">(optional)</span>
        </span>
        <textarea className={`${field} min-h-24`} value={v.message} onChange={set("message")} maxLength={2000} />
      </label>
      {/* Honeypot — hidden from people, filled by bots. Its name matches nothing
          a browser or password manager autofills. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Leave this empty
          <input name="hp_ref" tabIndex={-1} autoComplete="off" value={v.hp_ref} onChange={set("hp_ref")} />
        </label>
      </div>
      <label className="flex items-start gap-2.5 text-[13px] text-muted-foreground">
        <input
          type="checkbox"
          checked={v.consent}
          onChange={(e) => setV({ ...v, consent: e.target.checked })}
          required
          className="mt-0.5 size-4 shrink-0 accent-[color:var(--brass)]"
        />
        <span>You may contact me by phone, WhatsApp or email about this enquiry. We never share your details.</span>
      </label>
      {state.kind === "invalid" && (
        <div className="rounded-[2px] bg-red-50 px-3 py-2.5 text-[13px] text-red-800" role="alert">
          {state.message}
        </div>
      )}
      {state.kind === "offline" && (
        <div className="grid gap-1 rounded-[2px] bg-red-50 px-3 py-2.5 text-[13px] text-red-800" role="alert">
          <span>Our form is offline for a moment — please message us on WhatsApp instead.</span>
          <a className="inline-flex min-h-11 items-center font-medium underline underline-offset-4" href={whatsappUrl(summary())} target="_blank" rel="noopener noreferrer">
            Open WhatsApp
          </a>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={state.kind === "sending"} className="min-h-11">
          {state.kind === "sending" ? "Sending…" : "Send enquiry"}
        </Button>
        <a
          className="inline-flex min-h-11 items-center text-[13px] text-muted-foreground underline underline-offset-4"
          href={whatsappUrl(summary())}
          target="_blank"
          rel="noopener noreferrer"
        >
          or WhatsApp us instead
        </a>
        <a
          className="inline-flex min-h-11 items-center text-[13px] text-muted-foreground underline underline-offset-4"
          href={mailtoUrl(v.project && v.project !== ANY_PROJECT ? `Enquiry: ${v.project}` : "Dubai Creek Harbour enquiry", summary())}
        >
          or email us
        </a>
      </div>
    </form>
  );
}
