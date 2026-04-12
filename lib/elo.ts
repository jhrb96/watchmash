import { ELO_K, INITIAL_ELO } from "@/lib/config";

export function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + 10 ** ((ratingB - ratingA) / 400));
}

export function updateEloPair(
  winnerRating: number,
  loserRating: number,
  k: number = ELO_K,
): { winner: number; loser: number } {
  const ew = expectedScore(winnerRating, loserRating);
  const el = expectedScore(loserRating, winnerRating);
  return {
    winner: Math.round(winnerRating + k * (1 - ew)),
    loser: Math.round(loserRating + k * (0 - el)),
  };
}

export function parseElo(value: unknown): number {
  if (value === null || value === undefined) return INITIAL_ELO;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : INITIAL_ELO;
}
