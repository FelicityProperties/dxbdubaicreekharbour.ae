/**
 * Sentences with a link or emphasis inside them. The whole sentence is one translation, so each language can
 * put the link where its grammar wants it:
 *
 *   <Rich text={t("See the <privacy>Privacy Notice</privacy> and <terms>Terms of Use</terms>.")}
 *         tags={{ privacy: (s) => <Link to="/privacy">{s}</Link>, terms: (s) => <Link to="/terms">{s}</Link> }} />
 *
 * Tags are plain names in angle brackets; translations keep them (a test checks it) and only move them.
 */
import { Fragment, type ReactNode } from "react";

export type RichTags = Record<string, (inner: string) => ReactNode>;

export function rich(text: string, tags: RichTags): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /<(\w+)>(.*?)<\/\1>/gs;
  let last = 0, m: RegExpExecArray | null, i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const render = tags[m[1]!];
    out.push(<Fragment key={i++}>{render ? render(m[2]!) : m[2]}</Fragment>);
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Rich({ text, tags }: { text: string; tags: RichTags }) {
  return <>{rich(text, tags)}</>;
}
