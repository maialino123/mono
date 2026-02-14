# Change: Add Stake Widget

## Why

The `/stake` page currently shows a placeholder "Staking panel coming soon". Users need a functional staking interface with Stake, Unstake, and Withdraw tabs to interact with CUSD/stCUSD tokens. The widget already exists in the cyberk-next-boilerplate and needs to be ported to the mono repo with FSD architecture adaptations and shadcn component preference.

## What Changes

- Add `widgets/stake-module` widget with 3 tabs: Stake, Unstake, Withdraw
- Add `shared/ui/token-amount-input.tsx` - reusable decimal token input component
- Add `shared/ui/status-indicator.tsx` - SVG status circle for withdraw items
- Install shadcn `tabs` and `separator` components
- Update `screens/stake/ui/stake-screen.tsx` to render the StakeModule widget
- **Stake tab**: Token amount input (CUSD), receive display (stCUSD), exchange rate, CTA button
- **Unstake tab**: Token amount input (stCUSD), receive display (CUSD) with breakdown, exchange rate, CTA button
- **Withdraw tab**: List of withdrawal requests with status indicators, "Withdraw All" CTA button

## Impact

- Affected specs: `staking-chart` (adds widget to the same page)
- New spec: `stake-widget`
- Affected code:
  - `apps/web/src/widgets/stake-module/` (NEW)
  - `apps/web/src/shared/ui/token-amount-input.tsx` (NEW)
  - `apps/web/src/shared/ui/status-indicator.tsx` (NEW)
  - `apps/web/src/shared/shadcn/tabs.tsx` (NEW - CLI)
  - `apps/web/src/shared/shadcn/separator.tsx` (NEW - CLI)
  - `apps/web/src/screens/stake/ui/stake-screen.tsx` (MODIFIED)
