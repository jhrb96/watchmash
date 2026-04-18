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

function shuffleWatchArray(watches: Watch[]): Watch[] {
  const out = [...watches];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/**
 * Every catalog watch enters the bracket (shuffled order). Non-power-of-two
 * sizes use implicit byes: when one player is left waiting in a round while
 * others have already advanced, they carry forward without an extra match
 * (see `advanceBracketAfterValidPick` in `lib/tournament.ts`).
 */
export function pickTournamentParticipants(): Watch[] {
  if (WATCHES.length < 2) {
    throw new Error("Catalog needs at least two watches");
  }
  return shuffleWatchArray([...WATCHES]);
}
