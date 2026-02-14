# Discovery: Update Header Widget

## 1. Feature Summary

Redesign the header widget to match example-header.svg with branding, navigation, settings, share action, and user info.

## 2. Architecture Snapshot

### Relevant Packages

| Package | Purpose | Key Files |
| --- | --- | --- |
| `widgets/layout` | Header widget and layout shell | `ui/header.tsx` |
| `shared/shadcn` | shadcn/ui primitives | `dropdown-menu.tsx`, `button.tsx` |
| `shared/ui` | Shared UI components | (new: `logo.tsx`) |

### Entry Points

- UI: `widgets/layout/ui/header.tsx` rendered in root layout

## 3. Existing Patterns

### Similar Implementations

| Feature | Location | Pattern Used |
| --- | --- | --- |
| Dropdown menus | `shared/shadcn/dropdown-menu.tsx` | shadcn DropdownMenu |
| Auth client | `shared/auth/authClient` | better-auth session hook |

### Reusable Utilities

- Validation: Zod schemas in `packages/env`
- Error handling: Standard React error boundaries

## 4. Technical Constraints

- Dependencies: shadcn/ui, next/navigation, better-auth
- Build Requirements: Bun + Turborepo
- Database: N/A (UI-only change)

## 5. External References

- Design: `example-header.svg` (1441×60px)

## 6. Gap Analysis (Synthesized)

| Component | Have | Need | Gap Size |
| --- | --- | --- | --- |
| Logo | None | SVG component (150px) | New |
| Navigation | None | Nav with active states | Medium |
| Settings dropdown | ModeToggle only | Full settings dropdown | Medium |
| Share button | None | Dark CTA button | New |
| User pill | Full user menu | Compact pill format | Medium |
| Mobile nav | None | Sheet-based slide-in | New |
| Sticky header | None | Sticky positioning | Small |

## 7. Open Questions

- [x] Logo format? → Inline SVG component with currentColor
- [x] Nav items when empty? → Empty array initially, config-driven
- [x] Share action behavior? → Placeholder modal for now
- [x] Mobile nav scope? → Includes all desktop actions
- [x] Wallet data source? → Web3 wallet (refactor later)
