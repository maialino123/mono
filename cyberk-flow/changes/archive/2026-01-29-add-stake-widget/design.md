## Context

Porting the stake widget from cyberk-next-boilerplate to the mono repo. The boilerplate uses custom components (TypographyBase, CtaButton, custom Tabs) that don't exist in mono. We need to adapt to use shadcn/ui components and FSD conventions.

## Goals / Non-Goals

- Goals:
  - Port stake widget with all 3 tabs matching the design mockups
  - Use shadcn components (Tabs, Card, Button, Separator) where possible
  - Follow FSD layer rules strictly
  - Create reusable shared UI (TokenAmountInput, StatusIndicator)
  - Mock data only - no blockchain integration yet

- Non-Goals:
  - Wallet connection functionality
  - Real blockchain transactions
  - Token balance fetching
  - i18n support

## Risk Map

| Component | Risk | Rationale | Verification |
| --- | --- | --- | --- |
| shadcn Tabs | LOW | Standard CLI install | `bunx shadcn@latest add tabs` |
| TokenAmountInput | LOW | Direct port, well-tested in boilerplate | Manual test |
| StakeModule | LOW | Composition of existing patterns | Type check |
| StatusIndicator | LOW | Simple SVG component | Visual check |

## Decisions

- **shadcn Tabs over custom Tabs**: The boilerplate has a custom animated indicator Tabs. We use shadcn Tabs for consistency with the mono repo's shadcn-first approach. The animated indicator can be added later if needed.
- **CtaButton → shadcn Button**: Replace boilerplate's `CtaButton` with shadcn `Button` using appropriate variants.
- **TypographyBase → native elements**: Replace boilerplate's `TypographyBase` with `<span>` and `<p>` with Tailwind classes, since mono doesn't have a Typography component.
- **Types co-located in widget**: Token and Withdraw types are widget-specific for now. Move to `entities/` when real API integration happens.
- **No wallet dependency**: Use `isConnected = false` as default state. The "Connect Wallet" button is a placeholder.

## Component Tree

```
StakeModule (widget)
├── shadcn/Card
│   └── shadcn/Tabs
│       ├── TabsList (Stake | Unstake | Withdraw)
│       ├── StakeTab
│       │   ├── TokenAmountInput (shared/ui)
│       │   ├── Token badge (CUSD icon + symbol)
│       │   ├── Receive display
│       │   ├── shadcn/Button (Connect Wallet / Stake)
│       │   └── Exchange rate info
│       ├── UnstakeTab
│       │   ├── TokenAmountInput (shared/ui)
│       │   ├── Token badge (stCUSD icon + symbol)
│       │   ├── Receive display with breakdown
│       │   ├── shadcn/Button (Connect Wallet / Unstake)
│       │   └── Exchange rate info
│       └── WithdrawTab
│           ├── Withdraw requests header
│           ├── WithdrawItem[] (status, amount, dates)
│           │   └── StatusIndicator (shared/ui)
│           └── shadcn/Button (Withdraw All)
```

## File Structure

```
apps/web/src/
├── widgets/stake-module/
│   ├── index.ts                    # Public API
│   ├── ui/
│   │   ├── stake-module.tsx        # Main tabbed widget
│   │   ├── stake-tab.tsx           # Stake tab content
│   │   ├── unstake-tab.tsx         # Unstake tab content
│   │   ├── withdraw-tab.tsx        # Withdraw tab content
│   │   └── withdraw-item.tsx       # Single withdrawal request card
│   └── model/
│       └── types.ts                # Token, Withdraw, WithdrawStatus types
├── shared/
│   ├── ui/
│   │   ├── token-amount-input.tsx  # Decimal-validated token input
│   │   └── status-indicator.tsx    # SVG circle status indicator
│   └── shadcn/
│       ├── tabs.tsx                # NEW (shadcn CLI)
│       └── separator.tsx           # NEW (shadcn CLI)
└── screens/stake/
    └── ui/stake-screen.tsx         # MODIFIED: replace placeholder with StakeModule
```
