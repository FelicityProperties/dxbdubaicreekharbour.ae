/** Number and date formatting that renders identically on the server and in every browser (no locale lookups). */
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const thousands = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
export const num = (n: number | null | undefined) => (n == null ? "—" : thousands(n));
export const aed = (n: number | null | undefined) => (n == null ? "—" : `AED ${thousands(n)}`);
export function aedShort(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `AED ${(m >= 10 ? m.toFixed(1) : m.toFixed(2)).replace(/\.?0+$/, "")}M`;
  }
  return aed(n);
}

function parts(iso: string): [number, number, number] | null {
  const [y, m, d] = iso.split("-").map(Number);
  return y && m && d ? [y, m, d] : null;
}
/** "2026-10-07" → "7 Oct 2026" */
export function dateShort(iso: string): string {
  const p = parts(iso);
  return p ? `${p[2]} ${MONTHS[p[1] - 1]?.slice(0, 3)} ${p[0]}` : iso;
}
/** "2026-10-07" → "7 October 2026" */
export function dateLong(iso: string): string {
  const p = parts(iso);
  return p ? `${p[2]} ${MONTHS[p[1] - 1]} ${p[0]}` : iso;
}
/** "2026-07-13", "2026-10-07" → "13 Jul – 7 Oct 2026" */
export function dateRange(from: string, to: string): string {
  const a = parts(from), b = parts(to);
  if (!a || !b) return `${from} – ${to}`;
  const left = a[0] === b[0] ? `${a[2]} ${MONTHS[a[1] - 1]?.slice(0, 3)}` : dateShort(from);
  return `${left} – ${dateShort(to)}`;
}
