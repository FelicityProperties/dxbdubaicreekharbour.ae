/**
 * Browser entry: the default one, except that an Arabic or Chinese page loads its
 * dictionary before the page comes to life, so the browser shows exactly what the
 * server sent. English pages load no dictionary.
 */
import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { StartClient } from "@tanstack/react-start/client";
import { loadMessages } from "./i18n/messages";
import { splitLocale } from "./i18n/locales";

void loadMessages(splitLocale(window.location.pathname).locale)
  .catch(() => { /* English text stays; the page still works */ })
  .finally(() => {
    startTransition(() => {
      hydrateRoot(
        document,
        <StrictMode>
          <StartClient />
        </StrictMode>,
      );
    });
  });
