# Discovery: Update Stake Page

## 1. Feature Summary

Update the `/stake` page to match the design: add a hero section with title + pill badges above the existing TVL chart + coming-soon stake panel grid layout.

## 2. Architecture Snapshot

### Relevant Packages

| Package | Purpose | Key Files |
| --- | --- | --- |
| `apps/web` | Next.js frontend | `src/app/stake/page.tsx` |
| `apps/web` | Stake screen | `src/screens/stake/ui/stake-screen.tsx` |
| `apps/web` | TVL chart widget | `src/widgets/tvl-chart/` (already built) |
| `apps/web` | Layout widgets | `src/widgets/layout/` (header, footer) |
| `apps/web` | Shared UI | `src/shared/shadcn/` (card, button, etc.) |

### Entry Points

- Route: `apps/web/src/app/stake/page.tsx` → renders `<StakeScreen />`
- Screen: `apps/web/src/screens/stake/ui/stake-screen.tsx` → composes TVL chart + placeholder panel

## 3. Existing Patterns

### Similar Implementations

| Feature | Location | Pattern Used |
| --- | --- | --- |
| TVL chart widget | `widgets/tvl-chart/` | FSD widget with `ui/`, `lib/`, barrel `index.ts` |
| Layout header/footer | `widgets/layout/` | FSD widget with `ui/`, `config/` |
| Stake screen | `screens/stake/` | FSD screen composing widgets |

### Reusable Utilities

- `cn()` from `@/shared/lib/utils` for className merging
- shadcn `Card` components at `@/shared/shadcn/card`
- Theme CSS variables: `--primary`, `--muted-foreground`, `--border`, etc.
- Font: Inter Variable (already configured in `index.css`)

## 4. Technical Constraints

- No `Badge` shadcn component exists yet — need to add or hand-code pills
- Title style is custom (30px, semibold, -0.75% letter-spacing) — not a standard Tailwind class
- Pill text style is custom (14px, regular, secondary color)
- Stake module on the right is "coming soon" — keep placeholder
- Ignore "Customize" button on bottom right
- Must be responsive (mobile stacks to single column)

## 5. External References

- Design: attached screenshot showing hero + pills + chart + stake panel
- Existing TVL chart design doc: `openspec/changes/archive/2026-01-29-add-tvl-chart-widget/design.md`

## 6. Gap Analysis

| Component | Have | Need | Gap Size |
| --- | --- | --- | --- |
| Hero title section | None | "Every CUSD is backed..." with custom typography | New |
| Pill badges | None | "1:1 Backed", "On Base", "Fully On-chain" | New |
| TVL chart | Full widget | Already built | None |
| Stake panel | Basic placeholder | "Coming soon" placeholder (keep as-is) | None |
| Page layout | Grid only | Hero section above grid | Small |
| Responsive | Grid stacks on mobile | Hero + pills must also be responsive | Small |

## 7. Open Questions

- [x] Badge component: hand-code simple pill spans (no need for full shadcn badge)
- [x] Stake panel: keep existing "coming soon" placeholder
- [x] Customize button: ignore per requirements
