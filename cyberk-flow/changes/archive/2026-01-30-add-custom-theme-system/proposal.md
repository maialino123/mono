# Change: Add Custom Theme System

## Why

The custom theme menu widget has UI shells for appearance, font, radius, and color selection but no actual state management, persistence, or CSS variable application. Users cannot customize the app's look and feel despite the UI being present.

## What Changes

- **Create theme config model** (`ThemeConfig`, `ColorPalette` types + default values) in `shared/providers/`
- **Rewrite `CustomThemeProvider`** to manage full theme state (appearance, font, radius, colors), persist to localStorage, and apply CSS variable overrides at runtime via `useLayoutEffect`
- **Wire `AppearanceSelect`** to provider's `updateAppearance` (delegates to next-themes)
- **Wire `FontSelect`** to provider's `updateFont` + dynamic Google Fonts `<link>` injection
- **Wire `LayoutRadiusSelect`** to provider's `updateRadius` + apply `--radius` CSS var
- **Wire `ColorConfig`** to provider's `updateColor` + add native `<input type="color">` popup alongside hex input
- **Update `CustomThemeMenu`** to display current config values in accordion headers
- **Load theme from localStorage on app start**; use defaults if absent

## Impact

- Affected specs: None (new capability)
- Affected code:
  - `apps/web/src/shared/providers/custom-theme-provider.tsx` (rewrite)
  - `apps/web/src/widgets/custom-theme-menu/ui/custom-theme-menu.tsx` (wire to provider)
  - `apps/web/src/widgets/custom-theme-menu/ui/appearance-select.tsx` (wire to provider)
  - `apps/web/src/widgets/custom-theme-menu/ui/font-select.tsx` (wire to provider)
  - `apps/web/src/widgets/custom-theme-menu/ui/layout-radius-select.tsx` (wire to provider)
  - `apps/web/src/widgets/custom-theme-menu/ui/color-config.tsx` (wire + color picker popup)
  - `apps/web/src/widgets/custom-theme-menu/ui/color-picker.tsx` (enhance with native picker)
