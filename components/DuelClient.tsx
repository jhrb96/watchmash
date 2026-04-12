"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type WatchCard = { id: string; name: string; image: string };

export function DuelClient() {
  const [pair, setPair] = useState<[WatchCard, WatchCard] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);

  const loadPair = useCallback(async () => {
    setLoading(true);
    setError(null);
    setVoteError(null);
    try {
      const res = await fetch("/api/duel", { cache: "no-store" });
      const data = (await res.json()) as {
        pair?: [WatchCard, WatchCard];
        message?: string;
      };
      if (!res.ok || !data.pair) {
        setError(data.message ?? "Could not load duel");
        setPair(null);
        return;
      }
      setPair(data.pair);
    } catch {
      setError("Network error loading duel");
      setPair(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPair();
  }, [loadPair]);

  async function vote(winner: WatchCard, loser: WatchCard) {
    setVoteError(null);
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winnerId: winner.id, loserId: loser.id }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        reason?: string;
        message?: string;
      };
      if (res.status === 429) {
        setVoteError(
          data.reason === "ip"
            ? "Too many votes from this network. Try again later."
            : "Too many votes from this browser. Try again later.",
        );
        return;
      }
      if (!res.ok) {
        setVoteError(data.message ?? "Vote failed");
        return;
      }
      await loadPair();
    } catch {
      setVoteError("Network error submitting vote");
    }
  }

  if (loading && !pair) {
    return (
      <p className="text-zinc-500" role="status">
        Loading watches…
      </p>
    );
  }

  if (error || !pair) {
    return (
      <div className="space-y-4">
        <p className="text-red-400">{error ?? "No pair available"}</p>
        <button
          type="button"
          onClick={() => void loadPair()}
          className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-200 hover:border-zinc-400"
        >
          Retry
        </button>
      </div>
    );
  }

  const [a, b] = pair;

  return (
    <div className="space-y-8">
      <p className="text-zinc-400">Tap the watch you like better.</p>
      {voteError ? (
        <p className="text-amber-400" role="alert">
          {voteError}
        </p>
      ) : null}
      <div className="grid gap-6 sm:grid-cols-2">
        {[a, b].map((w) => (
          <button
            key={w.id}
            type="button"
            onClick={() => void vote(w, w.id === a.id ? b : a)}
            className="group flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 text-left transition hover:border-yellow-500/60 hover:shadow-lg hover:shadow-yellow-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-500"
            aria-label={`Pick ${w.name} as winner`}
          >
            <div className="relative aspect-square w-full bg-zinc-950">
              <Image
                src={w.image}
                alt={w.name}
                fill
                className="object-cover transition group-hover:opacity-95"
                sizes="(max-width: 640px) 100vw, 50vw"
                priority
              />
            </div>
            <span className="px-4 py-3 text-sm font-medium text-zinc-100">
              {w.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
