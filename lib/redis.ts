import { appendFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { Redis } from "@upstash/redis";

export function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  // #region agent log
  const agentPayload = {
    sessionId: "6331cf",
    location: "lib/redis.ts:getRedis",
    message: "Upstash env presence (no secrets)",
    data: {
      hypothesisId: "H1-H5",
      hasUrl: Boolean(url && url.trim()),
      hasToken: Boolean(token && token.trim()),
      urlLen: url?.length ?? 0,
      tokenLen: token?.length ?? 0,
      hasAltUrl: Boolean(process.env.UPSTASH_REDIS_URL),
      hasAltToken: Boolean(process.env.UPSTASH_REDIS_TOKEN),
      nodeEnv: process.env.NODE_ENV,
    },
    timestamp: Date.now(),
    runId: "pre-fix",
  };
  fetch("http://127.0.0.1:7606/ingest/e49cc500-10ed-4e17-9cc3-a0cf1b40cf2f", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "6331cf",
    },
    body: JSON.stringify(agentPayload),
  }).catch(() => {});
  try {
    const logPath = join(process.cwd(), ".cursor", "debug-6331cf.log");
    mkdirSync(dirname(logPath), { recursive: true });
    appendFileSync(logPath, `${JSON.stringify(agentPayload)}\n`);
  } catch {
    // ignore
  }
  // #endregion
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export function eloKey(watchId: string): string {
  return `elo:${watchId}`;
}
