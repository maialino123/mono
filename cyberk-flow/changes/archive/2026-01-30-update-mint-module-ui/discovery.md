# Discovery: Update Mint Module UI

## 1. Feature Summary

Build out the full Mint Module UI with Pay/Receive input sections, token selector, a "Connect Wallet" button, and an exchange rate/fee footer — matching the design in `drafts/mint-module.svg`.

## 2. Architecture Snapshot

### Relevant Packages
| Package | Purpose | Key Files |
| ------- | ------- | --------- |
| `apps/web/src/widgets/mint-module` | Mint/Redeem widget | `ui/mint-module.tsx`, `index.ts` |
| `apps/web/src/widgets/stake-module` | Reference pattern | `ui/stake-tab.tsx`, `ui/cusd-icon.tsx`, `model/types.ts` |
| `apps/web/src/shared/ui` | Shared UI components | `token-amount-input.tsx` |
| `apps/web/src/shared/shadcn` | shadcn components | `button.tsx`, `card.tsx`, `tabs.tsx` |

### Entry Points
- UI: `apps/web/src/widgets/mint-module/index.ts` → exports `MintModule`

## 3. Existing Patterns

### Similar Implementations
| Feature | Location | Pattern Used |
| ------- | -------- | ------------ |
| Stake Module | `widgets/stake-module/ui/stake-tab.tsx` | Tab content with `TokenAmountInput`, token pill, `Button`, exchange rate footer |
| Stake Module tabs | `widgets/stake-module/ui/stake-module.tsx` | `Tabs` + `TabsContent` per tab, delegating to child components |
| CUSD Icon | `widgets/stake-module/ui/cusd-icon.tsx` | SVG icon as React component |

### Reusable Utilities
- `TokenAmountInput` from `@/shared/ui/token-amount-input`
- `cn()` from `@/shared/lib/utils`
- `Button`, `Card`, `Tabs` from `@/shared/shadcn/*`
- `Token` type from `widgets/stake-module/model/types.ts` (can be reused or duplicated for mint-module)

## 4. Technical Constraints
- Must follow FSD widget layer rules (compose features/entities/shared)
- Must be a client component (`"use client"`)
- Must follow the same code style/conventions as `stake-module`

## 5. External References
- Design: `drafts/mint-module.svg` (visual spec)

## 6. Gap Analysis
| Component | Have | Need | Gap Size |
| --------- | ---- | ---- | -------- |
| Tabs shell | Tabs with Mint/Redeem triggers (no content) | TabsContent for Mint and Redeem | Small |
| Mint tab | Nothing | Pay input + token selector, arrow, Receive section + CUSD pill, Connect Wallet button, footer | New |
| Redeem tab | Nothing | Redeem tab content (inverse of mint) | New |
| Model types | None in mint-module | `Token` type (reuse from stake-module or extract to shared) | Small |
| Arrow icon | None | Down arrow separator between Pay and Receive | Small |

## 7. Open Questions (Resolved)
- [x] **Token type** → Move from `stake-module/model/types.ts` to `shared/` so both widgets import from there.
- [x] **Select Token dropdown** → Static placeholder for now (styled pill, no dropdown logic).
- [x] **Redeem tab** → Fully implemented; same UI as Mint tab.
