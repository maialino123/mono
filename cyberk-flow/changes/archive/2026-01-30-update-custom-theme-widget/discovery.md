# Discovery: Update Custom Theme Widget

## 1. Feature Summary

Redesign the custom theme menu to match shadcn-studio's Theme Generator UI. Replace the current accordion layout with a tabbed interface (Colors, Typography, Other), add mode toggle (light/dark), and place save/reset buttons at the bottom row. Add letter spacing control to typography and spacing control to "Other" tab.

## 2. Architecture Snapshot

### Relevant Packages

| Package | Purpose | Key Files |
| --- | --- | --- |
| `apps/web` | Next.js frontend | `src/widgets/custom-theme-menu/ui/*`, `src/shared/providers/custom-theme-provider.tsx`, `src/shared/providers/theme-config.ts` |

### Entry Points

- UI: `apps/web/src/widgets/custom-theme-menu/ui/custom-theme-menu.tsx` (main widget)
- State: `apps/web/src/shared/providers/custom-theme-provider.tsx` (context + hooks)
- Config: `apps/web/src/shared/providers/theme-config.ts` (types + defaults)

### Reference: shadcn-studio Components

| Component | Location | Purpose |
| --- | --- | --- |
| `ThemeControlPanel` | `src/components/customizer/ThemeControlPanel.tsx` | Main panel with Tabs (Colors/Typography/Other), mode toggle, save/reset |
| `ThemeColorPanel` | `src/components/customizer/ThemeColorPanel.tsx` | Color accordion with ColorSwatch rows |
| `SliderWithInput` | `src/components/customizer/SliderWithInput.tsx` | Combined slider + number input for radius, spacing, letter-spacing |
| `ThemeFontSelect` | `src/components/customizer/ThemeFontSelect.tsx` | Font family selector with preview |
| `HoldToSaveTheme` | `src/components/customizer/HoldToSaveTheme.tsx` | Hold-to-save button (we use simple save button instead) |

## 3. Existing Patterns

### Similar Implementations

| Feature | Location | Pattern Used |
| --- | --- | --- |
| Accordion layout | `custom-theme-menu.tsx` | shadcn Accordion with CustomAccordionItem |
| Color editing | `color-config.tsx` | ColorInput with hex input + native picker + collapsible sections |
| Font select | `font-select.tsx` | Custom combobox with Google Fonts + portal dropdown |
| Radius slider | `layout-radius-select.tsx` | shadcn Slider component |
| Appearance toggle | `appearance-select.tsx` | Radio buttons (dark/light/system) |
| Theme state | `custom-theme-provider.tsx` | React context + localStorage persistence |

### Reusable Utilities

- `useCustomTheme()` hook for all theme state management
- `cn()` utility for class merging
- shadcn components: `Tabs`, `Slider`, `Button`, `Input`, `Label`, `Accordion`

## 4. Technical Constraints

- Must keep `useCustomTheme` context API backward-compatible
- Letter spacing and spacing are new properties needing addition to `ThemeConfig`
- All existing shadcn components (Tabs, Slider, Button, etc.) are already available
- Google Fonts integration already exists in the provider

## 5. External References

- shadcn-studio repo: `github.com/shadcnstudio/shadcn-studio` (UI reference)
- shadcn/ui v4 repo: `github.com/shadcn-ui/ui` (component patterns)

## 6. Gap Analysis

| Component | Have | Need | Gap Size |
| --- | --- | --- | --- |
| Tab layout | Accordion layout | Tabs (Colors/Typography/Other) | Medium - restructure |
| Mode toggle | Radio buttons (dark/light/system) | Light/Dark toggle buttons (shadcn-studio style) | Small - restyle |
| Color tab | Color sections with accordion | Same - keep current color logic | None |
| Font select | Google Fonts combobox | Same - keep current logic | None |
| Letter spacing | None | SliderWithInput (-0.25em to 0.25em) | New |
| Spacing | None | SliderWithInput (0.15rem to 0.35rem) | New |
| Radius | Slider only | SliderWithInput (slider + number input) | Small - enhance |
| Save button | None | Button at bottom row | New |
| Reset button | `resetToDefaults()` exists in provider | Button at bottom row | Small - add UI |
| SliderWithInput | None | Combined slider + input component | New component |

## 7. Open Questions

- [x] Should mode toggle include "system" option? → Only light/dark per spec
- [x] Where to place save/reset buttons? → Bottom of menu, same row
- [x] Should letter-spacing apply to both modes? → Yes, like shadcn-studio's `updateBothThemes`
