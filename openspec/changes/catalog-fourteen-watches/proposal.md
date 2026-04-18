## Why

The curated set is now **14 watches**, but the codebase and docs still assume a **33-watch** catalog (`COUNT = 33`, `w-01`…`w-33`). That mismatch confuses operators, bloats the leaderboard with unused ids, and misaligns assets and copy with the real product scope.

## What Changes

- Set the in-repo catalog to **exactly 14** entries: stable ids **`w-01` … `w-14`**, names and image paths consistent with existing conventions.
- Align **`public/watches/`** (or documented source → `public` flow) so each catalog row has a matching image file where the app expects it.
- Update **README** and any on-page or OpenSpec references that still say **33** watches.
- **Optional / follow-up (non-blocking):** Redis may still hold **`wins:w-15`** … keys from older deploys; document cleanup in README — not required for app correctness because the leaderboard only reads keys for catalog ids.

## Capabilities

### New Capabilities

- `watch-catalog`: Fixed size and membership of the watch list (`WATCHES`), id scheme, and image path rules for the current **14-item** catalog.

### Modified Capabilities

- _(none — no `openspec/specs/` baseline; tournament behavior already uses “largest power of two ≤ catalog size,” which becomes **8** for 14 watches.)_

## Impact

- **`lib/catalog.ts`**: `COUNT` / array length → **14**.
- **`public/watches/`** (and optionally **`watch images/`**): trim or ignore extras so deployed paths match `w-01`…`w-14`.
- **`README.md`**: catalog size bullet.
- **Leaderboard / tournament**: no API shape changes; tournament **participant count** becomes **8** per run (largest power of two ≤ 14).
