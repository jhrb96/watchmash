## Context

Watchmash today uses **`GET /api/duel`** (random pair) and **`POST /api/vote`** (Elo in Redis under `elo:<id>`). The product shifts to **server-backed single elimination**: each visit/run is a new **shuffle**, picks advance authoritative state in Redis, and **only** a completed tournament increments **`wins:<id>`**. Leaderboard sorts by wins. **No rate limiting** on tournament endpoints. **Pick idempotency** uses **Option A**: monotonic **`pickIndex`** on the session and in the client request.

## Goals / Non-Goals

**Goals:**

- Redis session holds **full shuffled participant order** (and enough state to know the **current** head-to-head and to advance deterministically).
- **`POST /api/tournament/start`**: validates catalog, builds participant list (see **Even / bracket size** below), uniform shuffle, creates `sessionId`, sets TTL, returns first `{ left, right }` plus `pickIndex: 0`.
- **`POST /api/tournament/pick`**: body `{ sessionId, pickIndex, winnerId, loserId }`; **atomic** read-validate-advance-write; **`INCR wins:<championId>`** only when the bracket resolves to one winner.
- **Idempotency**: if `pickIndex` matches server’s expected index and the pair is valid, apply **one** advance; if the **same** request is replayed (duplicate network), return the **same** response payload as after that pick (store **`lastResponseJson`** per session after each successful advance, or equivalent recompute that is stable).
- If `pickIndex` is **stale** (already advanced), return **409** with `{ expectedPickIndex, currentMatch? }` so the client can resync.
- **Leaderboard** reads all catalog ids’ `wins:*` (default `0` if missing), sorts descending, stable tie-break (e.g. lexicographic by `watchId`).
- **Remove Elo**: delete `/api/vote`, `/api/duel`, remove Elo lib usage and leaderboard Elo column.

**Non-Goals:**

- Rate limits (IP/cookie) on start or pick.
- User accounts, auth, or per-user history.
- Persisting full bracket history beyond optional future work (counters only required for MVP).
- Client-side-only bracket truth (server is authoritative).

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Bracket size vs catalog | **Largest power of two ≤ catalog length**: randomly sample that many distinct watches for each tournament, then shuffle | Avoids mid-bracket byes when catalog is not \(2^k\) (e.g. 33 → 32). **BREAKING** vs “use all watches if even”: even length (e.g. 6) still breaks single-elim without byes in later rounds. |
| Session payload | **`order[]`**, **`pickIndex`**, **`roundQueue[]`**, **`nextRound[]`**, **`lastResponse`** (string), **`status`**: `active` \| `complete` | `order` preserves the opening shuffle for debugging/display; queue simulation matches “one match at a time” UX. |
| Match presentation | Current match is **`roundQueue[0]`** vs **`roundQueue[1]`** | After a pick, dequeue both, push winner onto **`nextRound`**. When **`roundQueue`** empty, roll **`nextRound`** into **`roundQueue`** for next round; when **`roundQueue.length === 1`** and no pending pair, that id is **champion**. |
| Session id | Cryptographic random (e.g. 16+ bytes hex), unguessable | Prevents session hijack guessing. |
| TTL | Configurable (e.g. **45–60 minutes**), refresh on each successful pick | Abandon without explicit delete. |
| Atomicity | **Redis Lua script** or **`MULTI`/`EXEC`** with **WATCH** on session key | Prevents double-advance under concurrent duplicate POSTs. |
| `pickIndex` semantics | Starts **0**; increments **once** per successful pick; client sends current expected value | Option A; stale index → 409. |
| Duplicate same pick | After successful advance at index *k*, persist response; if request repeats valid *(sessionId, pickIndex=k, same winner/loser)* before *k* incremented on server… actually after success `pickIndex` becomes *k+1*; duplicate with *k* sees mismatch—return **replay** of stored **`lastResponse`** when `body.pickIndex === session.pickIndex - 1` **and** same winner/loser as recorded for step *k-1* **OR** simpler: store **`lastApplied`**: `{ pickIndex, winnerId, loserId }`**; if incoming matches `lastApplied`, return **`lastResponse`** without mutating | Document the simpler rule: **if `(sessionId, pickIndex, winnerId, loserId)` equals last successful pick fingerprint, return cached `lastResponse`** |
| Wins key | `wins:<watchId>` string integer | Simple `INCR`. |
| Session key | `tournament:session:<sessionId>` | Namespace clarity. |

**Duplicate handling (final rule for implementers):**

1. Load session; if `status === complete`, return stored terminal payload (200).
2. If `pickIndex > session.pickIndex` → **409**.
3. If `pickIndex < session.pickIndex` **and** request matches **`completedPicks[pickIndex]`** (small array or last fingerprint) → return **cached response for that pickIndex** (200, idempotent replay).
4. If `pickIndex === session.pickIndex` and pair valid → advance atomically, bump `pickIndex`, append to `completedPicks` or set fingerprint, set `lastResponse`, return new state (200).

(Adjust storage shape in code as long as behavior matches spec.)

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| No rate limiting | Redis memory from many abandoned sessions → **TTL**; monitor key count in production. |
| Power-of-two subset surprises users | UI copy: “Each run includes **32** random watches” (or dynamic *M*) so sampling is transparent. |
| Lua/script portability | Upstash Redis supports Lua; verify in provider docs. |

## Migration Plan

1. Deploy tournament APIs + new UI behind feature flag **or** single cutover.
2. Stop writing Elo; optionally **DEL** `elo:*` in maintenance or leave orphaned.
3. Remove old routes and components after verification.

## Open Questions

- Whether to show the **opening shuffle** on screen (narrative) vs hidden.
- Exact **tie-break** for leaderboard (lexicographic id vs name).
