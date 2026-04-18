## 1. Catalog code

- [x] 1.1 Update **`lib/catalog.ts`** so **`WATCHES`** has exactly **14** entries with ids **`w-01`** … **`w-14`** and matching **`image`** paths
- [x] 1.2 Grep the repo for **`33`**, **`w-33`**, or “33 watches” and update remaining references (e.g. **`README.md`**, comments) to **14** where they describe catalog size

## 2. Static assets

- [x] 2.1 Ensure **`public/watches/`** contains **`w-01.png`** through **`w-14.png`** (add missing files or fix names to match catalog)
- [x] 2.2 Remove unused **`w-15.png`** … **`w-33.png`** from **`public/watches/`** if they exist in the tree, to avoid shipping dead assets

## 3. Verification

- [x] 3.1 Run **`npm run build`** and open **`/`** and **`/leaderboard`** locally to confirm images resolve and counts match **14** rows
