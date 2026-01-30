# Change: Update Mint Page UI

## Why

The `/mint` page currently shows a blank placeholder. It needs the same layout as `/stake` — heading, pills, TVL chart — with an empty mint module on the right, matching the design mockup.

## What Changes

- Create `screens/mint/` with `MintScreen` component
- Extract shared heading + pills section into a reusable `HeroBanner` widget
- Reuse existing `TVLChart` widget
- Create empty `MintModule` widget placeholder
- Update `app/mint/page.tsx` to render `MintScreen`
- Refactor `StakeScreen` to use the shared `HeroBanner`

## Impact

- Affected code: `apps/web/src/app/mint/page.tsx`, new `screens/mint/`, new `widgets/mint-module/`, new shared `widgets/hero-banner/`
- Refactored: `screens/stake/ui/stake-screen.tsx`
