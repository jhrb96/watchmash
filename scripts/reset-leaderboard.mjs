/**
 * Deletes tournament win counters in Redis for every watch in the generated catalog
 * (keys wins:w-01 … wins:w-NN). Run: npm run reset:leaderboard
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Redis } from "@upstash/redis";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnvLocal() {
  const p = path.join(root, ".env.local");
  if (!fs.existsSync(p)) return;
  const text = fs.readFileSync(p, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

function restCreds() {
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

function catalogWatchIds() {
  const catalogPath = path.join(root, "lib", "generated", "watchCatalog.ts");
  if (!fs.existsSync(catalogPath)) {
    console.error(`Missing ${catalogPath}; run npm run sync:watches first.`);
    process.exit(1);
  }
  const src = fs.readFileSync(catalogPath, "utf8");
  const ids = [...src.matchAll(/"id":\s*"(w-\d+)"/g)].map((m) => m[1]);
  if (ids.length < 2) {
    console.error("Could not parse watch ids from watchCatalog.ts.");
    process.exit(1);
  }
  return ids;
}

loadEnvLocal();
const creds = restCreds();
if (!creds) {
  console.error(
    "No Redis REST URL/token. Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN " +
      "(or KV_REST_API_URL + KV_REST_API_TOKEN) in .env.local.",
  );
  process.exit(1);
}

const ids = catalogWatchIds();
const keys = ids.map((id) => `wins:${id}`);
const redis = new Redis({ url: creds.url, token: creds.token });
const deleted = await redis.del(...keys);

console.log(
  `Reset leaderboard: DEL ${keys.length} key(s) (${keys.join(", ")}); removed count: ${deleted}.`,
);
