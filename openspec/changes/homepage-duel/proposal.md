## Why

Requiring a separate `/duel` page adds an extra step before visitors can vote. Showing random watch pairings on the **home page** (`/`) puts the core interaction front and center and matches a typical “landing = action” pattern for a lightweight mashup app.

## What Changes

- The **random pairwise duel** (two watches, pick a winner, load next pair) becomes the **primary content** of **`/`** (home).
- **Global navigation** and any CTAs that pointed users to “Start dueling” on `/duel` are updated so **`/`** is the main entry for voting.
- **`/duel`** either **redirects permanently to `/`** or is removed in favor of `/` only (**BREAKING** for bookmarks to `/duel` if removed without redirect; redirect preserves compatibility).
- **`/leaderboard`** and existing **API routes** (`/api/duel`, `/api/vote`) stay behavior-compatible unless design chooses to consolidate (no requirement to change API shapes).

## Capabilities

### New Capabilities

- `homepage-duel`: Defines that the home route (`/`) SHALL surface the same duel experience as today’s dedicated duel page (random pair, vote, next pair), and that site chrome (nav, links) SHALL reflect `/` as the duel entry point.

### Modified Capabilities

- _(none — no `openspec/specs/` baseline in repo; prior `watch-duels` spec lives under archived change `watch-mash-mvp` only.)_

## Impact

- **`app/page.tsx`**, **`app/duel/page.tsx`** (redirect or delete), **`components/DuelClient.tsx`** (possibly reused unchanged), **`app/layout.tsx`** (nav labels / hrefs).
- **README** or marketing copy if it says “open `/duel`” first.
- No Redis or Elo contract changes required for this UX move alone.
