import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
          Which watch wins?
        </h1>
        <p className="max-w-xl text-zinc-400">
          Tap the watch you prefer. Scores use Elo; nothing is stored except
          current ratings in Redis.
        </p>
      </div>
      <div className="flex flex-wrap gap-4">
        <Link
          href="/duel"
          className="rounded-lg bg-yellow-500 px-5 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-yellow-400"
        >
          Start dueling
        </Link>
        <Link
          href="/leaderboard"
          className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-500"
        >
          View leaderboard
        </Link>
      </div>
    </div>
  );
}
