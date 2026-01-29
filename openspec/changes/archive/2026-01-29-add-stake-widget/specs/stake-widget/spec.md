# Capability: Stake Widget

## ADDED Requirements

### Requirement: Stake Module Tabbed Interface

The system SHALL display a staking widget with 3 tabs (Stake, Unstake, Withdraw) on the `/stake` page alongside the TVL chart.

#### Scenario: Widget renders with Stake tab active by default

- **WHEN** user navigates to the `/stake` page
- **THEN** the staking widget renders in the right column (4 of 12 grid columns on desktop)
- **AND** the "Stake" tab is selected by default
- **AND** tabs display: Stake, Unstake, Withdraw

#### Scenario: User switches between tabs

- **WHEN** user clicks on a tab (Stake, Unstake, or Withdraw)
- **THEN** the corresponding tab content is displayed
- **AND** the selected tab is visually highlighted

### Requirement: Stake Tab

The system SHALL provide a Stake tab where users can input CUSD amount to stake and see the stCUSD they will receive.

#### Scenario: Stake tab displays input and output fields

- **WHEN** user views the Stake tab
- **THEN** a "You will send" section displays with a token amount input and CUSD token badge
- **AND** a "You will receive" section shows the equivalent stCUSD amount
- **AND** a "Connect Wallet" / "Stake" CTA button is displayed
- **AND** the exchange rate "1 CUSD = 1 stCUSD" is shown below

#### Scenario: User enters stake amount

- **WHEN** user types a valid numeric amount in the token input
- **THEN** the fiat value updates below the input (e.g., "$100.00")
- **AND** the "You will receive" section updates with the equivalent stCUSD
- **AND** the CTA button becomes enabled

#### Scenario: Additional info appears on valid amount

- **WHEN** user enters a valid amount greater than 0
- **THEN** "Max transaction cost" and "Reward fee" info rows animate into view

### Requirement: Unstake Tab

The system SHALL provide an Unstake tab where users can input stCUSD amount to unstake and see the CUSD they will receive.

#### Scenario: Unstake tab displays input and output fields

- **WHEN** user views the Unstake tab
- **THEN** a "You will send" section displays with a token amount input and stCUSD token badge
- **AND** a "You will receive" section shows the equivalent CUSD amount with breakdown (token unstake + cumulative rewards)
- **AND** a "Connect Wallet" / "Unstake" CTA button is displayed
- **AND** the exchange rate is shown below

#### Scenario: Receive breakdown appears on valid amount

- **WHEN** user enters a valid unstake amount
- **THEN** the "You will receive" section expands to show:
  - Token unstake amount
  - Cumulative rewards amount
  - Separated by a dashed line

### Requirement: Withdraw Tab

The system SHALL provide a Withdraw tab showing pending and ready withdrawal requests.

#### Scenario: Withdraw tab displays requests list

- **WHEN** user views the Withdraw tab with active withdrawal requests
- **THEN** a "Withdraw Requests (N)" header shows the count
- **AND** each request displays: status indicator, status text, amount, token, requested date, claimable date
- **AND** pending requests appear with yellow indicator and reduced opacity
- **AND** ready requests appear with green indicator and full opacity

#### Scenario: Empty withdraw state

- **WHEN** user views the Withdraw tab with no withdrawal requests
- **THEN** a "No withdrawal requests" message is displayed
- **AND** helper text "You haven't requested withdrawals yet." is shown

#### Scenario: Withdraw All button

- **WHEN** user views the Withdraw tab
- **THEN** a "Withdraw All" button is displayed at the bottom
- **AND** the button is disabled when no requests have "ready" status

### Requirement: Token Amount Input

The system SHALL provide a reusable token amount input component that validates decimal numeric input.

#### Scenario: Input validates decimal numbers

- **WHEN** user types into the token amount input
- **THEN** only numeric characters, dots, and commas are accepted
- **AND** commas are converted to dots
- **AND** leading zeros are cleaned (except "0.")
- **AND** decimal places are limited to the configured precision (default 18)
- **AND** multiple dots are prevented

#### Scenario: Input shows error state

- **WHEN** the input receives an `error` prop
- **THEN** the text color changes to red to indicate an error

### Requirement: Status Indicator

The system SHALL provide a reusable status indicator SVG component for withdrawal request statuses.

#### Scenario: Indicator renders with configured color

- **WHEN** a StatusIndicator is rendered with a color prop
- **THEN** an SVG circle renders with the specified stroke color
- **AND** the size is configurable (default 12px)
