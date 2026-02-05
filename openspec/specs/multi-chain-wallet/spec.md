# Specification: Multi-Chain Wallet Integration

## Overview

The web app supports wallet connectivity for both EVM (via RainbowKit/wagmi) and Solana (via Wallet Adapter) ecosystems. A unified hook and wrapper component abstract chain-specific logic.

## Requirements

### Requirement: EVM Wallet Connection

The system SHALL provide EVM wallet connection via RainbowKit and wagmi v3.

#### Scenario: User connects EVM wallet

- **WHEN** user clicks "Connect Wallet" on an EVM-required action
- **THEN** RainbowKit connect modal opens with supported wallet options

#### Scenario: User is on wrong EVM chain

- **WHEN** user is connected but on wrong chain
- **THEN** "Switch Network" button appears, triggering wagmi's `useSwitchChain().mutate()`

#### Scenario: User disconnects externally

- **WHEN** user disconnects wallet from browser extension
- **THEN** `useConnectionEffect` detects disconnect and calls `useDisconnect().mutate()` to clear cookie state

### Requirement: Solana Wallet Connection

The system SHALL provide Solana wallet connection via @solana/wallet-adapter.

#### Scenario: User connects Solana wallet

- **WHEN** user clicks "Connect Wallet" on a Solana-required action
- **THEN** Solana wallet modal opens with supported wallet options

#### Scenario: User is on wrong Solana network

- **WHEN** user is connected but on wrong Solana network
- **THEN** network is switched programmatically via SolanaNetworkContext

### Requirement: Unified Wallet Hook

The system SHALL provide a unified `useWalletConnection(options: WalletOptions)` hook that returns a `WalletState`.

#### Scenario: EVM wallet options

- **WHEN** `options.type === "evm"` with `chainId`
- **THEN** delegates to `useEvmWallet(chainId)` and returns `WalletState`

#### Scenario: Solana wallet options

- **WHEN** `options.type === "solana"` with `network`
- **THEN** delegates to `useSolanaWallet(network)` and returns `WalletState`

### Requirement: ConnectWallet Wrapper Component

The system SHALL provide a `<ConnectWallet>` wrapper component using the children pattern.

#### Scenario: Not connected

- **WHEN** wallet is not connected
- **THEN** renders "Connect Wallet" button instead of children

#### Scenario: Wrong chain

- **WHEN** wallet is connected but on wrong chain
- **THEN** renders "Switch Network" button instead of children

#### Scenario: Ready

- **WHEN** wallet is connected and on correct chain
- **THEN** renders children

## Architecture

### File Structure (shared layer)

| Path | Purpose |
|------|---------|
| `shared/lib/wallet/types.ts` | `WalletOptions` (discriminated union), `WalletState` interface |
| `shared/lib/wallet/evm-config.ts` | Wagmi config with RainbowKit `getDefaultConfig` |
| `shared/lib/wallet/solana-config.ts` | Solana network endpoints, wallet adapters |
| `shared/lib/wallet/solana-network-context.ts` | React context for active Solana network |
| `shared/lib/wallet/use-evm-wallet.ts` | EVM hook: `useConnection`, `useSwitchChain`, `useConnectionEffect` |
| `shared/lib/wallet/use-solana-wallet.ts` | Solana hook: `useWallet`, `useWalletModal` |
| `shared/lib/wallet/use-wallet-connection.ts` | Unified hook routing to EVM or Solana |
| `shared/providers/evm-provider.tsx` | `WagmiProvider` + `RainbowKitProvider` |
| `shared/providers/solana-provider.tsx` | `ConnectionProvider` + `WalletProvider` + `WalletModalProvider` |
| `shared/ui/connect-wallet.tsx` | `<ConnectWallet>` wrapper component |

### Provider Nesting Order

Theme → QueryClient → Wagmi → RainbowKit → Solana → children

### Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `wagmi` | ^3.4.1 | EVM wallet hooks (v3 uses `useConnection`, `useConnectionEffect`, `.mutate()` pattern) |
| `@rainbow-me/rainbowkit` | ^2.2.10 | EVM connect/chain modals |
| `viem` | ^2.45.1 | EVM client library |
| `@solana/wallet-adapter-*` | latest | Solana wallet integration |

## Conventions

- wagmi v3: Use `useConnection` (not `useAccount`), `useConnectionEffect` (not `useAccountEffect`), `.mutate()` (not named mutate fns like `switchChain()`, `disconnect()`)
- All wallet infra lives in `shared/` layer (FSD)
- No barrel export for `shared/lib/wallet/` — import directly
