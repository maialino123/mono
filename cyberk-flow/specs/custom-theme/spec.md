# Specification: Custom Theme

## Requirements

### Requirement: Theme Config Model

The system SHALL define a typed `ThemeConfig` model containing appearance mode, font family, border radius, letter spacing, spacing, and color palettes for light and dark modes.

#### Scenario: Default config matches existing CSS

- **WHEN** no custom theme is stored in localStorage
- **THEN** the app uses `DEFAULT_THEME_CONFIG` with `letterSpacing: 0` (em) and `spacing: 0.25` (rem)
- **AND** no visual change occurs compared to the current app

#### Scenario: Backward-compatible loading

- **WHEN** existing localStorage contains a config without `letterSpacing` or `spacing`
- **THEN** the provider merges with defaults (`letterSpacing: 0`, `spacing: 0.25`)
- **AND** existing settings are preserved

### Requirement: Theme Persistence

The system SHALL persist the full `ThemeConfig` to localStorage under the key `"custom-theme"` whenever any theme property changes.

#### Scenario: Save on change

- **WHEN** user changes any theme property (appearance, font, radius, letterSpacing, spacing, or color)
- **THEN** the full config is serialized to `localStorage.setItem("custom-theme", ...)`

#### Scenario: Load on app start

- **WHEN** the app starts and `localStorage.getItem("custom-theme")` returns a valid JSON config
- **THEN** the provider initializes state from that config
- **AND** applies all CSS variable overrides before the first paint

#### Scenario: Fallback to defaults

- **WHEN** localStorage has no stored theme or contains invalid data
- **THEN** the provider uses `DEFAULT_THEME_CONFIG`

### Requirement: Theme Menu Display

The custom theme menu SHALL use a tabbed layout with mode toggle and action buttons matching shadcn-studio's Theme Generator UI.

#### Scenario: Menu structure

- **WHEN** the theme menu is open
- **THEN** the top section shows a Light/Dark mode toggle
- **AND** below the toggle is a tab bar with three tabs: Colors, Typography, Other
- **AND** the bottom of the menu shows Save Theme and Reset to Default buttons side by side

#### Scenario: Tab navigation

- **WHEN** user clicks a tab (Colors, Typography, Other)
- **THEN** the corresponding content panel is shown
- **AND** the active tab is visually highlighted

### Requirement: Appearance Customization

The system SHALL allow users to switch between light and dark modes via a segmented toggle in the theme menu.

#### Scenario: Toggle mode

- **WHEN** user clicks the Light or Dark button in the mode toggle
- **THEN** the provider updates `config.appearance` and delegates to `next-themes` `setTheme()`
- **AND** the active button is visually highlighted
- **AND** the change persists across page refreshes

### Requirement: Colors Tab

The Colors tab SHALL display the existing color customization sections using the current accordion-based color editor.

#### Scenario: View and edit colors

- **WHEN** user navigates to the Colors tab
- **THEN** the existing color sections (Core Brand, Neutral/Layout, Text, Status) are displayed
- **AND** each color supports hex input and native color picker
- **AND** colors apply to the current mode (light/dark) as determined by the mode toggle

### Requirement: Typography Tab

The Typography tab SHALL contain font family selection and letter spacing control.

#### Scenario: Select font

- **WHEN** user navigates to the Typography tab
- **THEN** the existing font selector (Google Fonts combobox) is displayed
- **AND** selecting a font updates `config.font` and applies via CSS variable

#### Scenario: Adjust letter spacing

- **WHEN** user adjusts the letter spacing slider or input
- **THEN** the value updates in range -0.25em to 0.25em (step 0.025)
- **AND** the `--letter-spacing` CSS variable is set on `document.documentElement`
- **AND** the change persists across page refreshes

### Requirement: Other Tab

The Other tab SHALL contain border radius and spacing controls.

#### Scenario: Adjust radius

- **WHEN** user adjusts the radius slider or number input
- **THEN** the value updates in range 0 to 32px (step 1)
- **AND** the `--radius` CSS variable is set accordingly
- **AND** the change persists across page refreshes

#### Scenario: Adjust spacing

- **WHEN** user adjusts the spacing slider or number input
- **THEN** the value updates in range 0.15rem to 0.35rem (step 0.01)
- **AND** the `--spacing` CSS variable is set on `document.documentElement`
- **AND** the change persists across page refreshes

### Requirement: SliderWithInput Component

The system SHALL provide a reusable `SliderWithInput` component combining a labeled slider with a numeric input field.

#### Scenario: Render and interact

- **WHEN** the SliderWithInput is rendered
- **THEN** it displays a label on the left, a numeric input with unit on the right, and a full-width slider below
- **AND** dragging the slider updates the input value and vice versa
- **AND** values are clamped to the configured min/max range

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

### Requirement: Save Theme Button

The system SHALL provide a Save Theme button that persists the current configuration and closes the menu.

#### Scenario: Save theme

- **WHEN** user clicks the Save Theme button
- **THEN** the current `ThemeConfig` is persisted to localStorage
- **AND** the theme menu closes

### Requirement: Reset to Defaults

The system SHALL provide a Reset to Default button alongside the Save Theme button.

#### Scenario: Reset

- **WHEN** user clicks the Reset to Default button
- **THEN** the provider restores `DEFAULT_THEME_CONFIG`
- **AND** removes `"custom-theme"` from localStorage
- **AND** removes all CSS variable inline overrides from `document.documentElement`
- **AND** the app returns to its default appearance
