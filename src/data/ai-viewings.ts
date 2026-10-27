/**
 * AI viewings: short vertical walk-throughs of off-plan homes, made from Emaar's
 * renders and plans. scripts/ai-viewings.mjs downloads and encodes each one into
 * public/videos and records what it wrote in ai-viewings.json; a viewing appears
 * on the site only once it is recorded there, so no page points at a missing file.
 */
import encoded from "./ai-viewings.json";
import { SITE } from "./projects";

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
  { slug: "lyvia-by-palace", project: "Lyvia by Palace", area: "Dubai Creek Harbour", developer: "Emaar", permit: "2107900942", audio: true },
  { slug: "valia", project: "Valia", area: "Dubai Creek Harbour", developer: "Emaar", permit: "0710819088", audio: true },
  { slug: "albero", project: "Albero", area: "Dubai Creek Harbour", developer: "Emaar", permit: "1251122980", audio: true },
];

const recorded = encoded.videos as EncodedViewing[];
export const AI_VIEWINGS: AiViewing[] = AI_VIEWING_SPECS.flatMap((spec) => {
  const file = recorded.find((v) => v.slug === spec.slug);
  return file ? [{ ...spec, ...file }] : [];
});
export const aiViewingFor = (slug: string): AiViewing | null => AI_VIEWINGS.find((v) => v.slug === slug) ?? null;

export const INSTAGRAM_REELS = "https://www.instagram.com/felicity_properties/reels/";
export const viewingLine = (v: AiViewingSpec) => `${v.project} · ${v.area} · ${v.developer}`;
export const permitLine = (v: AiViewingSpec) => `Felicity Properties · RERA ORN ${SITE.reraOrn} · DLD Permit No. ${v.permit}`;
/** The WhatsApp message the owner chose; the link itself comes from the shared whatsappUrl. */
export const viewingMessage = (v: AiViewingSpec) => `Hi Muhannad, I watched the ${v.project} AI viewing on your site - please send the floor plans and prices`;
// The content hash in the query string replaces a cached copy (the service worker keeps posters) whenever a file is re-encoded.
export const videoSrc = (v: EncodedViewing) => `${v.video}?v=${v.hash}`;
export const posterSrc = (v: EncodedViewing) => `${v.poster}?v=${v.hash}`;
export const videoLabel = (v: AiViewingSpec) => `${v.project} AI viewing: a walk-through of ${v.developer}'s ${v.project} at ${v.area}, made from ${v.developer}'s renders`;

/** schema.org VideoObject for a page's structured data. */
export function videoObjectNode(v: AiViewing) {
  return {
    "@type": "VideoObject",
    "@id": `${SITE.url}${v.video}#video`,
    name: `${v.project} AI viewing · ${v.area} · ${v.developer}`,
    description: `An AI visualisation of ${v.developer}'s ${v.project} at ${v.area}, built from ${v.developer}'s own renders and plans. Felicity Properties (RERA ORN ${SITE.reraOrn}) sends the floor plans and prices on WhatsApp. DLD Permit No. ${v.permit}.`,
    thumbnailUrl: [`${SITE.url}${posterSrc(v)}`],
    contentUrl: `${SITE.url}${videoSrc(v)}`,
    uploadDate: v.uploadDate,
    duration: `PT${Math.round(v.seconds)}S`,
  };
}
