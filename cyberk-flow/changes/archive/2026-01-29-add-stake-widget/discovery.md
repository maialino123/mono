# Discovery: Stake Widget

## 1. Feature Summary

Create a staking widget with 3 tabs (Stake, Unstake, Withdraw) that allows users to stake CUSD tokens, unstake stCUSD tokens, and view/claim withdrawal requests. The widget replaces the placeholder "Staking panel coming soon" on the `/stake` page.

## 2. Architecture Snapshot

### Relevant Packages

| Package | Purpose | Key Files |
| --- | --- | --- |
| `apps/web/src/widgets/stake-module` | **NEW** - Stake widget with 3 tabs | `ui/stake-module.tsx`, `ui/stake-tab.tsx`, `ui/unstake-tab.tsx`, `ui/withdraw-tab.tsx`, `ui/withdraw-item.tsx` |
| `apps/web/src/shared/ui` | Shared UI components | `token-amount-input.tsx`, `status-indicator.tsx` (NEW) |
| `apps/web/src/shared/shadcn` | shadcn/ui managed components | `card.tsx`, `button.tsx` (existing); `tabs.tsx`, `separator.tsx` (NEW - add via CLI) |
| `apps/web/src/screens/stake` | Stake page composition | `ui/stake-screen.tsx` (existing - update to include StakeModule) |

### Entry Points

- UI: `apps/web/src/app/stake/page.tsx` → `screens/stake` → `widgets/stake-module`

## 3. Existing Patterns

### Similar Implementations (from cyberk-next-boilerplate)

| Feature | Location (boilerplate) | Pattern Used |
| --- | --- | --- |
| StakeModule widget | `src/widgets/stake-module/` | Tabbed card with 3 tab panels |
| TokenAmountInput | `src/shared/ui/components/token-amount-input/` | Controlled input with decimal validation |
| StatusIndicator | `src/shared/ui/components/status-indicator/` | SVG circle with configurable color |
| Custom Tabs | `src/shared/ui/components/tabs/` | Radix Tabs with animated indicator |

### Reusable Utilities

- `cn()` from `@/shared/lib/utils` (existing)
- shadcn Card, Button (existing)
- Need to add: shadcn Tabs, Separator

## 4. Technical Constraints

- **No wallet integration yet**: Use mock data and a "Connect Wallet" CTA button
- **No blockchain calls**: All values are static/mock for now
- **shadcn preference**: Use shadcn Tabs instead of custom Tabs from boilerplate
- **FSD compliance**: Widget in `widgets/`, shared UI in `shared/ui/`, types in widget-local scope
- **No external dependencies**: Avoid `@reown/appkit`, `react-intl`, etc.

## 5. External References

- Boilerplate source: `/Users/zyta/zytacyberk/cyberk-next-boilerplate/src/widgets/stake-module/`
- shadcn Tabs: https://ui.shadcn.com/docs/components/tabs
- shadcn Separator: https://ui.shadcn.com/docs/components/separator

## 6. Gap Analysis

| Component | Have | Need | Gap Size |
| --- | --- | --- | --- |
| shadcn Tabs | Not installed | Tabs component | Small (CLI add) |
| shadcn Separator | Not installed | Separator component | Small (CLI add) |
| TokenAmountInput | Not in mono | Shared input component | Medium (port from boilerplate) |
| StatusIndicator | Not in mono | SVG status circle | Small (port from boilerplate) |
| StakeModule widget | Placeholder div | Full widget with 3 tabs | Medium (port + adapt) |
| Token/Withdraw types | Not in mono | Type definitions | Small (create locally) |

## 7. Open Questions

- [x] Use shadcn Tabs or custom Tabs from boilerplate? → **shadcn Tabs** (project preference)
- [ ] Should wallet connect be a real feature or just a button placeholder?
- [ ] Should token types live in `shared/` or widget-local?
