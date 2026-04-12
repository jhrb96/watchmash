import type { Redis } from "@upstash/redis";
import { getRateLimitConfig } from "@/lib/config";

export function cookieRateKey(uid: string): string {
  return `rl:ck:${uid}`;
}

export type RateLimitReason = "ip" | "cookie";

export async function getVoteCounts(
  redis: Redis,
  ipKey: string,
  cookieKey: string,
): Promise<{ ip: number; cookie: number }> {
  const [ipRaw, ckRaw] = await redis.mget<[string | null, string | null]>(
    ipKey,
    cookieKey,
  );
  return {
    ip: ipRaw ? parseInt(ipRaw, 10) || 0 : 0,
    cookie: ckRaw ? parseInt(ckRaw, 10) || 0 : 0,
  };
}

export async function assertUnderRateLimits(
  redis: Redis,
  ipKey: string,
  cookieKey: string,
): Promise<RateLimitReason | null> {
  const { ipMax, cookieMax } = getRateLimitConfig();
  const { ip, cookie } = await getVoteCounts(redis, ipKey, cookieKey);
  if (ip >= ipMax) return "ip";
  if (cookie >= cookieMax) return "cookie";
  return null;
}

export async function recordSuccessfulVotes(
  redis: Redis,
  ipKey: string,
  cookieKey: string,
): Promise<void> {
  const { windowSec } = getRateLimitConfig();
  const ipNew = await redis.incr(ipKey);
  if (ipNew === 1) await redis.expire(ipKey, windowSec);
  const ckNew = await redis.incr(cookieKey);
  if (ckNew === 1) await redis.expire(cookieKey, windowSec);
}
