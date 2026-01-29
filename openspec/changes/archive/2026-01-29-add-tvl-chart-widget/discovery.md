# Discovery: TVL Chart Widget

## 1. Feature Summary

Add a TVL (Total Value Locked) area chart widget to the `/stake` page displaying stablecoin value over time, with time period toggles (LIVE, 1D, 7D, 30D, 180D, All Time) and a green gradient fill area chart.

## 2. Architecture Snapshot

### Relevant Packages

| Package | Purpose | Key Files |
| --- | --- | --- |
| `apps/web` | Next.js frontend | `src/app/stake/page.tsx` |
| `apps/web/src/widgets/` | Reusable large UI blocks | `layout/` (existing pattern) |
| `apps/web/src/entities/` | Read-only domain data | `todo/`, `user/` (existing pattern) |
| `apps/web/src/shared/` | Infrastructure, utilities | `shadcn/`, `ui/`, `lib/` |

### Entry Points

- **UI**: `apps/web/src/app/stake/page.tsx` (currently a stub: `<div>Stake</div>`)
- **Widget**: `widgets/tvl-chart/` (reusable chart widget)
- **Entity**: New `entities/staking/` for TVL data queries

## 3. Existing Patterns

### Similar Implementations

| Feature | Location | Pattern Used |
| --- | --- | --- |
| Layout widget | `widgets/layout/` | Widget with `ui/` folder, barrel `index.ts` |
| Todo entity | `entities/todo/` | Entity with queries, types |
| Connect wallet | `features/connect-wallet/` | Client-side interactive feature |

### Reusable Utilities

- UI components: `shared/shadcn/` (button, card, tabs, etc.)
- API client: `shared/api/orpc`
- Providers: `shared/providers/`

## 4. Technical Constraints

- **No charting library installed yet** - need to add `recharts` as dependency
- **Next.js 16 App Router** - chart must use `"use client"` directive
- **FSD architecture** - strict layer import rules apply
- **12-column grid layout** - chart takes 8 columns on desktop

## 5. External References

- **Recharts docs**: https://recharts.org/
- **Reference UI**: TVL chart showing stablecoin values with green area fill, time period toggles, current value header with 24H change percentage

## 6. Gap Analysis

| Component | Have | Need | Gap Size |
| --- | --- | --- | --- |
| Chart library | None | recharts | New dependency |
| TVL chart widget | None | `widgets/tvl-chart/` | New |
| Staking entity | None | `entities/staking/` for TVL data | New |
| Stake page layout | Stub page | 12-col grid with chart (8 cols) + sidebar (4 cols) | Rewrite |
| Stake screen | None | `screens/stake/` composition | New |

## 7. Resolved Questions

- [x] What is the data source for TVL values? → **Mock data for now**
- [x] Should the chart support real-time/LIVE updates via WebSocket or polling? → **Will implement later**
- [x] What stablecoin token icon to display? → **CUSD**
