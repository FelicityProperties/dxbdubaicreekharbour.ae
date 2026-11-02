# Arabic and Chinese

The site is in English (bare paths), Arabic (`/ar/…`, right to left) and Simplified Chinese (`/zh/…`).
`/leads` and the server endpoints are English only.

## How it works

- `locales.ts` — the three languages, `splitLocale` / `localizePath`. The router (`src/router.tsx`) takes the
  language prefix off before matching and puts it back on every link it builds, so `<Link to="/projects">`
  on an Arabic page goes to `/ar/projects` with no extra code. Routes and `location.pathname` never see the prefix.
- `messages.ts` — `useT()` in components, `tFor(locale)` outside them, `msg()` to mark a key without
  translating it yet. English text is the key; English needs no dictionary.
- Route heads get the language as `match.context.locale` (set by the root route's `beforeLoad`), and build
  their tags with `pageHead()` from `src/lib/seo.ts` (canonical + the other languages + share tags).
- Dictionaries: `ar/` and `zh/`, each `ui.json` (text typed in code), `data.json` (text from the data files),
  `legal.json` (Terms and Privacy). The browser loads only the dictionary of the page's language
  (`src/client.tsx`); the server holds both (`src/server.ts`).
- `npm run i18n:keys` lists every key in `keys.json` and prints what each language still lacks.
  `src/test/i18n.test.ts` fails while a key is untranslated, a translation changes a number or drops a
  placeholder, or `keys.json` is stale.

## Writing code

```tsx
const t = useT();
<h2>{t("Payment plans")}</h2>
<p>{t("{n} projects", { n: PROJECTS.length })}</p>        // values go in through {placeholders}
<p>{t(project.overview)}</p>                              // data text: the English is the key
{cond ? t("Ready") : t("Off-plan")}                       // never t(cond ? "…" : "…")
<Rich text={t("See the <privacy>Privacy Notice</privacy>.")} tags={{ privacy: (s) => <Link to="/privacy">{s}</Link> }} />
```

- The first argument of `t(` / `msg(` is a plain double-quoted string, or a value from the data. No template
  literals, no `+`, no ternaries inside — the key finder (`extract.ts`) must be able to read it.
- One key = one whole sentence or label. Never build a sentence from translated fragments: word order differs.
- Helpers used outside a page (`statusLabel`, `priceSummary`, `handoverText`, `noPlanText`, `bedroomsLabel`,
  `projectMessage`, `disclaimer` in `components/showcase/shared.tsx`) take `t` as their last argument and
  default to English, so FelicityBot's knowledge and the tests still get English.
- Dates: `dateShort(iso, t.locale)`, `dateLong(iso, t.locale)`, `dateRange(a, b, t.locale)`,
  `monthYear("2026-10", t.locale)`; a date the data holds in words ("9 October 2026") → `dateText(s, t.locale)`.
- Numbers and money stay as they are (`num`, `aed`, `aedShort`): Western digits, "AED", in every language.
- Project names, building names, brands ("by Palace"), the company, FelicityBot and person names are never
  translated. Wrap a Latin name inside Arabic text in nothing — the browser orders it.
- Plain `<a href="/…">` to a page of this site must use `localizePath(path, t.locale)`; `<Link>` needs nothing.
- `|` inside a key marks where a heading may break (`TwoLines` in shared.tsx); translations keep it.
- When the same English means two things, give one of them a note after `@@`:
  `t("Share@@table column: the instalment's share of the price")`. The note is never shown; English pages
  show the text before `@@`, and translators see the note.
- Text in code that only `/leads` shows stays English and outside `t()`.
- Server functions return English; the page translates a known message with `t(message)` — mark the
  possible messages with `msg("…")` where they are written so they become keys.
- WhatsApp messages: `waMessage(t, english, template, vars)` — the visitor's language with the English below,
  so the broker can always read it.
  The enquiry form's WhatsApp/email summary is the exception: it stays English, as the broker's record.
- Two sentences side by side: put `{gap(t)}` between them, not a space (Chinese has none after "。").
- A short Latin label inside Arabic ("4+", "AED 5M+"): `ltrLabel(s, t.locale)`, or the "+" jumps sides.
- Amounts never break between "AED" and the figure on Arabic and Chinese pages (`translate` handles it).

## Text that changes with the data

A string rebuilt on every data refresh (the 12-month window label, "DLD registrations loaded through …",
the DLD figures benefit card) is never a key: the page fills a template from the snapshot's numbers and
dates, and a test checks the English template reproduces the English text exactly. A refresh that only
moves numbers needs no new translation.

Anything else a refresh adds (a new project's overview, a changed caption) shows in English on the Arabic and
Chinese pages until it is translated, and `npm test` says which keys are missing. Translate them into
`ar/*.json` and `zh/*.json` (glossary below), run `npm run i18n:keys`, commit.

## Glossary

| English | Arabic | Chinese |
|---|---|---|
| Dubai Creek Harbour | مرسى خور دبي | 迪拜溪港 |
| Emaar / Emaar Properties PJSC | إعمار / إعمار العقارية ش.م.ع | 伊玛尔 / 伊玛尔地产公司 |
| Dubai Land Department (DLD) | دائرة الأراضي والأملاك في دبي | 迪拜土地局 (DLD) |
| Real Estate Regulatory Agency (RERA) | مؤسسة التنظيم العقاري (ريرا) | 迪拜房地产监管局 (RERA) |
| Ejari | إيجاري | Ejari 租赁登记 |
| off-plan | على الخارطة | 期房 |
| ready | جاهز | 现房 |
| resale | إعادة بيع | 二手转售 |
| handover | التسليم | 交房 |
| payment plan | خطة الدفع | 付款计划 |
| Golden Visa | الإقامة الذهبية | 黄金签证 |
| freehold | تملّك حر | 永久产权 |
| sq ft | قدم مربع | 平方英尺 |

The legal pages carry a line that the English version is the legally binding one.
