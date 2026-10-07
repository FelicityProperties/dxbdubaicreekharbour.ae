# dxbdubaicreekharbour.ae

An independent buyer's guide to Dubai Creek Harbour with an enquiry form.
Enquiries are saved in a Neon database and listed at `/leads` behind a
password.

## Going live

1. **Vercel**: vercel.com → Add New → Project → import this repository.
   It's detected as Next.js; leave the defaults.
2. **Neon**: in the Vercel project, Storage → Connect Database → Neon
   (or paste your own Neon pooled connection string as `DATABASE_URL`
   under Settings → Environment Variables).
3. **Leads password**: Settings → Environment Variables → add
   `LEADS_PASSWORD` with a password of your choice.
4. **Redeploy** once both variables are in (Deployments → ⋯ → Redeploy).
   The build creates the enquiries table in Neon by itself.
5. **Domain**: Settings → Domains → add `dxbdubaicreekharbour.ae` and
   `www.dxbdubaicreekharbour.ae`, then copy the DNS records Vercel shows
   into the .ae registrar's DNS panel.

Open `https://dxbdubaicreekharbour.ae/leads` to see enquiries (any
username, `LEADS_PASSWORD` as the password).

## Working on it

```bash
npm install
npm run dev         # http://localhost:3000
npm test            # type check, lint, and the site rules below
```

`scripts/verify-site.mjs` guards the rules the site is built on: nothing
naming any other business, no market figures (prices, PSF, yields, rents,
transaction counts) in the copy, and the "not the official site / not
Emaar" line stays in the footer.

Copy lives in `src/lib/site.ts`.
