# Watchmash

FaceSmash-style pairwise picks for a fixed catalog of watches. Ratings use **Elo** stored in **Redis** (Upstash REST). **Votes are not logged** — only current scores per watch id.

## Stack

- Next.js 15 (App Router) on Vercel
- `@upstash/redis` for Elo keys `elo:<watchId>`
- Anonymous users (no accounts); **no** server-side vote rate limits

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

### Vercel `404: NOT_FOUND` (plain JSON, id like `lhr1::…`)

[Vercel’s `NOT_FOUND`](https://vercel.com/docs/errors/NOT_FOUND) means the **edge could not map your URL to a live deployment resource**. It is **not** the same as Next.js’s in-app “Page not found” page.

**Runtime check (local build):** `npm run build` produces routes for `/`, `/duel`, `/leaderboard`, `/api/duel`, `/api/vote`, `/api/health`, etc. So a JSON `NOT_FOUND` on Vercel almost always points at **URL or project settings**, not missing pages in the repo.

1. Open **`https://<your-host>/api/health`**.  
   - **200** + `{"ok":true,...}` → deployment works; the path you tried earlier was wrong or a stale deployment URL. Use **Visit** on the latest **Ready** deployment in the **Deployments** tab, or your production domain (e.g. `watchmash.vercel.app`).  
   - **Same JSON 404** → fix dashboard settings below (or the hostname is not tied to this project).

2. **Settings → Build & Deployment**  
   - **Output Directory** must be **empty** for Next.js (default). If it is set to `out`, `dist`, `.next`, or anything else, Vercel will not serve the app correctly and you can see platform `NOT_FOUND`. Clear it and redeploy.  
   - **Root Directory** must be the folder that contains this `package.json` (usually **empty** = repo root).

3. **Settings → General** — Framework Preset **Next.js** (this repo includes **`vercel.json`** pinning `framework` + `npm run build` to reduce mis-detection).

4. Valid paths include `/`, `/duel`, `/leaderboard`, `GET /api/duel`, `POST /api/vote`, **`GET /api/health`**.

## Catalog and images

- Catalog: `lib/catalog.ts` — 33 watches `w-01` … `w-33` with images under `public/watches/`.
- Source assets live in `watch images/`; copies used at runtime are in `public/watches/` (stable filenames).

## Deploy on Vercel

1. Push this repo to GitHub (or your Git provider).
2. In [Vercel](https://vercel.com), **Add New Project** → import the repository.
3. Framework Preset: **Next.js**. Root directory: repo root.
4. **Environment Variables**: add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (or `KV_REST_*`) for Production (and Preview if desired).
5. Deploy. Smoke-test: open `/duel`, vote a few times, confirm `/leaderboard` order changes.

## Reset ratings in Redis

Upstash console → your database → run Redis commands, or use `redis-cli` against your endpoint:

- Delete all Elo keys: use **Data Browser** to remove keys matching `elo:*`, or run `SCAN` + `DEL` in the CLI.

There is no vote history to delete. Legacy `rl:ip:*` / `rl:ck:*` keys from older deploys can be deleted in the data browser but are unused now.

## OpenSpec

This app was specified under `openspec/changes/watch-mash-mvp/`.
