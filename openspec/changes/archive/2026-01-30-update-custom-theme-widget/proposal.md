# Change: Update Custom Theme Widget

## Why

The current theme menu uses an accordion layout that doesn't scale well as more customization options are added. Redesigning it to match shadcn-studio's tabbed Theme Generator UI provides a cleaner, more organized experience with dedicated sections for colors, typography, and other settings.

## What Changes

- Replace accordion layout with **Tabs** (Colors, Typography, Other)
- Add **Mode toggle** (Light/Dark) at the top of the menu
- **Colors tab**: Keep existing color sections and logic as-is
- **Typography tab**: Font select (existing) + new letter spacing slider
- **Other tab**: Radius slider (enhanced with number input) + new spacing slider
- Add new **SliderWithInput** reusable component (slider + number input, like shadcn-studio)
- Add **Save Theme** and **Reset to Default** buttons on same row at the bottom
- Extend `ThemeConfig` with `letterSpacing` and `spacing` properties
- Update `CustomThemeProvider` with new update functions and DOM application logic

## Impact

- Affected specs: `specs/custom-theme/spec.md`
- Affected code:
  - `apps/web/src/shared/providers/theme-config.ts` (add letterSpacing, spacing)
  - `apps/web/src/shared/providers/custom-theme-provider.tsx` (add update functions)
  - `apps/web/src/widgets/custom-theme-menu/ui/custom-theme-menu.tsx` (full restructure)
  - `apps/web/src/widgets/custom-theme-menu/ui/appearance-select.tsx` (restyle to Light/Dark toggle)
  - `apps/web/src/widgets/custom-theme-menu/ui/layout-radius-select.tsx` (enhance with number input)
  - New: `apps/web/src/widgets/custom-theme-menu/ui/slider-with-input.tsx`
  - New: `apps/web/src/widgets/custom-theme-menu/ui/letter-spacing-select.tsx`
  - New: `apps/web/src/widgets/custom-theme-menu/ui/spacing-select.tsx`
