# Change: Update Header Widget

## Why

The current header was a minimal prototype. Redesigned to match example-header.svg with branding, active nav states, settings dropdown, share action, and user info.

## What Changes

- Redesigned `widgets/layout/ui/header.tsx` to match example-header.svg
- Added `shared/ui/logo.tsx` — CyberK hexagonal logo as inline SVG (150px wide)
- Added `widgets/layout/config/navigation.ts` — typed nav config (Mint, Stake, Dashboard, Profile)
- Added `widgets/layout/ui/header-nav.tsx` — desktop nav with active state via `useSelectedLayoutSegment()`
- Added `widgets/layout/ui/settings-dropdown.tsx` — settings + theme toggle dropdown
- Added `widgets/layout/ui/share-button.tsx` — dark CTA button placeholder
- Restyled `widgets/layout/ui/user-menu.tsx` — compact pill format with truncated name
- Added `widgets/layout/ui/mobile-nav.tsx` — Sheet-based slide-in mobile menu
- Removed `widgets/layout/ui/mode-toggle.tsx` — merged into settings-dropdown
- Added shadcn Sheet component
- Removed routes: `/ai`, `/dashboard`, `/login` and their screen components
- Added empty pages: `/mint`, `/stake`, `/dashboard`, `/profile`

## Impact

- Affected code: `widgets/layout/*`, `shared/ui/logo.tsx`, `shared/shadcn/sheet.tsx`, `app/*/page.tsx`
