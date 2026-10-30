/**
 * The owner's private page: website enquiries (src/lib/enquiries.functions.ts)
 * and visitor numbers (src/components/leads/VisitorStats.tsx). The password is
 * LEADS_PASSWORD in Vercel; it is checked on the server and nothing leaves the
 * server without it. Typing it here also stops this browser's visits being
 * counted.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { EMAIL_RE, LEADS_SHOWN, MIN_LEADS_PASSWORD, getLeads, type DatabaseProblem, type Lead, type LeadsResult } from "@/lib/enquiries.functions";
import { setCountingThisDevice } from "@/components/SiteAnalytics";
import { VisitorStats } from "@/components/leads/VisitorStats";

export const Route = createFileRoute("/leads")({
  head: () => ({
    meta: [{ title: "Leads | DXB Creek Harbour" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: LeadsPage,
});

const KEY = "dxbch-leads-password";
const TAB = "dxbch-leads-tab";

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

const FIX: Record<DatabaseProblem["kind"], string> = {
  "not-set":
    "The password is right, but no database is connected to this site, so enquiries can't be listed here. In Vercel, open the project that has dxbdubaicreekharbour.ae under Domains, go to Storage and connect your Neon database with Production ticked, then redeploy.",
  paused:
    "The password is right, but your Neon database is paused: its free monthly allowance is used up. It comes back on the 1st of next month, or straight away if you upgrade the Neon plan.",
  login:
    "The password is right, but the database refused the login in DATABASE_URL (its password may have changed). Copy the connection string from Neon again into DATABASE_URL in Vercel, then redeploy.",
  "bad-address":
    "The password is right, but DATABASE_URL in Vercel isn't a valid database address. Paste the connection string from Neon exactly as given (it starts with postgresql://), then redeploy.",
  unreachable: "The password is right, but the database didn't answer. Try again in a minute; if it keeps happening, check the database in Neon.",
  other: "The password is right, but the database gave an error.",
};

/** Why the enquiries can't be shown, in steps the owner can take (sent only once the password is accepted). */
function DatabaseTrouble({ problem }: { problem: DatabaseProblem | undefined }) {
  if (!problem)
    return (
      <p className="mt-4 max-w-2xl text-red-800">
        Couldn't get an answer from the website. If your internet is working, the site or its database may be having trouble — try again in a minute.
      </p>
    );
  return (
    <div className="mt-4 grid max-w-2xl gap-2">
      <p className="text-red-800">{FIX[problem.kind]}</p>
      {problem.detail && <p className="text-[13px] text-muted-foreground [overflow-wrap:anywhere]">Database said: {problem.detail}</p>}
      <p className="text-[14px] text-muted-foreground">
        {problem.emailAlerts
          ? "Meanwhile, new enquiries are still emailed to you."
          : "Lead emails aren't switched on either (RESEND_API_KEY in Vercel), so a visitor who enquires now sees an error and is offered WhatsApp instead."}
      </p>
    </div>
  );
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
  const [marked, setMarked] = useState<null | "ok" | "blocked">(null);
  const [signedIn, setSignedIn] = useState(""); // the password that worked, for the visitor numbers
  const [tab, setTab] = useState<"visitors" | "enquiries">("visitors");

  async function load(pw: string, typed = false) {
    setBusy(true);
    try {
      const res = await getLeads({ data: { password: pw } });
      setResult(res);
      if (res.status === "ok") setSignedIn(pw);
      // Signing in marks this browser as the owner's: its visits stay out of the visitor numbers.
      // (Only when the password is typed, so "Count it again" sticks across reloads of this page.)
      if (res.status === "ok" && typed && setCountingThisDevice(false)) setMarked("blocked");
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
    // The lead email links to ?tab=enquiries; otherwise the tab last used here.
    const wanted = new URLSearchParams(window.location.search).get("tab");
    if (wanted === "enquiries" || wanted === "visitors") setTab(wanted);
    else try { if (localStorage.getItem(TAB) === "enquiries") setTab("enquiries"); } catch { /* default tab */ }
    const saved = readSaved();
    if (saved) void load(saved);
  }, []);

  const leads: Lead[] = result?.status === "ok" ? result.leads : [];
  const total = result?.status === "ok" ? Math.max(result.total ?? leads.length, leads.length) : 0;

  return (
    <main className="container min-h-[calc(100svh-90px)] py-12 max-sm:min-h-[calc(100svh-76px)]">
      <h1 className="font-[family-name:var(--font-display)] text-[44px]">{result?.status === "ok" ? "Your website" : "Enquiries"}</h1>

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
            {busy ? "Checking…" : "Sign in"}
          </Button>
        </form>
      )}

      {result?.status === "not-configured" && (
        <p className="mt-4 text-muted-foreground">
          Leads page isn't set up yet — add a LEADS_PASSWORD of at least {MIN_LEADS_PASSWORD} characters in Vercel.
        </p>
      )}
      {result?.status === "wrong-password" && <p className="mt-4 text-red-800">Wrong password.</p>}
      {result?.status === "offline" && <DatabaseTrouble problem={result.problem} />}

      {result?.status === "ok" && (
        <>
          <div className="viz-tabs" role="group" aria-label="Show">
            {(
              [
                ["visitors", "Visitors"],
                ["enquiries", `Enquiries (${total})`],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={tab === id}
                onClick={() => {
                  setTab(id);
                  try { localStorage.setItem(TAB, id); } catch { /* remembered for this visit only */ }
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <div hidden={tab !== "visitors"}>
            <VisitorStats
              password={signedIn}
              onCountingChange={() => setMarked(null)}
              onSignedOut={() => {
                try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
                setSignedIn("");
                setResult({ status: "wrong-password" });
              }}
            />
          </div>
          <div hidden={tab !== "enquiries"}>
          <p className="mt-6 text-muted-foreground">
            {total} {total === 1 ? "enquiry" : "enquiries"}, newest first.{total > leads.length ? ` The newest ${LEADS_SHOWN} are listed here; the older ones are still saved in the database.` : ""} Times are Dubai time.
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
          </div>
        </>
      )}
    </main>
  );
}
