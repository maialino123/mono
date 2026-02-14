# Discovery: Custom Theme Widget

## 1. Feature Summary

A side-panel widget that allows users to customize the application's visual theme in real-time, including appearance mode (light/dark/system), font selection, border radius, and comprehensive color customization (brand, neutral/layout, text, status colors). Triggered by a floating button at the bottom-right of the screen.

## 2. Architecture Snapshot

### Relevant Packages

| Package | Purpose | Key Files |
| --- | --- | --- |
| `apps/web/src/widgets/` | FSD widgets layer | `layout/ui/settings-dropdown.tsx` (existing theme toggle) |
| `apps/web/src/shared/shadcn/` | shadcn UI components | `sheet.tsx`, `button.tsx`, `input.tsx`, `label.tsx`, `tabs.tsx`, `card.tsx`, `separator.tsx` |
| `apps/web/src/shared/providers/` | App providers | `theme-provider.tsx` (next-themes), `providers.tsx` |
| `apps/web/src/index.css` | CSS variables | `:root` and `.dark` theme tokens |

### Entry Points

- UI: `apps/web/src/app/layout.tsx` (renders `<Providers>`, `<Header>`, `<Footer>`)
- Theme Provider: `apps/web/src/shared/providers/theme-provider.tsx` (next-themes wrapper)
- CSS Variables: `apps/web/src/index.css` (oklch-based color tokens)

## 3. Existing Patterns

### Similar Implementations

| Feature | Location | Pattern Used |
| --- | --- | --- |
| Theme toggle (light/dark/system) | `widgets/layout/ui/settings-dropdown.tsx` | `useTheme()` from next-themes |
| Sheet side panel | `shared/shadcn/sheet.tsx` | base-ui Dialog primitive |
| Providers wrapper | `shared/providers/providers.tsx` | React context composition |

### Reusable Utilities

- `cn()` utility from `shared/lib/utils.ts`
- next-themes `useTheme()` for appearance mode
- Sheet component for side panel
- Existing CSS variable structure with oklch colors

## 4. Technical Constraints

- **CSS Variables**: Currently using oklch color format in `:root` and `.dark`
- **next-themes**: Already installed and configured for class-based dark mode
- **shadcn/ui**: Using base-ui primitives (not radix), TailwindCSS v4 with `@theme inline`
- **FSD Architecture**: Widget must follow FSD layer rules (widgets can import from shared)
- **No Accordion/Slider/RadioGroup**: These shadcn components need to be added
- **No color picker**: Need HTML5 native `<input type="color">` or a library

## 5. External References

- **shadcn-studio customizer**: [github.com/shadcnstudio/shadcn-studio/tree/main/src/components/customizer](https://github.com/shadcnstudio/shadcn-studio/tree/main/src/components/customizer)
  - Uses: debounced color inputs, accordion groups, slider+input combos
  - Pattern: Context + localStorage for persistence, CSS variable application on `<html>`
  - Key insight: Separate light/dark storage, sync common properties (font/radius)
- **next-themes docs**: For appearance mode integration
- **Google Fonts API**: For font selection support

## 6. Gap Analysis

| Component | Have | Need | Gap Size |
| --- | --- | --- | --- |
| Side panel (Sheet) | Sheet component | Trigger button + custom panel | Small |
| Appearance toggle | DropdownMenu toggle | RadioGroup (Light/Dark/System) | Small |
| Font selector | Geist font loaded | Font dropdown + Google Fonts loading | Medium |
| Radius slider | CSS `--radius` variable | Slider component + live preview | Medium |
| Color picker inputs | None | Color input with hex + native picker | Medium |
| Color sections (accordion) | None | Accordion component + grouped colors | Medium |
| Theme persistence | next-themes (mode only) | localStorage for all custom values | Medium |
| CSS variable override | Static CSS | Dynamic JS-driven CSS variable updates | Medium |
| Theme context/store | next-themes context | Extended theme context with colors/font/radius | Medium |

## 7. Open Questions

- [ ] Should font changes persist via localStorage or cookies?
- [ ] Should we support Google Fonts dynamically or a curated list?
- [ ] Should "Save Theme" export CSS or save to localStorage?
- [ ] Should the theme widget be available on all pages or only specific routes?
- [ ] Need to decide on color format for user input: hex (user-friendly) vs oklch (current CSS)?
