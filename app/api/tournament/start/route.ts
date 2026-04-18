import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { pickTournamentParticipants } from "@/lib/catalog";
import { TOURNAMENT_SESSION_TTL_SECONDS } from "@/lib/config";
import { getRedis, tournamentSessionKey } from "@/lib/redis";
import { toWatchCard } from "@/lib/tournamentApi";
import { createTournamentSessionFromOrder } from "@/lib/tournament";

export const dynamic = "force-dynamic";

export async function POST() {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json(
      { error: "redis_unconfigured", message: "Redis is not configured" },
      { status: 503 },
    );
  }

  let participants;
  try {
    participants = pickTournamentParticipants();
  } catch (e) {
    const message = e instanceof Error ? e.message : "Catalog error";
    return NextResponse.json({ error: "catalog", message }, { status: 400 });
  }

  const order = participants.map((w) => w.id);
  const session = createTournamentSessionFromOrder(order);
  const sessionId = randomBytes(18).toString("hex");
  const key = tournamentSessionKey(sessionId);
  const raw = JSON.stringify(session);

  await redis.set(key, raw, { ex: TOURNAMENT_SESSION_TTL_SECONDS });

  const pair = session.roundQueue;
  const left = toWatchCard(pair[0]!);
  const right = toWatchCard(pair[1]!);

  return NextResponse.json({
    sessionId,
    pickIndex: 0,
    participantCount: order.length,
    match: { left, right },
  });
}
