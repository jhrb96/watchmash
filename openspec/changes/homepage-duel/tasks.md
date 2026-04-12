## 1. Home page

- [x] 1.1 Replace or extend `app/page.tsx` to render the duel experience (reuse `DuelClient` or shared component) with concise intro copy above or beside the duel
- [x] 1.2 Remove duplicate “go to duel” primary CTA that only linked to `/duel` unless it still adds value (e.g. anchor scroll)

## 2. Redirect and route cleanup

- [x] 2.1 Add `permanentRedirect` from `/duel` to `/` in `next.config.ts` **or** delete `app/duel/page.tsx` and add equivalent `redirects` config
- [x] 2.2 Remove `app/duel/page.tsx` if redundant after redirect (avoid two implementations)

## 3. Navigation and docs

- [x] 3.1 Update `app/layout.tsx` nav: ensure “Home” targets `/`; remove or relabel “Duel” so it does not imply a separate required route
- [x] 3.2 Update `README.md` (and any on-page copy) that tells users to open `/duel` first

## 4. Verification

- [x] 4.1 Run `npm run build`; manually verify `/`, `/leaderboard`, `/api/health`, vote flow from home, and `/duel` redirects to `/`
