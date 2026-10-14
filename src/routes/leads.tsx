/**
 * Private list of website enquiries (see src/lib/enquiries.functions.ts).
 * The password is LEADS_PASSWORD in Vercel; it is checked on the server and
 * no enquiry leaves the server without it.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { EMAIL_RE, MIN_LEADS_PASSWORD, getLeads, type Lead, type LeadsResult } from "@/lib/enquiries.functions";
import { STAYED_PATH, isCountingThisDevice, setCountingThisDevice } from "@/components/SiteAnalytics";

export const Route = createFileRoute("/leads")({
  head: () => ({
    meta: [{ title: "Leads | DXB Creek Harbour" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: LeadsPage,
});

const KEY = "dxbch-leads-password";

const dubaiTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Dubai",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const UAE_RE = /^(0?5\d{8}|0[2-4679]\d{7})$/; // 05X XXXXXXX mobile, 0X XXXXXXX landline
const UAE_COUNTRY = /\b(uae|u\.a\.e\.?|emirates|dubai|abu dhabi|sharjah|ajman|ras al khaimah|fujairah|umm al quwain)\b/i;
/**
 * International digits for wa.me and tel: links, or null when the number
 * can't honestly be made international (a national number from abroad).
 * UAE numbers arrive as +971…, 00971…, 05… or a bare 5XXXXXXXX; "+44 (0)20…"
 * drops its (0).
 */
function intl(phone: string, country: string | null): string | null {
  const d = phone.replace(/\(0\)/g, "").replace(/\D/g, "");
  if (phone.trim().startsWith("+")) return d;
  if (d.startsWith("00")) return d.slice(2);
  const abroad = !!country && !UAE_COUNTRY.test(country);
  if (!abroad && UAE_RE.test(d)) return `971${d.replace(/^0/, "")}`;
  return null;
}

function readSaved(): string {
  try {
    return sessionStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

function LeadsPage() {
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<LeadsResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [counted, setCounted] = useState(true);
  const [marked, setMarked] = useState<null | "ok" | "blocked">(null);

  async function load(pw: string, typed = false) {
    setBusy(true);
    try {
      const res = await getLeads({ data: { password: pw } });
      setResult(res);
      // Signing in marks this device as the owner's: its visits stay out of the visitor numbers.
      // (Only when the password is typed, so "Count it again" sticks across reloads of this page.)
      if (res.status === "ok" && typed) {
        const stillCounted = setCountingThisDevice(false);
        setCounted(stillCounted);
        if (stillCounted) setMarked("blocked");
      }
      try {
        if (res.status === "ok") sessionStorage.setItem(KEY, pw);
        else sessionStorage.removeItem(KEY);
      } catch {
        /* storage unavailable — just ask again next time */
      }
    } catch {
      setResult({ status: "offline" });
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    // /leads?me=1 marks a browser without the password (for in-app browsers such as Instagram's).
    if (new URLSearchParams(window.location.search).has("me")) {
      const stillCounted = setCountingThisDevice(false);
      setMarked(stillCounted ? "blocked" : "ok");
    }
    setCounted(isCountingThisDevice());
    const saved = readSaved();
    if (saved) void load(saved);
  }, []);

  const leads: Lead[] = result?.status === "ok" ? result.leads : [];

  return (
    <main className="container min-h-[calc(100svh-90px)] py-12 max-sm:min-h-[calc(100svh-76px)]">
      <h1 className="font-[family-name:var(--font-display)] text-[44px]">Enquiries</h1>

      {marked && (
        <p className="mt-4 max-w-md text-[14px]">
          {marked === "ok"
            ? "Done: this browser is now left out of the visitor numbers."
            : "This browser blocks saving settings, so visits from it are still counted."}
        </p>
      )}

      {result?.status !== "ok" && (
        <form
          className="mt-6 flex max-w-md flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void load(password, true);
          }}
        >
          <label className="grid flex-1 gap-1.5 text-[12px] font-medium uppercase tracking-[1px] text-muted-foreground">
            Password
            <input
              type="password"
              className="w-full rounded-[2px] border border-border bg-background px-3 py-2.5 text-[14px] max-sm:text-[16px] text-foreground"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          <Button type="submit" disabled={busy || !password} className="min-h-11">
            {busy ? "Checking…" : "Show enquiries"}
          </Button>
        </form>
      )}

      {result?.status === "not-configured" && (
        <p className="mt-4 text-muted-foreground">
          Leads page isn't set up yet — add a LEADS_PASSWORD of at least {MIN_LEADS_PASSWORD} characters in Vercel.
        </p>
      )}
      {result?.status === "wrong-password" && <p className="mt-4 text-red-800">Wrong password.</p>}
      {result?.status === "offline" && (
        <p className="mt-4 text-red-800">Couldn't reach the database. Check DATABASE_URL in Vercel, then try again.</p>
      )}

      {result?.status === "ok" && (
        <>
          <section className="mt-6 max-w-3xl rounded-[3px] border border-border bg-background p-5 text-[14px] leading-relaxed">
            <h2 className="text-[18px] font-medium">Visitor numbers</h2>
            <p className="mt-2">
              In <a className="underline underline-offset-4" href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer">Vercel</a>, open this
              website's project and the <strong>Analytics</strong> tab. Only you can see it.
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>Visitors</strong>: how many different people came (each person counted once a day).</li>
              <li>
                <strong>Who stayed</strong>: in the list of pages, the line <code>{STAYED_PATH}</code> is how many visits kept the site on screen for
                at least 30 seconds. <strong>Bounce rate</strong> is the share who left within 30 seconds without opening another page.
              </li>
              <li><strong>Page views</strong>: pages opened, plus one for each visit that stayed 30 seconds (that same line).</li>
              <li>The other lists show which pages people read, where they came from (Google, Instagram…), their country and device.</li>
            </ul>
            <p className="mt-3">
              {counted ? "Your visits from this browser are counted." : "This browser is not counted: your visits from it stay out of the numbers."}{" "}
              <button
                type="button"
                className="underline underline-offset-4"
                onClick={() => {
                  const now = setCountingThisDevice(!counted);
                  setCounted(now);
                  setMarked(now && counted ? "blocked" : null);
                }}
              >
                {counted ? "Don't count this browser" : "Count it again"}
              </button>
            </p>
            <p className="mt-1 text-muted-foreground">
              Sign in here once in each browser you use (Safari, Chrome, on each phone and computer). Where you'd rather not type the password,
              such as Instagram's or LinkedIn's built-in browser, open <strong>dxbdubaicreekharbour.ae/leads?me=1</strong> there once. Still counted:
              private windows, and the site's home-screen icon on iPhone.
            </p>
          </section>
          <p className="mt-6 text-muted-foreground">
            {leads.length} {leads.length === 1 ? "enquiry" : "enquiries"}, newest first. Times are Dubai time.
          </p>
          <div className="mt-8 grid gap-4">
            {leads.map((r) => {
              const n = intl(r.phone, r.country);
              return (
              <article key={r.id} className="min-w-0 rounded-[3px] border border-border bg-background p-5 [overflow-wrap:anywhere]">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-[18px] font-medium">{r.name}</h2>
                  <time className="text-[13px] text-muted-foreground">{dubaiTime.format(new Date(r.created_at))}</time>
                </div>
                <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
                  {n ? (
                    <>
                      <a className="underline underline-offset-4" href={`https://wa.me/${n}`} target="_blank" rel="noopener noreferrer">
                        WhatsApp {r.phone}
                      </a>
                      <a className="underline underline-offset-4" href={`tel:+${n}`}>
                        Call
                      </a>
                    </>
                  ) : (
                    <span>{r.phone}</span>
                  )}
                  {r.email &&
                    (EMAIL_RE.test(r.email) ? (
                      <a className="underline underline-offset-4" href={`mailto:${r.email}`}>
                        {r.email}
                      </a>
                    ) : (
                      <span>{r.email}</span>
                    ))}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-[12px]">
                  {(
                    [
                      ["Project", r.project],
                      ["Looking for", r.looking_for],
                      ["Buying as", r.buy_as],
                      ["Bedrooms", r.bedrooms],
                      ["Budget", r.budget],
                      ["When", r.timing],
                      ["Paying by", r.funding],
                      ["Lives in", r.country],
                      ["Language", r.language],
                      ["Page", r.page],
                    ] as const
                  )
                    .filter(([, value]) => value)
                    .map(([k, value]) => (
                      <span key={k} className="rounded-full bg-secondary px-3 py-1">
                        <span className="text-muted-foreground">{k}: </span>
                        {value}
                      </span>
                    ))}
                </div>
                {r.message && <p className="mt-3 whitespace-pre-wrap text-[14px]">{r.message}</p>}
              </article>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}
