# Change: Add Multi-Chain Wallet Integration (EVM + Solana)

## Why

The stake module needs wallet connectivity to function. The app must support both EVM chains (via RainbowKit/wagmi) and Solana (via Wallet Adapter) to enable staking across ecosystems. The first integration point is the `stake-tab.tsx` which requires EVM/Sepolia.

## What Changes

- Install RainbowKit, wagmi, viem for EVM wallet support
- Install @solana/wallet-adapter-* packages for Solana wallet support
- Add EVM and Solana provider wrappers in `shared/providers/`
- Add wallet configuration and hooks in `shared/lib/wallet/`
- Add `ConnectWallet` wrapper component in `shared/ui/` — children pattern: `<ConnectWallet chainType chainId>{action}</ConnectWallet>`
- Add environment variables for WalletConnect projectId and per-network Solana RPCs
- Integrate wallet connection into `stake-tab.tsx` (chainType=evm, chain=sepolia)
- **Solana dynamic network**: `SolanaProvider` supports runtime network switching via context, `ConnectionProvider` endpoint updates automatically when network changes
- **Per-network RPC config**: `SOLANA_NETWORKS` config map with env var overrides per network (`NEXT_PUBLIC_SOLANA_RPC_DEVNET`, `_TESTNET`, `_MAINNET`), fallback to public Solana endpoints

## Impact

- Affected specs: None (new capability)
- Affected code:
  - `apps/web/package.json` (new deps)
  - `apps/web/src/shared/providers/providers.tsx` (add wallet providers)
  - `apps/web/src/shared/providers/solana-provider.tsx` (dynamic network via context)
  - `apps/web/src/shared/lib/wallet/` (new directory — config, hooks, context, types)
  - `apps/web/src/shared/ui/connect-wallet.tsx` (wrapper component)
  - `apps/web/src/widgets/stake-module/ui/stake-tab.tsx` (integrate wallet)
  - `packages/env/src/web.ts` (per-network Solana RPC env vars)
