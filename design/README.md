# Design notes

- Favicon in use (from 12 October 2026): **option A, a dhow** — a cream lateen sail over a brass hull on a navy rounded square (`favicon-dhow-1.svg`, same file as `public/favicon.svg`). The dhow is the traditional boat of Dubai Creek, so it says "Creek Harbour" at a glance.
- `favicon-options-oct12.png` is the sheet the owner saw: the top five of sixteen concepts, judged at real tab sizes for legibility, brand fit and taste. The other four are kept here so any of them can go live in minutes:
  - B `favicon-dhow-2.svg` — two-masted dhow (cream main sail, brass mizzen)
  - C `favicon-wave-1.svg` — sun over two brass water lines
  - D `favicon-anchor-1.svg` — brass anchor
  - E `favicon-star-2.svg` — faceted compass star
- To switch: render `public/favicon.ico` (16 + 32 px), `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` (mark at 80% on navy) and copy the SVG to `public/favicon.svg`; then bump `?v=` on the icon links in `src/routes/__root.tsx` and `public/site.webmanifest`, and `VERSION` in `public/sw.js`, so browsers drop the old icon.
- Rejected earlier: the arch mark on a navy square (October 2026) and the navy seal with a brass rim and a Cormorant "D" (9–12 October 2026).
- The header lockup lives in code: `Wordmark` in `src/components/showcase/shared.tsx` with the `.dxbch-*` styles.
