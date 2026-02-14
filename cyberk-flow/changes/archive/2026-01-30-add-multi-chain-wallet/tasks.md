# Tasks: Add Multi-Chain Wallet Integration

## 1. Dependencies & Environment

- [x] 1.1 Install EVM packages: `@rainbow-me/rainbowkit`, `wagmi`, `viem`
- [x] 1.2 Install Solana packages: `@solana/wallet-adapter-base`, `@solana/wallet-adapter-react`, `@solana/wallet-adapter-react-ui`, `@solana/wallet-adapter-wallets`, `@solana/web3.js`
- [x] 1.3 Add env vars to `packages/env`: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`, per-network Solana RPCs (`_DEVNET`, `_TESTNET`, `_MAINNET`)

## 2. Wallet Configuration (shared/lib/wallet/)

- [x] 2.1 Create `types.ts` — `ChainType`, `SolanaNetwork`, `ChainId`, `WalletState`
- [x] 2.2 Create `evm-config.ts` — wagmi config with `getDefaultConfig`, supported chains (sepolia), SSR + cookie storage
- [x] 2.3 Create `solana-config.ts` — `SOLANA_NETWORKS` map with per-network RPC endpoints (env var overrides + public fallbacks), `getSolanaEndpoint()`, `createSolanaWallets()`
- [x] 2.4 Create `solana-network-context.ts` — `SolanaNetworkContext` + `useSolanaNetwork()` for dynamic network switching

## 3. Providers (shared/providers/)

- [x] 3.1 Create `evm-provider.tsx` — `WagmiProvider` + `RainbowKitProvider`
- [x] 3.2 Create `solana-provider.tsx` — dynamic network via `SolanaNetworkContext`, `ConnectionProvider` endpoint reacts to network state changes
- [x] 3.3 Update `providers.tsx` — nest EVM and Solana providers
- [x] 3.4 Import RainbowKit CSS and Solana wallet adapter CSS

## 4. Wallet Hooks (shared/lib/wallet/)

- [x] 4.1 Create `use-evm-wallet.ts` — `useConnection`, `useSwitchChain`, `useConnectionEffect` (disconnect sync), RainbowKit modals
- [x] 4.2 Create `use-solana-wallet.ts` — `useWallet`, `useWalletModal`, `useSolanaNetwork` for network match check + dynamic switch
- [x] 4.3 Create `use-wallet-connection.ts` — unified `useWalletConnection(chainType, chainId?)`, routes to EVM (number) or Solana (string network)

## 5. ConnectWallet Wrapper (shared/ui/)

- [x] 5.1 Create `connect-wallet.tsx` — wrapper component: not connected → "Connect Wallet"; wrong chain → "Switch Network"; correct chain → renders `{children}`

## 6. Stake Tab Integration

- [x] 6.1 Update `stake-tab.tsx` — `<ConnectWallet chainType="evm" chainId={sepolia.id}><Button>Stake</Button></ConnectWallet>`

## 7. Verification

- [x] 7.1 Run `bun run check-types` — no type errors
- [x] 7.2 Run `bun run check` — lint/format passes
- [x] 7.3 Run `bun run build` — build succeeds (verify SSR compat)

## 8. Wagmi v3 Deprecation Fixes

- [x] 8.1 Replace `useAccount` → `useConnection` (wagmi v3 rename)
- [x] 8.2 Replace `useAccountEffect` → `useConnectionEffect` (wagmi v3 rename)
- [x] 8.3 Replace destructured `switchChain`/`disconnect` with `.mutate()` pattern (wagmi v3 TanStack Query alignment)
- [x] 8.4 Verify with `bun run check-types` and `bun run check`
