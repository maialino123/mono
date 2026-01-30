# Tasks: Add Custom Theme Widget (UI Only)

## 1. Foundation — shadcn Components & Config

- [ ] 1.1 Add shadcn Accordion component (`shared/shadcn/accordion.tsx`)
- [ ] 1.2 Add shadcn Slider component (`shared/shadcn/slider.tsx`)
- [ ] 1.3 Add shadcn RadioGroup component (`shared/shadcn/radio-group.tsx`)
- [ ] 1.4 Create theme defaults config (`widgets/custom-theme/config/theme-defaults.ts`) — default colors, font list, radius
- [ ] 1.5 Create color-to-CSS-variable mapping config (`widgets/custom-theme/config/color-mappings.ts`)

## 2. UI Components — Atomic Building Blocks

- [ ] 2.1 Create `ColorInput` component (`widgets/custom-theme/ui/color-input.tsx`) — color swatch + hex input (static, no debounce logic)
- [ ] 2.2 Create `ColorGroup` component (`widgets/custom-theme/ui/color-group.tsx`) — accordion wrapper for color section
- [ ] 2.3 Create `ColorPresetBar` component (`widgets/custom-theme/ui/color-preset-bar.tsx`) — quick palette buttons
- [ ] 2.4 Create `AppearanceSection` component (`widgets/custom-theme/ui/appearance-section.tsx`) — RadioGroup: Light/Dark/System
- [ ] 2.5 Create `FontSection` component (`widgets/custom-theme/ui/font-section.tsx`) — font dropdown + text input
- [ ] 2.6 Create `RadiusSection` component (`widgets/custom-theme/ui/radius-section.tsx`) — slider + px display

## 3. Panel Assembly — Composed Widget

- [ ] 3.1 Create `ColorSection` component (`widgets/custom-theme/ui/color-section.tsx`) — composes ColorPresetBar + ColorGroups
- [ ] 3.2 Create `CustomThemePanel` component (`widgets/custom-theme/ui/custom-theme-panel.tsx`) — Sheet with all sections + footer
- [ ] 3.3 Create `CustomThemeTrigger` component (`widgets/custom-theme/ui/custom-theme-trigger.tsx`) — fixed bottom-right button that opens panel
- [ ] 3.4 Create widget barrel export (`widgets/custom-theme/index.ts`)
- [ ] 3.5 Add trigger + panel to `apps/web/src/app/layout.tsx` inside Providers

## 4. Verification

- [ ] 4.1 Run `bun run check-types` and `bun run check` — fix all errors
