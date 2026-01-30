# Change: Add Custom Theme Widget

## Why

Users need to customize the application's visual branding in real-time — including appearance mode, fonts, border radius, and a comprehensive color system (brand, neutral/layout, text, status colors). This enables white-label customization and improves user experience by letting users personalize the interface.

## What Changes

- Add `widgets/custom-theme/` FSD widget with side panel UI
- Add floating trigger button (bottom-right, fixed position)
- Add `CustomThemeProvider` context for theme state management
- Add real-time CSS variable override system
- Add localStorage persistence for custom theme settings
- Add shadcn components: Accordion, Slider, RadioGroup
- Add `ColorInput` component (native color picker + hex text input)
- Integrate with existing next-themes for appearance mode (Light/Dark/System)
- Add font selection with Google Fonts support
- Add layout radius slider (0-24px)
- Add organized color sections: Core Brand, Neutral/Layout, Text, Status
- Add color preset palettes for quick switching
- Add "Save Theme" and "Preview auto-updates" footer actions
- Wire trigger + panel into `apps/web/src/app/layout.tsx`

## Impact

- Affected specs: `web-fsd-architecture` (new widget)
- Affected code:
  - `apps/web/src/widgets/custom-theme/` (new)
  - `apps/web/src/shared/providers/providers.tsx` (add CustomThemeProvider)
  - `apps/web/src/shared/shadcn/` (add accordion, slider, radio-group)
  - `apps/web/src/app/layout.tsx` (add trigger button)
  - `apps/web/src/index.css` (may add custom status color variables)
