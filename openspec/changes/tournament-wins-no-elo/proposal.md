## Why

The catalog is smaller and open-ended Elo duels no longer match the product goal. Visitors should play through a **randomized single-elimination tournament** until one champion, with **integrity** (server owns bracket state) and a **global win count** per watch. Elo and random pair duels are retired in favor of that episodic flow.

## What Changes

- Replace **random pair + Elo vote** with **tournament start → repeated head-to-head picks** until one winner; each run uses a **fresh uniform shuffle** of the catalog for seeding order.
- **Server session** in Redis: stores **full shuffled `order[]`**, bracket progression fields, and **`pickIndex`** for idempotency; short TTL for abandoned runs.
- **Pick API**: `POST` with `sessionId`, `pickIndex`, `winnerId`, `loserId`; server validates against the **current** match, advances **at most once** per index (atomic); duplicate same successful pick replays the **same** next state without double-advancing (**Option A**).
- On **tournament completion only**: `INCR wins:<watchId>` for the champion; no Elo writes.
- **Leaderboard** becomes **tournament wins only** (sorted by `wins:*`, tie-break rule in design/spec).
- **Remove Elo**: delete or stop using `elo:*` keys, Elo update logic, **`GET /api/duel`** and **`POST /api/vote`** (replaced by tournament routes).
- **No rate limiting** for tournament endpoints (explicit product choice).
- **Catalog constraint**: each run uses **M = largest power of two ≤ catalog size** watches, drawn uniformly at random from the catalog, then shuffled—so single elimination closes without byes (e.g. 33 → 32 per tournament).

## Capabilities

### New Capabilities

- `tournament-sessions`: Start tournament (shuffle, persist session + `pickIndex`), return first match; pick endpoint with validation, atomic advance, idempotent replay for duplicate `pickIndex`, TTL/abandon, even-\(N\) rule.
- `tournament-leaderboard`: Read `wins:<id>` for all catalog ids; display ranking by win count; no Elo column or merge.

### Modified Capabilities

- _(none — repo has no `openspec/specs/` baseline; prior MVP specs live under `openspec/changes/` only.)_

## Impact

- **`app/api/duel`**, **`app/api/vote`**: removed or replaced.
- **New** route handlers e.g. `POST /api/tournament/start`, `POST /api/tournament/pick` (exact paths in design).
- **`components/DuelClient.tsx`** (or successor): drive UI from session + current match + `pickIndex`, handle terminal champion response.
- **`app/leaderboard`**, leaderboard API: read wins, not Elo.
- **Redis**: new keys `tournament:session:<id>` (or equivalent), `wins:<watchId>`; remove Elo pipeline usage.
- **`lib/`**: Elo helpers removed or unused; catalog may need **even count** helper or exclusion rule.
- **Docs / env**: drop rate-limit copy where it described duel voting.
