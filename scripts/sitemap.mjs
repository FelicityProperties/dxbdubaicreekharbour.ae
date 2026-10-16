// Regenerates public/sitemap.xml and public/robots.txt from the data files: `npm run sitemap`, then commit.
// Every address is SITE.url (the www host Vercel serves): Google won't index a sitemap URL that redirects.
// A test (src/test/data-integrity.test.ts) fails if a page or project is missing,
// so the file cannot silently drift from the routes.
import { readFileSync, writeFileSync } from "node:fs";
import { PROJECTS, SITE } from "../src/data/projects.ts";
import { TERMS, PRIVACY } from "../src/data/legal.ts";

const tx = JSON.parse(readFileSync(new URL("../src/data/transactions.json", import.meta.url), "utf8"));
// Content pages change when either snapshot or the shared footer changes; keep this date in step with real edits.
const CONTENT_UPDATED = "2026-10-12";
const later = (a, b) => (a > b ? a : b);
const content = later(tx.source.snapshotDate, CONTENT_UPDATED);
const url = (path, lastmod) => `  <url><loc>${SITE.url}${path}</loc><lastmod>${lastmod}</lastmod></url>`;
const rows = [
  url("/", content), url("/projects", content), url("/payment-plans", content), url("/market", content), url("/area", content), url("/guide", content),
  ...PROJECTS.map((p) => url(`/projects/${p.slug}`, content)),
  url("/terms", TERMS.lastUpdated), url("/privacy", PRIVACY.lastUpdated),
];
writeFileSync(new URL("../public/sitemap.xml", import.meta.url), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join("\n")}\n</urlset>\n`);
writeFileSync(new URL("../public/robots.txt", import.meta.url), `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`);
console.log(`sitemap.xml: ${rows.length} URLs`);
