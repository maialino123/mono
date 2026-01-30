# Multi-Chain Wallet Integration (EVM + Solana)

> **Source Threads**:
> - [T-019c0ce4-354c-74db-bd3b-9a17bfd49749](https://ampcode.com/threads/T-019c0ce4-354c-74db-bd3b-9a17bfd49749) - Planning, implementation & redesign
> - [T-019c0d93-cb5b-759b-b9ff-3addc64c088f](https://ampcode.com/threads/T-019c0d93-cb5b-759b-b9ff-3addc64c088f) - wagmi v3 deprecation fixes
>
> **Date**: January 2026

## Overview

Integrated two wallet ecosystems into the web app: **RainbowKit** (EVM/wagmi) for Ethereum-compatible chains and **Solana Wallet Adapter** for Solana. Provides a unified `ConnectWallet` wrapper component and `useWalletConnection` hook with discriminated union options.

## Architecture

### FSD Layer Placement

| Component | Layer | Path |
| --- | --- | --- |
| Wallet types & config | `shared/lib` | `shared/lib/wallet/` |
| Wallet hooks | `shared/lib` | `shared/lib/wallet/use-*.ts` |
| Solana network context | `shared/lib` | `shared/lib/wallet/solana-network-context.ts` |
| EVM provider | `shared/providers` | `shared/providers/evm-provider.tsx` |
| Solana provider | `shared/providers` | `shared/providers/solana-provider.tsx` |
| ConnectWallet wrapper | `shared/ui` | `shared/ui/connect-wallet.tsx` |

### Provider Nesting Order

```
ThemeProvider
  └── QueryClientProvider (shared by oRPC + wagmi)
        └── WagmiProvider
              └── RainbowKitProvider
                    └── SolanaNetworkContext.Provider
                          └── ConnectionProvider (dynamic endpoint)
                                └── WalletProvider
                                      └── WalletModalProvider
                                            └── {children}
```

### File Structure

```
shared/lib/wallet/
├── types.ts                  # WalletOptions (discriminated union), WalletState
├── evm-config.ts             # wagmi getDefaultConfig (chains, SSR, cookie storage)
├── solana-config.ts          # SOLANA_NETWORKS map, getSolanaEndpoint(), createSolanaWallets()
├── solana-network-context.ts # SolanaNetworkContext + useSolanaNetwork()
├── use-evm-wallet.ts         # useEvmWallet(chainId?) → WalletState
├── use-solana-wallet.ts      # useSolanaWallet(network?) → WalletState
└── use-wallet-connection.ts  # useWalletConnection(options) → WalletState (unified)
```

## Key Design Decisions

### 1. Discriminated Union for Options

```typescript
interface EvmWalletOptions { type: "evm"; chainId: number }
interface SolanaWalletOptions { type: "solana"; network: SolanaNetwork }
type WalletOptions = EvmWalletOptions | SolanaWalletOptions;
```

Consumers declare what chain they need, the hook routes to the correct wallet library.

### 2. ConnectWallet Wrapper Pattern

```tsx
<ConnectWallet options={{ type: "evm", chainId: sepolia.id }}>
  <Button>Stake</Button>
</ConnectWallet>
```

The wrapper auto-handles 3 states:
- **Not connected** → renders "Connect Wallet" button
- **Wrong chain** → renders "Switch Network" button (EVM) or triggers `setNetwork` (Solana)
- **Correct chain** → renders `{children}`

### 3. Solana Dynamic Network

Solana's `ConnectionProvider` endpoint is driven by React state, not env vars. `SolanaNetworkContext` holds the current network, and changing it triggers `ConnectionProvider` to create a new `Connection` instance via `useMemo`.

RPC endpoints are hardcoded in `solana-config.ts` (same pattern as RainbowKit EVM config). To use custom RPCs (Helius, QuickNode), edit `SOLANA_NETWORKS` directly in code.

### 4. EVM Chain Mismatch

Uses wagmi's `useSwitchChain` which triggers the wallet's native switch/add chain dialog (EIP-3085/3326). MetaMask automatically prompts "Add network" if the chain is not configured in the wallet.

## Packages

```
@rainbow-me/rainbowkit  # EVM connect modal + chain UI
wagmi                    # EVM React hooks (useConnection, useSwitchChain, etc.)
viem                     # EVM client library (wagmi peer dep)
@solana/wallet-adapter-base
@solana/wallet-adapter-react
@solana/wallet-adapter-react-ui
@solana/wallet-adapter-wallets
@solana/web3.js
```

## Bugs & Deprecations (wagmi v3)

### wagmi v3 Renamed APIs

| Deprecated (wagmi v2) | New (wagmi v3) | Reason |
| --- | --- | --- |
| `useAccount()` | `useConnection()` | Better represents app↔provider connection |
| `useAccountEffect()` | `useConnectionEffect()` | Same rename |
| `const { switchChain } = useSwitchChain()` | `const switchChain = useSwitchChain()` | Custom mutate names deprecated; use `.mutate()` |
| `const { disconnect } = useDisconnect()` | `const disconnect = useDisconnect()` | Same; call `disconnect.mutate()` |

### External Wallet Disconnect Not Syncing

**Problem**: When user disconnects from MetaMask extension, the app still showed "Stake" instead of "Connect Wallet". wagmi's cookie storage persisted the old connection state.

**Fix**: Added `useConnectionEffect({ onDisconnect() { disconnect.mutate() } })` to clear wagmi's persisted state when the wallet fires a disconnect event.

## Environment Variables

Only one wallet-related env var:
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` — free from [WalletConnect Cloud](https://cloud.walletconnect.com/), required for WalletConnect-based EVM wallets

Solana RPCs are configured directly in `shared/lib/wallet/solana-config.ts`.
