import { Link } from "@tanstack/react-router";
import { SITE } from "@/data/projects";
import { dateLong, dateText } from "@/lib/format";
import { LOCALE_META, localizePath } from "@/i18n/locales";
import { tFor, useT, type T } from "@/i18n/messages";
import { Rich } from "@/i18n/rich";

/** English, for callers outside a page: fillOperator() defaults to it. */
const EN = tFor("en");

export type LegalSection = { heading: string; paragraphs: string[] };
export type LegalDoc = { title: string; intro: string; lastUpdated: string; sections: LegalSection[] };

/**
 * Fills the operator placeholders the legal text carries, in the language of t (English by default); neutral
 * wording until the licence details are supplied. Translate first, then fill: fillOperator(t(paragraph), t) —
 * the translations keep the {{company}}-style placeholders.
 */
export function fillOperator(text: string, t: T = EN): string {
  return text
    .replace(/\{\{company\}\}/g, () => SITE.company || t("the operator of this website, an independent Dubai real-estate broker"))
    .replace(/\{\{licence\}\}/g, () => (SITE.licence ? t(SITE.licence) : t("licence details available on request")))
    .replace(/\{\{broker\}\}/g, () => SITE.broker)
    .replace(/\{\{address\}\}/g, () => t(SITE.address))
    .replace(/\{\{noc\}\}/g, () => dateText(SITE.emaarNoc, t.locale))
    .replace(/\{\{email\}\}/g, () => SITE.email);
}

export function LegalPage({ doc, path, other }: { doc: LegalDoc; path: "/terms" | "/privacy"; other: { to: "/terms" | "/privacy"; label: string } }) {
  const t = useT();
  // A phone number inside right-to-left text keeps its digit groups in order only when isolated left to right:
  // the legal text's own "+971 56 352 0611" gets Unicode isolates, the contact line below a left-to-right span.
  const rtl = LOCALE_META[t.locale].dir === "rtl";
  const fill = (text: string) => { const s = fillOperator(t(text), t); return rtl ? s.replace(/\+\d[\d ]*\d/g, (m) => `\u2066${m}\u2069`) : s; };
  const ltr = (text: string) => (t.locale === "en" ? text : <span dir="ltr">{text}</span>);
  return <main>
    <section className="page-hero"><div className="container"><span className="eyebrow">{t("Last updated {date}", { date: dateLong(doc.lastUpdated, t.locale) })}</span><h1>{t(doc.title)}</h1><p>{fill(doc.intro)}</p>
      {t.locale !== "en" && <p className="source-note">{t("This is a translation for your convenience. The English version is the legally binding text.")} <a href={localizePath(path, "en")} hrefLang={LOCALE_META.en.hreflang} lang={LOCALE_META.en.htmlLang}>{LOCALE_META.en.label}</a></p>}</div></section>
    <section className="section"><div className="container legal-layout">
      <nav className="legal-toc" aria-label={t("On this page")}><ul>{doc.sections.map((s, i) => <li key={s.heading}><a href={`#s${i + 1}`}>{t(s.heading)}</a></li>)}</ul><Link to={other.to} className="teaser-link">{other.label}</Link></nav>
      <div className="legal-body">{doc.sections.map((s, i) => <section key={s.heading} id={`s${i + 1}`}><h2>{t(s.heading)}</h2>{s.paragraphs.map((p, j) => <p key={j}>{fill(p)}</p>)}</section>)}
        <p className="source-note"><Rich text={t("Questions about this page: WhatsApp <phone>{phone}</phone> or <email>{email}</email>.", { phone: SITE.whatsappDisplay, email: SITE.email })} tags={{ phone: (s) => ltr(s), email: (s) => <a href={`mailto:${SITE.email}`}>{s}</a> }} /></p></div>
    </div></section>
  </main>;
}
