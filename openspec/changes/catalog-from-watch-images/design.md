## Context

Source assets directory: **`watch images/`** (note **space** in folder name — scripts must use repo-relative path string). Current catalog in **`lib/catalog.ts`** uses **`Array.from({ length: COUNT })`** and assumes **`/watches/w-NN.png`**. Folder today holds **mixed filenames** and at least **`.png`** and **`.avif`**; Next.js **`next/image`** can serve **`.avif`** from **`public/`**.

## Goals / Non-Goals

**Goals:**

- **Single source of truth** for “which watches exist”: the set of eligible image files in **`watch images/`**.
- **Stable ordering**: e.g. **Unicode locale sort** on basename so **`w-01`…`w-N`** assignments do not shuffle when re-running sync unless filenames change.
- **Stable ids**: keep **`w-01`…`w-N`** pattern for compatibility with existing **`wins:w-*`** and tournament code.
- **`image` field**: **`/watches/<filename-as-stored-in-public>`** — prefer **normalized filenames** in public (`w-01.avif`, `w-02.png`) copied from source with **known extension** per file to avoid URL-encoding chaos from semicolons/spaces in original names.
- **`name` field**: human-readable string from basename (strip extension, replace `-`/`_` with space, collapse whitespace, optional max length **~60** chars).

**Non-Goals:**

- Automatic sync on every **`next dev`** without an explicit script invocation (can add later).
- AI-generated captions or fetching metadata from the web.
- Serving images **directly** from **`watch images/`** at request time (not under **`public/`** — Next static serving expects **`public/watches`**).

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Eligible extensions | **`.png`**, **`.jpg`**, **`.jpeg`**, **`.webp`**, **`.avif`** | Matches current folder; ignore non-images. |
| Ignored entries | **`.DS_Store`**, dotfiles, non-matching extensions | Avoid polluting catalog. |
| Public filenames | **`w-01<ext>`** preserving source extension per slot | Next/Image picks `Content-Type` from extension; avoids lossy forced PNG conversion. |
| Generated code location | **`lib/generated/watchCatalog.ts`** (or **`lib/watchCatalog.generated.ts`**) gitcommitted + **`/* eslint-disable ... */`** header OR **`lib/catalog.data.json`** imported as assert — pick **TypeScript export** for type safety | `catalog.ts` re-exports `WATCHES` from generated file. |
| Script runtime | **Node** **`scripts/sync-watch-catalog.mjs`** (no `tsx` dep) using **`fs`**, **`path`**, **`child_process`** not needed | Zero new deps; run via **`npm run sync:watches`**. |
| Minimum watches | **≥ 2** or script errors | Tournament requirement. |
| Semicolons / spaces in source names | **Do not** use original basename as public URL; only **`w-NN.ext`** in **`public/watches/`** | Safe URLs and caching. |

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Filename sort order differs OS vs CI | Use **`localeCompare(undefined, { sensitivity: "base" })`** on basename only. |
| Generated file not run before deploy | Document **`sync:watches`** before **`npm run build`**; optional **`prebuild`** hook (design: opt-in to avoid surprise writes in CI). |
| Old **`wins:`** keys for removed ids | README note: optional `DEL`; leaderboard only lists current ids. |

## Migration Plan

1. Add script + npm script; run once locally.
2. Commit generated catalog + **`public/watches/`** updates.
3. Remove obsolete synthetic PNGs superseded by sync output.
4. Verify **`npm run build`** and smoke **`/`** + **`/leaderboard`**.

## Open Questions

- Whether to add **`prebuild`** to always sync (convenient vs. deterministic CI diffs).
- Optional **`watch-images-meta.json`** for display name overrides next to messy filenames.
