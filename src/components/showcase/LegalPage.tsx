import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { SITE } from "@/data/projects";
import { dateLong, dateText } from "@/lib/format";
import { LOCALE_META, localizePath } from "@/i18n/locales";
import { tFor, useT, type T } from "@/i18n/messages";
import { Rich } from "@/i18n/rich";
import { PHONE_QUERY } from "@/lib/phone";

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
  // Phones: the contents become a bar that sticks under the top bar, names the section being read and opens the
  // list of sections over the text (a tap outside or Escape closes it). Computers keep the side column as it is.
  const toc = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(-1);
  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => { if (!toc.current?.contains(e.target as Node)) setOpen(false); };
    const escape = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); toggle.current?.focus(); } };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);
  useEffect(() => {
    const phone = window.matchMedia(PHONE_QUERY);
    let frame = 0;
    const measure = () => {
      frame = 0;
      const bar = toc.current;
      if (!bar) return;
      // Only once the bar has stuck under the top bar: above that, the first heading is right under it anyway.
      const box = bar.getBoundingClientRect();
      const stuck = box.top <= parseFloat(getComputedStyle(bar).top) + 1;
      let at = -1;
      if (stuck) doc.sections.forEach((_, i) => { const el = document.getElementById(`s${i + 1}`); if (el && el.getBoundingClientRect().top <= box.bottom + 24) at = i; });
      setCurrent(at);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(measure); };
    const watch = () => {
      window.removeEventListener("scroll", onScroll);
      if (phone.matches) { window.addEventListener("scroll", onScroll, { passive: true }); measure(); } else setCurrent(-1);
    };
    watch();
    phone.addEventListener("change", watch);
    return () => { phone.removeEventListener("change", watch); window.removeEventListener("scroll", onScroll); cancelAnimationFrame(frame); };
  }, [doc]);
  const reading = current >= 0 ? doc.sections[current] : undefined;
  // Opened before the bar has stuck under the top bar (straight after the page loads), the list would run on under
  // the bottom bar, out of reach. Bring the bar up to its stuck place first, at once; the list then fits between the bars.
  const toggleList = () => {
    const bar = toc.current;
    if (!open && bar) {
      const stuck = parseFloat(getComputedStyle(bar).top);
      const top = bar.getBoundingClientRect().top;
      if (top > stuck + 1) window.scrollTo({ top: window.scrollY + top - stuck, behavior: "instant" });
    }
    setOpen((o) => !o);
  };
  return <main className="page-legal">
    <section className="page-hero"><div className="container"><span className="eyebrow">{t("Last updated {date}", { date: dateLong(doc.lastUpdated, t.locale) })}</span><h1>{t(doc.title)}</h1><p>{fill(doc.intro)}</p>
      {t.locale !== "en" && <p className="source-note">{t("This is a translation for your convenience. The English version is the legally binding text.")} <a href={localizePath(path, "en")} hrefLang={LOCALE_META.en.hreflang} lang={LOCALE_META.en.htmlLang}>{LOCALE_META.en.label}</a></p>}</div></section>
    <section className="section"><div className="container legal-layout">
      {/* Keyboard focus moving on to something outside the open list (Tab after its last link) closes it, so it never
          covers what is focused. Focus going nowhere (a tap on the list's own margin) leaves it open; a tap outside closes it above. */}
      <nav ref={toc} className={`legal-toc${open ? " is-open" : ""}`} aria-label={t("On this page")} onBlur={(e) => { if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}>
        <button ref={toggle} type="button" className="legal-toc-toggle hidden" aria-expanded={open} aria-controls="legal-toc-list" onClick={toggleList}><span className="legal-toc-text"><span className="legal-toc-title">{t("On this page")}</span>{reading && <span className="legal-toc-now">{t(reading.heading)}</span>}</span><ChevronDown aria-hidden="true" /></button>
        <div className="legal-toc-list" id="legal-toc-list"><ul>{doc.sections.map((s, i) => <li key={s.heading}><a href={`#s${i + 1}`} aria-current={i === current ? "location" : undefined} onClick={() => setOpen(false)}>{t(s.heading)}</a></li>)}</ul><Link to={other.to} className="teaser-link">{other.label}</Link></div></nav>
      <div className="legal-body">{doc.sections.map((s, i) => <section key={s.heading} id={`s${i + 1}`}><h2>{t(s.heading)}</h2>{s.paragraphs.map((p, j) => <p key={j}>{fill(p)}</p>)}</section>)}
        <p className="source-note"><Rich text={t("Questions about this page: WhatsApp <phone>{phone}</phone> or <email>{email}</email>.", { phone: SITE.whatsappDisplay, email: SITE.email })} tags={{ phone: (s) => ltr(s), email: (s) => <a href={`mailto:${SITE.email}`}>{s}</a> }} /></p></div>
    </div></section>
  </main>;
}
