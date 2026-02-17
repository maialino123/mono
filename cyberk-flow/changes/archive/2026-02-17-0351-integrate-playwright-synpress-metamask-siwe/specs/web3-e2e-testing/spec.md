## ADDED Requirements

### Requirement: Local Synpress Playwright Harness

The system SHALL provide a local-only E2E harness using Playwright with Synpress MetaMask fixtures.

#### Scenario: Local harness bootstraps successfully

- **WHEN** a developer runs the documented local setup commands for wallet cache and E2E execution
- **THEN** Playwright starts with Synpress MetaMask fixtures in Chromium and loads the web app under test

### Requirement: Deterministic MetaMask Wallet Setup

The system SHALL define a deterministic wallet setup entrypoint for Synpress cache generation in `e2e/wallet-setup`.

#### Scenario: Wallet cache can be regenerated after setup changes

- **WHEN** wallet setup configuration is changed and cache generation is re-run
- **THEN** Synpress rebuilds wallet cache successfully and tests use the updated wallet state

### Requirement: SIWE Happy Path E2E

The system SHALL include an automated test for SIWE sign-in with MetaMask on `/sign-in`.

#### Scenario: User signs in with wallet via SIWE

- **WHEN** user opens `/sign-in`, connects MetaMask through RainbowKit, and confirms SIWE signature
- **THEN** the app authenticates successfully and navigates away from `/sign-in` to an authenticated landing route

### Requirement: Local Troubleshooting Guidance

The system SHALL document common Synpress/Playwright failure modes and recovery actions for local development.

#### Scenario: Developer hits known setup or runtime issue

- **WHEN** developer encounters a known issue (version mismatch, stale wallet cache, modal timing flake, or extension mode limitation)
- **THEN** the runbook provides explicit corrective steps to restore deterministic local execution
