import { NextRequest, NextResponse } from "next/server";
import { isValidWatchId } from "@/lib/catalog";
import { TOURNAMENT_SESSION_TTL_SECONDS } from "@/lib/config";
import { getRedis, tournamentSessionKey, winsKey } from "@/lib/redis";
import { buildPickResponseBody, toWatchCard } from "@/lib/tournamentApi";
import { processPick, type TournamentSession } from "@/lib/tournament";
import { casSetSessionAndOptionalWinIncr } from "@/lib/tournamentRedis";

export const dynamic = "force-dynamic";

type PickBody = {
  sessionId?: unknown;
  pickIndex?: unknown;
  winnerId?: unknown;
  loserId?: unknown;
};

function parsePickIndex(v: unknown): number | null {
  if (typeof v === "number" && Number.isInteger(v) && v >= 0) return v;
  if (typeof v === "string" && /^\d+$/.test(v)) return parseInt(v, 10);
  return null;
}

export async function POST(req: NextRequest) {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json(
      { error: "redis_unconfigured", message: "Redis is not configured" },
      { status: 503 },
    );
  }

  let body: PickBody;
  try {
    body = (await req.json()) as PickBody;
  } catch {
    return NextResponse.json(
      { error: "validation", message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const sessionId =
    typeof body.sessionId === "string" && /^[a-f0-9]{20,64}$/i.test(body.sessionId)
      ? body.sessionId
      : null;
  const pickIndex = parsePickIndex(body.pickIndex);
  const winnerId = typeof body.winnerId === "string" ? body.winnerId : null;
  const loserId = typeof body.loserId === "string" ? body.loserId : null;

  if (!sessionId || pickIndex === null || !winnerId || !loserId) {
    return NextResponse.json(
      {
        error: "validation",
        message:
          "sessionId (hex string), pickIndex (non-negative int), winnerId, and loserId are required",
      },
      { status: 400 },
    );
  }

  if (!isValidWatchId(winnerId) || !isValidWatchId(loserId)) {
    return NextResponse.json(
      { error: "validation", message: "winnerId and loserId must be catalog ids" },
      { status: 400 },
    );
  }

  const key = tournamentSessionKey(sessionId);

  for (let attempt = 0; attempt < 16; attempt++) {
    const curRaw = await redis.get<string>(key);
    if (curRaw === null) {
      return NextResponse.json(
        { error: "gone", message: "Tournament session expired or unknown" },
        { status: 410 },
      );
    }

    let session: TournamentSession;
    try {
      session = JSON.parse(curRaw) as TournamentSession;
    } catch {
      return NextResponse.json(
        { error: "server", message: "Corrupt session data" },
        { status: 500 },
      );
    }

    const buildJson = (s: TournamentSession) =>
      JSON.stringify(buildPickResponseBody(sessionId, s));

    const out = processPick(
      session,
      { pickIndex, winnerId, loserId },
      buildJson,
    );

    if (out.kind === "complete_replay" || out.kind === "idempotent_replay") {
      return NextResponse.json(JSON.parse(out.bodyJson));
    }

    if (out.kind === "conflict") {
      let currentMatch: { left: ReturnType<typeof toWatchCard>; right: ReturnType<typeof toWatchCard> } | undefined;
      try {
        if (out.leftId && out.rightId) {
          currentMatch = {
            left: toWatchCard(out.leftId),
            right: toWatchCard(out.rightId),
          };
        }
      } catch {
        currentMatch = undefined;
      }
      return NextResponse.json(
        {
          error: "conflict",
          message: "Pick index out of sync",
          sessionId,
          expectedPickIndex: out.expectedPickIndex,
          currentMatch,
        },
        { status: 409 },
      );
    }

    if (out.kind === "bad_request") {
      return NextResponse.json(
        { error: "validation", message: out.message },
        { status: 400 },
      );
    }

    const newRaw = JSON.stringify(out.newSession);
    const winsRedisKey = out.winsIncrKey ? winsKey(out.winsIncrKey) : "";

    const cas = await casSetSessionAndOptionalWinIncr(
      redis,
      key,
      curRaw,
      newRaw,
      TOURNAMENT_SESSION_TTL_SECONDS,
      winsRedisKey,
    );

    if (cas === "OK") {
      return NextResponse.json(JSON.parse(out.responseJson));
    }

    if (cas === "NOT_FOUND") {
      return NextResponse.json(
        { error: "gone", message: "Tournament session expired or unknown" },
        { status: 410 },
      );
    }
    // RETRY — concurrent writer; loop with fresh GET
  }

  return NextResponse.json(
    { error: "busy", message: "Could not apply pick after retries" },
    { status: 503 },
  );
}
