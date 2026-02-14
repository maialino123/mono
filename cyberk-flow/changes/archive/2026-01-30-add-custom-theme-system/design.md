# Design: Custom Theme System

## Context

The custom theme menu widget exists with UI shells for appearance, font, radius, and color selection — but none are wired to actual state or persistence. We need a theme config model, a provider with localStorage persistence, and runtime CSS variable application.

## Goals / Non-Goals

**Goals:**
- Define a typed theme config model (appearance, font, radius, colors per mode)
- Persist theme config to localStorage, load on app start
- Apply theme via CSS custom property overrides at runtime
- Wire all existing UI components to the provider
- Add a native color picker popup in the color config section
- Support light/dark/system appearance via next-themes integration

**Non-Goals:**
- Server-side theme persistence (database)
- URL-based theme sharing (nuqs)
- Custom OKLCH color input (use hex, convert if needed)
- Theme presets/templates
- Font preview rendering in the dropdown

## Risk Map

| Component | Risk | Rationale | Verification |
| --- | --- | --- | --- |
| Theme config model | LOW | Standard TypeScript types + defaults | Type check |
| Provider state | LOW | useState + useEffect pattern | Manual test |
| CSS variable overrides | LOW | `document.documentElement.style.setProperty` is well-supported | Manual test |
| Google Font loading | MEDIUM | Dynamic `<link>` injection, potential FOUT | Manual test with slow network |
| Hydration / FOUC | MEDIUM | Must apply theme before React paint | Test with SSR |
| Color format conversion | LOW | Hex input directly applied as CSS values | Unit test |

## Architecture

### Theme Config Model

```typescript
interface ThemeConfig {
  appearance: "light" | "dark" | "system";
  font: string;             // Google Font family name, default "Inter"
  radius: number;           // px value for --radius, default 10 (0.625rem)
  colors: {
    light: ColorPalette;
    dark: ColorPalette;
  };
}

interface ColorPalette {
  primary: string;          // hex
  secondary: string;
  background: string;       // app background
  card: string;             // card background
  secondaryCard: string;    // secondary card / muted
  primaryText: string;      // foreground
  secondaryText: string;    // muted-foreground
  mutedText: string;        // even lighter text
  inverseText: string;      // text on primary/dark backgrounds
  success: string;
  warning: string;
  error: string;            // destructive
  info: string;
}
```

### Color Mapping (Custom → CSS Variables)

| Config Key | CSS Variable | Description |
| --- | --- | --- |
| `primary` | `--primary` | Primary brand color |
| `secondary` | `--secondary` | Secondary brand color |
| `background` | `--background` | App background |
| `card` | `--card` | Card background |
| `secondaryCard` | `--muted` | Muted / secondary card |
| `primaryText` | `--foreground` | Primary text |
| `secondaryText` | `--muted-foreground` | Secondary text |
| `mutedText` | *(no direct var)* | Reserve for future |
| `inverseText` | `--primary-foreground` | Inverse text |
| `success` | `--chart-1` | Success status (reuse chart) |
| `warning` | `--chart-2` | Warning status |
| `error` | `--destructive` | Error / destructive |
| `info` | `--chart-3` | Info status |
| `font` | `--font-sans` | Font family |
| `radius` | `--radius` | Border radius base |

### Data Flow

```
User interaction → CustomThemeProvider state update
  → localStorage.setItem("custom-theme", JSON.stringify(config))
  → useLayoutEffect applies CSS vars to document.documentElement
  → appearance changes delegated to next-themes setTheme()
  → font changes inject/update Google Fonts <link> tag
```

### Provider API

```typescript
interface CustomThemeContextValue {
  config: ThemeConfig;
  updateAppearance: (appearance: ThemeConfig["appearance"]) => void;
  updateFont: (font: string) => void;
  updateRadius: (radius: number) => void;
  updateColor: (mode: "light" | "dark", key: keyof ColorPalette, value: string) => void;
  resetToDefaults: () => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}
```

### Color Picker Popup

The color config section will use a combination of:
1. **Native `<input type="color">`** — for visual color picking
2. **Hex text input** — for precise hex entry (existing `ColorPicker` component)
3. **Color swatch preview** — existing circular preview

Layout per color row:
```
[swatch] [label] [hex input] [color picker button]
```

Clicking the color picker button opens the native browser color picker.

## Decisions

1. **Hex colors for custom overrides**: Users input hex colors. These are applied directly as CSS variable overrides via inline styles on `<html>`. The base OKLCH values in `index.css` serve as defaults when no custom override is set.

2. **localStorage key**: `"custom-theme"` — single JSON blob with the full `ThemeConfig`.

3. **Appearance delegation**: `updateAppearance` calls both `setTheme()` from next-themes AND stores in config. The next-themes provider handles the actual class toggle.

4. **Google Fonts loading**: Inject a `<link>` element with `https://fonts.googleapis.com/css2?family={font}:wght@400;500;600;700&display=swap`. Update on font change.

5. **FOUC prevention**: Use a blocking `<script>` in the HTML head (via Next.js `<Script strategy="beforeInteractive">`) or `useLayoutEffect` to apply stored theme before paint.

6. **Default config**: Matches current `index.css` values so that applying defaults changes nothing visually.

## Migration Plan

No migration needed — this is a new feature. Existing CSS variables are preserved as defaults. The provider only overrides when custom values are set.

## Open Questions

- None remaining. All decisions made above.
