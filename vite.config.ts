// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

type NitroOptions = Exclude<NonNullable<Parameters<typeof defineConfig>[0]>["nitro"], boolean | undefined>;

// Sent with every response on Vercel, pages and files alike (a first route that matches everything and carries on):
// - nosniff: a file is only ever treated as the type it is served as;
// - the page may be framed by this site alone, so another site cannot lay it under its own buttons (clickjacking),
//   the enquiry form and /leads included; no <base> or plug-in content from elsewhere; forms post here only;
// - other sites learn which site a visitor came from, never which page;
// - the browser features the site never uses stay off for it and for anything embedded in it.
// Nothing here limits scripts, styles, images or video, so no page loses a feature to it, and felicitypro.com still
// plays the videos in public/felicitypro straight from here (a video file is not a framed page).
const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Content-Security-Policy": "frame-ancestors 'self'; base-uri 'self'; object-src 'none'; form-action 'self'",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
};

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Vercel only: let a FelicityBot answer run up to 60 s (the most every Vercel plan allows),
  // whatever the project's default is. Its own deadline (felicitybot.functions.ts) stays inside this.
  // The options are passed to nitro as they are; this package's type lists only a few of them.
  // The security headers are the first route of .vercel/output/config.json, which nitro writes from `vercel.config`
  // (vercel.json's "headers" are not read for a prebuilt output).
  nitro: {
    vercel: {
      functions: { maxDuration: 60 },
      config: { routes: [{ src: "/(.*)", headers: SECURITY_HEADERS, continue: true }] },
    },
  } as NitroOptions,
});
