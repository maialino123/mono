# Change: Add SIWE (Sign-In with Ethereum) Authentication

## Why

Web3 users need to authenticate with their Ethereum wallets. The project already has wagmi/viem wallet infrastructure and better-auth has a built-in SIWE plugin — this is a natural extension of the auth system.

## Appetite

S (≤1d) — better-auth SIWE plugin handles most complexity; wagmi/viem already in place.

## Scope

- **In**:
  - better-auth SIWE plugin integration (server)
  - SIWE client plugin (web)
  - "Sign in with Wallet" button on sign-in/sign-up pages
  - Wallet linking for existing users (link wallet to email/Google account)
  - Database migration for `walletAddress` table
  - Nonce generation and message verification via viem
- **Out**:
  - ENS name/avatar lookup
  - Mobile (Expo) SIWE support
  - Smart contract wallet (EIP-1271) support
- **Cut list**:
  - ENS name/avatar resolution

## What Changes

- `packages/auth/src/index.ts` — add `siwe()` plugin to better-auth config
- `packages/auth/package.json` — add `viem` dependency for server-side verification
- `packages/db/` — run migration for `walletAddress` table
- `packages/env/` — add `SIWE_DOMAIN` env var (optional, can derive from `CORS_ORIGIN`)
- `apps/web/src/shared/api/auth-client.ts` — add `siweClient()` plugin
- `apps/web/src/features/auth/sign-in/ui/` — add wallet sign-in button component
- `apps/web/src/features/auth/sign-up/ui/` — add wallet sign-up button component

## Capabilities

- **Modified**: `specs/auth/spec.md` (delta — add SIWE requirements)

## Risk Level

LOW — Using official better-auth plugin + existing wagmi/viem infrastructure. No custom crypto. No breaking changes.

## Impact

- Affected specs: `auth`
- Affected code: `packages/auth`, `packages/db` (migration), `apps/web` (auth features)

## Open Questions

- [x] ~~Should we support wallet-linking for existing users?~~ → Yes, in-scope
- [x] ~~Do we need mobile SIWE support?~~ → No, web-only
