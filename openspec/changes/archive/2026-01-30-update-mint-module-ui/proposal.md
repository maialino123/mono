# Change: Update Mint Module UI

## Why

The current `MintModule` widget only renders empty Mint/Redeem tabs with no content. The design (`drafts/mint-module.svg`) specifies a full minting interface with Pay/Receive inputs, token selection, a Connect Wallet button, and exchange rate/fee footer.

## What Changes

- Add `MintTab` component with:
  - "Pay" section: `TokenAmountInput` + "Select Token" dropdown pill
  - Down-arrow separator
  - "Receive" section: amount display + CUSD token pill with icon
  - "Connect Wallet" button (full width, dark style)
  - Footer: exchange rate ("1 USDT ⇄ 1 CUSD") and fee ("Fee: 0.00001 ETH")
- Add `RedeemTab` component (fully implemented, same UI as MintTab)
- Move `Token` type from `stake-module/model/types.ts` to `shared/types/token.ts`; update stake-module imports
- Wire `TabsContent` into `mint-module.tsx` for both tabs
- Add `CusdIcon` (reuse from stake-module or co-locate)

## Impact

- Affected code:
  - `apps/web/src/shared/types/token.ts` (new — Token type extracted here)
  - `apps/web/src/widgets/stake-module/model/types.ts` (modified — remove Token, re-export from shared)
  - `apps/web/src/widgets/mint-module/ui/mint-module.tsx` (modified — add TabsContent)
  - `apps/web/src/widgets/mint-module/ui/mint-tab.tsx` (new)
  - `apps/web/src/widgets/mint-module/ui/redeem-tab.tsx` (new)
  - `apps/web/src/widgets/mint-module/ui/cusd-icon.tsx` (new)
- No breaking changes
- No API or database changes
