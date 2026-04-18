import { getWatchById } from "@/lib/catalog";
import type { TournamentSession } from "@/lib/tournament";
import { currentPairIds } from "@/lib/tournament";

export type WatchCard = { id: string; name: string; image: string };

export function toWatchCard(id: string): WatchCard {
  const w = getWatchById(id);
  if (!w) {
    throw new Error(`Unknown watch id: ${id}`);
  }
  return { id: w.id, name: w.name, image: w.image };
}

export function buildPickResponseBody(
  sessionId: string,
  s: TournamentSession,
): Record<string, unknown> {
  if (s.status === "complete" && s.championId) {
    return {
      sessionId,
      pickIndex: s.pickIndex,
      complete: true,
      champion: toWatchCard(s.championId),
    };
  }
  const pair = currentPairIds(s);
  if (!pair) {
    return {
      sessionId,
      pickIndex: s.pickIndex,
      complete: false,
      error: "no_active_match",
    };
  }
  return {
    sessionId,
    pickIndex: s.pickIndex,
    complete: false,
    match: {
      left: toWatchCard(pair[0]),
      right: toWatchCard(pair[1]),
    },
  };
}
