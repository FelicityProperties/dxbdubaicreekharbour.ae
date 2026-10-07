/**
 * Guards the two rules this site is built on:
 *
 * 1. It is separate. No Felicity Properties name, licence number, phone or
 *    email anywhere in what visitors can see.
 * 2. No market figures in the copy — no price per square foot, yield, rent
 *    or "average price" numbers. Those go stale on a page; buyers get
 *    current figures when their enquiry is answered. The budget bands on the
 *    form are the visitor's own choice, not a claim about the market, and
 *    are allowed by name.
 *
 * Also checks the "not the official site / not Emaar" line is still there.
 *
 *   node scripts/verify-site.mjs
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|css|json|svg|txt|html)$/.test(name)) out.push(p);
  }
  return out;
}

const files = [...walk("src"), ...walk("public")];
const text = Object.fromEntries(files.map((f) => [f, readFileSync(f, "utf8")]));

let failures = 0;
const check = (name, ok, detail = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${!ok && detail ? `\n      ${detail}` : ""}`);
};

const FELICITY = /felicity|felicitypro|33951|1145910|59244|563520611|bay square/i;
const felicityHits = files.filter((f) => FELICITY.test(text[f]));
check("no Felicity name, licence, phone or address on the site", felicityHits.length === 0, felicityHits.join(", "));

// A figure next to a market word: "AED 2,400 per sq ft", "6.5% yield", "1,234 transactions".
const FIGURE =
  /(AED\s*\d|\d[\d,.]*\s*%\s*(yield|return|roi|growth|appreciation|gain|rise|drop|fall)|\d[\d,.]*\s*(per\s*sq|psf|\/\s*sq)|\b(yields?|rents?|psf|price per|average price|median)\b[^.\n]{0,30}\d|\d[\d,.]*\s*(transactions|deals|sales)\b)/i;
const BUDGET_BAND = /AED \d[\d.]*M/;
const figureHits = [];
for (const f of files) {
  text[f].split("\n").forEach((line, i) => {
    const t = line.trim();
    if (/^(\/\/|\*|\/\*)/.test(t)) return;
    if (BUDGET_BAND.test(t) && f.endsWith("site.ts")) return;
    if (/className=|stopOpacity|offset=|opacity|viewBox|width|height/.test(t)) return;
    const m = t.match(FIGURE);
    if (m) figureHits.push(`${f}:${i + 1}: "${m[0]}"`);
  });
}
check("no market figures (price/psf/yield/rent/transaction counts) in the copy", figureHits.length === 0, figureHits.join("\n      "));

const site = text["src/lib/site.ts"] ?? "";
check(
  "the independence line names Emaar and says this is not the official site",
  /not the official Dubai Creek Harbour website/.test(site) && /not affiliated with, endorsed by or operated by Emaar/.test(site)
);
check("the footer prints the independence line", /\{INDEPENDENCE\}/.test(text["src/components/site-footer.tsx"] ?? ""));
check("the leads page is password-protected", /matcher:\s*\["\/leads"/.test(text["src/proxy.ts"] ?? ""));
check("search engines are told to skip /leads", /disallow:\s*"\/leads"/.test(text["src/app/robots.ts"] ?? ""));

console.log(failures ? `\n${failures} check(s) failed.` : "\nAll checks passed.");
process.exit(failures ? 1 : 0);
