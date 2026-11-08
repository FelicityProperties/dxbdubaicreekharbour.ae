/**
 * "AI viewings" (src/data/ai-viewings.ts): vertical walk-throughs made from
 * Emaar's renders. A video downloads nothing until it is at least half on
 * screen; then it plays muted and inline — the only way iPhones let a page
 * start a video — and pauses again below half. Visitors who ask their device
 * for reduced motion get the poster and a play button instead. On phones the
 * viewings sit in one swipe row, and only one plays at a time: the one that
 * last came into view or was tapped.
 */
import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { WhatsApp } from "@/components/showcase/shared";
import { AI_VIEWINGS, INSTAGRAM_REELS, permitLine, posterSrc, videoLabel, videoSrc, viewingLine, viewingMessage, type AiViewing } from "@/data/ai-viewings";
import { msg, useT } from "@/i18n/messages";
import { isPhone } from "@/lib/phone";

const HEADING = msg("Walk through it before it's built");
const SUB = msg("AI viewings of Dubai off-plan homes, built from the developers' own plans.");

/** Every mounted viewing, so turning one's sound on silences the others. */
const players = new Set<HTMLVideoElement>();
/** Viewings paused because another one started (phones): that pause is not the visitor's. */
const yielded = new WeakSet<HTMLVideoElement>();

function start(video: HTMLVideoElement) {
  if (isPhone()) {
    for (const other of players) if (other !== video && !other.paused) { yielded.add(other); other.pause(); }
  }
  video.play().catch((e: unknown) => {
    // The browser wants a tap before it plays sound: carry on muted. Any other refusal
    // (Low Power Mode, data saver) leaves the play button for the visitor; an AbortError
    // is a pause() that arrived while the file was still loading, so it stays paused.
    if (e instanceof DOMException && e.name === "NotAllowedError" && !video.muted) {
      video.muted = true;
      video.play().catch(() => {});
    }
  });
}

export function ViewingCard({ viewing, linkProject = false }: { viewing: AiViewing; linkProject?: boolean }) {
  const t = useT();
  const ref = useRef<HTMLVideoElement>(null);
  const held = useRef(false); // paused by the visitor: scrolling back doesn't restart it
  const inView = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    // React sets `muted` as a property only; Safari also checks the attribute before it allows a silent autoplay.
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("muted", "");
    players.add(video);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      ([entry]) => {
        inView.current = !!entry?.isIntersecting && entry.intersectionRatio >= 0.5;
        if (!inView.current) video.pause();
        else if (!still && !held.current) start(video);
      },
      { threshold: [0, 0.5] },
    );
    io.observe(video);
    return () => {
      io.disconnect();
      players.delete(video);
      video.pause();
    };
  }, []);

  const togglePlay = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      held.current = false;
      start(video);
    } else {
      held.current = true;
      video.pause();
    }
  };
  const toggleSound = () => {
    const video = ref.current;
    if (!video) return;
    if (!video.muted) {
      video.muted = true;
      return;
    }
    for (const other of players) if (other !== video) other.muted = true;
    video.muted = false;
    held.current = false;
    if (video.paused) start(video);
  };

  const name = viewingLine(viewing, t);
  const project = viewing.project;
  return (
    <article className="aiv-card">
      <div className="aiv-frame">
        <video
          ref={ref}
          className="aiv-video"
          src={videoSrc(viewing)}
          poster={posterSrc(viewing)}
          width={viewing.width}
          height={viewing.height}
          muted
          playsInline
          loop
          preload="none"
          disablePictureInPicture
          aria-label={videoLabel(viewing, t)}
          onClick={togglePlay}
          onPlay={() => setPlaying(true)}
          onPause={(e) => {
            setPlaying(false);
            // Another viewing took over (phones): it starts again when it next comes into view.
            if (yielded.delete(e.currentTarget)) return;
            // Paused on screen by something other than scrolling (the lock screen, a headphone
            // button): treat it as the visitor's pause. A pause because the tab went to the
            // background is not one.
            if (inView.current && document.visibilityState === "visible") held.current = true;
          }}
          onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
        />
        <button type="button" className="aiv-control aiv-play" onClick={togglePlay} aria-label={playing ? t("Pause the {project} AI viewing", { project }) : t("Play the {project} AI viewing", { project })}>
          {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
        </button>
        {viewing.audio && (
          <button type="button" className="aiv-control aiv-sound" onClick={toggleSound} aria-label={muted ? t("Tap for sound: the {project} AI viewing", { project }) : t("Mute the {project} AI viewing", { project })}>
            {muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
            {muted && <span aria-hidden="true">{t("Tap for sound")}</span>}
          </button>
        )}
      </div>
      <div className="aiv-body">
        <h3 className="aiv-project">{linkProject ? <Link to="/projects/$slug" params={{ slug: viewing.slug }}>{name}</Link> : name}</h3>
        <span className="chip">{t("Emaar renders · AI visualisation")}</span>
        <WhatsApp message={viewingMessage(viewing, t)} className="aiv-wa">
          {t("Floor plans & prices on WhatsApp")}
        </WhatsApp>
        <p className="aiv-permit">{permitLine(viewing, t)}</p>
      </div>
    </article>
  );
}

function FollowLine() {
  const t = useT();
  return (
    <a className="teaser-link aiv-follow" href={INSTAGRAM_REELS} target="_blank" rel="noopener noreferrer">
      {t("New viewing every Sunday and Wednesday on Instagram")} <ArrowUpRight className="size-3.5" />
    </a>
  );
}

/** Home page section: every viewing this site carries. Renders nothing until one is encoded. */
export function AiViewings({ viewings = AI_VIEWINGS }: { viewings?: AiViewing[] }) {
  const t = useT();
  if (!viewings.length) return null;
  return (
    <section className="section aiv-section" id="ai-viewings" aria-labelledby="aiv-h">
      <div className="container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{t("AI viewings")}</span>
            <h2 id="aiv-h">{t(HEADING)}</h2>
          </div>
          <p className="section-intro">{t(SUB)}</p>
        </div>
        {/* The restoration id lets the router put the row back where it was after a sheet closes (ProjectCollection.tsx). */}
        <div className="aiv-grid app-shelf" data-count={viewings.length} data-scroll-restoration-id="aiv-row">
          {viewings.map((v) => (
            <ViewingCard key={v.slug} viewing={v} linkProject />
          ))}
        </div>
        <FollowLine />
      </div>
    </section>
  );
}

/** One project's viewing, inside its project page. */
export function ProjectViewing({ viewing }: { viewing: AiViewing }) {
  const t = useT();
  return (
    <section className="detail-section" id="ai-viewing" aria-labelledby="aiv-detail-h">
      <span className="eyebrow">{t("AI viewing")}</span>
      <h2 id="aiv-detail-h">{t(HEADING)}</h2>
      <p className="mb-6">{t(SUB)}</p>
      <div className="aiv-single">
        <ViewingCard viewing={viewing} />
      </div>
      <FollowLine />
    </section>
  );
}
