# Design: Custom Theme Widget

## Context

Users need to customize the application's visual appearance in real-time. This is a branding/white-label feature that allows configuring appearance mode, fonts, border radius, and colors organized by purpose (brand, neutral, text, status). The design follows patterns from shadcn-studio's customizer and the cyberk-next-boilerplate.

## Goals / Non-Goals

- **Goals**:
  - Side panel triggered by a fixed bottom-right button
  - Real-time CSS variable updates on theme changes
  - Organized color sections: Core Brand, Neutral/Layout, Text, Status
  - Appearance mode (Light/Dark/System) via next-themes
  - Font selection from curated list + Google Fonts support
  - Layout radius slider with live preview
  - Color picker with hex input + native color picker
  - Persist customizations to localStorage
  - "Save Theme" and "Preview auto-updates" actions

- **Non-Goals**:
  - Server-side theme storage (future)
  - Theme export/import as CSS file (future)
  - Custom shadow configuration (future)
  - Per-page theme overrides

## Risk Map

| Component | Risk | Rationale | Verification |
| --- | --- | --- | --- |
| Sheet side panel | LOW | Existing Sheet component | N/A |
| Appearance toggle | LOW | Existing next-themes integration | N/A |
| Color picker input | LOW | Native HTML5 `<input type="color">` + hex text | N/A |
| Accordion sections | MEDIUM | Need to add shadcn accordion component | Test with base-ui collapsible |
| Slider component | MEDIUM | Need to add shadcn slider component | Test with base-ui slider |
| CSS variable override | MEDIUM | Dynamic style injection on `<html>` | Verify oklch/hex conversion |
| Font loading (Google Fonts) | MEDIUM | Dynamic `<link>` injection, no SSR fonts | Test font swap behavior |
| Theme persistence | LOW | localStorage read/write | N/A |

## Architecture Decisions

### Decision 1: FSD Placement

**Widget**: `widgets/custom-theme/` — contains the full panel UI, trigger button, and theme logic.

**Rationale**: This is a self-contained UI block composed of multiple features. In FSD, widgets compose features and entities.

### Decision 2: State Management

**Approach**: React Context (`CustomThemeProvider`) + localStorage persistence.

```
CustomThemeProvider
├── themeConfig state (colors, font, radius)
├── updateColor(key, value)
├── updateFont(fontName)
├── updateRadius(value)
├── saveTheme()
├── resetTheme()
└── useEffect → apply CSS variables to document.documentElement
```

**Rationale**: Follows shadcn-studio pattern. Context provides reactive updates; localStorage provides persistence across sessions. next-themes handles appearance mode separately.

### Decision 3: Color Format

**Input**: Hex format (`#2563EB`) for user-facing inputs.
**Storage**: Hex in localStorage, converted to CSS variables at runtime.
**CSS Override**: Apply hex directly to CSS custom properties (browsers handle both oklch and hex).

**Rationale**: Hex is universally understood by users and supported by HTML5 color picker. The CSS variables accept any valid color value.

### Decision 4: Component Dependencies (shadcn)

New shadcn components to add:
- **Accordion** — for collapsible color sections
- **Slider** — for radius control
- **RadioGroup** — for appearance mode toggle

Reuse existing: Sheet, Button, Input, Label, Card, Separator

### Decision 5: Color Sections Structure

Based on the reference UI screenshots:

```
Color
├── [Preset swatches: Dark Blue, Gray, Green-Yellow, Red-Orange]
├── Core Brand Colors
│   ├── Primary (#2563EB)
│   └── Secondary (#FFFFFF)
├── Neutral / Layout Colors
│   ├── App Background (#0F0F0F)
│   ├── Card Background (#171717)
│   └── Secondary Card (#212121)
├── Text Colors
│   ├── Primary Text (#FFFFFF)
│   ├── Secondary Text (#E2E2E2)
│   ├── Muted / Hint (#A1A1A1)
│   └── Inverse Text (#111111)
└── Status Colors
    ├── Success (#16A34A)
    ├── Warning (#F59E0B)
    ├── Error (#DC2626)
    └── Info (#0EA5E9)
```

### Decision 6: Trigger Button

Fixed position button at bottom-right corner (`fixed bottom-6 right-6 z-40`). Uses a palette/paintbrush icon. Only visible when the panel is closed.

### Decision 7: Panel Layout

```
Sheet (right side, ~350px width)
├── Header: "Customize Your Brand" + Close button
├── Scrollable content:
│   ├── Appearance section (RadioGroup: Light/Dark/System)
│   ├── Font section (collapsible: dropdown + text input)
│   ├── Layout Radius section (collapsible: slider 0-24px)
│   ├── Color section
│   │   ├── Preset color palette buttons
│   │   └── Accordion groups (Brand, Neutral, Text, Status)
│   │       └── Each: Label + ColorInput (swatch + hex text)
├── Footer: "Preview auto-updates" link + "Save Theme" button
```

## Component Tree

```
<CustomThemeProvider>                    # Context provider (in Providers)
  <CustomThemeTrigger />                 # Fixed bottom-right button
  <CustomThemePanel />                   # Sheet side panel
    <AppearanceSection />                # Light/Dark/System radio
    <FontSection />                      # Font dropdown + input
    <RadiusSection />                    # Slider + px display
    <ColorSection />                     # Color presets + accordion groups
      <ColorPresetBar />                 # Quick preset color palettes
      <ColorGroup title="Core Brand">   # Accordion item
        <ColorInput label="Primary" />   # Color swatch + hex input
        <ColorInput label="Secondary" />
      </ColorGroup>
      <ColorGroup title="Neutral / Layout Colors">
        <ColorInput label="App Background" />
        <ColorInput label="Card Background" />
        <ColorInput label="Secondary Card" />
      </ColorGroup>
      <ColorGroup title="Text Colors">
        <ColorInput label="Primary Text" />
        <ColorInput label="Secondary Text" />
        <ColorInput label="Muted / Hint" />
        <ColorInput label="Inverse Text" />
      </ColorGroup>
      <ColorGroup title="Status Colors">
        <ColorInput label="Success" />
        <ColorInput label="Warning" />
        <ColorInput label="Error" />
        <ColorInput label="Info" />
      </ColorGroup>
    <PanelFooter />                      # Preview toggle + Save button
</CustomThemeProvider>
```

## CSS Variable Mapping

| UI Label | CSS Variable | Section |
| --- | --- | --- |
| Primary | `--primary` | Core Brand |
| Secondary | `--secondary` | Core Brand |
| App Background | `--background` | Neutral/Layout |
| Card Background | `--card` | Neutral/Layout |
| Secondary Card | `--accent` | Neutral/Layout |
| Primary Text | `--foreground` | Text |
| Secondary Text | `--muted-foreground` | Text |
| Muted / Hint | `--muted` | Text |
| Inverse Text | `--primary-foreground` | Text |
| Success | `--chart-1` (or custom `--success`) | Status |
| Warning | `--chart-2` (or custom `--warning`) | Status |
| Error | `--destructive` | Status |
| Info | `--chart-3` (or custom `--info`) | Status |

## File Structure

```
apps/web/src/widgets/custom-theme/
├── index.ts                           # Public exports
├── config/
│   ├── theme-defaults.ts              # Default color values, font list
│   └── color-mappings.ts              # UI label → CSS variable mappings
├── lib/
│   ├── theme-context.tsx              # CustomThemeProvider + useCustomTheme
│   └── use-theme-persistence.ts       # localStorage read/write hook
├── ui/
│   ├── custom-theme-trigger.tsx       # Fixed bottom-right button
│   ├── custom-theme-panel.tsx         # Main Sheet panel
│   ├── appearance-section.tsx         # Light/Dark/System radio group
│   ├── font-section.tsx               # Font selector
│   ├── radius-section.tsx             # Radius slider
│   ├── color-section.tsx              # Color section with presets + groups
│   ├── color-group.tsx                # Accordion group wrapper
│   ├── color-input.tsx                # Color swatch + hex input
│   └── color-preset-bar.tsx           # Quick preset palette buttons
```

## Open Questions

- [ ] Should font changes persist via localStorage or cookies?
- [ ] Should we support Google Fonts dynamically or a curated list?
- [ ] Should "Save Theme" export CSS or save to localStorage?
