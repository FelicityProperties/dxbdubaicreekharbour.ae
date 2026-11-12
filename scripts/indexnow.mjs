// Tells Bing and the other IndexNow search engines (Yandex, Naver, Seznam, Yep) that the site's pages are new or have
// changed, so they fetch them now and not whenever they next come by: `npm run indexnow`, once a deploy that adds pages
// or changes figures is live. Bing's index is also where ChatGPT search and Copilot look pages up. Google does not
// take part: it reads public/sitemap.xml, and Search Console is where to ask it for a page.
//
// The key is not a secret. IndexNow has the site publish it at /<key>.txt (public/<key>.txt here) to show that the
// list comes from whoever runs the site; all it lets anyone do is name this site's own pages to a search engine.
import { readFileSync, readdirSync } from "node:fs";

const pub = new URL("../public/", import.meta.url);
const pages = [...readFileSync(new URL("sitemap.xml", pub), "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (!pages.length) throw new Error("public/sitemap.xml lists no pages: run `npm run sitemap` first");
const site = new URL(pages[0]);
const keyFile = readdirSync(pub).find((f) => /^[0-9a-f]{32}\.txt$/.test(f) && readFileSync(new URL(f, pub), "utf8").trim() === f.slice(0, -4));
if (!keyFile) throw new Error("public/ holds no IndexNow key file (<32 hex characters>.txt containing its own name)");
const key = keyFile.slice(0, -4);
const keyLocation = `${site.origin}/${keyFile}`;

// The search engines fetch the key from the live site before they accept the list, so it has to be deployed first.
// Behind an HTTPS proxy (a cloud session) Node's fetch uses the proxy only when asked: NODE_USE_ENV_PROXY=1 npm run indexnow
const live = await fetch(keyLocation).then((r) => (r.ok ? r.text() : ""), (e) => {
  console.error(`Could not reach ${site.origin} (${e.cause?.message ?? e.message}). Behind a proxy, run: NODE_USE_ENV_PROXY=1 npm run indexnow`);
  process.exit(1);
});
if (live.trim() !== key) {
  console.error(`${keyLocation} is not live yet. Deploy first, then run this again.`);
  process.exit(1);
}

const urlList = [...pages, `${site.origin}/llms.txt`];
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: site.host, key, keyLocation, urlList }),
});
// 200: accepted. 202: accepted, the key is still being checked. 403 on a key's first use: the search engines are
// still checking it and nothing was accepted; a minute or two later the same run is accepted.
console.log(`IndexNow: ${urlList.length} addresses sent for ${site.host}, answer ${res.status} ${res.statusText}`);
if (res.status !== 200 && res.status !== 202) {
  console.error((await res.text()).slice(0, 500));
  if (res.status === 403) console.error("If this is the key's first use, run it again in a minute or two.");
  process.exit(1);
}
