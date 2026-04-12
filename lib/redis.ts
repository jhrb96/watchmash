import { Redis } from "@upstash/redis";

/**
 * Upstash REST credentials use UPSTASH_REDIS_REST_*.
 * Vercel KV / env pull often exposes the same REST API as KV_REST_API_*.
 */
function resolveRestCredentials(): { url: string; token: string } | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL?.trim() ||
    process.env.KV_REST_API_URL?.trim() ||
    "";
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ||
    process.env.KV_REST_API_TOKEN?.trim() ||
    "";
  if (!url || !token) return null;
  return { url, token };
}

export function getRedis(): Redis | null {
  const creds = resolveRestCredentials();
  if (!creds) return null;
  return new Redis({ url: creds.url, token: creds.token });
}

export function eloKey(watchId: string): string {
  return `elo:${watchId}`;
}
