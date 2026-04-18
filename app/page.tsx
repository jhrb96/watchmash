import Link from "next/link";
import { TournamentClient } from "@/components/TournamentClient";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
          Which watch wins?
        </h1>
        <p className="max-w-xl text-zinc-400">
          Each visit runs a fresh random single-elimination tournament. Only the
          champion increments their win count in Redis — tap through until one
          watch remains.
        </p>
        <Link
          href="/leaderboard"
          className="inline-flex rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-500"
        >
          View leaderboard
        </Link>
      </div>
      <section id="mash" aria-label="Tournament picks">
        <TournamentClient />
      </section>
    </div>
  );
}
