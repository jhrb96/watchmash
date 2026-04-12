## Why

The duel grid uses **`sm:grid-cols-2`**, so viewports below the `sm` breakpoint (Tailwind default **640px**) show the two watches **stacked vertically**. Typical phones (e.g. iPhone in portrait, ~390px wide) therefore see one watch at a time until scrolling, which is slower to compare and vote.

## What Changes

- The **duel UI** (`DuelClient` or equivalent) SHALL show **both watches side by side** on **mobile phone** viewports (portrait widths roughly **320px–639px**), not only from `sm` upward.
- **Spacing, typography, and tap targets** MAY be tuned for narrow widths (smaller gaps, readable labels, still usable buttons) so the layout remains accessible.
- **No API, Redis, or pairing logic** changes.

## Capabilities

### New Capabilities

- `duel-mobile-layout`: Responsive layout rules for the pairwise duel so two options appear in **two columns** on typical mobile portrait widths, with acceptable usability.

### Modified Capabilities

- _(none — no `openspec/specs/` baseline in repo.)_

## Impact

- **`components/DuelClient.tsx`** (grid classes, gaps, optional `sizes` on `next/image`, label sizing).
- Possible minor **`globals.css`** only if a shared token is preferred (unlikely).
