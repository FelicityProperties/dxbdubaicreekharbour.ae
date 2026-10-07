import type { Metadata } from "next";
import { connection } from "next/server";
import { db, type Enquiry } from "@/lib/db";

export const metadata: Metadata = {
  title: "Leads",
  robots: { index: false, follow: false },
};

const dubaiTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Dubai",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * The number in international digits for wa.me and tel: links. Visitors
 * type UAE numbers every way: +971 50…, 00971 50…, 050….
 */
function intl(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (phone.trim().startsWith("+")) return d;
  if (d.startsWith("00")) return d.slice(2);
  if (d.startsWith("0")) return `971${d.slice(1)}`;
  return d;
}

export default async function Leads() {
  // Always read fresh rows: never prerender or cache this page.
  await connection();

  const sql = db();
  let rows: Enquiry[] = [];
  let problem = "";
  if (!sql) problem = "DATABASE_URL is not set in Vercel, so enquiries can't be saved or shown.";
  else {
    try {
      rows = (await sql`SELECT * FROM enquiries ORDER BY created_at DESC LIMIT 500`) as Enquiry[];
    } catch (err) {
      console.error("leads read failed", err);
      problem = "Couldn't read the enquiries from the database. Try again in a minute.";
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl text-ink">Enquiries</h1>
      <p className="mt-2 text-ink-muted">
        {problem || `${rows.length} ${rows.length === 1 ? "enquiry" : "enquiries"}, newest first. Times are Dubai time.`}
      </p>

      {rows.length > 0 && (
        <div className="mt-8 grid gap-4">
          {rows.map((r) => (
            <article key={r.id} className="rounded-lg border border-rule bg-white p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-medium text-ink">{r.name}</h2>
                <time className="text-sm text-ink-muted">{dubaiTime.format(new Date(r.created_at))}</time>
              </div>
              <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <a className="text-accent-deep underline underline-offset-4" href={`https://wa.me/${intl(r.phone)}`}>
                  WhatsApp {r.phone}
                </a>
                <a className="text-accent-deep underline underline-offset-4" href={`tel:+${intl(r.phone)}`}>
                  Call
                </a>
                {r.email && (
                  <a className="text-accent-deep underline underline-offset-4" href={`mailto:${r.email}`}>
                    {r.email}
                  </a>
                )}
              </p>
              <dl className="mt-3 flex flex-wrap gap-2 text-sm">
                {(
                  [
                    ["Buying as", r.buy_as],
                    ["Bedrooms", r.bedrooms],
                    ["Budget", r.budget],
                    ["When", r.timing],
                    ["Paying by", r.funding],
                  ] as const
                )
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k} className="rounded-full bg-bg px-3 py-1">
                      <dt className="inline text-ink-muted">{k}: </dt>
                      <dd className="inline text-ink">{v}</dd>
                    </div>
                  ))}
              </dl>
              {r.message && <p className="mt-3 whitespace-pre-wrap text-ink">{r.message}</p>}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
