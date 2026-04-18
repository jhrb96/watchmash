## Why

The app catalog today is **synthetic** (`Watch 01` … generic paths under `/watches/w-NN.png`) while the **real assets** live under the repo’s **`watch images/`** folder with **distinct filenames** (brands, screenshots, mixed extensions including **`.avif`**). Operators maintain images in that folder but must manually keep `lib/catalog.ts` and `public/watches/` in sync, which drifts and duplicates effort.

## What Changes

- **Rebuild `WATCHES`** so each entry corresponds to **one image file** from **`watch images/`** (excluding junk like **`.DS_Store`**), with stable ids (**`w-01` … `w-N`**) and **`image`** URLs that Next can serve from **`public/watches/`**.
- **Populate `public/watches/`** from the source folder (copy or normalize) so deployed paths match the catalog; remove or replace stale **`w-*.png`** files that no longer map to the folder.
- **Display names** derived from filenames (slug / humanized string) or from a small optional manifest — product choice captured in design; default is **deterministic derivation** so no hand-maintained list is required for every rename.
- Add a **documented sync path** (e.g. **`npm run sync:watches`**) that developers run after adding/removing files in **`watch images/`**, regenerating the catalog module and refreshing **`public/watches/`** (or document a manual procedure if script is deferred — prefer script in tasks).
- **README** updated: source of truth is **`watch images/`**; how to sync before build/deploy.

## Capabilities

### New Capabilities

- `watch-catalog-sync`: Catalog membership and `image` paths SHALL align with **`watch images/`**; sync procedure, stable id scheme, supported image extensions, and deterministic ordering.

### Modified Capabilities

- _(none — no `openspec/specs/` baseline in repo.)_

## Impact

- **`lib/catalog.ts`**: either imports generated data or becomes a thin wrapper; **`WATCHES.length`** may change (today **14** synthetic vs **~12** real files in folder — exact count follows folder after sync).
- **`public/watches/`**: replaced/rewritten from sync output.
- **`package.json`** scripts; optional **`scripts/`** Node script (no new runtime npm dependency unless justified).
- **Tournament / leaderboard**: unchanged APIs; **M** (largest power of two ≤ **N**) updates automatically with **N = `WATCHES.length`**.
- **Redis**: optional cleanup note for `wins:w-*` keys for ids that disappear after a smaller catalog — documentation only.
