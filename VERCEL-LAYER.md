# How this repo is put together

The site is **built in Lovable** and **hosted on Vercel** at
dxbdubaicreekharbour.ae. Vercel deploys whatever is on `main` in this repo.

## Two sources

1. **Lovable project "Creek Harbour Showcase"** — everything you see: pages,
   design, project data (`src/data/projects.ts`), photos, brochures. Edit the
   site there, then copy it here.
2. **The Vercel-only layer** — the parts Lovable can't host because they talk
   to the Neon database. They exist only in this repo:
   - `src/lib/enquiries.functions.ts` — saves enquiries to Neon and reads them
     for `/leads` (server-side only).
   - `src/components/enquiry/EnquiryForm.tsx` — the enquiry form.
   - `src/components/enquiry/EnquirySection.tsx` — replaces Lovable's
     WhatsApp-only version of the same file with one that shows the form.
   - `src/routes/leads.tsx` — the private enquiries page.
   - `"@neondatabase/serverless"` added to `dependencies` in `package.json`.

## Copying a new Lovable version in

Replace every file with Lovable's version **except** the four layer files
above, then re-add the Neon dependency to `package.json`. `public/og-image.png`
is the branded sharing image; keep it unless Lovable's is replaced on purpose.
Before pushing, check that `npm install --include=dev --legacy-peer-deps` and
`NITRO_PRESET=vercel npm run build` both succeed.

## Vercel settings

- `vercel.json` tells Vercel how to install and build (npm, not bun: Lovable's
  `bun.lock` points at Lovable's private package registry).
- Environment variables:
  - `DATABASE_URL` — from the Neon integration. Enquiries are saved here; the
    `enquiries` table creates itself on first use.
  - `LEADS_PASSWORD` — password for `/leads`, **at least 20 characters**
    (shorter ones are refused, because nothing slows down guessing).
- Node.js 22.x (set in `package.json` → `engines`).

## Rules the content follows

- Independent showcase, not Emaar's site; the footer disclaimer says so on
  every page.
- Every price, date and percentage on the site comes from
  `src/data/projects.ts`, which was checked against Emaar's own pages on
  7 October 2026. Don't add figures anywhere else.
- Photos and brochures are Emaar's official files, loaded from
  www.emaar.com.
