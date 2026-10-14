/**
 * POST /api/visit: the browser's visit report (src/components/SiteAnalytics.tsx).
 * The handler runs on the server only; see src/lib/visits.server.ts.
 */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/visit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { handleVisit } = await import("@/lib/visits.server");
        return handleVisit(request);
      },
    },
  },
});
