# Discovery: SIWE (Sign-In with Ethereum) Authentication

## 1. Feature Summary

Integrate Sign-In with Ethereum (EIP-4361/SIWE) into the existing better-auth system, enabling users to authenticate using their Ethereum wallets. Wallet addresses are linked to user accounts via the better-auth SIWE plugin.

## 2. Workstreams Used / Skipped

| Workstream           | Used? | Justification |
| -------------------- | ----- | ------------- |
| Architecture Snapshot | ✅    | Need to understand current auth flow and wallet infrastructure |
| Internal Patterns    | ✅    | Google OAuth and multi-chain wallet already implemented — follow same patterns |
| External Patterns    | ✅    | Librarian researched SIWE patterns across multiple OSS projects |
| Constraint Check     | ✅    | New dependency (viem for verification), DB schema change |
| Documentation        | ✅    | better-auth has official SIWE plugin docs |

## 3. Architecture Snapshot

### Relevant Packages
| Package          | Purpose                    | Key Files |
| ---------------- | -------------------------- | --------- |
| `packages/auth`  | better-auth configuration  | `src/index.ts` |
| `packages/db`    | Drizzle ORM schema         | `src/schema/auth.ts` |
| `packages/env`   | Zod-validated env vars     | `src/server.ts` |
| `apps/server`    | Hono API server            | `src/index.ts` (auth route handler) |
| `apps/web`       | Next.js frontend           | `src/shared/api/auth-client.ts`, `src/features/auth/` |

### Entry Points
- API: `apps/server/src/index.ts` → `/api/auth/*` → better-auth handler
- UI: `apps/web/src/features/auth/sign-in/` (sign-in page with email + Google)
- Wallet: `apps/web/src/shared/lib/wallet/` (wagmi/viem already configured)

## 4. Internal Patterns

### Similar Implementations
| Feature                | Location                                           | Pattern Used |
| ---------------------- | -------------------------------------------------- | ------------ |
| Google OAuth sign-in   | `apps/web/src/features/auth/sign-in/ui/google-sign-in-button.tsx` | `authClient.signIn.social()` |
| Email/password sign-in | `apps/web/src/features/auth/sign-in/api/use-sign-in.ts` | `authClient.signIn.email()` |
| Wallet connection      | `apps/web/src/shared/lib/wallet/use-evm-wallet.ts` | wagmi hooks + viem |
| Auth client setup      | `apps/web/src/shared/api/auth-client.ts`           | `createAuthClient({ plugins: [...] })` |

### Reusable Utilities
- **Wallet hooks**: `useEvmWallet`, `useWalletConnection` — already provide connected address, signer
- **viem**: Already a dependency via wagmi — can use `verifyMessage` for server-side verification
- **Auth client**: Plugin system — just add `siweClient()` to existing client

## 5. Constraint Check

- **Dependencies**:
  - `viem` — already in `apps/web/package.json` via wagmi; need to add to `packages/auth` for server-side verification
  - `better-auth` SIWE plugin — built-in (`better-auth/plugins`), no extra package needed
- **Build Requirements**: No changes — viem is ESM compatible, works with Bun
- **Database**: New `walletAddress` table added by better-auth SIWE plugin (id, userId, address, chainId, isPrimary, createdAt)

## 6. External Patterns & Documentation

### better-auth SIWE Plugin (Official)
- **Server**: `siwe()` plugin with `domain`, `getNonce`, `verifyMessage`, `ensLookup` (optional), `anonymous` mode
- **Client**: `siweClient()` plugin adds `authClient.siwe.nonce()` and `authClient.siwe.verify()`
- **Schema**: Adds `walletAddress` table linking wallets to users
- **Account linking**: Plugin automatically creates/links wallet to user account. When `anonymous: true`, creates user without email. When `anonymous: false`, requires email.

### SIWE (EIP-4361) Standard
- Nonce: cryptographically secure, one-time use, server-stored
- Message: domain, address, statement, URI, version, chainId, nonce, issuedAt, expirationTime
- Verification: signature recovery → address match + nonce match + expiry check

### Account Linking Patterns (from Librarian research)
- **Wallet → new account**: First-time wallet sign-in creates new user + links wallet
- **Wallet → existing account**: If user is logged in and links wallet, it associates with current account
- **Conflict**: If wallet already linked to different user → reject with clear error
- **Multiple wallets**: `walletAddress` table supports multiple wallets per user with `isPrimary` flag

## 7. Gap Analysis (Synthesized)

| Component | Have | Need | Gap Size |
| --------- | ---- | ---- | -------- |
| Auth plugin (server) | better-auth with email+Google | + SIWE plugin | Small — config addition |
| Auth client (web) | `createAuthClient` with basic plugins | + `siweClient()` | Small — config addition |
| DB schema | user, session, account tables | + `walletAddress` table | Small — migration |
| Sign-in UI | Email + Google buttons | + "Sign in with Wallet" button | Small — new component |
| Wallet infra | wagmi + viem fully configured | Reuse for SIWE signing | None — already exists |
| Server-side viem | Not in `packages/auth` | `verifyMessage` from viem | Small — add dependency |
| Env vars | Current env schema | + SIWE domain config | Trivial |

## 8. Key Decisions

| Decision | Options Considered | Chosen | Rationale |
| -------- | ------------------ | ------ | --------- |
| SIWE implementation | Custom SIWE vs better-auth plugin | better-auth plugin | Already using better-auth; plugin handles nonce, sessions, account linking automatically |
| Anonymous mode | `anonymous: true` (no email) vs `false` | `true` | Web3 users expect wallet-only auth; email can be added later via profile |
| ENS lookup | Enable vs skip | Skip initially | Nice-to-have, adds complexity and RPC calls; can add later |
| Verification library | `ethers.js` vs `viem` | `viem` | Already a dependency via wagmi |

## 9. Options Comparison _(not needed — single clear solution via better-auth plugin)_

## 10. Risks & Constraints

- **Must**: Nonce must be cryptographically secure and one-time use (handled by plugin)
- **Must**: Signature verification must use viem's `verifyMessage` (not custom crypto)
- **Must**: Rate limiting on SIWE endpoints (already covered by existing `authLimiter`)
- **Should**: Support multiple EVM chains (plugin supports `chainId` parameter)
- **Should**: Follow existing FSD patterns for new UI components

## 11. Open Questions

- [ ] Should we support wallet-linking for existing email/Google users (link wallet to existing account)? Or only wallet-as-primary-auth for now?
- [ ] Do we need mobile (Expo) SIWE support, or web-only for now?
