/**
 * Translations. Every piece of English the site shows, typed in code or coming
 * from the data files, is its own key: t("Payment plans") or t(project.overview).
 * English needs no dictionary; Arabic and Chinese are loaded once per page load,
 * only for the language being shown (src/client.tsx, src/server.ts), so English
 * pages carry none of them.
 *
 * Placeholders: t("{n} registered sales", { n: num(count) }) — the dictionary
 * entry keeps {n}, the value goes in after translating. Figures are never typed
 * into a translation: they always come in through a placeholder or stay inside
 * a data string that the translation repeats unchanged (a test checks it).
 */
import { useMemo } from "react";
import { useRouter } from "@tanstack/react-router";
import { localeFromHref, type Locale } from "./locales";

export type Dict = Record<string, string>;
export type Vars = Record<string, string | number>;
export type T = ((text: string, vars?: Vars) => string) & { locale: Locale };

const DICTS: Partial<Record<Locale, Dict>> = {};

/** Load a language's dictionary (a separate download per language). Safe to call more than once. */
export async function loadMessages(locale: Locale): Promise<void> {
  if (locale === "en" || DICTS[locale]) return;
  DICTS[locale] = (locale === "ar" ? (await import("./ar")).default : (await import("./zh")).default) as Dict;
}

/** For tests and the server, which hold every language. */
export function setMessages(locale: Locale, dict: Dict) {
  DICTS[locale] = dict;
}

const fill = (s: string, vars?: Vars) => (vars ? s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : s);

/**
 * A key may carry a note for translators after "@@" when the same English means two things
 * ("Share" the button, "Share@@table column: …" the share of the price); the note is never shown.
 */
const english = (key: string) => { const i = key.indexOf("@@"); return i < 0 ? key : key.slice(0, i); };

/** The text in that language; English (the key without its note) when no translation exists yet. */
export function translate(locale: Locale, text: string, vars?: Vars): string {
  const found = locale === "en" ? undefined : DICTS[locale]?.[text];
  const out = fill(found ?? english(text), vars);
  // In Arabic and Chinese text an amount must not break between "AED" and its figure.
  if (locale === "en") return out;
  // An amount never breaks across lines: not after "AED", not inside "12 مليار درهم", not inside "120亿迪拉姆" (word joiners are invisible).
  return out.replace(/\bAED (?=\d)/g, "AED\u00a0").replace(/(\d) (مليار|مليون) درهم/g, "$1\u00a0$2\u00a0درهم").replace(/\d[\d,.]*[万亿]?迪拉姆/g, (a) => [...a].join("\u2060"));
}

/**
 * The space between two sentences or between a sentence and the link after it: none in Chinese, where a
 * sentence ends with "。" and the next starts straight after it.
 */
export const gap = (t: T): string => (t.locale === "zh" ? "" : " ");

/** A translator for a language, for code outside components (route heads, helpers). */
export function tFor(locale: Locale): T {
  return Object.assign((text: string, vars?: Vars) => translate(locale, text, vars), { locale });
}

/** Marks a string as a translation key without translating it yet (lists defined in code, rendered later with t()). */
export const msg = (text: string) => text;

/**
 * The language of the page being shown. It cannot change without a full page load (the language links are
 * plain links, and every link the router builds keeps the language), so reading it once is enough. Outside a
 * router (component tests) the page is English.
 */
export const useLocale = (): Locale => localeFromHref(useRouter({ warn: false })?.latestLocation?.publicHref);

/** t() for the page being shown. */
export function useT(): T {
  const locale = useLocale();
  return useMemo(() => tFor(locale), [locale]);
}
