import { LOCALE_META, isLocale, localizePath, type Locale } from "@/i18n/locales";
import { tFor } from "@/i18n/messages";

/** Text goes into the page as HTML: a translation must not be able to break it. */
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** The plain page shown when the server itself fails, in the language of the address asked for (English by default). */
export function renderErrorPage(locale: Locale = "en"): string {
  const l: Locale = isLocale(locale) ? locale : "en";
  const t = tFor(l);
  return `<!doctype html>
<html lang="${LOCALE_META[l].htmlLang}" dir="${LOCALE_META[l].dir}">
  <head>
    <meta charset="utf-8" />
    <title>${esc(t("This page didn't load"))}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #fafafa; color: #111; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #4b5563; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #111; color: #fff; }
      .secondary { background: #fff; color: #111; border-color: #d1d5db; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>${esc(t("This page didn't load"))}</h1>
      <p>${esc(t("Something went wrong on our end. You can try refreshing or head back home."))}</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">${esc(t("Try again"))}</button>
        <a class="secondary" href="${localizePath("/", l)}">${esc(t("Go home"))}</a>
      </div>
    </div>
  </body>
</html>`;
}
