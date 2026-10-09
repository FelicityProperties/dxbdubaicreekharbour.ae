# Design notes

- `favicon-seal.svg` — the favicon in use (October 2026): navy medallion, brass rim, cream Cormorant Garamond "D" (the letter that opens the DXB wordmark). Chosen from five concepts rendered at real tab sizes and judged for legibility, brand fit and taste; `favicon-finalists.png` shows it next to the runner-up.
- `favicon-monogram-runner-up.svg` — the runner-up (cream D on a navy rounded square), kept in case the owner prefers it. To switch, regenerate `public/favicon.ico`, the PNG icons and `public/favicon.svg` from this file.
- The header lockup lives in code: `Wordmark` in `src/components/showcase/shared.tsx` with the `.dxbch-*` styles.
