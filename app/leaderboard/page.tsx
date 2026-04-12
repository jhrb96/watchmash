import Image from "next/image";
import { INITIAL_ELO } from "@/lib/config";
import {
  fetchLeaderboard,
  leaderboardWithoutRedis,
  type LeaderboardRow,
} from "@/lib/leaderboard";
import { getRedis } from "@/lib/redis";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const redis = getRedis();
  let rows: LeaderboardRow[];
  let offline = false;
  if (redis) {
    rows = await fetchLeaderboard(redis);
  } else {
    rows = leaderboardWithoutRedis();
    offline = true;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-50">Leaderboard</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Global ranking by Elo (starting rating {INITIAL_ELO} until votes move
          scores)
        </p>
      </div>
      {offline ? (
        <p className="rounded-lg border border-amber-900/60 bg-amber-950/30 px-4 py-3 text-sm text-amber-200">
          Redis is not configured for this Node process. Vercel env vars do not
          apply to your laptop — add{" "}
          <code className="rounded bg-zinc-900 px-1 text-xs">
            UPSTASH_REDIS_REST_URL
          </code>{" "}
          and{" "}
          <code className="rounded bg-zinc-900 px-1 text-xs">
            UPSTASH_REDIS_REST_TOKEN
          </code>{" "}
          to <code className="rounded bg-zinc-900 px-1 text-xs">.env.local</code>{" "}
          (copy from the Vercel dashboard or run{" "}
          <code className="rounded bg-zinc-900 px-1 text-xs">
            vercel env pull
          </code>
          ), then restart <code className="rounded bg-zinc-900 px-1 text-xs">npm run dev</code>.
          Until then, scores stay at the default {INITIAL_ELO}.
        </p>
      ) : null}
      <ol className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900/50">
        {rows.map((row, index) => (
          <li
            key={row.id}
            className="flex items-center gap-4 px-4 py-3 first:rounded-t-xl last:rounded-b-xl"
          >
            <span className="w-8 text-center text-sm font-medium text-zinc-500">
              {index + 1}
            </span>
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-950">
              <Image
                src={row.image}
                alt={row.name}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-zinc-100">{row.name}</p>
              <p className="text-xs text-zinc-500">{row.id}</p>
            </div>
            <span className="tabular-nums text-sm font-semibold text-yellow-500">
              {row.elo}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
