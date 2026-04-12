## Context

Greenfield project **watchmash**: a FaceSmash-style site where anonymous visitors pick the better of two watches from a **fixed catalog** (order of tens). Ratings use **Elo** in **Redis**; **votes are not stored**. Hosting target is **Vercel**. Prior conversation locked: random pairing, global leaderboard only, rate limits by **IP** and **cookie**.

## Goals / Non-Goals

**Goals:**

- Ship a minimal Next.js (or equivalent) app on Vercel with duel UI, vote endpoint, and leaderboard page.
- Keep Redis usage small: one Elo value per catalog watch id (optional metadata in code only).
- Enforce configurable rate limits per IP and per cookie without requiring login.
- Use standard Elo update for 1v1 outcomes; document default rating and K.

**Non-Goals:**

- User accounts, OAuth, or saved profiles.
- Persisting pairwise vote history or analytics pipelines.
- TrueSkill or other multi-parameter models.
- Admin UI for catalog edits (catalog changes are deploy-time / code changes for MVP).
- Pairing strategies beyond uniform random among distinct catalog ids.

## Decisions

| Decision | Choice | Rationale | Alternatives considered |
|----------|--------|-----------|-------------------------|
| Framework | Next.js App Router on Vercel | First-class Vercel support, Server Actions or Route Handlers for Redis | Remix, static-only (rejected: need server for Redis writes) |
| Redis provider | Upstash Redis (REST or `@upstash/redis`) | Serverless-friendly, low idle cost, fits “cost-lightweight” | Vercel KV (also viable); self-hosted Redis (ops burden) |
| Key schema | `elo:<watchId>` → string/float score; rate keys `rl:ip:<hash>` / `rl:ck:<token>` with TTL | Simple reads/writes; clear separation | Single hash for all Elos (fewer keys but heavier contention on parallel updates) |
| Elo defaults | Initial rating **1500**, fixed **K** (e.g. 32) for MVP | Simple, no games-played field required | Variable K by count (rejected without storing games) |
| Random pairing | Server selects two distinct ids uniformly from catalog | Matches product spec; no Redis read for pairing | Elo-balanced pairing (explicitly out of scope) |
| Cookie for rate limit | Set **httpOnly** opaque session id on first visit if missing | Stable per-browser bucket without PII | fingerprint.js (heavier, privacy concerns) |
| IP for rate limit | Derived from `x-forwarded-for` (first hop) or platform-provided IP on Vercel | Standard serverless pattern; document trust boundary | Strict single header (document Vercel-specific behavior) |
| Concurrency | Read both Elos, compute new pair, **pipeline** or transaction two writes | Two watches updated per vote; acceptable race at low scale | Lua script in Redis for atomic read-modify-write (optional hardening later) |
| Catalog source | TypeScript module or JSON committed with repo, ids stable strings | Fixed set, no DB for catalog | Redis copy of catalog (rejected: duplication) |

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Race conditions on Elo updates under concurrent votes on same watch | Accept for MVP at small traffic; add Redis Lua or WATCH/MULTI if metrics show drift |
| Shared IP false positives (NAT) | Document as known limitation; tune limits |
| Cookie clearing bypasses cookie bucket | IP limit still applies; both layers are best-effort |
| No vote log → cannot replay if formula changes | Accepted non-goal; document reset procedure (flush Elo keys) |
| `x-forwarded-for` spoofing | Vercel sets headers; use platform-trusted IP where available |

## Migration Plan

- **Deploy**: Connect Vercel project, set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (or equivalent), deploy.
- **First run**: Missing `elo:*` keys resolve to initial rating on read or lazy SET on first duel involving that watch.
- **Rollback**: Revert deployment; Redis state remains (leaderboard persists across rollbacks unless keys cleared).

## Open Questions

- Exact **K** and initial rating constants (defaults above can be finalized in implementation).
- Whether leaderboard shows **only rank + name + image** or also numeric Elo (product polish).
- Image hosting: local `public/` vs external CDN for catalog URLs.
