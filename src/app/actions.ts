"use server";

import { db } from "@/lib/db";
import { BEDROOMS, BUDGETS, BUY_AS, FUNDING, TIMINGS } from "@/lib/site";

export type EnquiryState = {
  ok: boolean;
  message: string;
  /**
   * What the visitor typed, sent back on an error so the form can refill
   * itself. React clears a form after its action runs; without this a
   * buyer who hits one mistake has to type everything again.
   */
  fields?: Record<string, string>;
};

const KEPT = ["name", "phone", "email", "buy_as", "bedrooms", "budget", "timing", "funding", "message", "consent"];

const field = (form: FormData, key: string, max: number) =>
  String(form.get(key) ?? "")
    .trim()
    .slice(0, max);

/** A dropdown answer, kept only if it is one of the options we offered. */
const choice = (form: FormData, key: string, options: readonly string[]) => {
  const v = field(form, key, 60);
  return options.includes(v) ? v : null;
};

export async function submitEnquiry(_prev: EnquiryState, form: FormData): Promise<EnquiryState> {
  const fields = Object.fromEntries(KEPT.map((k) => [k, field(form, k, 2000)]));
  const fail = (message: string): EnquiryState => ({ ok: false, message, fields });

  // Honeypot: a field people never see. Bots fill every input; pretend it
  // worked so they don't retry.
  if (field(form, "company", 200)) return { ok: true, message: "Thank you — we'll be in touch shortly." };

  const name = field(form, "name", 120);
  const phone = field(form, "phone", 40);
  const email = field(form, "email", 200);
  const message = field(form, "message", 2000);

  if (name.length < 2) return fail("Please tell us your name.");
  if (phone.replace(/\D/g, "").length < 7 || !/^[+\d\s()-]+$/.test(phone))
    return fail("Please enter a phone number we can call or WhatsApp.");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return fail("That email address doesn't look right — or leave it blank.");
  if (form.get("consent") !== "on")
    return fail("Please tick the box so we may contact you about your enquiry.");

  const sql = db();
  if (!sql) {
    console.error("enquiry not saved: DATABASE_URL is not set");
    return fail("Our form is offline for a moment. Please try again in a few minutes.");
  }

  try {
    await sql`
      INSERT INTO enquiries (name, phone, email, buy_as, bedrooms, budget, timing, funding, message, page)
      VALUES (
        ${name}, ${phone}, ${email || null},
        ${choice(form, "buy_as", BUY_AS)}, ${choice(form, "bedrooms", BEDROOMS)},
        ${choice(form, "budget", BUDGETS)}, ${choice(form, "timing", TIMINGS)},
        ${choice(form, "funding", FUNDING)}, ${message || null}, ${"home"}
      )
    `;
  } catch (err) {
    console.error("enquiry not saved", err);
    return fail("Something went wrong saving your enquiry. Please try again in a few minutes.");
  }

  return { ok: true, message: `Thank you, ${name.split(" ")[0]}. We'll call you shortly to talk through what's available.` };
}
