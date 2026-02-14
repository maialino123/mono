# Specification: Custom Theme

## ADDED Requirements

### Requirement: Theme Config Model

The system SHALL define a typed `ThemeConfig` model containing appearance mode, font family, border radius, and color palettes for light and dark modes.

#### Scenario: Default config matches existing CSS

- **WHEN** no custom theme is stored in localStorage
- **THEN** the app uses `DEFAULT_THEME_CONFIG` whose values match the existing `index.css` CSS variables
- **AND** no visual change occurs compared to the current app

### Requirement: Theme Persistence

The system SHALL persist the full `ThemeConfig` to localStorage under the key `"custom-theme"` whenever any theme property changes.

#### Scenario: Save on change

- **WHEN** user changes any theme property (appearance, font, radius, or color)
- **THEN** the full config is serialized to `localStorage.setItem("custom-theme", ...)`

#### Scenario: Load on app start

- **WHEN** the app starts and `localStorage.getItem("custom-theme")` returns a valid JSON config
- **THEN** the provider initializes state from that config
- **AND** applies all CSS variable overrides before the first paint

#### Scenario: Fallback to defaults

- **WHEN** localStorage has no stored theme or contains invalid data
- **THEN** the provider uses `DEFAULT_THEME_CONFIG`

### Requirement: Appearance Customization

The system SHALL allow users to switch between light, dark, and system appearance modes via the AppearanceSelect component.

#### Scenario: Change appearance

- **WHEN** user selects a different appearance mode
- **THEN** the provider updates `config.appearance` and delegates to `next-themes` `setTheme()`
- **AND** the change persists across page refreshes

### Requirement: Font Customization

The system SHALL allow users to select a Google Font family via the FontSelect component.

#### Scenario: Change font

- **WHEN** user selects a font from the dropdown
- **THEN** the provider updates `config.font`
- **AND** injects a Google Fonts `<link>` element into `<head>` for the selected font
- **AND** sets `--font-sans` CSS variable to the selected font family
- **AND** the change persists across page refreshes

#### Scenario: Custom font name

- **WHEN** user types a font name not in the preset list and presses Enter
- **THEN** the system treats it as a valid Google Font name and attempts to load it

### Requirement: Layout Radius Customization

The system SHALL allow users to adjust the global border radius via the LayoutRadiusSelect slider.

#### Scenario: Change radius

- **WHEN** user moves the radius slider
- **THEN** the provider updates `config.radius` (in pixels)
- **AND** sets `--radius` CSS variable to the corresponding `rem` value
- **AND** all components using `--radius` variants (sm, md, lg, xl) update accordingly
- **AND** the change persists across page refreshes

### Requirement: Color Customization

The system SHALL allow users to customize color values for both light and dark modes via the ColorConfig component.

#### Scenario: Change color via hex input

- **WHEN** user types a valid hex color in a color input field
- **THEN** the provider updates the corresponding color in `config.colors[currentMode]`
- **AND** sets the mapped CSS variable on `document.documentElement`
- **AND** the UI updates in real-time

#### Scenario: Change color via native picker

- **WHEN** user clicks the color picker button next to a color row
- **THEN** the browser's native color picker opens
- **AND** selecting a color updates both the hex input and the CSS variable in real-time

#### Scenario: Color swatches preview

- **WHEN** the color accordion is collapsed
- **THEN** the trigger area displays small color swatches showing the current color values from the config

### Requirement: Reset to Defaults

The system SHALL provide a way to reset all theme customizations to defaults.

#### Scenario: Reset

- **WHEN** user triggers reset to defaults
- **THEN** the provider restores `DEFAULT_THEME_CONFIG`
- **AND** removes `"custom-theme"` from localStorage
- **AND** removes all CSS variable inline overrides from `document.documentElement`
- **AND** the app returns to its default appearance

### Requirement: Theme Menu Display

The custom theme menu accordion headers SHALL display the current value for each section.

#### Scenario: Accordion headers show current values

- **WHEN** the theme menu is open
- **THEN** the appearance section header shows the current mode (e.g., "dark", "light", "system")
- **AND** the font section header shows the current font name (e.g., "Inter")
- **AND** the radius section header shows the current radius in px (e.g., "10px")
- **AND** the color section header shows color swatches of current palette
