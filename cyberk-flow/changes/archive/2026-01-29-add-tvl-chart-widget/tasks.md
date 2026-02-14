# Tasks: Add TVL Chart Widget

## 1. Setup

- [x] 1.1 Install `recharts` dependency in `apps/web` (recharts@3.7.0)
- [x] 1.2 Verify recharts works with Next.js 16 + React 19 (tsc passes)

## 2. Widget: TVL Chart

- [x] 2.1 Create `widgets/tvl-chart/lib/types.ts` with TVLDataPoint, ChartPeriod types
- [x] 2.2 Create `widgets/tvl-chart/lib/mock-data.ts` with realistic TVL mock data per period
- [x] 2.3 Create `widgets/tvl-chart/ui/period-toggle.tsx` — time period selector (LIVE, 1D, 7D, 30D, 180D, All Time)
- [x] 2.4 Create `widgets/tvl-chart/ui/chart-header.tsx` — CUSD icon, "TVL" label, current value, 24H change
- [x] 2.5 Create `widgets/tvl-chart/ui/tvl-chart.tsx` — main recharts AreaChart with green gradient, axes, tooltip
- [x] 2.6 Create `screens/stake/ui/stake-screen.tsx` — 12-col grid layout (chart 8 cols + placeholder 4 cols), imports from `@/widgets/tvl-chart`
- [x] 2.7a Create `widgets/tvl-chart/index.ts` barrel export
- [x] 2.7b Create `screens/stake/index.ts` barrel export

## 3. Integration

- [x] 3.1 Update `app/stake/page.tsx` to render StakeScreen

## 4. Verification

- [x] 4.1 Run `bun run check-types` — no new TypeScript errors
- [x] 4.2 Run `bun run check` — Biome lint/format passes
- [x] 4.3 Visual check: chart renders with green gradient, period toggles work
