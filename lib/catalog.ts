import { WATCHES, type Watch } from "./generated/watchCatalog";

export type { Watch };
export { WATCHES };

const byId = new Map(WATCHES.map((w) => [w.id, w]));

export function getWatchById(id: string): Watch | undefined {
  return byId.get(id);
}

export function isValidWatchId(id: string): boolean {
  return byId.has(id);
}

/** Largest power of two ≤ n (n ≥ 1). */
export function largestPowerOfTwoAtMost(n: number): number {
  if (n < 1) return 0;
  let p = 1;
  while (p * 2 <= n) p *= 2;
  return p;
}

function shuffleWatchArray(watches: Watch[]): Watch[] {
  const out = [...watches];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/**
 * Picks M = largest power of two ≤ catalog size distinct watches, uniformly
 * among all M-subsets (shuffle index permutation then take first M), then
 * shuffles participant order for the bracket.
 */
export function pickTournamentParticipants(): Watch[] {
  if (WATCHES.length < 2) {
    throw new Error("Catalog needs at least two watches");
  }
  const m = largestPowerOfTwoAtMost(WATCHES.length);
  const indices = WATCHES.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j]!, indices[i]!];
  }
  const chosen = indices.slice(0, m).map((i) => WATCHES[i]!);
  return shuffleWatchArray(chosen);
}
