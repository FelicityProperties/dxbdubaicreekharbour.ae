import { Link } from "@tanstack/react-router";
import { SITE } from "@/data/projects";
import { dateLong } from "@/lib/format";

export type LegalSection = { heading: string; paragraphs: string[] };
export type LegalDoc = { title: string; intro: string; lastUpdated: string; sections: LegalSection[] };

/** Fills the operator placeholders the legal text carries; neutral wording until the licence details are supplied. */
export function fillOperator(text: string): string {
  return text
    .replace(/\{\{company\}\}/g, SITE.company || "the operator of this website, an independent Dubai real-estate broker")
    .replace(/\{\{licence\}\}/g, SITE.licence || "licence details available on request");
}

export function LegalPage({ doc, other }: { doc: LegalDoc; other: { to: "/terms" | "/privacy"; label: string } }) {
  return <main>
    <section className="page-hero"><div className="container"><span className="eyebrow">Last updated {dateLong(doc.lastUpdated)}</span><h1>{doc.title}</h1><p>{fillOperator(doc.intro)}</p></div></section>
    <section className="section"><div className="container legal-layout">
      <nav className="legal-toc" aria-label="On this page"><ul>{doc.sections.map((s, i) => <li key={s.heading}><a href={`#s${i + 1}`}>{s.heading}</a></li>)}</ul><Link to={other.to} className="teaser-link">{other.label}</Link></nav>
      <div className="legal-body">{doc.sections.map((s, i) => <section key={s.heading} id={`s${i + 1}`}><h2>{s.heading}</h2>{s.paragraphs.map((p, j) => <p key={j}>{fillOperator(p)}</p>)}</section>)}
        <p className="source-note">Questions about this page: WhatsApp {SITE.whatsappDisplay} or <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p></div>
    </div></section>
  </main>;
}
