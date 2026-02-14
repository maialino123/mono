# Design: TVL Chart Widget

## Context

The `/stake` page needs a TVL area chart displaying stablecoin values over time. The chart sits in an 8-column section of a 12-column grid layout, alongside a 4-column staking action panel. The UI matches the reference screenshots showing a green gradient area chart with time period toggles.

## Goals / Non-Goals

**Goals:**

- Display TVL value as an area chart with green gradient fill
- Support time period toggles: LIVE, 1D, 7D, 30D, 180D, All Time
- Show current TVL value and 24H change percentage in chart header
- Responsive 12-column grid: chart = 8 cols, staking panel = 4 cols
- Follow FSD architecture (widget layer for chart)

**Non-Goals:**

- Real-time WebSocket updates (polling or static data for v1)
- Interactive chart features (zoom, pan, crosshair)
- Multi-token chart comparison
- Backend API for TVL data (use mock data for now)

## Risk Map

| Component | Risk | Rationale | Verification |
| --- | --- | --- | --- |
| recharts dependency | MEDIUM | New external dependency, but widely used (26K+ stars) | Check bundle size, SSR compat |
| Chart SSR | LOW | Well-documented `"use client"` pattern | N/A |
| Grid layout | LOW | Standard Tailwind grid | N/A |
| FSD structure | LOW | Follows existing widget pattern | N/A |

## Decisions

### 1. Charting Library: Recharts

**Decision**: Use `recharts` for the TVL area chart.

**Alternatives considered:**

- **lightweight-charts** (TradingView): Best performance but limited gradient support, requires wrapper for React
- **visx** (Airbnb): Maximum customization but steep learning curve, more code for basic charts
- **tremor**: Too large bundle (85KB) for a single chart, overkill

**Rationale**: Recharts offers the best balance of DX, gradient fill support, responsive design (ResponsiveContainer), and Next.js compatibility. ~60KB gzipped is acceptable.

### 2. FSD Layer Placement

The TVL chart was promoted to `widgets/tvl-chart/` since it will be reused on multiple pages (stake, dashboard, etc.). The `screens/stake/` screen imports the widget for page composition.

```
widgets/tvl-chart/
├── ui/
│   ├── tvl-chart.tsx       # Main recharts AreaChart ("use client")
│   ├── chart-header.tsx    # TVL value + 24H change display
│   └── period-toggle.tsx   # Time period selector (LIVE, 1D, 7D, etc.)
├── lib/
│   ├── types.ts            # TVLDataPoint, ChartPeriod types
│   └── mock-data.ts        # Mock TVL data for development
└── index.ts                # Barrel export

screens/stake/
├── ui/
│   └── stake-screen.tsx    # Grid layout, imports from @/widgets/tvl-chart
└── index.ts                # Barrel export
```

**Rationale**: Initially planned for `screens/` but promoted to `widgets/` as the chart will be reused on multiple pages (stake, dashboard, etc.).

### 3. Grid Layout

```
┌──────────────────────────────────┬────────────────┐
│         TVL Chart (8 cols)       │  Stake Panel   │
│  ┌──────────────────────────┐    │   (4 cols)     │
│  │ [Token] TVL    [Periods] │    │                │
│  │ $393.28  ↗1.47% (24H)   │    │ [Stake|Unstake]│
│  │                          │    │ [Input CUSD]   │
│  │   ~~~~ Area Chart ~~~~   │    │ [Receive stCUSD]│
│  │                          │    │ [Connect Wallet]│
│  │  Jul 1  Jul 3  Jul 5    │    │ [Exchange Rate] │
│  └──────────────────────────┘    │                │
└──────────────────────────────────┴────────────────┘
```

Tailwind classes: `grid grid-cols-12 gap-6` with `col-span-8` and `col-span-4`. Stacks vertically on mobile (`col-span-12`).

### 4. Color Palette

- Chart line: `#22c55e` (Tailwind green-500)
- Gradient top: `rgba(34, 197, 94, 0.3)`
- Gradient bottom: `rgba(34, 197, 94, 0.05)`
- Positive change: `text-green-600`
- Negative change: `text-red-500`
- Card background: `bg-white` with `rounded-xl shadow-sm border`
- Grid lines: `stroke-gray-100` dashed

## Migration Plan

No migration needed — this is a new feature on a stub page.

## Resolved Questions

- Data source: mock data for initial implementation
- Real-time LIVE updates: deferred to future iteration
- Token: CUSD with custom icon
