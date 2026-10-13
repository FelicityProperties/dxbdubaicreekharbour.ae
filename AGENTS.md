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
  `src/data/transactions.json`: Dubai Land Department registration records,
  generated from the data supplier's query results and dated. Presentation
  reads them; it never calculates beyond adding up counts, and never invents
  a default.
- On the site, registered figures and construction status are credited to
  the Dubai Land Department and to nobody else; the supplier is named only
  in `VERCEL-LAYER.md` and the generators. Do not add supplier names or
  links to page code or to the data files.
- If a figure is missing, show "on request" or leave the row out. A
  plausible-sounding number is wrong even when it is close.
- The area page and the buying guide quote Emaar's published figures with a
  source link beside each one. Editorial copy stays qualitative.
- FelicityBot (the AI assistant) answers only from the knowledge text that
  `src/lib/felicitybot.knowledge.ts` renders from these same data files. To
  teach it a fact, change the data file; never type a figure into its rules
  or knowledge text. Its rules forbid estimates, ranges and yields, and it
  credits only Emaar and the Dubai Land Department.

## Showcase architecture

- Shared showcase components (`src/components/showcase/shared.tsx`) own the
  header, footer, cards, status wording, price wording, WhatsApp URLs and the
  exact disclaimer, so every page says the same thing.
- Keep the brand lockup in the shared `Wordmark` with its pixel-tuned
  `.dxbch-*` styles, and serve every icon from `public/` wired through the
  root route head.
- Routes: `/` (home: snapshot, filterable collection, plans, latest
  transactions, district teaser, guide teaser, enquiry, FAQ), `/projects`
  (the same collection as a page of its own), `/projects/$slug`,
  `/payment-plans`, `/market`, `/area`, `/guide`, `/terms`, `/privacy`,
  `/leads`. Navigation links to pages, never to `/#section`; hash links are
  only for jumps within the page you are on.
- Search: titles stay within 60 characters and descriptions within 160
  (helpers and the brokerage's structured data in `src/lib/seo.ts`; a test
  enforces the limits for project pages). Route `head()` code must not import
  `transactions.json` — it would put the whole snapshot in every page's
  JavaScript. After adding a page, run `npm run sitemap`; a test fails if the
  sitemap misses a page or project.
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
  server. Nothing is emailed to visitors; with `RESEND_API_KEY` set, each new
  enquiry is also emailed to the operator only (`LEAD_EMAIL`, default
  `SITE.email`) — see `VERCEL-LAYER.md` and the Privacy Notice. A failed
  alert never fails the enquiry.
