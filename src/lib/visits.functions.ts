/** The visitor numbers for /leads, behind the same password as the enquiries. */
import { createServerFn } from "@tanstack/react-start";
import { checkLeadsPassword, countEnquiries } from "@/lib/enquiries.functions";
import type { VisitStatsResult } from "@/lib/visits.shared";

export const getVisitStats = createServerFn({ method: "POST" })
  .validator((d: unknown) => (d && typeof d === "object" ? d : {}) as { password?: unknown; days?: unknown })
  .handler(async ({ data }): Promise<VisitStatsResult> => {
    const access = await checkLeadsPassword(data.password);
    if (access !== "ok") return { status: access };
    const days = [1, 7, 30, 90].includes(Number(data.days)) ? Number(data.days) : 7;
    const { visitStats } = await import("@/lib/visits.server");
    const stats = await visitStats(days);
    if (!stats) return { status: "offline" };
    const enquiries = await countEnquiries(stats.from, stats.to);
    return { status: "ok", stats: { ...stats, enquiries: enquiries ?? 0 } };
  });
