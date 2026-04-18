## 1. Sync script

- [ ] 1.1 Add **`scripts/sync-watch-catalog.mjs`** (or `.ts` with `node --experimental-strip-types` if preferred) that reads **`watch images/`**, filters eligible extensions, sorts basenames, copies each file to **`public/watches/w-NN.<ext>`**, and writes **`lib/generated/watchCatalog.ts`** (or agreed path) exporting **`WATCHES`** typed consistently with **`Watch`**
- [ ] 1.2 Add **`npm run sync:watches`** in **`package.json`** invoking the script; document any Node version requirement

## 2. App integration

- [ ] 2.1 Refactor **`lib/catalog.ts`** to import **`WATCHES`** (and rebuild **`byId`**) from the generated module — keep **`pickTournamentParticipants`**, **`largestPowerOfTwoAtMost`**, etc. unchanged
- [ ] 2.2 Add **`lib/generated/`** to **`.gitignore`** only if the team prefers not committing generated output — **default: commit generated file** so Vercel build works without running sync unless documented otherwise

## 3. Assets and docs

- [ ] 3.1 Run **`npm run sync:watches`** once; commit updated **`public/watches/`** (only **`w-01`…`w-N`** synced files) and generated catalog
- [ ] 3.2 Update **`README.md`**: source of truth **`watch images/`**, sync command, note on tournament **N** / **M** changing with folder size
- [ ] 3.3 Remove obsolete **`public/watches/`** files that are not part of the new **`w-01`…`w-N`** set

## 4. Verification

- [ ] 4.1 Run **`npm run build`**; smoke **`/`** and **`/leaderboard`** to confirm every **`WATCHES[i].image`** loads and row count matches folder-derived **N**
