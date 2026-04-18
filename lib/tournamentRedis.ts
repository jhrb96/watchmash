import type { Redis } from "@upstash/redis";

/**
 * Compare-and-swap session JSON: SET only if current value equals expectedRaw;
 * optionally INCR wins key when tournament completes (ARGV[4] full Redis key).
 */
const CAS_SET_AND_OPTIONAL_INCR = `
local cur = redis.call('GET', KEYS[1])
if cur == false then
  return 'NOT_FOUND'
end
if cur ~= ARGV[1] then
  return 'RETRY'
end
redis.call('SET', KEYS[1], ARGV[2], 'EX', ARGV[3])
if ARGV[4] ~= nil and ARGV[4] ~= '' then
  redis.call('INCR', ARGV[4])
end
return 'OK'
`;

export type CasResult = "OK" | "RETRY" | "NOT_FOUND";

export async function casSetSessionAndOptionalWinIncr(
  redis: Redis,
  sessionKey: string,
  expectedRaw: string,
  newRaw: string,
  ttlSeconds: number,
  winsRedisKeyOrEmpty: string,
): Promise<CasResult> {
  const r = await redis.eval(CAS_SET_AND_OPTIONAL_INCR, [sessionKey], [
    expectedRaw,
    newRaw,
    String(ttlSeconds),
    winsRedisKeyOrEmpty,
  ]);
  const s = typeof r === "string" ? r : String(r);
  if (s === "OK" || s === "RETRY" || s === "NOT_FOUND") return s as CasResult;
  return "RETRY";
}
