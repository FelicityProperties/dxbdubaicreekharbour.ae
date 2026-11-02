/**
 * AI viewings: short vertical walk-throughs of off-plan homes, made from Emaar's
 * renders and plans. scripts/ai-viewings.mjs downloads and encodes each one into
 * public/videos and records what it wrote in ai-viewings.json; a viewing appears
 * on the site only once it is recorded there, so no page points at a missing file.
 */
import encoded from "./ai-viewings.json";
import { SITE } from "./projects";
import { msg, tFor, type T } from "@/i18n/messages";
import { waMessage } from "@/components/showcase/shared";

/** English, for code that runs outside a page (tests, FelicityBot): every helper below defaults to it. */
const EN = tFor("en");

export type AiViewingSpec = {
  slug: string; // the project's slug on this site, and the video's file name
  project: string;
  area: string;
  developer: string;
  permit: string; // DLD (Trakheesi) advertising permit number for this viewing: Valia and Albero as the owner gave them 19 Oct 2026, Lyvia as printed in the owner's own video (26 Oct 2026)
  audio: boolean; // whether the viewing keeps its sound track (behind a tap-for-sound button)
};
/** What the encoder measured and wrote (src/data/ai-viewings.json). */
export type EncodedViewing = { slug: string; video: string; poster: string; bytes: number; seconds: number; width: number; height: number; audio: boolean; hash: string; uploadDate: string; encoding: string };
export type AiViewing = AiViewingSpec & EncodedViewing;

/** The viewings this site shows, in order: Lyvia leads (the owner's main video, 26 Oct 2026). */
export const AI_VIEWING_SPECS: AiViewingSpec[] = [
  // area and developer are shown translated (t(v.area), t(v.developer)); msg() makes them translation keys.
  { slug: "lyvia-by-palace", project: "Lyvia by Palace", area: msg("Dubai Creek Harbour"), developer: msg("Emaar"), permit: "2107900942", audio: true },
  { slug: "valia", project: "Valia", area: msg("Dubai Creek Harbour"), developer: msg("Emaar"), permit: "0710819088", audio: true },
  { slug: "albero", project: "Albero", area: msg("Dubai Creek Harbour"), developer: msg("Emaar"), permit: "1251122980", audio: true },
];

const recorded = encoded.videos as EncodedViewing[];
export const AI_VIEWINGS: AiViewing[] = AI_VIEWING_SPECS.flatMap((spec) => {
  const file = recorded.find((v) => v.slug === spec.slug);
  return file ? [{ ...spec, ...file }] : [];
});
export const aiViewingFor = (slug: string): AiViewing | null => AI_VIEWINGS.find((v) => v.slug === slug) ?? null;

export const INSTAGRAM_REELS = "https://www.instagram.com/felicity_properties/reels/";
/** The names the owner's lines carry: his trading name and first name, never translated (placeholders, not part of a key). */
const COMPANY = "Felicity Properties";
const OWNER = "Muhannad";
/** viewingLine and permitLine also work as map() callbacks (AI_VIEWING_SPECS.map(viewingLine)): an index where the translator goes means English. */
const translator = (given: T | number): T => (typeof given === "function" ? given : EN);
export function viewingLine(v: AiViewingSpec, given: T | number = EN): string {
  const t = translator(given);
  return [v.project, t(v.area), t(v.developer)].join(" · ");
}
export function permitLine(v: AiViewingSpec, given: T | number = EN): string {
  const t = translator(given);
  return t("{company} · RERA ORN {orn} · DLD Permit No. {permit}", { company: COMPANY, orn: SITE.reraOrn, permit: v.permit });
}
/** The WhatsApp message the owner chose; in Arabic or Chinese with his English underneath. The link itself comes from the shared whatsappUrl. */
export const viewingMessage = (v: AiViewingSpec, t: T = EN) =>
  waMessage(t, `Hi ${OWNER}, I watched the ${v.project} AI viewing on your site - please send the floor plans and prices`, msg("Hi {name}, I watched the {project} AI viewing on your site - please send the floor plans and prices"), { name: OWNER, project: v.project });
// The content hash in the query string replaces a cached copy (the service worker keeps posters) whenever a file is re-encoded.
export const videoSrc = (v: EncodedViewing) => `${v.video}?v=${v.hash}`;
export const posterSrc = (v: EncodedViewing) => `${v.poster}?v=${v.hash}`;
export const videoLabel = (v: AiViewingSpec, t: T = EN) => t("{project} AI viewing: a walk-through of {developer}'s {project} at {area}, made from {developer}'s renders", { project: v.project, developer: t(v.developer), area: t(v.area) });

/** schema.org VideoObject for a page's structured data, in the page's language. */
export function videoObjectNode(v: AiViewing, t: T = EN) {
  const vars = { project: v.project, area: t(v.area), developer: t(v.developer), company: COMPANY, orn: SITE.reraOrn, permit: v.permit };
  return {
    "@type": "VideoObject",
    "@id": `${SITE.url}${v.video}#video`,
    name: t("{project} AI viewing · {area} · {developer}", vars),
    description: t("An AI visualisation of {developer}'s {project} at {area}, built from {developer}'s own renders and plans. {company} (RERA ORN {orn}) sends the floor plans and prices on WhatsApp. DLD Permit No. {permit}.", vars),
    thumbnailUrl: [`${SITE.url}${posterSrc(v)}`],
    contentUrl: `${SITE.url}${videoSrc(v)}`,
    uploadDate: v.uploadDate,
    duration: `PT${Math.round(v.seconds)}S`,
  };
}
