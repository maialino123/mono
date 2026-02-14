# Change: Add TVL Chart Widget to Stake Page

## Why

The `/stake` page is currently a stub. Users need to see stablecoin TVL (Total Value Locked) history as an area chart to understand protocol health before staking. The chart is the primary visual element of the stake page, occupying 8 of 12 grid columns.

## What Changes

- **Add `recharts` dependency** to `apps/web` for area chart rendering
- **Create `widgets/tvl-chart/`** widget with:
  - Green gradient area chart for TVL time series
  - Chart header showing current TVL value and 24H change %
  - Time period toggle (LIVE, 1D, 7D, 30D, 180D, All Time)
  - Mock data for initial development
- **Create `screens/stake/`** screen composing the page layout, importing the chart from `widgets/tvl-chart/`:
  - 12-column grid: chart (8 cols) + staking panel placeholder (4 cols)
  - Responsive: stacks to full-width on mobile
- **Update `app/stake/page.tsx`** to render the stake screen

## Impact

- **Affected specs**: None (new capability)
- **New spec**: `staking-chart` capability
- **Affected code**:
  - `apps/web/package.json` (new recharts dependency)
  - `apps/web/src/widgets/tvl-chart/` (new — chart widget, reusable across pages)
  - `apps/web/src/screens/stake/` (new — imports from `@/widgets/tvl-chart`)
  - `apps/web/src/app/stake/page.tsx` (update)
