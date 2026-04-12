## Why

There is no lightweight way for visitors to rank a curated set of watches through quick pairwise choices while keeping hosting and data costs minimal. A FaceSmash-style flow on Vercel with Redis-backed Elo scores addresses that: fun UX, tiny operational footprint, and no account friction.

## What Changes

- New web app deployable on **Vercel** (e.g. Next.js) serving a **duel** UI (two watches, pick a winner) and a **global leaderboard**.
- **Random pairing** of two distinct watches from a **fixed catalog** (tens of items), defined in-repo or static config.
- **Elo** ratings stored in **Redis** keyed by watch id; **individual votes are not persisted** (only current ratings).
- **Anonymous** users; **abuse mitigation** via **rate limits** using **IP** and **opaque cookie** identifiers.
- Environment and deployment docs for Vercel + Redis (e.g. Upstash).

## Capabilities

### New Capabilities

- `watch-duels`: Random pair presentation, winner submission, Elo read/update in Redis, anonymous identity model, dual rate limits (IP + cookie), validation that winner/loser ids belong to the catalog.
- `watch-leaderboard`: Global ranking view derived from Redis Elo values for all catalog watches, consistent ordering and ties handling.

### Modified Capabilities

- _(none — greenfield repo)_

## Impact

- **New** application code (UI, API routes or Server Actions, Elo math, Redis client).
- **New** third-party/hosted dependency: Redis compatible with serverless (e.g. Upstash) and Vercel env vars.
- **Assets**: existing watch images / metadata wired into the catalog definition.
- **No** user accounts, **no** vote-history store, **no** personal data beyond ephemeral rate-limit keys and optional session cookie for limiting.
