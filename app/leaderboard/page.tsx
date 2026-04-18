import Image from "next/image";
import {
  fetchLeaderboard,
  leaderboardWithoutRedis,
  type LeaderboardRow,
} from "@/lib/leaderboard";
import { genericLeaderboardWatchName } from "@/lib/leaderboardDisplay";
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
          Tournament wins — each full bracket crowns one champion; wins are
          stored per watch id in Redis.
        </p>
      </div>
      {offline ? (
        <div className="space-y-2 rounded-lg border border-amber-900/60 bg-amber-950/30 px-4 py-3 text-sm text-amber-200">
          <p>
            Redis REST credentials are missing. Set either{" "}
            <code className="rounded bg-zinc-900 px-1 text-xs">
              UPSTASH_REDIS_REST_URL
            </code>{" "}
            +{" "}
            <code className="rounded bg-zinc-900 px-1 text-xs">
              UPSTASH_REDIS_REST_TOKEN
            </code>{" "}
            or{" "}
            <code className="rounded bg-zinc-900 px-1 text-xs">
              KV_REST_API_URL
            </code>{" "}
            +{" "}
            <code className="rounded bg-zinc-900 px-1 text-xs">
              KV_REST_API_TOKEN
            </code>{" "}
            in{" "}
            <code className="rounded bg-zinc-900 px-1 text-xs">.env.local</code>
            , then restart{" "}
            <code className="rounded bg-zinc-900 px-1 text-xs">npm run dev</code>
            . Until then, all watches show 0 wins.
          </p>
          <p className="text-amber-200/90">
            If you ran{" "}
            <code className="rounded bg-zinc-900 px-1 text-xs">
              vercel env pull
            </code>{" "}
            but still see this: it pulls the{" "}
            <strong className="font-medium text-amber-100">Development</strong>{" "}
            environment by default. Add the Upstash vars under Development in
            Vercel, or run{" "}
            <code className="rounded bg-zinc-900 px-1 text-xs">
              vercel env pull .env.local --environment=production
            </code>{" "}
            if they only exist for Production.
          </p>
        </div>
      ) : null}
      <ol className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-900/50">
        {rows.map((row, index) => {
          const displayName = genericLeaderboardWatchName(row.id);
          return (
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
                alt={displayName}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-zinc-100">{displayName}</p>
              <p className="text-xs text-zinc-500">{row.id}</p>
            </div>
            <span className="tabular-nums text-sm font-semibold text-yellow-500">
              {row.wins}
            </span>
          </li>
          );
        })}
      </ol>
    </div>
  );
}
