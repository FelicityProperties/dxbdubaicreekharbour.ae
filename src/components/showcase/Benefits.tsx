import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { BENEFITS } from "@/data/benefits";
import { SourceLink } from "./shared";

/** "Why Creek Harbour": every card rests on a sentence Emaar published or a figure in the DLD snapshot — see src/data/benefits.ts. */
export function WhyCreekHarbour({ compact = false }: { compact?: boolean }) {
  if (BENEFITS.length === 0) return null;
  const list = compact ? BENEFITS.slice(0, 4) : BENEFITS;
  return <section className="section benefits-section" id="why"><div className="container">
    <div className="section-heading"><div><span className="eyebrow">Why buyers choose it</span><h2>Why Dubai Creek Harbour</h2></div><p className="section-intro">Freehold, visa-eligible, developer payment plans and a waterfront district between Downtown and the airport — in Emaar's words and the Land Department's numbers, not ours.</p></div>
    <div className="benefit-grid">{list.map((b, i) => <article className="benefit" key={b.title}><span className="benefit-n">{String(i + 1).padStart(2, "0")}</span><h3>{b.title}</h3><p>{b.body}</p><p className="benefit-src">{b.kind === "dld-snapshot" ? "Dubai Land Department records" : <SourceLink href={b.sourceUrl}>Source: Emaar</SourceLink>}</p></article>)}</div>
    {compact && <Link to="/guide" hash="why" className="teaser-link">All {BENEFITS.length} reasons, and how buying works <ArrowRight className="size-3.5" /></Link>}
  </div></section>;
}
