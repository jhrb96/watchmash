## 1. Catalog and keys

- [x] 1.1 Add **`pickTournamentParticipants()`** (or equivalent): compute **M = largest power of two ≤ `WATCHES.length`**, uniformly sample **M** distinct watches from the catalog, return array for shuffling
- [x] 1.2 Add **`winsKey(watchId)`** in `lib/redis.ts` (or adjacent module); document TTL namespace for **`tournament:session:*`** alongside existing helpers

## 2. Bracket engine and Redis session

- [x] 2.1 Implement in-server bracket state machine: **`roundQueue`**, **`nextRound`**, shuffle **`order[]`**, **`pickIndex`**, **`status`**, **`lastResponse`** / **`completedPicks`** (or equivalent) per **design.md**
- [x] 2.2 Serialize session to Redis JSON (or hash) with **TTL**; refresh TTL on successful pick
- [x] 2.3 Implement **atomic pick** (Lua script or **`WATCH`/`MULTI`/`EXEC`**) including **`INCR wins:<champion>`** only on terminal transition; implement **Option A** idempotent replay for stale **`pickIndex`** matching a completed pick

## 3. HTTP API

- [x] 3.1 Implement **`POST /api/tournament/start`**: create **`sessionId`**, persist session, return **`{ sessionId, pickIndex, match: { left, right } }`** with watch payloads
- [x] 3.2 Implement **`POST /api/tournament/pick`**: validate body, return next match or champion + **`pickIndex`** update; map errors to **400** / **404** / **409** / **410** per spec
- [x] 3.3 Remove **`app/api/duel/route.ts`** and **`app/api/vote/route.ts`**; remove **`lib/elo.ts`** and any unused Elo imports

## 4. Leaderboard

- [x] 4.1 Replace **`lib/leaderboard.ts`** to read **`wins:*`** via **`mget`**, sort by wins desc, tie-break by **`watchId`** ascending; type **`LeaderboardRow`** with **`wins`** not **`elo`**
- [x] 4.2 Update **`app/leaderboard/page.tsx`** (and any API route if leaderboard is fetched server-side) to display **wins** only

## 5. Client UI

- [x] 5.1 Replace **`DuelClient`** usage with a **tournament** client: call **start** on mount or explicit “New tournament”, track **`sessionId`** and **`pickIndex`**, render two-column pick UI for current pair, handle terminal champion (copy + optional “Play again” → **start**)
- [x] 5.2 Update **`app/page.tsx`** copy to describe tournaments, not endless Elo duels; handle **409** resync by adopting **`expectedPickIndex`** from response

## 6. Verification

- [x] 6.1 Run **`npm run build`**; manually run one full tournament in dev (Redis on), confirm **`wins:<id>`** increments once and leaderboard updates
- [x] 6.2 Manually double-submit or replay same pick (devtools) and confirm **no double advance** and **no double `INCR`**
