# Discovery: Multi-Chain Wallet Integration (EVM + Solana)

## 1. Feature Summary

Integrate two wallet ecosystems into the web app: **RainbowKit** (EVM/wagmi) and **Solana Wallet Adapter**. Provide a unified `ConnectWalletButton` component that accepts `chainType` (evm/solana) and `chainId`, handles chain mismatch (switch/add chain), and integrates into the stake module.

## 2. Architecture Snapshot

### Relevant Packages

| Package | Purpose | Key Files |
| --- | --- | --- |
| `apps/web` | Next.js frontend | `src/shared/providers/providers.tsx` |
| `apps/web` | Stake module widget | `src/widgets/stake-module/ui/stake-tab.tsx` |
| `packages/env` | Zod-validated env vars | New: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`, `NEXT_PUBLIC_SOLANA_RPC` |

### Entry Points

- Providers: `apps/web/src/shared/providers/providers.tsx`
- Stake UI: `apps/web/src/widgets/stake-module/ui/stake-tab.tsx`

## 3. Existing Patterns

### Similar Implementations

| Feature | Location | Pattern Used |
| --- | --- | --- |
| Theme Provider | `shared/providers/theme-provider.tsx` | Client-side provider wrapper |
| Query Provider | `shared/providers/providers.tsx` | Nested provider composition |

### Reusable Utilities

- `cn()` from `@/shared/lib/utils` for class merging
- Existing `Button` component from `@/shared/shadcn/button`

## 4. Technical Constraints

- **Dependencies**: New packages required (RainbowKit, wagmi, viem, @solana/wallet-adapter-*)
- **SSR**: RainbowKit requires `ssr: true` config and cookie-based state for Next.js
- **Build**: wagmi/viem may need polyfills; Next.js 16 uses Turbopack by default
- **WalletConnect**: Requires a free `projectId` from WalletConnect Cloud
- **Environment Variables**: Must be Zod-validated via `@cyberk-flow/env`

## 5. External References

- RainbowKit Docs: https://rainbowkit.com/docs/installation
- Solana Wallet Adapter: https://github.com/anza-xyz/wallet-adapter/blob/master/APP.md
- Wagmi Docs: https://wagmi.sh
- Viem Docs: https://viem.sh

## 6. Gap Analysis

| Component | Have | Need | Gap Size |
| --- | --- | --- | --- |
| EVM Provider | None | RainbowKit + wagmi config | New |
| Solana Provider | None | ConnectionProvider + WalletProvider | New |
| Wallet Hook | None | `useWalletConnection(chainType, chainId)` | New |
| Connect Button | None | `ConnectWalletButton` component | New |
| Chain Switch | None | EVM switch/add chain handling | New |
| Env Vars | None | `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`, `NEXT_PUBLIC_SOLANA_RPC` | New |

## 7. Open Questions

- [x] Which EVM chains to support initially? → Sepolia (for stake-tab integration)
- [x] Which Solana network? → Devnet initially
- [ ] WalletConnect projectId — user needs to provide or use placeholder
