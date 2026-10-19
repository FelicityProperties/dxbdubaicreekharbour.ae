/**
 * "AI viewings" (src/data/ai-viewings.ts): vertical walk-throughs made from
 * Emaar's renders. A video downloads nothing until it is at least half on
 * screen; then it plays muted and inline — the only way iPhones let a page
 * start a video — and pauses again below half. Visitors who ask their device
 * for reduced motion get the poster and a play button instead.
 */
import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/showcase/shared";
import { AI_VIEWINGS, INSTAGRAM_REELS, permitLine, posterSrc, videoLabel, videoSrc, viewingLine, viewingWhatsappUrl, type AiViewing } from "@/data/ai-viewings";

const HEADING = "Walk through it before it's built";
const SUB = "AI viewings of Dubai off-plan homes, built from the developers' own plans.";

/** Every mounted viewing, so turning one's sound on silences the others. */
const players = new Set<HTMLVideoElement>();

function start(video: HTMLVideoElement) {
  video.play().catch(() => {
    // Sound was on and the browser wants a tap first: carry on muted. Otherwise
    // (Low Power Mode, data saver) the play button stays for the visitor to press.
    if (!video.muted) {
      video.muted = true;
      video.play().catch(() => {});
    }
  });
}

export function ViewingCard({ viewing, linkProject = false }: { viewing: AiViewing; linkProject?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const held = useRef(false); // paused by the visitor: scrolling back doesn't restart it
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
        if (entry?.isIntersecting && entry.intersectionRatio >= 0.5) {
          if (!still && !held.current) start(video);
        } else video.pause();
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

  const name = viewingLine(viewing);
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
          aria-label={videoLabel(viewing)}
          onClick={togglePlay}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
        />
        <button type="button" className="aiv-control aiv-play" onClick={togglePlay} aria-label={`${playing ? "Pause" : "Play"} the ${viewing.project} AI viewing`}>
          {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
        </button>
        {viewing.audio && (
          <button type="button" className="aiv-control aiv-sound" onClick={toggleSound} aria-pressed={!muted} aria-label={`${muted ? "Turn on sound for" : "Mute"} the ${viewing.project} AI viewing`}>
            {muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
            {muted && <span aria-hidden="true">Tap for sound</span>}
          </button>
        )}
      </div>
      <div className="aiv-body">
        <h3 className="aiv-project">{linkProject ? <Link to="/projects/$slug" params={{ slug: viewing.slug }}>{name}</Link> : name}</h3>
        <span className="chip">Emaar renders · AI visualisation</span>
        <Button asChild className="aiv-wa">
          <a href={viewingWhatsappUrl(viewing)} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon />
            Floor plans & prices on WhatsApp
          </a>
        </Button>
        <p className="aiv-permit">{permitLine(viewing)}</p>
      </div>
    </article>
  );
}

function FollowLine() {
  return (
    <a className="teaser-link aiv-follow" href={INSTAGRAM_REELS} target="_blank" rel="noopener noreferrer">
      New viewing every Sunday and Wednesday on Instagram <ArrowUpRight className="size-3.5" />
    </a>
  );
}

/** Home page section: every viewing this site carries. Renders nothing until one is encoded. */
export function AiViewings({ viewings = AI_VIEWINGS }: { viewings?: AiViewing[] }) {
  if (!viewings.length) return null;
  return (
    <section className="section aiv-section" id="ai-viewings" aria-labelledby="aiv-h">
      <div className="container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">AI viewings</span>
            <h2 id="aiv-h">{HEADING}</h2>
          </div>
          <p className="section-intro">{SUB}</p>
        </div>
        <div className="aiv-grid" data-count={viewings.length}>
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
  return (
    <section className="detail-section" id="ai-viewing" aria-labelledby="aiv-detail-h">
      <span className="eyebrow">AI viewing</span>
      <h2 id="aiv-detail-h">{HEADING}</h2>
      <p className="mb-6">{SUB}</p>
      <div className="aiv-single">
        <ViewingCard viewing={viewing} />
      </div>
      <FollowLine />
    </section>
  );
}
