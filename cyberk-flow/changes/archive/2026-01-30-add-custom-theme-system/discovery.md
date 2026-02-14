# Discovery: Custom Theme System

## 1. Feature Summary

Implement a runtime custom theme system that allows users to customize appearance (light/dark/system), font family, layout border radius, and color palette. Theme settings persist in localStorage and apply via CSS custom properties, inspired by shadcn/ui studio's theming approach.

## 2. Architecture Snapshot

### Relevant Packages

| Package | Purpose | Key Files |
| --- | --- | --- |
| `apps/web` | Next.js frontend | `src/index.css`, `src/shared/providers/`, `src/widgets/custom-theme-menu/` |
| `shared/providers` | Theme providers | `custom-theme-provider.tsx`, `theme-provider.tsx`, `providers.tsx` |
| `widgets/custom-theme-menu` | Theme configurator UI | `ui/custom-theme-menu.tsx`, `ui/color-config.tsx`, `ui/font-select.tsx`, `ui/layout-radius-select.tsx`, `ui/appearance-select.tsx` |

### Entry Points

- **Provider**: `CustomThemeProvider` wraps the app in `providers.tsx`
- **UI**: `CustomThemeMenu` widget (Sheet sidebar panel)
- **CSS**: `index.css` defines CSS custom properties for `:root` and `.dark`

## 3. Existing Patterns

### Similar Implementations

| Feature | Location | Pattern Used |
| --- | --- | --- |
| Dark/Light mode | `theme-provider.tsx` | `next-themes` with `attribute="class"` |
| Appearance toggle | `appearance-select.tsx` | `useTheme()` from next-themes (functional) |
| Font select | `font-select.tsx` | Combobox with portal dropdown (UI only, no state persistence) |
| Radius select | `layout-radius-select.tsx` | Slider component (UI only, no state persistence) |
| Color config | `color-config.tsx` | Accordion sections with hex inputs (UI only, no state persistence) |
| Color picker | `color-picker.tsx` | Simple hex input component (unused in color-config) |

### Reusable Utilities

- `cn()` from `@/shared/lib` for className merging
- `next-themes` already integrated for dark/light/system mode
- shadcn/ui components: Sheet, Accordion, Slider, Input, Button
- CSS variables already defined in `index.css` using OKLCH color space

## 4. Technical Constraints

- **CSS Variables**: Current theme uses OKLCH color space (`oklch(0.205 0 0)`) — user color inputs are hex, need conversion or separate variable layer
- **next-themes**: Already handles `class` attribute for dark mode — custom theme must coexist
- **Tailwind 4**: Uses `@theme inline` for CSS variable mapping — runtime overrides via `document.documentElement.style.setProperty()` will work
- **SSR/Hydration**: Must use `useLayoutEffect` or script injection to avoid flash of unstyled content
- **Google Fonts**: Font loading requires dynamic `<link>` injection or Next.js font optimization

## 5. External References

- shadcn/ui studio: Uses `buildRegistryTheme()` to merge base + theme CSS vars, applies via `useLayoutEffect` with dynamic `<style>` element
- shadcn/ui studio uses OKLCH color space and `nuqs` for URL-based persistence
- next-themes: Industry standard for Next.js dark/light mode

## 6. Gap Analysis

| Component | Have | Need | Gap Size |
| --- | --- | --- | --- |
| Theme config model | None | Typed config with defaults for colors/font/radius | New |
| Provider state | `isOpen` toggle only | Full theme state (colors, font, radius) + localStorage persistence | Large |
| CSS variable application | Static CSS only | Runtime CSS variable overrides via DOM | Medium |
| Appearance select | Functional (next-themes) | Already working | None |
| Font select | UI shell only | Connect to provider, load Google Fonts dynamically | Medium |
| Radius select | UI shell only | Connect to provider, update `--radius` CSS var | Small |
| Color config | UI shell only | Connect to provider, color picker popup, live preview | Medium |
| Color picker popup | Basic hex input exists | Native color picker + hex input combo | Small |
| localStorage persistence | None | Load on mount, save on change | Small |
| Hydration safety | None | Apply theme before paint to prevent FOUC | Medium |

## 7. Open Questions

- [x] Color format: Use hex for user input, convert to OKLCH for CSS vars? → **Decision: Use hex for custom overrides, apply as inline style overrides on `:root`. The base OKLCH vars in CSS remain as defaults.**
- [x] Font loading strategy: Dynamic `<link>` tag injection for Google Fonts? → **Decision: Yes, inject `<link>` tags dynamically. Next.js font optimization only works at build time.**
- [x] Scope: Per-user theme only (localStorage) or also shareable? → **Decision: localStorage only for now. URL-based sharing can be added later.**
