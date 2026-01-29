# Discovery: Footer Widget

## 1. Feature Summary

Create a minimal footer widget displaying centered copyright text ("© {year} All rights reserved") with a dynamic year. References the simple footer pattern from `cyberk-dev/vibe_amb_fe` boilerplate.

## 2. Architecture Snapshot

### Relevant Packages

| Package | Purpose | Key Files |
| --- | --- | --- |
| `apps/web` | Next.js frontend | `src/widgets/layout/` |

### Entry Points

- UI: `apps/web/src/widgets/layout/ui/footer.tsx`
- Export: `apps/web/src/widgets/layout/index.ts`

## 3. Existing Patterns

### Similar Implementations

| Feature | Location | Pattern Used |
| --- | --- | --- |
| Header widget | `widgets/layout/ui/header.tsx` | Client component, `cn()` utility, sticky layout, CyberkLogoFull |
| Header nav config | `widgets/layout/config/navigation.ts` | Typed config with NavItem type |
| Boilerplate footer | `cyberk-dev/vibe_amb_fe` | `FooterProps` interface, `cn()`, shadcn tokens |

### Reusable Utilities

- `cn()` from `@/shared/lib/utils` for class merging

## 4. Technical Constraints

- Must follow FSD import rules (widgets can import from shared)
- Must use shadcn/ui design tokens (`bg-background`, `text-muted-foreground`, `border-border`)
- Server component (no interactivity)
- Must export from `widgets/layout/index.ts`

## 5. External References

- Boilerplate: `cyberk-dev/vibe_amb_fe` - `src/widgets/layout/ui/footer.tsx`

## 6. Gap Analysis

| Component | Have | Need | Gap Size |
| --- | --- | --- | --- |
| Footer component | None | `footer.tsx` with copyright text | New |
| Layout export | Header only | Header + Footer | Small |

## 7. Open Questions

- [x] Should footer be server or client component? → Server component (no interactivity needed)
- [x] What sections should footer include? → Copyright only, with dynamic year
