## Context

`DuelClient` renders the pair in `grid gap-6 sm:grid-cols-2`, so **default is one column** until `min-width: 640px`. The product goal is **two columns from the smallest supported phone width** (about 320px) through all breakpoints unless a future breakpoint explicitly changes layout.

## Goals / Non-Goals

**Goals:**

- **Two columns** for the duel pair on **all** viewport widths used on phones in portrait (including &lt; 640px).
- Keep **full-card tap** to vote; maintain **focus-visible** styles.
- Update **`sizes` on `next/image`** so the CDN requests appropriate widths for ~50vw per column on mobile.

**Non-Goals:**

- Landscape-specific rules, tablet-only tweaks, or redesign of leaderboard.
- Changing image aspect ratio or swapping to non-square crops unless required for fit.

## Decisions

| Decision | Choice | Rationale | Alternatives |
|----------|--------|-----------|--------------|
| Breakpoint strategy | **`grid-cols-2` by default** (remove `sm:` gate on column count) | Simplest; matches “always side by side” | `max-sm:grid-cols-2` only on phone (redundant if always 2) |
| Gap | **`gap-2` or `gap-3` on base**, **`sm:gap-6`** (or similar) | Tighter on narrow screens; roomier on desktop | Single gap everywhere (acceptable) |
| Labels | Slightly **smaller text on base** (`text-xs sm:text-sm`) if wrapping hurts | Readability on 320px | Truncate names (worse a11y) |
| Min tap target | Rely on **full card** height/width; if image feels small, ensure **min-h** on button or image container | WCAG-friendly target | Separate “Vote” buttons (scope creep) |

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Very narrow devices (320px) feel cramped | Reduce gap and label size; verify in devtools iPhone SE |
| Long watch names wrap awkwardly | `line-clamp-2` optional on label |
| Larger images requested | Tune `sizes` to `50vw` for small viewports |

## Migration Plan

1. Ship UI-only change; no data migration.
2. Rollback: revert `DuelClient` grid classes.

## Open Questions

- Whether to **`line-clamp`** watch names on mobile only (product call).
