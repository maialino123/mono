# Change: Integrate Playwright + Synpress for MetaMask SIWE E2E

## Why

The project already supports SIWE with RainbowKit and MetaMask, but currently lacks browser-level proof that the full wallet UX works end-to-end. Adding a focused local E2E flow de-risks wallet auth regressions and creates a reliable base for future Web3 test scenarios.

## Appetite

M (<=3d)

## Scope

- **In**:
  - Add local-only Playwright + Synpress test infrastructure for MetaMask extension automation.
  - Add deterministic wallet setup workflow under `e2e/wallet-setup`.
  - Implement first SIWE happy-path test: connect MetaMask, sign message, verify redirect after successful sign-in.
  - Add docs/scripts for local execution and troubleshooting.
- **Out**:
  - CI integration in this phase.
  - Full auth matrix (negative cases, profile assertions, provider-link assertions).
  - Non-MetaMask wallets.
- **Cut list**:
  - Rich test reporting customization.
  - Parallel E2E execution.

## What Changes

- Add Playwright config and Synpress integration for Chromium extension testing.
- Add wallet setup file and cache-generation command for deterministic MetaMask profile.
- Add first SIWE E2E spec for `/sign-in` wallet flow.
- Add local runbook with common failure recovery steps.

## Capabilities

- **New**: `specs/web3-e2e-testing/spec.md`

## Risk Level

MEDIUM

## Impact

- Affected specs: new `web3-e2e-testing`
- Affected code:
  - root `package.json` scripts
  - `e2e/` (fixtures, wallet setup, specs)
  - Playwright/Synpress configuration files (new)
  - docs for local E2E runbook (new)

## Open Questions

- [x] Execution target for phase 1? -> Local only
- [x] Assertion depth for first case? -> Simple SIWE happy path (redirect success)
