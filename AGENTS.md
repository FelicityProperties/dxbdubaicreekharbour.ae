<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project started in [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed.
<!-- LOVABLE:END -->

## Numbers: Emaar or the Land Department, never typed in

- Every price, size, unit count, payment schedule, handover date and status
  lives in `src/data/projects.ts`, generated from Emaar's own pages and
  dated. Every registered sale, rent, count and median lives in
  `src/data/transactions.json`, generated from PropertyIndex (Dubai Land
  Department records) and dated. Presentation reads them; it never
  calculates beyond adding up counts, and never invents a default.
- If a figure is missing, show "on request" or leave the row out. A
  plausible-sounding number is wrong even when it is close.
- The area page and the buying guide quote Emaar's published figures with a
  source link beside each one. Editorial copy stays qualitative.

## Showcase architecture

- Shared showcase components (`src/components/showcase/shared.tsx`) own the
  header, footer, cards, status wording, price wording, WhatsApp URLs and the
  exact disclaimer, so every page says the same thing.
- Keep the brand lockup in the shared `Wordmark` with its pixel-tuned
  `.dxbch-*` styles, and serve every icon from `public/` wired through the
  root route head.
- Routes: `/` (home: snapshot, filterable collection, plans, latest
  transactions, district teaser, guide teaser, enquiry, FAQ), `/projects/$slug`,
  `/market`, `/area`, `/guide`, `/leads`. Hash links are for sections of the
  home page.
- Canonical social-image metadata goes through the shared helper in each
  content route's head, never at the root or on missing projects. Project
  pages use their own `og.jpg`.
- Images are self-hosted WebP variants under `public/img`; render them with
  the shared `Picture` (srcset + sizes, lazy except the first on a page) and
  keep the gallery's lightbox, failure state and focus return.
- Visual tokens and reusable layout styles live in the global stylesheet;
  plan-bar proportions come solely from the supplied percentages.
- Enquiries save to Neon through `src/lib/enquiries.functions.ts` with a
  WhatsApp fallback; the private `/leads` page is password-protected on the
  server. Nothing is ever emailed from the site.
