/** Generic label for leaderboard rows (`w-7` / `w-07` → `Watch 07`). */
export function genericLeaderboardWatchName(id: string): string {
  const m = /^w-(\d+)$/.exec(id);
  if (!m) return id;
  const n = parseInt(m[1]!, 10);
  if (!Number.isFinite(n) || n < 1) return id;
  return `Watch ${String(n).padStart(2, "0")}`;
}
