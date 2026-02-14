# Design: Update Custom Theme Widget

## Context

Redesign the custom theme menu to follow shadcn-studio's Theme Generator layout pattern. The existing accordion-based approach will be replaced with a tab-based layout matching the reference UI.

## Goals / Non-Goals

- **Goals**: Tab layout (Colors/Typography/Other), mode toggle, letter spacing, spacing, save/reset buttons, SliderWithInput component
- **Non-Goals**: Theme import/export, random theme generation, theme presets, hold-to-save interaction, AI tab, contrast checker

## Risk Map

| Component | Risk | Rationale | Verification |
| --- | --- | --- | --- |
| Tab restructure | MEDIUM | Full UI restructure, but shadcn Tabs already available | Visual review |
| ThemeConfig extension | LOW | Adding 2 optional properties with defaults | Type check |
| SliderWithInput | LOW | Simple composition of existing Slider + Input | Visual review |
| Letter spacing CSS | LOW | Standard CSS property `letter-spacing` | Visual review |
| Spacing CSS | LOW | Standard CSS property via `--spacing` variable | Visual review |

## Decisions

### Layout Structure

Following shadcn-studio's `ThemeControlPanel`, the menu structure will be:

```
┌─────────────────────────────────┐
│ Sheet Header: "Theme Generator" │
├─────────────────────────────────┤
│ Mode: [Light] [Dark]            │
├─────────────────────────────────┤
│ [Colors] [Typography] [Other]   │ ← Tabs
├─────────────────────────────────┤
│                                 │
│ (Tab content area - scrollable) │
│                                 │
├─────────────────────────────────┤
│ [Save Theme]  [Reset to Default]│ ← Bottom row
└─────────────────────────────────┘
```

### SliderWithInput Component

Matches shadcn-studio's `SliderWithInput`:
- Label on left, input + unit on right
- Slider below spanning full width
- Props: `value`, `onChange`, `min`, `max`, `step`, `unit`, `label`

### ThemeConfig Extension

```typescript
interface ThemeConfig {
  appearance: "light" | "dark" | "system";
  font: string;
  radius: number;
  letterSpacing: number; // NEW: in em units, default 0
  spacing: number;       // NEW: in rem units, default 0.25
  colors: {
    light: ColorPalette;
    dark: ColorPalette;
  };
}
```

### Mode Toggle

Replace 3-option radio (dark/light/system) with 2-button toggle (Light/Dark) matching shadcn-studio's mode section. Uses segmented button style similar to the reference screenshot.

### CSS Variable Mapping

| Property | CSS Variable | Unit | Range |
| --- | --- | --- | --- |
| `letterSpacing` | `--letter-spacing` | em | -0.25 to 0.25 |
| `spacing` | `--spacing` | rem | 0.15 to 0.35 |

## Open Questions

- None remaining
