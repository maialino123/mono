# Tasks: Update Custom Theme Widget

## 1. Extend Theme Config & Provider

- [x] 1.1 Add `letterSpacing: number` and `spacing: number` to `ThemeConfig` in `theme-config.ts`
- [x] 1.2 Add defaults: `letterSpacing: 0`, `spacing: 0.25` to `DEFAULT_THEME_CONFIG`
- [x] 1.3 Add `updateLetterSpacing` and `updateSpacing` functions to `CustomThemeProvider`
- [x] 1.4 Update `applyThemeToDOM` to set `--letter-spacing` and `--spacing` CSS variables
- [x] 1.5 Update `removeThemeFromDOM` to remove the new CSS variables
- [x] 1.6 Handle backward-compatible loading (existing localStorage without new fields)

## 2. Create SliderWithInput Component

- [x] 2.1 Create `apps/web/src/widgets/custom-theme-menu/ui/slider-with-input.tsx`
- [x] 2.2 Implement: label (left) + input with unit (right) + slider (below), matching shadcn-studio's pattern
- [x] 2.3 Props: `value`, `onChange`, `min`, `max`, `step`, `unit`, `label`

## 3. Create New Tab Content Components

- [x] 3.1 Create `letter-spacing-select.tsx` using SliderWithInput (min: -0.25, max: 0.25, step: 0.025, unit: em)
- [x] 3.2 Create `spacing-select.tsx` using SliderWithInput (min: 0.15, max: 0.35, step: 0.01, unit: rem)
- [x] 3.3 Update `layout-radius-select.tsx` to use SliderWithInput instead of plain Slider

## 4. Redesign Mode Toggle

- [x] 4.1 Update `appearance-select.tsx` to Light/Dark segmented toggle buttons (remove system option from toggle)

## 5. Restructure Main Menu Layout

- [x] 5.1 Replace Accordion with Tabs (Colors, Typography, Other) in `custom-theme-menu.tsx`
- [x] 5.2 Colors tab: render existing `ColorConfig` component
- [x] 5.3 Typography tab: render `FontSelect` + `LetterSpacingSelect`
- [x] 5.4 Other tab: render `LayoutRadiusSelect` + `SpacingSelect`
- [x] 5.5 Place Mode toggle above tabs
- [x] 5.6 Place Save Theme + Reset to Default buttons in a row at the bottom

## 6. Verify

- [x] 6.1 Run `bun run check-types` — passed
- [x] 6.2 Run `bun run check` — passed (2 pre-existing infos only)
- [x] 6.3 Visual review: pending manual check
