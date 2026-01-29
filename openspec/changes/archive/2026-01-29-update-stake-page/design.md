# Design: Update Stake Page

## Context

The `/stake` page currently shows only the TVL chart + a placeholder stake panel in a 12-column grid. The design requires a hero section with a title and pill badges above the grid, matching the provided screenshot.

## Goals / Non-Goals

**Goals:**

- Add hero section with centered title and pill badges above the chart grid
- Apply custom title typography: 30px, semibold, -0.75% letter-spacing, primary color
- Apply custom pill typography: 14px, regular, secondary color, rounded border
- Responsive layout: hero stacks naturally, grid stacks at `lg` breakpoint
- Keep existing TVL chart widget and stake panel placeholder unchanged

**Non-Goals:**

- Redesign the TVL chart widget (already built)
- Implement the actual stake module (marked "coming soon")
- Add the "Customize" button (ignored per requirements)
- Dark mode specific styling (uses existing CSS variables which handle both)

## Risk Map

| Component | Risk | Rationale | Verification |
| --- | --- | --- | --- |
| Hero section | LOW | Simple HTML/CSS, no logic | Visual review |
| Pill badges | LOW | Static text with border styling | Visual review |
| Custom typography | LOW | Standard Tailwind + inline styles | Visual review |
| Responsive layout | LOW | Standard Tailwind responsive classes | Test at 375px, 768px, 1024px, 1440px |

## Decisions

### 1. Hero Section Placement

**Decision**: Add hero section inside `StakeScreen` component, above the existing grid.

**Rationale**: The hero is specific to the stake page, so it belongs in the screen layer. No need for a separate widget since it won't be reused on other pages.

### 2. Pill Badge Implementation

**Decision**: Hand-code simple `<span>` elements with border and rounded-full styling, no shadcn Badge dependency.

**Alternatives considered:**

- shadcn `Badge` component: Would need to `npx shadcn@latest add badge` — overkill for 3 static text pills
- Custom shared component: Not reused elsewhere yet, YAGNI

**Rationale**: Three static pills don't justify adding a new dependency. Simple spans with Tailwind classes are sufficient.

### 3. Typography Implementation

**Decision**: Use Tailwind utility classes with custom values for the specific design specs.

Title: `text-[30px] font-semibold leading-[36px] tracking-[-0.75%] text-primary text-center`
Pills: `text-sm leading-5 text-secondary-foreground`

### 4. Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│                     Hero Section                         │
│                                                          │
│    "Every CUSD is backed by real assets in Treasury"     │
│                                                          │
│         [1:1 Backed] [On Base] [Fully On-chain]          │
│                                                          │
├──────────────────────────────────┬───────────────────────┤
│       TVL Chart (8 cols)         │  Stake Panel (4 cols) │
│       (existing widget)          │  (coming soon)        │
└──────────────────────────────────┴───────────────────────┘
```

Responsive (mobile < lg):

```
┌──────────────────────┐
│     Hero Section     │
│                      │
│   "Every CUSD..."    │
│                      │
│ [1:1] [On Base] [...] │
│                      │
├──────────────────────┤
│    TVL Chart         │
│    (full width)      │
├──────────────────────┤
│    Stake Panel       │
│    (coming soon)     │
└──────────────────────┘
```

### 5. Component Structure (FSD)

Only the screen component changes — no new widgets or features needed:

```
screens/stake/
├── ui/
│   └── stake-screen.tsx    # Updated: add hero section + pills above grid
└── index.ts                # No change
```

## Migration Plan

No migration — this is an update to an existing stub page. The changes are additive (new hero section) and non-breaking (existing grid layout preserved).
