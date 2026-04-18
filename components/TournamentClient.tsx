"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type WatchCard = { id: string; name: string; image: string };

type MatchPayload = { left: WatchCard; right: WatchCard };

export function TournamentClient() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pickIndex, setPickIndex] = useState(0);
  const [participantCount, setParticipantCount] = useState<number | null>(null);
  const [match, setMatch] = useState<MatchPayload | null>(null);
  const [champion, setChampion] = useState<WatchCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pickError, setPickError] = useState<string | null>(null);

  const startTournament = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPickError(null);
    setChampion(null);
    setSessionId(null);
    setMatch(null);
    try {
      const res = await fetch("/api/tournament/start", {
        method: "POST",
        cache: "no-store",
      });
      const data = (await res.json()) as {
        sessionId?: string;
        pickIndex?: number;
        participantCount?: number;
        match?: MatchPayload;
        message?: string;
      };
      if (!res.ok || !data.sessionId || !data.match) {
        setError(data.message ?? "Could not start tournament");
        return;
      }
      setSessionId(data.sessionId);
      setPickIndex(typeof data.pickIndex === "number" ? data.pickIndex : 0);
      setParticipantCount(
        typeof data.participantCount === "number" ? data.participantCount : null,
      );
      setMatch(data.match);
    } catch {
      setError("Network error starting tournament");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void startTournament();
  }, [startTournament]);

  async function submitPick(winner: WatchCard, loser: WatchCard) {
    if (!sessionId) return;
    setPickError(null);
    try {
      const res = await fetch("/api/tournament/pick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          pickIndex,
          winnerId: winner.id,
          loserId: loser.id,
        }),
      });
      const data = (await res.json()) as {
        complete?: boolean;
        champion?: WatchCard;
        match?: MatchPayload;
        pickIndex?: number;
        expectedPickIndex?: number;
        currentMatch?: MatchPayload;
        message?: string;
      };

      if (res.status === 409) {
        if (typeof data.expectedPickIndex === "number") {
          setPickIndex(data.expectedPickIndex);
        }
        if (data.currentMatch?.left && data.currentMatch?.right) {
          setMatch(data.currentMatch);
        }
        setPickError(data.message ?? "Out of sync — try your pick again.");
        return;
      }

      if (!res.ok) {
        setPickError(data.message ?? "Pick failed");
        return;
      }

      if (data.complete && data.champion) {
        setChampion(data.champion);
        setMatch(null);
        if (typeof data.pickIndex === "number") setPickIndex(data.pickIndex);
        return;
      }

      if (data.match?.left && data.match?.right) {
        setMatch(data.match);
        if (typeof data.pickIndex === "number") setPickIndex(data.pickIndex);
      }
    } catch {
      setPickError("Network error submitting pick");
    }
  }

  if (loading && !match && !champion) {
    return (
      <p className="text-zinc-500" role="status">
        Starting tournament…
      </p>
    );
  }

  if (error || (!match && !champion)) {
    return (
      <div className="space-y-4">
        <p className="text-red-400">{error ?? "Tournament unavailable"}</p>
        <button
          type="button"
          onClick={() => void startTournament()}
          className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-200 hover:border-zinc-400"
        >
          Retry
        </button>
      </div>
    );
  }

  if (champion) {
    return (
      <div className="space-y-6">
        <p className="text-lg font-medium text-zinc-100">
          Champion:{" "}
          <span className="text-yellow-400">{champion.name}</span>
        </p>
        <div className="relative mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
          <Image
            src={champion.image}
            alt={champion.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 384px"
          />
        </div>
        <button
          type="button"
          onClick={() => void startTournament()}
          className="rounded-lg border border-yellow-600/60 bg-yellow-500/10 px-4 py-2 text-sm font-medium text-yellow-200 transition hover:border-yellow-500"
        >
          New tournament
        </button>
      </div>
    );
  }

  const { left: a, right: b } = match!;

  return (
    <div className="space-y-8">
      {participantCount !== null ? (
        <p className="text-sm text-zinc-500">
          {participantCount} watches this run — single elimination until one
          winner.
        </p>
      ) : null}
      <p className="text-zinc-400">Tap the watch you like better.</p>
      {pickError ? (
        <p className="text-amber-400" role="alert">
          {pickError}
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-3 sm:gap-6">
        {[a, b].map((w) => (
          <button
            key={w.id}
            type="button"
            onClick={() => void submitPick(w, w.id === a.id ? b : a)}
            className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 text-left transition hover:border-yellow-500/60 hover:shadow-lg hover:shadow-yellow-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-500"
            aria-label={`Pick ${w.name} as winner`}
          >
            <div className="relative aspect-square w-full min-w-0 bg-zinc-950">
              <Image
                src={w.image}
                alt={w.name}
                fill
                className="object-cover transition group-hover:opacity-95"
                sizes="50vw"
                priority
              />
            </div>
            <span className="line-clamp-2 px-3 py-2 text-xs font-medium text-zinc-100 sm:px-4 sm:py-3 sm:text-sm">
              {w.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
