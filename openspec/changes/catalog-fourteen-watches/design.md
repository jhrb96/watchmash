## Context

`lib/catalog.ts` builds `WATCHES` from `COUNT = 33` with ids `w-01`…`w-33` and image paths `/watches/w-{nn}.png`. The product list is now **14 watches**; tournament and leaderboard logic already derive from `WATCHES.length` (e.g. largest power of two ≤ N), so shrinking the catalog is mostly **data + assets + docs**.

## Goals / Non-Goals

**Goals:**

- **`WATCHES.length === 14`** with ids **`w-01` … `w-14`** and human-readable names consistent with the existing pattern (`Watch {n}` unless product wants real names later).
- **Image paths** remain **`/watches/w-{nn}.png`** with two-digit zero padding.
- **Docs** (README, obvious comments) state **14** and no longer claim 33.

**Non-Goals:**

- Renaming ids to a non-sequential scheme (would touch Redis session history and wins keys — out of scope).
- Automatically deleting historical **`wins:w-15`**… keys in Redis (document only).
- Changing tournament math (still **M = 8** for N = 14).

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Id scheme | Keep **`w-01`…`w-14`** | Matches existing `isValidWatchId` / image naming; minimal churn. |
| Source of truth | Single **`COUNT = 14`** (or literal `14` in `Array.from`) in **`lib/catalog.ts`** | One place to update; leaderboard and tournament pick from `WATCHES`. |
| Assets | Ensure **`public/watches/w-01.png` … `w-14.png`** exist for deploy | Next/Image and static hosting need files; missing files break UI. |
| Orphan public assets | **Delete** `w-15.png`…`w-33.png` from `public/watches/` if present | Smaller deploy; avoids confusion. If repo has no files yet, skip. |
| `watch images/` folder | **Optional** sync note in README only | May be author’s source tree; not all environments have it. |

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Missing PNG for one of 14 | Run **`npm run build`** and a quick manual `/` load; fix filenames or catalog rows. |
| Stale Redis wins for removed ids | README: optional `DEL wins:w-15` … or ignore (leaderboard does not list them). |

## Migration Plan

1. Land catalog + asset + README updates in one PR.
2. Deploy; smoke-test home tournament and leaderboard.
3. Optionally clean Redis keys for ids no longer in catalog.

## Open Questions

- Whether **display names** should stay generic (`Watch 01`) or switch to real model names (product input).
