// Downloads the AI viewings, encodes them into public/videos and records them in
// src/data/ai-viewings.json — the site shows a viewing only once it is recorded there.
//   npm run ai-viewings                   fetch each source below, then encode
//   npm run ai-viewings -- --from DIR     encode DIR/<slug>.mp4 instead of fetching
// Needs ffmpeg and ffprobe. Output: H.264 1080x1920 (padded, never cropped, if a
// source isn't 9:16), at most 30 fps, CRF 26, +faststart, at most 8 MB — when CRF 26
// alone comes out larger, a two-pass encode aimed at the 8 MB budget replaces it.
// Sound is kept only where `audio` is true. Poster: the frame at 1 s. Nothing in
// public/videos or the JSON changes unless every source succeeds. Then commit both.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const SOURCES = [
  { slug: "valia", audio: false, url: "https://d2ol7oe51mr4n9.cloudfront.net/user_3FtvcmlTEalMEsF459UqJq0vs3Z/c09220a1-29ea-466a-bf27-784c49de725b.mp4" },
  { slug: "albero", audio: true, url: "https://d2ol7oe51mr4n9.cloudfront.net/user_3FtvcmlTEalMEsF459UqJq0vs3Z/145fa6bd-3a45-4dd0-98fc-0e0047c07163.mp4" },
];
const MAX_BYTES = 8_000_000;
const AUDIO_KBPS = 128;

const root = fileURLToPath(new URL("..", import.meta.url));
const outDir = join(root, "public/videos");
const manifestPath = join(root, "src/data/ai-viewings.json");
const arg = (name) => (process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : null);
const from = arg("--from");

const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, stdio: ["ignore", "pipe", "pipe"], maxBuffer: 1 << 26 }).toString();
const probe = (file) => JSON.parse(run("ffprobe", ["-v", "error", "-show_entries", "format=duration:stream=codec_type,width,height,avg_frame_rate,r_frame_rate", "-of", "json", file]));
const fps = (rate) => { const [n, d] = String(rate).split("/").map(Number); return d ? n / d : n || 0; };
/** Top-level MP4 boxes in file order, to prove +faststart put the index (moov) before the media (mdat). */
function boxes(file) {
  const buf = readFileSync(file), out = [];
  for (let at = 0; at + 8 <= buf.length;) {
    let size = buf.readUInt32BE(at);
    out.push(buf.toString("latin1", at + 4, at + 8));
    if (size === 1) size = Number(buf.readBigUInt64BE(at + 8));
    if (size === 0) break;
    at += size;
  }
  return out;
}
const dubaiNow = () => `${new Date(Date.now() + 4 * 3600e3).toISOString().slice(0, 19)}+04:00`;

const previous = JSON.parse(readFileSync(manifestPath, "utf8"));
const work = mkdtempSync(join(tmpdir(), "ai-viewings-"));
const videos = [];
try {
  for (const s of SOURCES) {
    const src = from ? join(from, `${s.slug}.mp4`) : join(work, `${s.slug}-source.mp4`);
    if (!from) run("curl", ["-fsSL", "--retry", "3", "-o", src, s.url]);
    const info = probe(src);
    const v = info.streams.find((x) => x.codec_type === "video");
    if (!v) throw new Error(`${s.slug}: the source has no video`);
    if (s.audio && !info.streams.some((x) => x.codec_type === "audio")) throw new Error(`${s.slug}: the source has no sound to keep`);
    if (Math.abs(v.width / v.height - 9 / 16) > 0.01) console.warn(`${s.slug}: source is ${v.width}x${v.height}, not 9:16 — padded to 1080x1920, nothing cropped`);
    const seconds = Number(info.format.duration);
    // r_frame_rate as well: a variable-rate source is written out at its peak rate, not its average.
    const fast = Math.max(fps(v.avg_frame_rate), fps(v.r_frame_rate)) > 30.5;
    const filter = `scale=1080:1920:force_original_aspect_ratio=decrease:flags=lanczos,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1${fast ? ",fps=30" : ""}`;
    const video = join(work, `${s.slug}-ai-viewing.mp4`), poster = join(work, `${s.slug}-ai-viewing.jpg`);
    const common = ["-y", "-v", "error", "-i", src, "-map", "0:v:0", "-vf", filter, "-c:v", "libx264", "-preset", "slow", "-profile:v", "high", "-pix_fmt", "yuv420p"];
    const sound = s.audio ? ["-map", "0:a:0", "-c:a", "aac", "-b:a", `${AUDIO_KBPS}k`, "-ac", "2"] : ["-an"];
    const tail = ["-map_metadata", "-1", "-movflags", "+faststart", video];
    run("ffmpeg", [...common, "-crf", "26", ...sound, ...tail]);
    let encoding = "H.264 CRF 26";
    // Over budget: spread the 8 MB over the clip with a two-pass encode (calm stretches give
    // their bits to busy ones), shaving 5% off the target until the file fits.
    for (let kbps = Math.floor((MAX_BYTES * 8 * 0.96) / seconds / 1000 - (s.audio ? AUDIO_KBPS : 0)), tries = 0; statSync(video).size > MAX_BYTES; kbps = Math.floor(kbps * 0.95), tries++) {
      if (tries === 6) throw new Error(`${s.slug}: still over 8 MB at ${kbps} kb/s`);
      const rate = ["-b:v", `${kbps}k`, "-maxrate", `${kbps * 2}k`, "-bufsize", `${kbps * 2}k`, "-passlogfile", join(work, `${s.slug}-pass`)];
      run("ffmpeg", [...common, ...rate, "-pass", "1", "-an", "-f", "null", "-"], work);
      run("ffmpeg", [...common, ...rate, "-pass", "2", ...sound, ...tail], work);
      encoding = `H.264 two-pass at ${kbps} kb/s (CRF 26 came out over 8 MB)`;
    }
    run("ffmpeg", ["-y", "-v", "error", "-ss", String(Math.min(1, seconds / 2)), "-i", video, "-frames:v", "1", "-q:v", "4", poster]);
    if (!existsSync(poster)) throw new Error(`${s.slug}: no poster frame could be taken`);
    const order = boxes(video);
    if (order.indexOf("moov") < 0 || order.indexOf("moov") > order.indexOf("mdat")) throw new Error(`${s.slug}: index is not at the front (${order.join(",")})`);
    const out = probe(video), ov = out.streams.find((x) => x.codec_type === "video");
    const entry = {
      slug: s.slug,
      video: `/videos/${s.slug}-ai-viewing.mp4`,
      poster: `/videos/${s.slug}-ai-viewing.jpg`,
      bytes: statSync(video).size,
      seconds: Math.round(Number(out.format.duration) * 100) / 100,
      width: ov.width,
      height: ov.height,
      audio: out.streams.some((x) => x.codec_type === "audio"),
      hash: createHash("sha256").update(readFileSync(video)).update(readFileSync(poster)).digest("hex").slice(0, 10),
      // First published on the site; a later re-encode keeps the date.
      uploadDate: previous.videos.find((p) => p.slug === s.slug)?.uploadDate ?? dubaiNow(),
      encoding: `${encoding}${s.audio ? `, AAC ${AUDIO_KBPS} kb/s` : ", no sound"}`,
    };
    videos.push(entry);
    console.log(`${s.slug}: ${(entry.bytes / 1e6).toFixed(2)} MB, ${entry.seconds} s, ${entry.width}x${entry.height}, ${entry.encoding}`);
  }
  // Every source succeeded: only now replace what the site serves.
  mkdirSync(outDir, { recursive: true });
  for (const v of videos) for (const file of [v.video, v.poster]) copyFileSync(join(work, file.replace("/videos/", "")), join(root, "public", file));
  writeFileSync(manifestPath, `${JSON.stringify({ note: previous.note, videos }, null, 2)}\n`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
