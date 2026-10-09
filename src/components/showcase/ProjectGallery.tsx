import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { imageSrc, imageSrcSet, type Project, type ProjectImage } from "@/data/projects";
import { Picture, ProjectArt } from "./shared";

export function ProjectGallery({ project }: { project: Project }) {
  const [failed, setFailed] = useState<string[]>([]);
  const [selected, setSelected] = useState<ProjectImage | null>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const images = project.images.filter((image) => !failed.includes(image.base));
  const cover = project.images[0];
  const tiles = images.filter((image) => image.base !== cover?.base);
  const fail = (base: string) => { setFailed((previous) => (previous.includes(base) ? previous : [...previous, base])); setSelected((previous) => (previous?.base === base ? null : previous)); };
  const show = (image: ProjectImage, trigger: HTMLButtonElement | null) => { openerRef.current = trigger; setSelected(image); };
  const move = (offset: number) => {
    if (!selected || images.length === 0) return;
    const index = images.findIndex((image) => image.base === selected.base);
    setSelected(images[(index + offset + images.length) % images.length] ?? null);
  };
  return <>
    {cover && !failed.includes(cover.base) ? <figure className="project-cover">
      <Button variant="ghost" className="image-open cover-open" aria-label={cover.caption} onClick={(event) => show(cover, event.currentTarget)}>
        <Picture img={cover} sizes="(max-width: 1160px) 100vw, 1160px" width={1600} priority onError={() => fail(cover.base)} />
      </Button><figcaption className="image-note">{cover.caption}</figcaption>
    </figure> : <ProjectArt project={project} large />}
    {tiles.length > 0 && <section className="gallery section" aria-label={`${project.name} gallery`}>
      {tiles.map((image, index) => <figure key={image.base} className={index === tiles.length - 1 && tiles.length % 2 === 1 ? "gallery-wide" : undefined}>
        <Button variant="ghost" className="image-open" aria-label={image.caption} onClick={(event) => show(image, event.currentTarget)}>
          <Picture img={image} sizes="(max-width: 640px) 100vw, (max-width: 1160px) 50vw, 570px" onError={() => fail(image.base)} />
        </Button><figcaption className="image-note">{image.caption}</figcaption>
      </figure>)}
    </section>}
    <Dialog open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }}>
      <DialogContent className="gallery-lightbox" onCloseAutoFocus={(event) => { event.preventDefault(); openerRef.current?.focus(); }} onKeyDown={(event) => { if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); } else if (event.key === "ArrowRight") { event.preventDefault(); move(1); } }}>
        <DialogTitle className="sr-only">{project.name}</DialogTitle>
        {selected && <img src={imageSrc(selected, 1600)} srcSet={imageSrcSet(selected)} sizes="(max-width: 1100px) 100vw, 1100px" alt={selected.caption} width={selected.w} height={selected.h} loading="lazy" decoding="async" onError={() => fail(selected.base)} />}
        <div className="lightbox-footer">
          <Button variant="outline" size="icon" aria-label="Previous image" title="Previous image" disabled={images.length < 2} onClick={() => move(-1)}><ChevronLeft /></Button>
          <DialogDescription>{selected?.caption}</DialogDescription>
          <Button variant="outline" size="icon" aria-label="Next image" title="Next image" disabled={images.length < 2} onClick={() => move(1)}><ChevronRight /></Button>
        </div>
      </DialogContent>
    </Dialog>
  </>;
}
