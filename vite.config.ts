// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

type NitroOptions = Exclude<NonNullable<Parameters<typeof defineConfig>[0]>["nitro"], boolean | undefined>;

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Vercel only: let a FelicityBot answer run up to 60 s (the most every Vercel plan allows),
  // whatever the project's default is. Its own deadline (felicitybot.functions.ts) stays inside this.
  // The options are passed to nitro as they are; this package's type lists only a few of them.
  nitro: { vercel: { functions: { maxDuration: 60 } } } as NitroOptions,
});
