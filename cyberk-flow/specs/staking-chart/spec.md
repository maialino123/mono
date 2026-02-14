# Capability: Staking Chart

## ADDED Requirements

### Requirement: TVL Area Chart Display

The system SHALL display a TVL (Total Value Locked) area chart on the stake page showing stablecoin value over time with a green gradient fill.

#### Scenario: Chart renders with default 7D period

- **WHEN** user navigates to the `/stake` page
- **THEN** the TVL area chart renders with 7D data selected by default
- **AND** the chart shows a green line with gradient fill from top (green-500 @ 0.3 opacity) to bottom (green-500 @ 0.05 opacity)
- **AND** the X-axis displays date labels
- **AND** the Y-axis displays dollar values

#### Scenario: Chart displays on 8-column grid

- **WHEN** user views the stake page on desktop (≥1024px)
- **THEN** the chart occupies 8 of 12 grid columns
- **AND** the staking panel occupies the remaining 4 columns

#### Scenario: Chart stacks on mobile

- **WHEN** user views the stake page on mobile (<1024px)
- **THEN** the chart takes full width (12 columns)
- **AND** the staking panel stacks below at full width

### Requirement: Chart Header

The system SHALL display a chart header above the area chart showing the token icon, "TVL" label, current value, and 24H change percentage.

#### Scenario: Header shows current TVL value

- **WHEN** the chart renders
- **THEN** the header displays the token icon and "TVL" label on the left
- **AND** the current TVL value is shown in large text (e.g., "$393.28")
- **AND** the 24H percentage change is shown with an arrow indicator (↗ for positive, ↘ for negative)
- **AND** positive change uses green text, negative uses red text

### Requirement: Time Period Toggle

The system SHALL provide time period toggle buttons to filter TVL chart data by different time ranges.

#### Scenario: User switches time period

- **WHEN** user clicks a period toggle button (LIVE, 1D, 7D, 30D, 180D, All Time)
- **THEN** the chart data updates to show the selected time range
- **AND** the selected period button is visually highlighted
- **AND** the chart animates smoothly to the new data

#### Scenario: Default period selection

- **WHEN** the chart first loads
- **THEN** the "7D" period is selected by default

### Requirement: Chart Tooltip

The system SHALL display a tooltip when the user hovers over the chart area.

#### Scenario: Hover shows data point details

- **WHEN** user hovers over a point on the chart
- **THEN** a tooltip appears showing the date and formatted dollar value for that data point
