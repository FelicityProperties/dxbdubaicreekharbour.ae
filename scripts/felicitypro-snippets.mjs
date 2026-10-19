// Writes the code the owner pastes into Durable (felicitypro.com's site builder, which
// this repository cannot edit) for the "AI viewings" section:
//   design/felicitypro-ai-viewings/1-homepage-section.html   custom-code block under the home page hero
//   design/felicitypro-ai-viewings/2-ai-viewings-page.html   the same section with a two-line intro, on a new page
//   design/felicitypro-ai-viewings/3-ai-viewings-page-head.html  that page's head code (og:video), where Durable allows it
// The videos are this site's public/felicitypro files (npm run ai-viewings -- --set felicitypro), played
// from the www address Vercel serves. Each block is self-contained (styles prefixed .fpav, one script that
// works however many blocks a page has). If Durable strips scripts, the videos keep the browser's own
// controls. Run `npm run felicitypro-snippets` after re-encoding, then paste the new blocks into Durable.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const outDir = join(root, "design/felicitypro-ai-viewings");
const { videos } = JSON.parse(readFileSync(join(outDir, "videos.json"), "utf8"));
const HOST = "https://www.dxbdubaicreekharbour.ae"; // SITE.url: the address Vercel serves without a redirect
const WHATSAPP = "971563520611";

// The owner's wording, 19 Oct 2026.
const HEADING = "Walk through it before it's built";
const SUB = "AI viewings of Dubai off-plan homes, built from the developers' own plans.";
const INTRO = [
  "Each viewing turns the developer's own renders and floor plans into a short walk-through, so you can see the rooms, the light and the view before the building is finished.",
  "Like one? Ask us on WhatsApp and we send the floor plans and prices for that project.",
];
const PROJECTS = {
  valia: { project: "Valia", area: "Dubai Creek Harbour", developer: "Emaar", permit: "0710819088" },
  parkwood: { project: "Parkwood", area: "Dubai Hills Estate", developer: "Emaar", permit: "1882419628" },
  albero: { project: "Albero", area: "Dubai Creek Harbour", developer: "Emaar", permit: "1251122980" },
};
const ORDER = ["valia", "parkwood", "albero"];
const INSTAGRAM_REELS = "https://www.instagram.com/felicity_properties/reels/";

const rows = ORDER.map((slug) => {
  const file = videos.find((v) => v.slug === slug);
  if (!file) throw new Error(`${slug} is not encoded yet: npm run ai-viewings -- --set felicitypro`);
  return { slug, ...PROJECTS[slug], ...file, src: `${HOST}${file.video}?v=${file.hash}`, posterSrc: `${HOST}${file.poster}?v=${file.hash}` };
});
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const line = (v) => `${v.project} · ${v.area} · ${v.developer}`;
const whatsapp = (v) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hi Muhannad, I watched the ${v.project} AI viewing on your site - please send the floor plans and prices`)}`;

const ICON = {
  whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>',
};
// Built by the script at run time (so a page without scripts shows none of them).
const RUNTIME_ICONS = {
  play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polygon points="6 3 20 12 6 21 6 3"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/></svg>',
  mute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M11 5 6 9H2v6h4l5 4V5z"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/></svg>',
  sound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>',
};

// Felicity's navy and rose-gold (the brand values in the Felicity Lovable project); text in the
// darker rose-gold so small type stays readable. The block brings its own light background, so it
// reads the same in a dark Durable section. Fonts are inherited from the Durable page.
const CSS = `.fpav{--fpav-navy:#0F1B2D;--fpav-rose:#D1966D;--fpav-rose-text:#865634;--fpav-ivory:#FBFAF7;--fpav-muted:#566173;padding:72px 0;background:var(--fpav-ivory);color:var(--fpav-navy);text-align:left}
.fpav *{box-sizing:border-box}
.fpav .fpav-wrap{width:min(1180px,calc(100% - 40px));margin:0 auto}
.fpav .fpav-eyebrow{display:flex;align-items:center;gap:12px;margin:0 0 14px;font-size:12px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:var(--fpav-rose-text)}
.fpav .fpav-eyebrow::before{content:"";width:28px;height:1px;background:var(--fpav-rose)}
.fpav .fpav-h{margin:0;font-size:clamp(32px,5vw,52px);line-height:1.08;font-weight:500;color:var(--fpav-navy)}
.fpav .fpav-sub,.fpav .fpav-intro{margin:14px 0 0;max-width:620px;font-size:16px;line-height:1.6;color:var(--fpav-muted)}
.fpav .fpav-intro{margin-top:10px}
.fpav .fpav-grid{display:grid;grid-template-columns:minmax(0,1fr);gap:44px 24px;margin-top:36px}
.fpav .fpav-card{min-width:0}
.fpav .fpav-frame{position:relative;width:min(100%,calc(80vh * 9 / 16));margin:0 auto;aspect-ratio:9/16;background:var(--fpav-navy);border-radius:12px;overflow:hidden}
.fpav .fpav-video{position:absolute;inset:0;width:100%;height:100%;max-width:none;max-height:none;min-width:0;margin:0;padding:0;border:0;object-fit:cover;display:block;background:var(--fpav-navy);cursor:pointer}
.fpav svg{max-width:none;max-height:none}
@supports not (aspect-ratio:1/1){.fpav .fpav-video{position:static;height:auto}}
.fpav .fpav-ctl{position:absolute;height:44px;min-width:44px;display:inline-flex;align-items:center;justify-content:center;gap:8px;margin:0;padding:0 14px;border:0;border-radius:999px;background:rgba(15,27,45,.62);color:#fff;font:inherit;font-size:13px;line-height:1;cursor:pointer;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
.fpav .fpav-ctl:hover{background:rgba(15,27,45,.82)}
.fpav .fpav-ctl:focus-visible,.fpav .fpav-wa:focus-visible,.fpav .fpav-follow:focus-visible{outline:2px solid var(--fpav-rose);outline-offset:2px}
.fpav .fpav-ctl svg{width:18px;height:18px;flex:none}
.fpav .fpav-play{left:12px;bottom:12px;width:44px;padding:0}
.fpav .fpav-sound{right:12px;top:12px}
.fpav .fpav-body{display:flex;flex-direction:column;align-items:flex-start;gap:12px;padding-top:18px}
.fpav .fpav-project{margin:0;font-size:22px;line-height:1.25;font-weight:500;color:var(--fpav-navy)}
.fpav .fpav-tag{display:inline-block;padding:4px 10px;border:1px solid var(--fpav-rose);border-radius:999px;font-size:11px;line-height:1.5;letter-spacing:.08em;text-transform:uppercase;color:var(--fpav-rose-text)}
.fpav .fpav-wa{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;min-height:48px;margin:0;padding:12px 18px;border-radius:999px;background:var(--fpav-navy);color:var(--fpav-ivory)!important;font-size:14px;font-weight:600;line-height:1.3;letter-spacing:.02em;text-align:center;text-decoration:none!important}
.fpav .fpav-wa:hover{background:#1B2B44}
.fpav .fpav-wa svg{width:18px;height:18px;flex:none;color:var(--fpav-rose)}
.fpav .fpav-permit{margin:0;font-size:12px;line-height:1.5;color:var(--fpav-muted)}
.fpav .fpav-follow{display:inline-flex;align-items:center;gap:6px;min-height:44px;margin-top:32px;font-size:15px;font-weight:600;color:var(--fpav-rose-text)!important;text-decoration:none!important}
.fpav .fpav-follow:hover{text-decoration:underline!important;text-underline-offset:4px}
.fpav .fpav-follow svg{width:16px;height:16px}
@media (min-width:641px){.fpav .fpav-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (min-width:1024px){.fpav .fpav-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (max-width:640px){.fpav{padding:48px 0}}`;

// Same behaviour as the Creek Harbour site's player (src/components/showcase/AiViewings.tsx):
// nothing downloads until a video is half on screen; then it plays muted and inline and pauses
// below half; reduced-motion visitors get the poster and a play button; one sound at a time.
const JS = `(function(){
var ICON=${JSON.stringify(RUNTIME_ICONS)};
var players=[];
var still=!!(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches);
function start(v){var p=v.play();if(p&&p.catch)p.catch(function(e){if(e&&e.name==="NotAllowedError"&&!v.muted){v.muted=true;v.play().catch(function(){});}});}
function button(cls){var b=document.createElement("button");b.type="button";b.className="fpav-ctl "+cls;return b;}
function setup(card){
var v=card.querySelector(".fpav-video"),frame=card.querySelector(".fpav-frame");
if(!v||!frame||!("IntersectionObserver" in window))return;
var name=card.getAttribute("data-project"),hasSound=card.getAttribute("data-sound")==="yes",held=false,inView=false;
v.controls=false;v.removeAttribute("controls");v.muted=true;v.defaultMuted=true;v.setAttribute("muted","");v.playsInline=true;v.setAttribute("playsinline","");
players.push(v);
var play=button("fpav-play");frame.appendChild(play);
var snd=hasSound?button("fpav-sound"):null;if(snd)frame.appendChild(snd);
function paint(){
play.innerHTML=v.paused?ICON.play:ICON.pause;play.setAttribute("aria-label",(v.paused?"Play":"Pause")+" the "+name+" AI viewing");
if(snd){snd.innerHTML=v.muted?ICON.mute+'<span aria-hidden="true">Tap for sound</span>':ICON.sound;snd.setAttribute("aria-label",v.muted?"Tap for sound: the "+name+" AI viewing":"Mute the "+name+" AI viewing");}
}
function toggle(){if(v.paused){held=false;start(v);}else{held=true;v.pause();}}
play.addEventListener("click",toggle);v.addEventListener("click",toggle);
if(snd)snd.addEventListener("click",function(){if(!v.muted){v.muted=true;return;}for(var i=0;i<players.length;i++)if(players[i]!==v)players[i].muted=true;v.muted=false;held=false;if(v.paused)start(v);});
v.addEventListener("play",paint);v.addEventListener("volumechange",paint);
v.addEventListener("pause",function(){paint();if(inView&&document.visibilityState==="visible")held=true;});
new IntersectionObserver(function(entries){var e=entries[entries.length-1];inView=!!e&&e.isIntersecting&&e.intersectionRatio>=0.5;if(!inView)v.pause();else if(!still&&!held)start(v);},{threshold:[0,0.5]}).observe(v);
paint();
}
function init(){var cards=document.querySelectorAll(".fpav-card:not([data-fpav-ready])");for(var i=0;i<cards.length;i++){cards[i].setAttribute("data-fpav-ready","");setup(cards[i]);}}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();`;

const ld = (pageUrl) => JSON.stringify({
  "@context": "https://schema.org",
  "@graph": rows.map((v) => ({
    "@type": "VideoObject",
    "@id": `${pageUrl}#${v.slug}-ai-viewing`,
    name: `${line(v)} · AI viewing`,
    description: `An AI visualisation of ${v.developer}'s ${v.project} at ${v.area}, built from ${v.developer}'s own renders and plans. Felicity Properties (RERA ORN 33951) sends the floor plans and prices on WhatsApp. DLD Permit No. ${v.permit}.`,
    thumbnailUrl: [v.posterSrc],
    contentUrl: v.src,
    uploadDate: v.uploadDate,
    duration: `PT${Math.round(v.seconds)}S`,
  })),
}).replace(/</g, "\\u003c");

const card = (v) => `<article class="fpav-card" data-project="${esc(v.project)}" data-sound="${v.audio ? "yes" : "no"}">
<div class="fpav-frame"><video class="fpav-video" src="${esc(v.src)}" poster="${esc(v.posterSrc)}" width="${v.width}" height="${v.height}" muted playsinline loop preload="none" controls aria-label="${esc(`${v.project} AI viewing: a walk-through of ${v.developer}'s ${v.project} at ${v.area}, made from ${v.developer}'s renders`)}"></video></div>
<div class="fpav-body">
<h3 class="fpav-project">${esc(line(v))}</h3>
<span class="fpav-tag">Emaar renders · AI visualisation</span>
<a class="fpav-wa" href="${esc(whatsapp(v))}" target="_blank" rel="noopener noreferrer">${ICON.whatsapp}Floor plans &amp; prices on WhatsApp</a>
<p class="fpav-permit">Felicity Properties · RERA ORN 33951 · DLD Permit No. ${esc(v.permit)}</p>
</div>
</article>`;

const section = ({ id, intro, pageUrl }) => `<!-- Felicity Properties · AI viewings. Generated by scripts/felicitypro-snippets.mjs in the dxbdubaicreekharbour.ae repository; edit there, not here. -->
<section class="fpav" id="${id}" aria-labelledby="${id}-h">
<style>
${CSS}
</style>
<div class="fpav-wrap">
<p class="fpav-eyebrow">AI viewings</p>
<h2 class="fpav-h" id="${id}-h">${esc(HEADING)}</h2>
<p class="fpav-sub">${esc(SUB)}</p>
${intro ? intro.map((p) => `<p class="fpav-intro">${esc(p)}</p>`).join("\n") + "\n" : ""}<div class="fpav-grid">
${rows.map(card).join("\n")}
</div>
<a class="fpav-follow" href="${INSTAGRAM_REELS}" target="_blank" rel="noopener noreferrer">New viewing every Sunday and Wednesday on Instagram ${ICON.arrow}</a>
</div>
<script type="application/ld+json">${ld(pageUrl)}</script>
<script>
${JS}
</script>
</section>
`;

const head = `<!-- Felicity Properties · AI viewings page: video for link previews. Paste into this page's own head code only. If Durable only offers head code for the whole site, leave this file out. -->
${rows.map((v) => `<meta property="og:video" content="${esc(v.src)}">
<meta property="og:video:secure_url" content="${esc(v.src)}">
<meta property="og:video:type" content="video/mp4">
<meta property="og:video:width" content="${v.width}">
<meta property="og:video:height" content="${v.height}">`).join("\n")}
`;

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "1-homepage-section.html"), section({ id: "fpav-home", intro: null, pageUrl: "https://felicitypro.com/" }));
writeFileSync(join(outDir, "2-ai-viewings-page.html"), section({ id: "fpav-page", intro: INTRO, pageUrl: "https://felicitypro.com/ai-viewings" }));
writeFileSync(join(outDir, "3-ai-viewings-page-head.html"), head);
console.log(`wrote 3 files for ${rows.map((v) => v.project).join(", ")}`);
