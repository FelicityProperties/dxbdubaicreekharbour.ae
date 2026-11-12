# DLD snapshot: `src/data/transactions.json`

The registered sales and rents on the site (home, `/market`, project pages, the DLD figures card) come from Dubai
Land Department registration records, fetched through the PropertyIndex connector. The site credits the Dubai Land
Department only; the supplier is named here and in `VERCEL-LAYER.md`, never in page code, data or translations.

| File | What it is |
|---|---|
| `queries.json` | The 14 queries, exactly as run. Never edit one except to move the 12-month window. |
| `capture.py` | Copies each query's result, unchanged, out of the agent transcripts into `raw/`. |
| `build_transactions.py` | Builds `src/data/transactions.json` from `raw/`. |
| `project_map.json` | Register location → site project. It reproduces every building-to-project match of the 6 Nov 2026 snapshot. |
| `raw/` | The raw results. Kept local and git-ignored: the queries can always fetch them again. |

## "refresh pix"

1. Run every query in `queries.json` once, unchanged, with `mcp__PropertyIndex__propertyindex_query`. Run them in helper
   agents, so the rows never pass through the main conversation. Collect each agent's report as a list of
   `{"file", "queryId", "ok"}`.
   - The connector's `queryId` is a fingerprint of the query, so an unchanged query keeps its ID.
   - For example `sales_existing_p1.json` is `d4bebca10c924aaaacd34c42`.
2. Copy the results out:
   `python3 -I tools/pix/capture.py <the run's transcript dir> <reports.json>`.
   It accepts only real results (a `rows` list plus `definitions`), never an agent's retelling.
3. Build the snapshot:
   `python3 -I tools/pix/build_transactions.py <today, YYYY-MM-DD>`.
   It refuses to build if a 12-month aggregate came back incomplete, or if the window in the queries does not match
   the coverage month.
4. **When `definitions.coverage` moves to a new month** (for example "…through November 2026"):
   - Move the `between` dates of the seven 12-month queries in `queries.json`. The window is the 12 full months ending
     with the coverage month.
   - Run them again and build.
   - `npm test` then says whether the DLD figures card moved. If it did, update `src/data/benefits.ts` and
     `design/benefits-sources.json` to the template in `Benefits.tsx`.
5. Finish:
   - Run `npm run sitemap`, `npm test` and `NITRO_PRESET=vercel npm run build`.
   - Grep `src/`, `public/` and the build output for the supplier's name; it must be absent.
   - Commit and push, check the live site, and report in three lines.

Rows are ordered newest first, then by building, then by price (sales) or by start date (rentals). The latest-row
lists keep the 200 newest registrations of each kind. Related-party transfers and completion re-registrations are
left out of the sales rows. The 12-month summaries count apartments only.
