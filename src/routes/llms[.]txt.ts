/**
 * /llms.txt: the site described for AI assistants (llmstxt.org), as plain text built from the data files
 * (src/lib/llms.server.ts).
 */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: async ({ request }) => (await import("@/lib/llms.server")).llmsResponse(request),
    },
  },
});
