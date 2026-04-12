import type { Redis } from "@upstash/redis";
import { WATCHES, type Watch } from "@/lib/catalog";
import { INITIAL_ELO } from "@/lib/config";
import { parseElo } from "@/lib/elo";
import { eloKey } from "@/lib/redis";

export type LeaderboardRow = Watch & { elo: number };

function sortLeaderboard(rows: LeaderboardRow[]): LeaderboardRow[] {
  return [...rows].sort((a, b) => {
    if (b.elo !== a.elo) return b.elo - a.elo;
    return a.id.localeCompare(b.id);
  });
}

export function leaderboardWithoutRedis(): LeaderboardRow[] {
  return sortLeaderboard(
    WATCHES.map((w) => ({ ...w, elo: INITIAL_ELO })),
  );
}

export async function fetchLeaderboard(redis: Redis): Promise<LeaderboardRow[]> {
  const keys = WATCHES.map((w) => eloKey(w.id));
  const raw = await redis.mget<(string | null)[]>(...keys);
  const withElo: LeaderboardRow[] = WATCHES.map((w, i) => ({
    ...w,
    elo: parseElo(raw[i]),
  }));
  return sortLeaderboard(withElo);
}
