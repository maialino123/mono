# Tasks: Add Stake Widget

## 1. Setup

- [x] 1.1 Install shadcn `tabs` component: `bunx shadcn@latest add tabs`
- [x] 1.2 Install shadcn `separator` component: `bunx shadcn@latest add separator`

## 2. Shared UI Components

- [x] 2.1 Create `shared/ui/token-amount-input.tsx` - port from boilerplate with mono conventions (use `cn` from `@/shared/lib/utils`, remove boilerplate-specific imports)
- [x] 2.2 Create `shared/ui/status-indicator.tsx` - port from boilerplate

## 3. Stake Widget

- [x] 3.1 Create `widgets/stake-module/model/types.ts` - define Token, Withdraw, WithdrawStatus types
- [x] 3.2 Create `widgets/stake-module/ui/stake-tab.tsx` - Stake tab with TokenAmountInput, receive display, CTA button, exchange rate
- [x] 3.3 Create `widgets/stake-module/ui/unstake-tab.tsx` - Unstake tab with TokenAmountInput, receive breakdown, CTA button, exchange rate
- [x] 3.4 Create `widgets/stake-module/ui/withdraw-item.tsx` - Single withdraw request card with StatusIndicator
- [x] 3.5 Create `widgets/stake-module/ui/withdraw-tab.tsx` - Withdraw tab with request list and "Withdraw All" button
- [x] 3.6 Create `widgets/stake-module/ui/stake-module.tsx` - Main widget with shadcn Tabs wrapping all 3 tabs
- [x] 3.7 Create `widgets/stake-module/index.ts` - Public barrel export

## 4. Integration

- [x] 4.1 Update `screens/stake/ui/stake-screen.tsx` - replace placeholder div with `<StakeModule />`

## 5. Verification

- [x] 5.1 Run `bun run check-types` - verify no TypeScript errors
- [x] 5.2 Run `bun run check` - verify Biome lint/format passes
- [x] 5.3 Visual check - verify all 3 tabs render correctly matching mockup designs
