import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { imageSrc, imageSrcSet, type Project, type ProjectImage } from "@/data/projects";
import { useT } from "@/i18n/messages";
import { LOCALE_META, ltrLabel } from "@/i18n/locales";
import { isPhone, useBackCloses } from "@/lib/phone";
import { Picture, ProjectArt } from "./shared";

const LIGHTBOX_SIZES = "(max-width: 1100px) 100vw, 1100px";
/** A swipe must travel this far sideways (and more sideways than down) to change the photo. */
const SWIPE_PX = 40;

export function ProjectGallery({ project }: { project: Project }) {
  const t = useT();
  const [failed, setFailed] = useState<string[]>([]);
  const [selected, setSelected] = useState<ProjectImage | null>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const photoRef = useRef<HTMLImageElement | null>(null);
  const swipe = useRef<{ x: number; y: number; dx: number; axis: "x" | "y" | null } | null>(null);
  const entering = useRef(false);
  const revealTimer = useRef<number | undefined>(undefined);
  const images = project.images.filter((image) => !failed.includes(image.base));
  const cover = project.images[0];
  const tiles = images.filter((image) => image.base !== cover?.base);
  const at = selected ? images.findIndex((image) => image.base === selected.base) : -1;
  const fail = (base: string) => { setFailed((previous) => (previous.includes(base) ? previous : [...previous, base])); setSelected((previous) => (previous?.base === base ? null : previous)); };
  const show = (image: ProjectImage, trigger: HTMLButtonElement | null) => { openerRef.current = trigger; setSelected(image); };
  // Phones: Back closes the photo viewer and stays on the project page, as in an app.
  useBackCloses("photo", selected !== null, () => setSelected(null));
  const move = (offset: number) => {
    if (!selected || images.length === 0) return;
    const index = images.findIndex((image) => image.base === selected.base);
    setSelected(images[(index + offset + images.length) % images.length] ?? null);
  };
  // Right to left (Arabic), "Previous" sits on the right, so the arrow keys follow the buttons.
  const rtl = LOCALE_META[t.locale].dir === "rtl";
  const back = rtl ? "ArrowRight" : "ArrowLeft", forward = back === "ArrowLeft" ? "ArrowRight" : "ArrowLeft";
  /** Shows the photo again once it has moved back to the middle (after the new one has loaded, or after a failed swipe). */
  const settle = () => { const photo = photoRef.current; if (photo) { photo.style.transition = ""; photo.style.transform = ""; photo.style.opacity = ""; } };
  const reveal = () => { if (!entering.current) return; entering.current = false; requestAnimationFrame(settle); };
  /**
   * Previous or next photo. On phones the new photo slides in from the side it comes from: the reading end for the
   * next one (the right in English, the left in Arabic), once it has loaded, so the old one never flashes back.
   */
  const go = (offset: number) => {
    const photo = photoRef.current;
    if (photo && images.length > 1 && isPhone()) {
      photo.style.transition = "none";
      photo.style.transform = `translateX(${(offset > 0) !== rtl ? 48 : -48}px)`;
      photo.style.opacity = "0";
      void photo.offsetWidth; // commit the starting position now, so the slide back runs even when the next photo is cached
      entering.current = true;
      // One fallback at a time: an earlier step's timer must not reveal this photo before it has loaded.
      window.clearTimeout(revealTimer.current);
      revealTimer.current = window.setTimeout(reveal, 700);
    }
    move(offset);
  };
  // Phones: a sideways swipe moves to the previous or next photo, and the photo follows the finger meanwhile. Swiping
  // towards the reading start brings the next one (to the left in English, to the right in Arabic). Two fingers
  // (pinch zoom) and up-and-down drags are left alone.
  const onTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    swipe.current = event.touches.length === 1 && touch && images.length > 1 && isPhone() ? { x: touch.clientX, y: touch.clientY, dx: 0, axis: null } : null;
  };
  const onTouchMove = (event: React.TouchEvent) => {
    const s = swipe.current, touch = event.touches[0];
    if (!s) return;
    if (event.touches.length !== 1 || !touch) { swipe.current = null; settle(); return; }
    const dx = touch.clientX - s.x, dy = touch.clientY - s.y;
    if (!s.axis && Math.hypot(dx, dy) > 10) s.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    if (s.axis !== "x") return;
    s.dx = dx;
    const photo = photoRef.current;
    if (photo) { photo.style.transition = "none"; photo.style.transform = `translateX(${dx}px)`; }
  };
  const onTouchEnd = () => {
    const s = swipe.current;
    swipe.current = null;
    if (!s || s.axis !== "x") return;
    if (Math.abs(s.dx) < SWIPE_PX) { settle(); return; }
    go((s.dx < 0) !== rtl ? 1 : -1);
  };
  // Phones: fetch the photos either side of the open one, so a swipe shows the next one at once.
  useEffect(() => {
    if (!selected || !isPhone()) return;
    const shown = project.images.filter((image) => !failed.includes(image.base));
    const index = shown.findIndex((image) => image.base === selected.base);
    if (index < 0 || shown.length < 2) return;
    for (const image of new Set([shown[(index + 1) % shown.length], shown[(index - 1 + shown.length) % shown.length]])) {
      if (!image || image.base === selected.base) continue;
      const preload = new Image();
      preload.sizes = LIGHTBOX_SIZES;
      preload.srcset = imageSrcSet(image);
    }
  }, [selected, failed, project.images]);
  return <>
    {cover && !failed.includes(cover.base) ? <figure className="project-cover">
      <Button variant="ghost" className="image-open cover-open" aria-label={t(cover.caption)} onClick={(event) => show(cover, event.currentTarget)}>
        <Picture img={cover} sizes="(max-width: 1160px) 100vw, 1160px" width={1600} priority onError={() => fail(cover.base)} />
        {images.length > 1 && <span className="cover-count hidden" aria-hidden="true"><Images />{images.length}</span>}
      </Button><figcaption className="image-note">{t(cover.caption)}</figcaption>
    </figure> : <ProjectArt project={project} large />}
    {tiles.length > 0 && <section className="gallery section app-shelf" data-scroll-restoration-id="gallery-row" data-count={tiles.length} aria-label={t("{name} gallery", { name: project.name })}>
      {tiles.map((image, index) => <figure key={image.base} className={index === tiles.length - 1 && tiles.length % 2 === 1 ? "gallery-wide" : undefined}>
        <Button variant="ghost" className="image-open" aria-label={t(image.caption)} onClick={(event) => show(image, event.currentTarget)}>
          <Picture img={image} eager={index === 0} sizes="(max-width: 640px) 80vw, (max-width: 1160px) 50vw, 570px" onError={() => fail(image.base)} />
        </Button><figcaption className="image-note">{t(image.caption)}</figcaption>
      </figure>)}
    </section>}
    <Dialog open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }}>
      <DialogContent className="gallery-lightbox" closeLabel={t("Close")} onCloseAutoFocus={(event) => { event.preventDefault(); openerRef.current?.focus(); }} onKeyDown={(event) => { if (event.key === back) { event.preventDefault(); go(-1); } else if (event.key === forward) { event.preventDefault(); go(1); } }} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onTouchCancel={() => { swipe.current = null; settle(); }}>
        <DialogTitle className="sr-only">{project.name}</DialogTitle>
        {selected && images.length > 1 && <p className="lightbox-count hidden" aria-live="polite" aria-atomic="true">{ltrLabel(`${at + 1} / ${images.length}`, t.locale)}</p>}
        {selected && <img ref={photoRef} src={imageSrc(selected, 1600)} srcSet={imageSrcSet(selected)} sizes={LIGHTBOX_SIZES} alt={t(selected.caption)} width={selected.w} height={selected.h} loading="lazy" decoding="async" onLoad={reveal} onError={() => fail(selected.base)} />}
        <div className="lightbox-footer">
          <Button variant="outline" size="icon" aria-label={t("Previous image")} title={t("Previous image")} disabled={images.length < 2} onClick={() => go(-1)}><ChevronLeft /></Button>
          <DialogDescription>{selected ? t(selected.caption) : undefined}</DialogDescription>
          <Button variant="outline" size="icon" aria-label={t("Next image")} title={t("Next image")} disabled={images.length < 2} onClick={() => go(1)}><ChevronRight /></Button>
        </div>
      </DialogContent>
    </Dialog>
  </>;
}
