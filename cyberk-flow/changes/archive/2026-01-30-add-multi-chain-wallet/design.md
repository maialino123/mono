# Design: Multi-Chain Wallet Integration

## Context

The app needs to support staking on both EVM and Solana chains. Each page/widget knows which `chainType` and `chainId` it requires. The wallet system must detect mismatches and prompt the user to switch.

## Goals / Non-Goals

- **Goals**:
  - Support EVM wallets via RainbowKit (MetaMask, WalletConnect, etc.)
  - Support Solana wallets via Wallet Adapter (Phantom, Solflare, etc.)
  - Unified hook `useWalletConnection(chainType, chainId)` returning connection state + actions
  - Chain mismatch detection and switch/add chain prompts for EVM
  - Integrate into `stake-tab.tsx` with `chainType=evm`, `chain=sepolia`
- **Non-Goals**:
  - Cross-chain bridging
  - Wallet balance fetching (separate feature)
  - Transaction signing (separate feature)

## Architecture

```
shared/providers/
├── providers.tsx           # Root: wraps all providers
├── evm-provider.tsx        # NEW: WagmiProvider + RainbowKitProvider
├── solana-provider.tsx     # NEW: ConnectionProvider + WalletProvider
├── theme-provider.tsx      # Existing

shared/lib/
├── wallet/
│   ├── evm-config.ts       # NEW: wagmi config, chain definitions
│   ├── solana-config.ts    # NEW: Solana endpoint, wallet adapters
│   ├── use-evm-wallet.ts   # NEW: Hook for EVM wallet state + chain switch
│   ├── use-solana-wallet.ts# NEW: Hook for Solana wallet state
│   └── types.ts            # NEW: ChainType, WalletConnectionState

shared/ui/
├── connect-wallet-button.tsx # NEW: Unified connect button component
```

## Key Design Decisions

### Decision 1: Separate providers, unified hook

Both providers (EVM + Solana) wrap the entire app. A consumer hook `useWalletConnection(chainType, chainId)` abstracts the difference:

```typescript
type ChainType = "evm" | "solana";

interface WalletConnectionState {
  isConnected: boolean;
  address: string | null;
  isCorrectChain: boolean;
  openConnectModal: () => void;
  switchChain: () => void;  // EVM only — prompts switch/add chain
}
```

**Rationale**: Widgets don't need to know which wallet library is used. They just declare the required chain and get connection state.

### Decision 2: EVM chain mismatch handling

Using wagmi's `useSwitchChain` + RainbowKit's `useChainModal`:
1. Connected but wrong chain → Show "Switch to Sepolia" button
2. `switchChain()` calls wagmi which triggers MetaMask's native switch/add chain dialog
3. If chain not in wallet, wagmi/MetaMask automatically prompts "Add network"

This is the standard EVM practice — wallets handle add/switch natively via EIP-3085/EIP-3326.

### Decision 3: Solana network handling

Solana doesn't have chain switching like EVM. The network is determined by the RPC endpoint in `ConnectionProvider`. If the wallet is connected to a different network than the app expects, the transactions will simply fail.

Best practice: Display a warning if the wallet's network doesn't match. Solana wallets (Phantom) let users switch networks in their settings.

### Decision 4: FSD Layer placement

| Component | Layer | Reason |
| --- | --- | --- |
| Providers (EVM, Solana) | `shared/providers/` | Infrastructure, no business logic |
| Wallet config | `shared/lib/wallet/` | Utility/configuration |
| Wallet hooks | `shared/lib/wallet/` | Generic hooks, reusable everywhere |
| ConnectWalletButton | `shared/ui/` | Generic UI component |

## Risk Map

| Component | Risk | Rationale | Mitigation |
| --- | --- | --- | --- |
| RainbowKit + Next.js 16 | MEDIUM | Turbopack compat, SSR | Test build early; fallback to webpack flag |
| Solana Wallet Adapter + Next.js 16 | MEDIUM | SSR/polyfill issues | Dynamic import with `ssr: false` |
| wagmi + viem bundle size | LOW | Tree-shakeable | Standard practice |
| Provider nesting order | LOW | TanStack Query shared | RainbowKit uses its own QueryClient or shares |

## Provider Nesting Order

```tsx
<ThemeProvider>
  <QueryClientProvider>          // Shared by ORPC + wagmi
    <WagmiProvider>
      <RainbowKitProvider>
        <SolanaConnectionProvider>
          <SolanaWalletProvider>
            {children}
          </SolanaWalletProvider>
        </SolanaConnectionProvider>
      </RainbowKitProvider>
    </WagmiProvider>
  </QueryClientProvider>
</ThemeProvider>
```

**Note**: RainbowKit needs `QueryClientProvider` above it. wagmi also uses TanStack Query internally. We'll share the same `QueryClient`.
