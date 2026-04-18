import type { Redis } from "@upstash/redis";
import { WATCHES, type Watch } from "@/lib/catalog";
import { winsKey } from "@/lib/redis";

export type LeaderboardRow = Watch & { wins: number };

function parseWins(value: unknown): number {
  if (value === null || value === undefined) return 0;
  const n = typeof value === "number" ? value : parseInt(String(value), 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function sortLeaderboard(rows: LeaderboardRow[]): LeaderboardRow[] {
  return [...rows].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return a.id.localeCompare(b.id);
  });
}

export function leaderboardWithoutRedis(): LeaderboardRow[] {
  return sortLeaderboard(WATCHES.map((w) => ({ ...w, wins: 0 })));
}

export async function fetchLeaderboard(redis: Redis): Promise<LeaderboardRow[]> {
  const keys = WATCHES.map((w) => winsKey(w.id));
  const raw = await redis.mget<(string | number | null)[]>(...keys);
  const withWins: LeaderboardRow[] = WATCHES.map((w, i) => ({
    ...w,
    wins: parseWins(raw[i]),
  }));
  return sortLeaderboard(withWins);
}
