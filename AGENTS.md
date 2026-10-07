<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Showcase architecture
- Keep all project facts in the supplied typed data module; presentation reads them without calculations or fabricated defaults.
- Use shared showcase components for cards, WhatsApp URLs, navigation and the exact disclaimer so every page remains consistent.
- Generate canonical social-image metadata through the shared helper in content-route heads, never at the root or on missing projects, to prevent inherited sharing previews.
- Keep the full home showcase at the index route and project details at `/projects/$slug`; hash navigation is for sections of this explicitly requested scrolling home page.
- The showcase is frontend-only with no persistence; enquiries leave the site through encoded WhatsApp links.
- Define visual tokens and reusable layout styles in the global stylesheet; allow dynamic plan flex proportions solely from supplied percentages.

- Keep captioned project media and Dialog lightbox in the shared gallery module with per-image failure state; this prevents broken icons and preserves cover art fallbacks.
- The gallery grid shows only the images other than the cover while the lightbox cycles the full list, returning focus to the tile that opened it and following the arrow keys; this keeps the cover visible once on the page yet still reachable.
- Reuse the single WhatsApp-only EnquirySection on home and project pages; this keeps enquiries frontend-only and consistent.
- Keep Vercel hosting configuration separate from Lovable preview settings; this preserves the existing preview build.
