import { neon } from "@neondatabase/serverless";

/**
 * The Neon connection, or null when DATABASE_URL isn't set (a local run or
 * a preview without the database). Callers say so to the visitor instead of
 * throwing a blank error page.
 */
export function db() {
  const url = process.env.DATABASE_URL;
  return url ? neon(url) : null;
}

export type Enquiry = {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  email: string | null;
  buy_as: string | null;
  bedrooms: string | null;
  budget: string | null;
  timing: string | null;
  funding: string | null;
  message: string | null;
};
