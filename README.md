# Watchmash

FaceSmash-style pairwise picks for a fixed catalog of watches. Ratings use **Elo** stored in **Redis** (Upstash REST). **Votes are not logged** — only current scores per watch id.

## Stack

- Next.js 15 (App Router) on Vercel
- `@upstash/redis` for Elo keys `elo:<watchId>` and rate-limit counters
- Anonymous users; limits by **IP** and **httpOnly cookie** (`watchmash_rl_uid`)

## Local development

```bash
npm install
cp .env.example .env.local
# Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from Upstash
# Or pull from Vercel (CLI linked to the project). Note: `vercel env pull`
# uses the **Development** environment by default. If your Upstash vars are
# only on Production, either add them for Development in the Vercel UI or run:
#   vercel env pull .env.local --environment=production
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without Redis, `/leaderboard` shows default ratings (1500); `/api/vote` returns `503` until env vars are set.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `UPSTASH_REDIS_REST_URL` | Yes* | Upstash REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Yes* | Upstash REST token |
| `KV_REST_API_URL` | Yes* | Vercel KV REST URL (alternative naming from `vercel env pull`) |
| `KV_REST_API_TOKEN` | Yes* | Vercel KV REST token (use with `KV_REST_API_URL`) |

\*Provide either the `UPSTASH_REDIS_REST_*` pair **or** the `KV_REST_API_*` pair.
| `RATE_LIMIT_IP_MAX` | No | Max successful votes per IP per window (default `30`) |
| `RATE_LIMIT_COOKIE_MAX` | No | Max successful votes per cookie per window (default `30`) |
| `RATE_LIMIT_WINDOW_SECONDS` | No | Window length in seconds (default `3600`) |

## Catalog and images

- Catalog: `lib/catalog.ts` — 33 watches `w-01` … `w-33` with images under `public/watches/`.
- Source assets live in `watch images/`; copies used at runtime are in `public/watches/` (stable filenames).

## Deploy on Vercel

1. Push this repo to GitHub (or your Git provider).
2. In [Vercel](https://vercel.com), **Add New Project** → import the repository.
3. Framework Preset: **Next.js**. Root directory: repo root.
4. **Environment Variables**: add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (and optional rate-limit vars) for Production (and Preview if desired).
5. Deploy. Smoke-test: open `/duel`, vote a few times, confirm `/leaderboard` order changes.

## Reset ratings in Redis

Upstash console → your database → run Redis commands, or use `redis-cli` against your endpoint:

- Delete all Elo keys: use **Data Browser** to remove keys matching `elo:*`, or run `SCAN` + `DEL` in the CLI.
- Rate-limit keys use prefixes `rl:ip:` and `rl:ck:`; delete if you need to clear limits during testing.

There is no vote history to delete.

## OpenSpec

This app was specified under `openspec/changes/watch-mash-mvp/`.
