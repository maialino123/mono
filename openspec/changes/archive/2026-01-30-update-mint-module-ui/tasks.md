# Tasks: Update Mint Module UI

## 1. Setup

- [x] 1.1 Create `apps/web/src/shared/types/token.ts` — extract `Token` interface from stake-module
- [x] 1.2 Update `apps/web/src/widgets/stake-module/model/types.ts` — import `Token` from shared instead of defining locally
- [x] 1.3 Create `apps/web/src/widgets/mint-module/ui/cusd-icon.tsx` (co-locate from stake-module pattern)

## 2. Mint Tab

- [x] 2.1 Create `apps/web/src/widgets/mint-module/ui/mint-tab.tsx`:
  - "Pay" section with `TokenAmountInput` and static "Select Token ∨" pill
  - Down-arrow separator
  - "Receive" section with amount display and CUSD token pill (icon + label)
  - "Connect Wallet" button (full-width, dark, rounded-full)
  - Footer with exchange rate ("1 CUSD = 1.0000 USD") and fee ("Fee: 0.00 ETH")
- [x] 2.2 Wire `MintTab` into `mint-module.tsx` via `TabsContent value="mint"`

## 3. Redeem Tab

- [x] 3.1 Create `apps/web/src/widgets/mint-module/ui/redeem-tab.tsx` — fully implemented, same UI as MintTab
- [x] 3.2 Wire `RedeemTab` into `mint-module.tsx` via `TabsContent value="redeem"`

## 4. Verification

- [x] 4.1 Run `bun run check-types` — no type errors
- [x] 4.2 Run `bun run check` — no lint errors
- [ ] 4.3 Visual review against `drafts/mint-module.svg`
