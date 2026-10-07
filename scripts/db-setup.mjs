/**
 * Creates the enquiries table in Neon if it isn't there yet. Runs before
 * every build, so a fresh Neon database needs no manual step. Without
 * DATABASE_URL it says so and exits cleanly, so a build without the
 * database (a local run, a preview) still succeeds.
 *
 *   npm run db:setup
 */
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.log("db-setup: DATABASE_URL not set — skipping (enquiries will not be saved).");
  process.exit(0);
}

if (!/^postgres(ql)?:\/\//.test(url)) {
  console.error(
    "db-setup: DATABASE_URL must be the bare postgresql://… string from Neon " +
      "(no quotes, no 'DATABASE_URL=', no 'psql'). Fix it in Vercel and redeploy.",
  );
  process.exit(1);
}

try {
  const sql = neon(url);
  await sql`
    CREATE TABLE IF NOT EXISTS enquiries (
      id          BIGSERIAL PRIMARY KEY,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      name        TEXT NOT NULL,
      phone       TEXT NOT NULL,
      email       TEXT,
      buy_as      TEXT,
      bedrooms    TEXT,
      budget      TEXT,
      timing      TEXT,
      funding     TEXT,
      message     TEXT,
      page        TEXT,
      status      TEXT NOT NULL DEFAULT 'new'
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS enquiries_created_at_idx ON enquiries (created_at DESC)`;
} catch (err) {
  // The Neon driver repeats the connection string, password included, in its
  // errors. Build logs are kept and shared, so strip it before printing.
  const msg = String(err?.message ?? err)
    .split(url)
    .join("<DATABASE_URL>")
    .replace(/\/\/[^\s'"]*@/g, "//<credentials>@");
  console.error("db-setup: could not create the enquiries table: " + msg);
  process.exit(1);
}
console.log("db-setup: enquiries table ready.");
