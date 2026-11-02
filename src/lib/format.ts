/**
 * Number and date formatting that renders identically on the server and in every browser (no locale lookups).
 * Figures use Western digits in every language (as Dubai's own Arabic property documents do); dates follow the
 * page's language: "7 October 2026", "7 أكتوبر 2026", "2026年10月7日".
 */
import type { Locale } from "@/i18n/locales";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

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
/** Day and month without the year: "7 Oct", "7 أكتوبر", "10月7日" (Arabic months are never shortened). */
function dayMonth(p: [number, number, number], locale: Locale, long: boolean): string {
  if (locale === "zh") return `${p[1]}月${p[2]}日`;
  if (locale === "ar") return `${p[2]} ${MONTHS_AR[p[1] - 1]}`;
  const m = MONTHS[p[1] - 1] ?? "";
  return `${p[2]} ${long ? m : m.slice(0, 3)}`;
}
const withYear = (p: [number, number, number], locale: Locale, long: boolean) => (locale === "zh" ? `${p[0]}年${dayMonth(p, locale, long)}` : `${dayMonth(p, locale, long)} ${p[0]}`);

/** "2026-10-07" → "7 Oct 2026" (Arabic: "7 أكتوبر 2026", Chinese: "2026年10月7日") */
export function dateShort(iso: string, locale: Locale = "en"): string {
  const p = parts(iso);
  return p ? withYear(p, locale, false) : iso;
}
/** "2026-10-07" → "7 October 2026" (Arabic: "7 أكتوبر 2026", Chinese: "2026年10月7日") */
export function dateLong(iso: string, locale: Locale = "en"): string {
  const p = parts(iso);
  return p ? withYear(p, locale, true) : iso;
}
/** "2026-10" → "October 2026" (Arabic: "أكتوبر 2026", Chinese: "2026年10月") */
export function monthYear(iso: string, locale: Locale = "en"): string {
  const [y, m] = iso.split("-").map(Number);
  if (!y || !m) return iso;
  return locale === "zh" ? `${y}年${m}月` : `${(locale === "ar" ? MONTHS_AR : MONTHS)[m - 1]} ${y}`;
}
/**
 * A date the data files hold as English words ("9 October 2026", e.g. SITE.pricesCheckedOn) in the page's
 * language. Anything that is not such a date comes back unchanged.
 */
export function dateText(english: string, locale: Locale = "en"): string {
  const m = /^(\d{1,2}) ([A-Z][a-z]+) (\d{4})$/.exec(english.trim());
  const month = m ? MONTHS.indexOf(m[2]!) + 1 : 0;
  if (!m || !month || locale === "en") return english;
  return dateLong(`${m[3]}-${String(month).padStart(2, "0")}-${m[1]!.padStart(2, "0")}`, locale);
}
/** "2026-07-13", "2026-10-07" → "13 Jul – 7 Oct 2026" (Chinese: "2026年7月13日至10月7日") */
export function dateRange(from: string, to: string, locale: Locale = "en"): string {
  const a = parts(from), b = parts(to);
  if (!a || !b) return `${from} – ${to}`;
  if (locale === "zh") return a[0] === b[0] ? `${withYear(a, locale, false)}至${dayMonth(b, locale, false)}` : `${withYear(a, locale, false)}至${withYear(b, locale, false)}`;
  const left = a[0] === b[0] ? dayMonth(a, locale, false) : dateShort(from, locale);
  return `${left} – ${dateShort(to, locale)}`;
}

/** The brand line to show under a project name, or null when the name already carries it ("Lyvia by Palace" + "by Palace"). */
export const brandLine = (p: { name: string; brand: string | null }): string | null => {
  if (!p.brand) return null;
  const word = p.brand.replace(/^by\s+/i, "").trim();
  return word && p.name.toLowerCase().includes(word.toLowerCase()) ? null : p.brand;
};
/** Full label for selects, titles and summaries: "Lyvia by Palace", "Creek Crest", "Montiva by Vida" — the brand is appended only when the name does not already carry it. */
export const projectLabel = (p: { name: string; brand: string | null }): string => {
  const b = brandLine(p);
  return b?.startsWith("by ") ? `${p.name} ${b}` : p.name;
};
