/**
 * Regenerate the watch catalog + public copies from watch images/, then clear
 * tournament win counters in Redis for every catalog id (same keys as reset:leaderboard).
 *
 * Run: npm run rebuild:watch-state
 */
import { execSync } from "child_process";
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
    console.error(`Missing ${catalogPath} after sync.`);
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

execSync("node scripts/sync-watch-catalog.mjs", {
  cwd: root,
  stdio: "inherit",
});

const creds = restCreds();
if (!creds) {
  console.log(
    "rebuild-watch-state: catalog synced. Skipping Redis (no UPSTASH_REDIS_REST_* or KV_REST_* in env).",
  );
  process.exit(0);
}

const ids = catalogWatchIds();
const keys = ids.map((id) => `wins:${id}`);
const redis = new Redis({ url: creds.url, token: creds.token });
const deleted = await redis.del(...keys);

console.log(
  `rebuild-watch-state: Redis DEL ${keys.length} win key(s); removed count: ${deleted}.`,
);
