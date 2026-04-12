## Context

Watchmash today uses **`/`** as a short marketing-style landing with links to **`/duel`** (client duel UI via `DuelClient`) and **`/leaderboard`**. The duel flow already calls **`GET /api/duel`** and **`POST /api/vote`**; no change to Redis or Elo logic is required for moving the UI surface.

## Goals / Non-Goals

**Goals:**

- Render the **same duel experience** (random pair, pick winner, advance) as the **primary content** of **`/`**.
- Update **header navigation** and **in-page links** so **`/`** is the default place to vote; **`/duel`** does not remain the only entry.
- Prefer **`permanent redirect (308)`** from **`/duel` → `/`** to preserve bookmarks and external links.

**Non-Goals:**

- Changing pairing logic, catalog, leaderboard behavior, or API request/response contracts.
- New auth, analytics, or A/B tests.
- Redesigning card layout beyond what’s needed to fit the home page (optional minor spacing/typography only).

## Decisions

| Decision | Choice | Rationale | Alternatives |
|----------|--------|-----------|--------------|
| Home composition | **`app/page.tsx`** renders intro copy + **`<DuelClient />`** (or equivalent) | Single entry, minimal file churn; reuses tested client | Move duel into layout (rejected: couples all pages) |
| Old `/duel` route | **`next.config.ts` `redirects`** `permanent: true` from `/duel` to `/` | One-line config, SEO/bookmark friendly | Delete `app/duel/` only (breaks bookmarks); keep duplicate page (rejected: drift) |
| Nav | **“Home”** → `/` (duel lives there); remove redundant **“Duel”** link **or** point “Duel” to `/` with label tweak | Avoid two nav items to same UX | Keep “Duel” linking `/` (acceptable duplicate) |
| `dynamic` | Keep **`export const dynamic = 'force-dynamic'`** on home if needed for future server data; duel client is client-side fetch anyway | Matches current duel page pattern | Omit if home stays fully static (optional) |

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Home feels crowded (hero + duel) | Short hero; duel below the fold is OK; trim duplicate CTAs |
| Users expect `/` to be “marketing only” | Copy clarifies “pick below”; redirect educates old `/duel` users |
| SEO duplicate content `/` vs old `/duel` | 308 to `/` removes duplicate |

## Migration Plan

1. Implement home page + redirect; deploy to Preview.
2. Smoke-test: open `/`, vote, leaderboard; open `/duel`, confirm lands on `/`.
3. Rollback: revert redirect and restore previous `page.tsx` if needed.

## Open Questions

- Exact **nav labels** (“Home” vs “Vote” vs “Mash”) — product polish, not blocking.
- Whether to **remove** `app/duel/page.tsx` entirely after redirect (recommended: delete page file, keep redirect in config).
