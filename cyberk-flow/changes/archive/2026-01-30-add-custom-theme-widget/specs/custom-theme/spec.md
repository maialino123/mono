# Capability: Custom Theme Widget

## ADDED Requirements

### Requirement: Theme Customization Side Panel

The system SHALL provide a side panel (Sheet) for real-time theme customization, triggered by a fixed button at the bottom-right corner of the screen.

#### Scenario: User opens the theme panel

- **WHEN** user clicks the floating theme trigger button (bottom-right)
- **THEN** a Sheet side panel slides in from the right with title "Customize Your Brand"

#### Scenario: User closes the theme panel

- **WHEN** user clicks the close (X) button or clicks outside the panel
- **THEN** the Sheet panel closes and the trigger button reappears

### Requirement: Appearance Mode Selection

The system SHALL allow users to select between Light, Dark, and System appearance modes via a RadioGroup.

#### Scenario: User switches to dark mode

- **WHEN** user selects "Dark" in the Appearance section
- **THEN** the application applies the `.dark` class to the HTML element via next-themes
- **THEN** all components reflect dark mode styling immediately

#### Scenario: User selects system mode

- **WHEN** user selects "System" in the Appearance section
- **THEN** the application follows the OS color scheme preference

### Requirement: Font Selection

The system SHALL allow users to select a font from a curated list and optionally type a Google Fonts name.

#### Scenario: User selects a font from dropdown

- **WHEN** user selects a font name from the dropdown (e.g., "Inter")
- **THEN** the selected font is loaded (via Google Fonts link if needed)
- **THEN** the `--font-sans` CSS variable is updated
- **THEN** all text in the application reflects the new font

#### Scenario: User types a custom Google Font name

- **WHEN** user types a font name in the text input and confirms
- **THEN** the system loads the font from Google Fonts
- **THEN** the font is applied to the application

### Requirement: Layout Radius Control

The system SHALL provide a slider to adjust the global border radius (0-24px).

#### Scenario: User adjusts the radius slider

- **WHEN** user drags the radius slider to a new value (e.g., 16px)
- **THEN** the `--radius` CSS variable is updated in real-time
- **THEN** all components with border-radius reflect the new value
- **THEN** the current pixel value is displayed next to the slider

### Requirement: Color Customization

The system SHALL provide color input controls organized in collapsible accordion sections: Core Brand Colors, Neutral/Layout Colors, Text Colors, and Status Colors.

#### Scenario: User changes a brand color

- **WHEN** user changes the Primary color via color picker or hex input (e.g., "#2563EB")
- **THEN** the `--primary` CSS variable is updated on `document.documentElement`
- **THEN** all components using the primary color update in real-time

#### Scenario: User uses the native color picker

- **WHEN** user clicks the color swatch square
- **THEN** the browser's native color picker opens
- **THEN** color changes from the picker update the hex input and CSS variable

#### Scenario: User types a hex value

- **WHEN** user types a valid hex color in the text input
- **THEN** the color swatch updates to show the new color
- **THEN** the corresponding CSS variable updates after a 300ms debounce

### Requirement: Color Preset Palettes

The system SHALL provide quick-access preset color palette buttons for one-click theme switching.

#### Scenario: User clicks a color preset

- **WHEN** user clicks one of the preset palette buttons (e.g., dark blue, gray, green-yellow, red-orange)
- **THEN** all color variables update to the preset's values
- **THEN** all color inputs reflect the new values

### Requirement: Theme Persistence

The system SHALL persist custom theme settings to localStorage and restore them on page reload.

#### Scenario: User customizes and reloads

- **WHEN** user changes colors, font, or radius and reloads the page
- **THEN** all custom theme settings are restored from localStorage
- **THEN** CSS variables are applied before first paint (or immediately on hydration)

#### Scenario: User saves theme

- **WHEN** user clicks "Save Theme" in the panel footer
- **THEN** the current theme configuration is persisted to localStorage
- **THEN** a success toast notification confirms the save

### Requirement: Preview Auto-Updates

The system SHALL support toggling between live preview (auto-update) and deferred update modes.

#### Scenario: Preview mode is active (default)

- **WHEN** "Preview auto-updates" is enabled
- **THEN** all color/font/radius changes apply to the page immediately

#### Scenario: Preview mode is disabled

- **WHEN** "Preview auto-updates" is disabled
- **THEN** changes are staged but not applied until user clicks "Save Theme"
