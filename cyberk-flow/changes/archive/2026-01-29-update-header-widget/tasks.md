# Tasks: Update Header Widget

## 1. Foundation

- [x] 1.1 Create `shared/ui/logo.tsx` — inline SVG hexagonal logo (150px, currentColor)
- [x] 1.2 Create `widgets/layout/config/navigation.ts` — typed nav config (Mint, Stake, Dashboard, Profile)

## 2. Header Sub-Components

- [x] 2.1 Create `widgets/layout/ui/header-nav.tsx` — desktop nav with active state via `useSelectedLayoutSegment()`
- [x] 2.2 Create `widgets/layout/ui/settings-dropdown.tsx` — settings + theme toggle dropdown
- [x] 2.3 Create `widgets/layout/ui/share-button.tsx` — dark CTA button placeholder
- [x] 2.4 Restyle `widgets/layout/ui/user-menu.tsx` — compact pill format with truncated name

## 3. Mobile Navigation

- [x] 3.1 Add shadcn Sheet component
- [x] 3.2 Create `widgets/layout/ui/mobile-nav.tsx` — Sheet-based slide-in mobile menu

## 4. Header Assembly

- [x] 4.1 Rewrite `widgets/layout/ui/header.tsx` — assemble all sub-components, sticky positioning
- [x] 4.2 Update `widgets/layout` barrel exports
- [x] 4.3 Remove `widgets/layout/ui/mode-toggle.tsx`

## 5. Route Cleanup

- [x] 5.1 Remove `/ai`, `/dashboard`, `/login` routes and their screen components
- [x] 5.2 Add empty pages: `/mint`, `/stake`, `/profile`

## 6. Verification

- [x] 6.1 Run `bun run check-types` — no errors
- [x] 6.2 Run `bun run check` — biome passes
- [x] 6.3 Visual check — header matches example-header.svg
