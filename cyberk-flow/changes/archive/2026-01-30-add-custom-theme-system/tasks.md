# Tasks: Add Custom Theme System

## 1. Theme Config Model

- [x] 1.1 Create `ThemeConfig` and `ColorPalette` TypeScript interfaces
- [x] 1.2 Define `DEFAULT_THEME_CONFIG` with default values matching current `index.css`
- [x] 1.3 Define `COLOR_KEY_TO_CSS_VAR` mapping (config key → CSS variable name)
- [x] 1.4 Define `STORAGE_KEY` constant (`"custom-theme"`)

## 2. Rewrite CustomThemeProvider

- [x] 2.1 Add `ThemeConfig` state initialized from localStorage (fallback to defaults)
- [x] 2.2 Implement `updateAppearance(appearance)` — update config + delegate to `next-themes` `setTheme()`
- [x] 2.3 Implement `updateFont(font)` — update config + set `--font-sans` CSS var + inject Google Fonts `<link>`
- [x] 2.4 Implement `updateRadius(radius)` — update config + set `--radius` CSS var
- [x] 2.5 Implement `updateColor(mode, key, value)` — update config color for the given mode
- [x] 2.6 Implement `resetToDefaults()` — restore `DEFAULT_THEME_CONFIG` + clear localStorage + remove CSS overrides
- [x] 2.7 Add `useLayoutEffect` to apply all CSS variable overrides from config on mount and config changes
- [x] 2.8 Add `useEffect` to persist config to localStorage on every config change
- [x] 2.9 Keep existing `isOpen/open/close/toggle` for the Sheet panel state

## 3. Wire Appearance Select

- [x] 3.1 Update `AppearanceSelect` to call `updateAppearance()` from provider instead of directly calling `setTheme()`
- [x] 3.2 Read current appearance from `config.appearance` instead of `useTheme().theme`

## 4. Wire Font Select

- [x] 4.1 Update `FontSelect` to read current font from `config.font`
- [x] 4.2 Call `updateFont()` from provider on font selection
- [x] 4.3 Implement Google Fonts `<link>` injection in provider's font update logic

## 5. Wire Layout Radius Select

- [x] 5.1 Update `LayoutRadiusSelect` to read current radius from `config.radius`
- [x] 5.2 Call `updateRadius()` from provider on slider change
- [x] 5.3 Display current radius value in px

## 6. Wire Color Config + Color Picker Popup

- [x] 6.1 Update `ColorConfig` to read colors from `config.colors[currentMode]`
- [x] 6.2 Call `updateColor()` from provider on color input change
- [x] 6.3 Add native `<input type="color">` button alongside hex input in each color row
- [x] 6.4 Sync native picker value ↔ hex input value bidirectionally
- [x] 6.5 Update `ColorSwatches` to display actual current colors from config

## 7. Update CustomThemeMenu

- [x] 7.1 Display current config values in accordion headers (font name, radius px, appearance mode)
- [x] 7.2 Ensure Sheet open/close state uses provider's `isOpen/toggle`

## 8. Verification

- [x] 8.1 Run `bun run check-types` — no TypeScript errors
- [x] 8.2 Run `bun run check` — no lint errors
- [ ] 8.3 Manual test: change appearance → persists across refresh
- [ ] 8.4 Manual test: change font → loads Google Font, persists across refresh
- [ ] 8.5 Manual test: change radius → updates all rounded elements, persists across refresh
- [ ] 8.6 Manual test: change colors → updates live, persists across refresh
- [ ] 8.7 Manual test: reset to defaults → clears all customizations
