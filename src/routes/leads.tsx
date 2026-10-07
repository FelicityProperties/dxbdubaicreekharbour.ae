/**
 * Private list of website enquiries. Vercel-only layer (see
 * src/lib/enquiries.functions.ts). The password is LEADS_PASSWORD in Vercel;
 * it is checked on the server and no enquiry leaves the server without it.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { EMAIL_RE, MIN_LEADS_PASSWORD, getLeads, type Lead, type LeadsResult } from "@/lib/enquiries.functions";

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

/**
 * International digits for wa.me and tel: links. UAE numbers arrive as
 * +971…, 00971…, 05… or a bare 5XXXXXXXX; "+44 (0)20…" drops its (0).
 */
function intl(phone: string): string {
  const d = phone.replace(/\(0\)/g, "").replace(/\D/g, "");
  if (phone.trim().startsWith("+")) return d;
  if (d.startsWith("00")) return d.slice(2);
  if (d.startsWith("0")) return `971${d.slice(1)}`;
  if (/^5\d{8}$/.test(d)) return `971${d}`;
  return d;
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

  async function load(pw: string) {
    setBusy(true);
    try {
      const res = await getLeads({ data: { password: pw } });
      setResult(res);
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
    const saved = readSaved();
    if (saved) void load(saved);
  }, []);

  const leads: Lead[] = result?.status === "ok" ? result.leads : [];

  return (
    <main className="container min-h-[calc(100svh-90px)] py-12 max-sm:min-h-[calc(100svh-76px)]">
      <h1 className="font-[family-name:var(--font-display)] text-[44px]">Enquiries</h1>

      {result?.status !== "ok" && (
        <form
          className="mt-6 flex max-w-md flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void load(password);
          }}
        >
          <label className="grid flex-1 gap-1.5 text-[12px] font-medium uppercase tracking-[1px] text-muted-foreground">
            Password
            <input
              type="password"
              className="w-full rounded-[2px] border border-border bg-background px-3 py-2.5 text-[14px] text-foreground"
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
          <p className="mt-2 text-muted-foreground">
            {leads.length} {leads.length === 1 ? "enquiry" : "enquiries"}, newest first. Times are Dubai time.
          </p>
          <div className="mt-8 grid gap-4">
            {leads.map((r) => (
              <article key={r.id} className="min-w-0 rounded-[3px] border border-border bg-background p-5 [overflow-wrap:anywhere]">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-[18px] font-medium">{r.name}</h2>
                  <time className="text-[13px] text-muted-foreground">{dubaiTime.format(new Date(r.created_at))}</time>
                </div>
                <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
                  <a className="underline underline-offset-4" href={`https://wa.me/${intl(r.phone)}`} target="_blank" rel="noopener noreferrer">
                    WhatsApp {r.phone}
                  </a>
                  <a className="underline underline-offset-4" href={`tel:+${intl(r.phone)}`}>
                    Call
                  </a>
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
                      ["Buying as", r.buy_as],
                      ["Bedrooms", r.bedrooms],
                      ["Budget", r.budget],
                      ["When", r.timing],
                      ["Paying by", r.funding],
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
            ))}
          </div>
        </>
      )}
    </main>
  );
}
