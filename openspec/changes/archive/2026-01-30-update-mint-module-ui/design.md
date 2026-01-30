# Design: Update Mint Module UI

## Context

The mint-module widget needs a full UI matching the design in `drafts/mint-module.svg`. The stake-module serves as the primary pattern reference for layout, component usage, and conventions.

## Goals / Non-Goals

- **Goals**: Implement the visual design faithfully; reuse existing shared components; follow stake-module patterns
- **Non-Goals**: Functional token selection logic; real wallet connection; actual minting/redeeming transactions

## Risk Map

| Component | Risk | Rationale | Verification |
| --------- | ---- | --------- | ------------ |
| MintTab UI | LOW | Follows stake-tab pattern exactly | Visual review |
| RedeemTab UI | LOW | Mirror of MintTab | Visual review |
| Token type | LOW | Simple interface, same as stake-module | Type check |
| TokenAmountInput | LOW | Already exists and proven in stake-tab | N/A |

## Decisions

- **Reuse `TokenAmountInput`** from `@/shared/ui/token-amount-input` (same as stake-module)
- **Co-locate `CusdIcon`** in mint-module's `ui/` folder (same pattern as stake-module, per FSD rules)
- **Extract `Token` type to shared** at `shared/types/token.ts`; both stake-module and mint-module import from there
- **Static mock data** for exchange rate, fee, and token info — no API integration yet
- **"Select Token" as static pill** — renders as a styled button/pill with chevron, no dropdown logic yet

## Component Structure

```
shared/types/
│   └── token.ts          # Token type (shared across widgets)

widgets/mint-module/
├── ui/
│   ├── mint-module.tsx    # Shell: Card + Tabs + TabsContent
│   ├── mint-tab.tsx       # Pay input, arrow, Receive, button, footer
│   ├── redeem-tab.tsx     # Inverse of mint (Receive USDT, Pay CUSD)
│   └── cusd-icon.tsx      # CUSD token SVG icon
└── index.ts               # Public export
```

## Layout (Mint Tab)

1. **Pay section** — bordered card with:
   - "Pay" label (12px, muted)
   - `TokenAmountInput` (24px font) + "Select Token ∨" pill (right-aligned)
   - Fiat value "$0" below input
2. **Arrow separator** — centered down-arrow icon between sections
3. **Receive section** — bordered card with:
   - "Receive" label (12px, muted)
   - Amount display (24px) + "CUSD" pill with icon (right-aligned)
   - Fiat value "$0" below
4. **Connect Wallet button** — full width, dark bg, rounded-full (pill shape)
5. **Footer** — flex row with exchange rate left, fee right

## Open Questions
- None — all resolved, all LOW risk, proceed with implementation
