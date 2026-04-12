## 1. Duel grid

- [x] 1.1 Update `components/DuelClient.tsx` to use a **two-column** grid at all relevant breakpoints (remove `sm:` gating on `grid-cols-2`); tighten `gap` on small screens and restore comfortable spacing from `sm` up
- [x] 1.2 Adjust `next/image` **`sizes`** so each column uses ~half viewport width on mobile (e.g. `50vw` where appropriate)
- [x] 1.3 Optionally reduce label **`text-*` on base** and add **`line-clamp`** if long names overflow on 320px-wide viewports

## 2. Verification

- [x] 2.1 Run `npm run build`; manually verify duel on a **375px / 390px** wide viewport (DevTools or device): both watches visible side by side, both tappable, no horizontal scroll
