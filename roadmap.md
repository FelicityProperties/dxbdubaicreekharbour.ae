# Showcase roadmap
- [x] Exact supplied project data and compliant content
- [x] Home, project pages, shared navigation and footer
- [x] Luxury design and permitted atmosphere imagery
- [x] SEO, robots and sitemap
- [x] Verify mobile, links, filters, fallbacks and numeric content

## Requested refinements
- [x] Project metadata, fact rows, banner semantics and next-project recommendations
- [x] Branded sharing image and canonical social metadata
- [x] Mobile readability, tap targets, captions, footer clearance and plan bars
- [x] Recheck all pages, displayed numbers and unchanged protected content

## Official media update
- [x] Replace supplied project data exactly and footer disclaimer
- [x] Official image covers, captions, galleries, lightbox and failure fallbacks
- [x] WhatsApp enquiry sections on home and every project
- [x] Attached sharing image, Vercel settings and robots restriction
- [x] Verify desktop/mobile, images, links, numeric content and console health

## Gallery and hero polish
- [x] Gallery grid skips the cover photo, lightbox keeps cycling the full list
- [x] Larger lightbox close target, focus return and arrow-key navigation
- [x] Hero headline width and caption backing at tablet width

## Final brand mark
- [x] New mark, favicon set, app icons and web manifest
- [x] Header and footer lockup replaced with the supplied pixel-tuned markup
## October 2026: the broker's edition
- [x] All 42 Emaar projects at Dubai Creek Harbour, with Emaar's two prices (starting price and cheapest listed unit), unit counts, sizes, dated payment schedules and handover milestones
- [x] Self-hosted Emaar renders for every project (480/960/1600 WebP, sharing image each)
- [x] Registered sales (ready and off-plan) and tenancy contracts from PropertyIndex / DLD on the home page, a market page and every project page
- [x] Filters by status, quarter, bedrooms and budget; compare table
- [x] Area page, buying guide with Emaar-sourced costs, fuller FAQ
- [x] Enquiry form: looking-for, country, language; phone bottom bar; 16px fields on phones
- [x] Titles, descriptions, canonical links, JSON-LD and a 48-route sitemap
- [ ] Trakheesi advertising permit number in the footer (SITE.dldPermit) once issued

## October 2026: search
- [x] Real `/projects` page; every Projects link and breadcrumb points to it
- [x] `/payment-plans`: every Emaar schedule Emaar publishes, instalment by instalment
- [x] Titles within 60 characters and descriptions within 160 on all pages, with Emaar, price and payment plan in project titles
- [x] Brokerage structured data (Felicity Properties, ORN, BRN, licence, address), breadcrumbs on project pages
- [x] Self-hosted fonts, first gallery photo loads early, transactions table out of the main script
- [x] Generated sitemap with a test that it lists every page
- [ ] Owner: verify the site in Google Search Console and Bing Webmaster Tools, submit the sitemap
- [ ] Owner: Google Business Profile for Felicity Properties with this website; portal agency profiles linking here
- [ ] Next content: per-quarter pages (Creek Island, Creek Beach, Green Gate) once Search Console shows demand
- [ ] Refresh both data snapshots monthly

## October 2026: app feel, legal pages, why-buy
- [x] Phone tab bar (Home · Projects · Market · Enquire · WhatsApp), back button, sideways filter rows, Share, add-to-home-screen, service worker and standalone manifest
- [x] Terms of Use and Privacy Notice in plain English (`/terms`, `/privacy`), linked from footer, phone menu and the form's consent line
- [x] "Why Dubai Creek Harbour": eight sourced reasons incl. freehold, Golden Residency, payment plans, escrow, no annual property tax, location, lifestyle, registered rental market
- [x] Registered figures credited to the Dubai Land Department throughout
- [x] Licensed company name, ORN, BRN, office address and Emaar NOC on the footer, Terms and Privacy (12 Oct 2026); advertising permit number still to come
- [ ] Licence, ORN and broker card renew 7 Feb 2027 — check SITE after renewal

## October 2026: FelicityBot
- [x] AI assistant on every page (not `/leads`): answers about the 42 projects, prices, payment plans, handovers, registered sales and rents, the area and buying steps, only from the site's own data files
- [x] Links to the site's pages in its answers; replies in the visitor's language; WhatsApp fallback when it is off or busy
- [x] Passes a visitor's name and number to the broker as an enquiry, only after they say yes
- [x] Terms and Privacy updated (AI provider, what the chat keeps)
- [ ] Owner: Anthropic API key in Vercel (`ANTHROPIC_API_KEY`) with a monthly spend limit, then redeploy

## October 2026: visitor numbers
- [x] Own visitor numbers on /leads (Visitors tab): visitors, visits, stayed 30 s+, typical visit length, enquiries, visits per day, pages, sources, countries, devices
- [x] No cookies, no outside service, no IP stored; one database row per visit
- [x] Owner's browsers left out (sign in on /leads, or /leads?me=1); /leads never counted
- [x] Enquiries still emailed when the database is down
- [ ] If traffic grows: separate free database for visit numbers (ANALYTICS_DATABASE_URL)
