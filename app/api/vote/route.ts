import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { isValidWatchId } from "@/lib/catalog";
import { COOKIE_RATE_UID } from "@/lib/config";
import { updateEloPair, parseElo } from "@/lib/elo";
import { ipRateKey, getClientIp } from "@/lib/ip";
import {
  assertUnderRateLimits,
  cookieRateKey,
  recordSuccessfulVotes,
} from "@/lib/rate-limit";
import { eloKey, getRedis } from "@/lib/redis";

export const dynamic = "force-dynamic";

type VoteBody = {
  winnerId?: string;
  loserId?: string;
};

export async function POST(req: NextRequest) {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json(
      { error: "redis_unconfigured", message: "Redis is not configured" },
      { status: 503 },
    );
  }

  let body: VoteBody;
  try {
    body = (await req.json()) as VoteBody;
  } catch {
    return NextResponse.json(
      { error: "validation", message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const winnerId = body.winnerId;
  const loserId = body.loserId;

  if (
    typeof winnerId !== "string" ||
    typeof loserId !== "string" ||
    winnerId === loserId ||
    !isValidWatchId(winnerId) ||
    !isValidWatchId(loserId)
  ) {
    return NextResponse.json(
      {
        error: "validation",
        message: "winnerId and loserId must be distinct catalog ids",
      },
      { status: 400 },
    );
  }

  const ip = getClientIp(req.headers);
  const ipKey = ipRateKey(ip);

  let uid = req.cookies.get(COOKIE_RATE_UID)?.value?.trim();
  let issuedCookie = false;
  if (!uid) {
    uid = randomUUID();
    issuedCookie = true;
  }

  const ckKey = cookieRateKey(uid);

  const blocked = await assertUnderRateLimits(redis, ipKey, ckKey);
  if (blocked) {
    return NextResponse.json(
      { error: "rate_limit", reason: blocked },
      { status: 429 },
    );
  }

  const wKey = eloKey(winnerId);
  const lKey = eloKey(loserId);
  const [wRaw, lRaw] = await redis.mget<[string | null, string | null]>(
    wKey,
    lKey,
  );
  const wElo = parseElo(wRaw);
  const lElo = parseElo(lRaw);
  const { winner: newWinner, loser: newLoser } = updateEloPair(wElo, lElo);

  const pipe = redis.pipeline();
  pipe.set(wKey, newWinner);
  pipe.set(lKey, newLoser);
  await pipe.exec();

  await recordSuccessfulVotes(redis, ipKey, ckKey);

  const res = NextResponse.json({ ok: true });
  if (issuedCookie) {
    res.cookies.set(COOKIE_RATE_UID, uid, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return res;
}
