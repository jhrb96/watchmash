import Link from "next/link";
import { DuelClient } from "@/components/DuelClient";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
          Which watch wins?
        </h1>
        <p className="max-w-xl text-zinc-400">
          Tap the watch you prefer. Scores use Elo; nothing is stored except
          current ratings in Redis.
        </p>
        <Link
          href="/leaderboard"
          className="inline-flex rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-500"
        >
          View leaderboard
        </Link>
      </div>
      <section id="mash" aria-label="Pick a watch">
        <DuelClient />
      </section>
    </div>
  );
}
