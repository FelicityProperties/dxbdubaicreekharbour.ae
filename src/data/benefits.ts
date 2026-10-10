/**
 * "Why Dubai Creek Harbour" — each entry rests on a sentence Emaar published
 * (sourceUrl) or on a figure in the DLD snapshot (src/data/transactions.json).
 * Never add a reason that cannot be traced to one of those two.
 */
export type Benefit = { title: string; body: string; sourceUrl: string; kind: "emaar" | "dld-snapshot" };

export const BENEFITS: Benefit[] = [];
