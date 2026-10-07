import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { type Project, type ProjectImage } from "@/data/projects";
import { ProjectArt } from "./shared";

export function ProjectGallery({ project }: { project: Project }) {
  const [failed, setFailed] = useState<string[]>([]);
  const [selected, setSelected] = useState<ProjectImage | null>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const images = project.images.filter(image => !failed.includes(image.src));
  const cover = project.images[0];
  const tiles = images.filter(image => image.src !== cover?.src);
  const fail = (src: string) => { setFailed(previous => previous.includes(src) ? previous : [...previous, src]); setSelected(previous => previous?.src === src ? null : previous); };
  const show = (image: ProjectImage, trigger: HTMLButtonElement | null) => { openerRef.current = trigger; setSelected(image); };
  const move = (offset: number) => {
    if (!selected || images.length === 0) return;
    const index = images.findIndex(image => image.src === selected.src);
    setSelected(images[(index + offset + images.length) % images.length] ?? null);
  };
  return <>
    {cover && !failed.includes(cover.src) ? <figure className="project-cover">
      <Button variant="ghost" className="image-open cover-open" aria-label={cover.caption} onClick={event => show(cover, event.currentTarget)}>
        <img src={cover.src} alt={cover.caption} loading="eager" decoding="async" width={1620} height={832} ref={element => { if (element?.complete && element.naturalWidth === 0) fail(cover.src); }} onError={() => fail(cover.src)} />
      </Button><figcaption className="image-note">{cover.caption}</figcaption>
    </figure> : <ProjectArt project={project} large />}
    {tiles.length > 0 && <section className="gallery section" aria-label={`${project.name} gallery`}>
      {tiles.map((image, index) => <figure key={image.src} className={index === tiles.length - 1 && tiles.length % 2 === 1 ? "gallery-wide" : undefined}>
        <Button variant="ghost" className="image-open" aria-label={image.caption} onClick={event => show(image, event.currentTarget)}>
          <img src={image.src} alt={image.caption} loading="lazy" decoding="async" width={1200} height={750} ref={element => { if (element?.complete && element.naturalWidth === 0) fail(image.src); }} onError={() => fail(image.src)} />
        </Button><figcaption className="image-note">{image.caption}</figcaption>
      </figure>)}
    </section>}
    <Dialog open={selected !== null} onOpenChange={open => { if (!open) setSelected(null); }}>
      <DialogContent className="gallery-lightbox" onCloseAutoFocus={event => { event.preventDefault(); openerRef.current?.focus(); }} onKeyDown={event => { if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); } else if (event.key === "ArrowRight") { event.preventDefault(); move(1); } }}>
        <DialogTitle className="sr-only">{project.name}</DialogTitle>
        {selected && <img src={selected.src} alt={selected.caption} width={1620} height={1000} loading="lazy" decoding="async" ref={element => { if (element?.complete && element.naturalWidth === 0) fail(selected.src); }} onError={() => fail(selected.src)} />}
        <div className="lightbox-footer">
          <Button variant="outline" size="icon" aria-label="Previous image" title="Previous image" disabled={images.length < 2} onClick={() => move(-1)}><ChevronLeft /></Button>
          <DialogDescription>{selected?.caption}</DialogDescription>
          <Button variant="outline" size="icon" aria-label="Next image" title="Next image" disabled={images.length < 2} onClick={() => move(1)}><ChevronRight /></Button>
        </div>
      </DialogContent>
    </Dialog>
  </>;
}
