## 1. Project bootstrap

- [x] 1.1 Initialize Next.js App Router project with TypeScript in the repo root (or agreed subpath) and verify `pnpm`/`npm` dev server runs
- [x] 1.2 Add `@upstash/redis` (or chosen Redis client), configure env vars `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for local `.env.local` and Vercel
- [x] 1.3 Add `.env.example` documenting required variables (no secrets committed)

## 2. Catalog and assets

- [x] 2.1 Define fixed catalog module: stable string id, display name, image path/URL per watch (cover all items in `watch images/` or agreed subset)
- [x] 2.2 Place or reference images under `public/` (or external URLs) so the duel UI can render both watches

## 3. Elo and Redis persistence

- [x] 3.1 Implement pure Elo helper: expected score, updated ratings for winner/loser given K and initial default (e.g. 1500 / 32)
- [x] 3.2 Implement Redis read for a watch Elo with default when key missing; key naming per design (e.g. `elo:<id>`)
- [x] 3.3 Implement atomic or pipelined write of both updated Elos after a valid vote (no vote log keys)

## 4. Rate limiting

- [x] 4.1 Resolve client IP from request (Vercel / `x-forwarded-for` strategy as in design) for rate-limit identity
- [x] 4.2 Issue httpOnly opaque cookie when absent; use its value as cookie-bucket identity
- [x] 4.3 Implement Redis counters with TTL for IP and cookie buckets; configurable max votes per window; reject when either bucket exceeds limit
- [x] 4.4 Apply rate checks only on successful vote path before mutating Elo

## 5. Server API: duel and vote

- [x] 5.1 Expose server action or route handler that returns a random unordered pair of distinct catalog ids (and display payload for UI)
- [x] 5.2 Expose server action or route handler that accepts winnerId + loserId, validates against catalog, runs rate limits, updates Elo, returns success/error
- [x] 5.3 Return appropriate HTTP/status and JSON for validation errors vs rate-limit errors

## 6. Leaderboard

- [x] 6.1 Implement data fetch that loads Elo for all catalog ids (parallel `mget` or pipeline), defaulting missing to initial rating
- [x] 6.2 Sort descending by Elo with deterministic tie-break (e.g. ascending id); expose to leaderboard page as Server Component data or API

## 7. UI

- [x] 7.1 Build duel page: show two watches (image + label), buttons to pick winner; on success load next random pair
- [x] 7.2 Build global leaderboard page: table or list with rank, label, image, Elo
- [x] 7.3 Add minimal navigation between duel and leaderboard; basic responsive layout and accessible button labels

## 8. Deploy and verification

- [ ] 8.1 Connect GitHub repo to Vercel, set production env vars for Upstash
- [ ] 8.2 Deploy and smoke-test: duel flow, rate limit behavior (spot-check), leaderboard ordering, new watch default Elo
- [x] 8.3 Document in README: local dev, env vars, how to reset ratings (optional Redis key pattern flush)
