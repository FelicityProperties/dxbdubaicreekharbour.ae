"use client";

import { useActionState } from "react";
import Link from "next/link";
import { submitEnquiry, type EnquiryState } from "@/app/actions";
import { BEDROOMS, BUDGETS, BUY_AS, FUNDING, TIMINGS } from "@/lib/site";

const initial: EnquiryState = { ok: false, message: "" };

const KEPT = ["name", "phone", "email", "buy_as", "bedrooms", "budget", "timing", "funding", "message", "consent"];

/**
 * The server action, with the failures it can't report itself caught here: a
 * dropped connection, or a redeploy since the page was opened (the old page's
 * action no longer exists). Uncaught, either replaces the whole page with an
 * error screen and loses everything the visitor typed.
 */
async function send(prev: EnquiryState, form: FormData): Promise<EnquiryState> {
  try {
    return await submitEnquiry(prev, form);
  } catch {
    return {
      ok: false,
      message:
        "We couldn't send that. Check your connection and press Send again. If it still doesn't go through, refresh the page and send it once more.",
      fields: Object.fromEntries(KEPT.map((k) => [k, String(form.get(k) ?? "")])),
      attempt: Date.now(),
    };
  }
}

const input =
  "w-full rounded-md border border-rule bg-white px-3.5 py-2.5 text-ink placeholder:text-ink-muted/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";
const label = "grid gap-1.5 text-sm font-medium text-ink";

function Choice({ name, title, options, value }: { name: string; title: string; options: readonly string[]; value?: string }) {
  return (
    <label className={label}>
      {title}
      <select className={input} name={name} defaultValue={value ?? ""}>
        <option value="">Choose one</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

export function EnquiryForm() {
  const [state, action, pending] = useActionState(send, initial);
  const f = state.fields ?? {};

  if (state.ok) {
    return (
      <div className="rounded-lg border border-rule bg-white p-6 sm:p-8" role="status">
        <p className="font-display text-2xl text-ink">{state.message}</p>
        <p className="mt-3 text-ink-muted">Keep your phone close — we usually call from a +971 number.</p>
      </div>
    );
  }

  return (
    <form key={state.attempt ?? 0} action={action} className="relative grid gap-4 rounded-lg border border-rule bg-white p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label}>
          Name
          <input className={input} name="name" defaultValue={f.name} autoComplete="name" required maxLength={120} />
        </label>
        <label className={label}>
          Phone / WhatsApp
          <input className={input} name="phone" defaultValue={f.phone} type="tel" autoComplete="tel" required maxLength={40} placeholder="+971 …" />
        </label>
      </div>
      <label className={label}>
        <span>
          Email <span className="font-normal text-ink-muted">(optional)</span>
        </span>
        <input className={input} name="email" defaultValue={f.email} type="email" autoComplete="email" maxLength={200} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <Choice value={f.buy_as} name="buy_as" title="Buying as" options={BUY_AS} />
        <Choice value={f.bedrooms} name="bedrooms" title="Bedrooms" options={BEDROOMS} />
        <Choice value={f.budget} name="budget" title="Budget" options={BUDGETS} />
        <Choice value={f.timing} name="timing" title="When" options={TIMINGS} />
        <Choice value={f.funding} name="funding" title="Paying by" options={FUNDING} />
      </div>
      <label className={label}>
        <span>
          Anything else? <span className="font-normal text-ink-muted">(a building, a view, a handover date)</span>
        </span>
        <textarea className={`${input} min-h-28`} name="message" defaultValue={f.message} maxLength={2000} />
      </label>
      {/* Honeypot — hidden from people, filled by bots. Its name and label
          match nothing a browser or password manager autofills (never
          "company", "website", "address"), or real buyers would be caught. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Leave this empty
          <input name="hp_ref" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="flex items-start gap-2.5 text-sm text-ink-muted">
        <input type="checkbox" name="consent" defaultChecked={f.consent === "on"} required className="mt-0.5 size-4 shrink-0 accent-[var(--accent)]" />
        <span>
          You may contact me by phone, WhatsApp or email about this enquiry. See the{" "}
          <Link href="/privacy" className="underline underline-offset-4">
            privacy notice
          </Link>
          .
        </span>
      </label>
      {state.message && (
        <p className="rounded-md bg-red-50 px-3.5 py-2.5 text-sm text-red-800" role="alert">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="justify-self-start rounded-md bg-ink px-6 py-3 font-medium text-white transition hover:bg-ink/90 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}
