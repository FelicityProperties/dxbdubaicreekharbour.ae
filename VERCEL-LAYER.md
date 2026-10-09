# How this repo is put together

The site is **hosted on Vercel** at dxbdubaicreekharbour.ae. Vercel deploys
whatever is on `main` in this repo. Since October 2026 the code is edited
**here, in this repo** — the Lovable project "Creek Harbour Showcase" was the
starting point but is now behind this repo and should not be copied over it.

## Where things live

- `src/data/projects.ts` — the 42 projects: every price, size, unit count,
  payment schedule, handover date, amenity and image caption. **Generated**
  from Emaar's own pages by the snapshot tooling (see "Refreshing the data");
  never hand-edit a figure.
- `src/data/transactions.json` — registered sales and tenancy contracts for
  Dubai Creek Harbour, supplied by PropertyIndex (Dubai Land Department
  records). Also generated; `src/data/transactions.ts` types it and adds the
  per-project helpers. Shown as registered, never as valuations.
- `public/img/<project-slug>/` — Emaar's renders and photos, resized to
  480/960/1600 WebP plus a 1200×630 `og.jpg` for sharing previews.
  `public/img/district/` holds the area images.
- `src/routes/` — `index.tsx` (home), `projects.$slug.tsx`, `market.tsx`
  (registered sales and rents), `area.tsx` (the district), `guide.tsx`
  (buying steps, costs, FAQ), `leads.tsx` (private enquiries page).
- `src/components/showcase/` — header, footer, cards, gallery, shared helpers
  and the exact footer disclaimer. `src/components/market/` — the
  transaction tables and summaries. `src/components/enquiry/` — the form.
- `src/lib/enquiries.functions.ts` — server side of the form and `/leads`.
  Enquiries go to the Neon database Vercel provides as `DATABASE_URL`; the
  `enquiries` table creates itself (and adds new columns) on first use.

## Refreshing the data

Both data files carry the date they were taken. To refresh:

1. Re-run the Emaar extraction and `build.py` to regenerate
   `src/data/projects.ts` (prices, unit counts, sizes, schedules, status).
2. Re-query PropertyIndex and run `build_transactions.py` to regenerate
   `src/data/transactions.json`.
3. Build, check every page, commit, push.

The generators live with the session tooling, not in this repo; the rule
that matters is in `AGENTS.md`: no Dubai real-estate figure is ever typed in
by hand.

## Vercel settings

- `vercel.json` tells Vercel how to install and build (npm, not bun: Lovable's
  `bun.lock` points at Lovable's private package registry).
- Environment variables:
  - `DATABASE_URL` — from the Neon integration. Enquiries are saved here.
  - `LEADS_PASSWORD` — password for `/leads`, **at least 20 characters**
    (shorter ones are refused, because nothing slows down guessing). Set it
    before the last deployment or redeploy after setting it.
  - `RESEND_API_KEY` — optional. When set, every new enquiry is also emailed
    to `LEAD_EMAIL` (default: the address in `SITE.email`, currently the
    owner's Gmail) through Resend; `LEAD_FROM` overrides the sender once a
    domain is verified there. Without the key, enquiries are only saved to
    the database and shown on `/leads`.
- Node.js 22.x (set in `package.json` → `engines`).
- Both the domain and the two variables must be on the same Vercel project.

## Checking a change locally

`npm install --include=dev --legacy-peer-deps`, then
`NITRO_PRESET=node-server npm run build` and
`PORT=4700 node .output/server/index.mjs`. `npx tsc --noEmit` and
`npm test` must pass before pushing.

## Rules the content follows

- Independent showcase, not Emaar's site; the footer disclaimer says so on
  every page and names the two data sources and their dates.
- Emaar figures come only from `src/data/projects.ts`; registered figures
  only from `src/data/transactions.json`. Don't add numbers anywhere else.
- Photos and brochures are Emaar's official files; brochures and floor plans
  link to Emaar's site, images are self-hosted copies with Emaar credited in
  every caption.
