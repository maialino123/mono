---
labels: [siwe, auth, better-auth, wallet]
source: migrated-from-docs/knowledge/siwe-auth-account-linking.md
summary: > Source Threads:
---
# SIWE Authentication and Account Linking
**Date**: 2026-02-23

# SIWE Authentication & Account Linking

> **Source Threads**:
> - [T-019c5ea7-21d3-764a-b0a8-139826bed8f7](https://ampcode.com/threads/T-019c5ea7-21d3-764a-b0a8-139826bed8f7) - SIWE auth implementation & tests
> - [T-019c5ee3-e18d-74af-8c48-6f412aba56c9](https://ampcode.com/threads/T-019c5ee3-e18d-74af-8c48-6f412aba56c9) - Test fixes, account linking config, error handling
>
> **Date**: February 2026

## Overview

SIWE (Sign-In with Ethereum) authentication using better-auth's `siwe()` plugin with anonymous mode. Wallet users get synthetic emails (`0xaddress@domain`), which requires specific `accountLinking` configuration to allow linking with Google/social providers.

## Architecture

```
┌──────────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   Web App (3001)     │────▶│  API Server (3000)   │────▶│  Google OAuth   │
│   link-google-btn    │     │  packages/auth       │     │                 │
│   link-wallet-btn    │     │  siwe() plugin       │     └─────────────────┘
└──────────────────────┘     │  accountLinking cfg  │
         │                   └──────────────────────┘
         │ callbackURL +              │
         │ errorCallbackURL           │ redirect on error
         ▼                            ▼
    /profile?error=...       /api/auth/callback/google
```

## Key Files

| File | Purpose |
| --- | --- |
| `packages/auth/src/index.ts` | Backend auth config with `siwe()` plugin + `accountLinking` |
| `packages/auth/src/__tests__/siwe-auth.test.ts` | Integration tests (11 tests) |
| `apps/web/src/features/auth/link-provider/ui/link-google-button.tsx` | Google linking with `errorCallbackURL` |
| `apps/web/src/features/auth/link-provider/ui/link-wallet-button.tsx` | Wallet linking via ORPC `linkWallet` |
| `apps/web/src/screens/profile/ui/profile-screen.tsx` | Profile page with error toast handling |
| `packages/api/src/routers/wallet.ts` | ORPC wallet linking endpoint |

## Critical Knowledge

### 1. better-auth Client Proxy — `fetchOptions` Placement

**Problem**: `client.linkSocial()` returns 401 even with valid session.

**Root Cause**: better-auth's client proxy (`proxy.mjs`) destructures arguments as:
```js
// args[0] = body object → destructured for { query, fetchOptions, ...body }
// args[1] = extra options → spread into fetch options
```

For **POST methods** (linkSocial, unlinkAccount), `fetchOptions` must be in the **first argument** (body), NOT the second:

```typescript
// ❌ WRONG — headers never sent, causes 401
client.linkSocial(
  { provider: "google", idToken: { token: "..." } },
  { fetchOptions: { headers } },
);

// ✅ CORRECT — fetchOptions destructured from first arg
client.linkSocial({
  provider: "google",
  idToken: { token: "..." },
  fetchOptions: { headers },
});
```

For **GET methods** (getSession, listAccounts), `fetchOptions` goes in the first arg too (since there's no body):
```typescript
client.getSession({ fetchOptions: { headers } }); // ✅ correct
```

### 2. Account Linking — `allowDifferentEmails` is Mandatory for SIWE

SIWE anonymous users have synthetic emails like `0xdead@localhost`. When linking Google, the email check in `account.mjs` (line 146) and `callback.mjs` (line 104) **always fails** because emails never match.

**Two separate checks in better-auth** (both must pass):

| Line | Check | Config to bypass |
| --- | --- | --- |
| 145 | `!trustedProviders.includes(provider) && !emailVerified` | `trustedProviders: ["google"]` |
| 146 | `email !== session.email && !allowDifferentEmails` | `allowDifferentEmails: true` |

`trustedProviders` only skips the `emailVerified` check, NOT the email match check. Both configs are required:

```typescript
account: {
  accountLinking: {
    enabled: true,
    allowDifferentEmails: true,       // skip email match (mandatory for SIWE)
    trustedProviders: ["google"],     // skip emailVerified check
  },
},
```

### 3. OAuth Error Redirect — `errorCallbackURL`

**Problem**: OAuth linking errors show on backend error page (`/api/auth/error`) instead of frontend.

**Root Cause**: better-auth's `callback.mjs` uses `redirectOnError()` which redirects to:
1. `errorURL` from OAuth state (if present)
2. Fallback: `options.onAPIError?.errorURL || ${baseURL}/error`

The `errorURL` in state comes from `c.body.errorCallbackURL` (set in `oauth2/state.mjs:19`).

**Fix**: Pass `errorCallbackURL` in the `linkSocial` call:

```typescript
authClient.linkSocial({
  provider: "google",
  callbackURL: window.location.href,
  errorCallbackURL: window.location.href,  // ← errors redirect to frontend
});
```

Frontend reads `?error=` param and shows toast:
```typescript
const LINK_ERROR_MESSAGES: Record<string, string> = {
  account_already_linked_to_different_user: "This account is already linked to another user",
  "email_doesn't_match": "Email doesn't match your account",
  unable_to_link_account: "Unable to link account",
};
```

### 4. React StrictMode — Prevent Duplicate Toasts

`useEffect` with `useSearchParams` fires twice in dev (StrictMode). Use a ref to deduplicate:

```typescript
const shownErrorRef = useRef<string | null>(null);
useEffect(() => {
  const error = searchParams.get("error");
  if (error && shownErrorRef.current !== error) {
    shownErrorRef.current = error;
    toast.error(LINK_ERROR_MESSAGES[error] ?? `Failed: ${error}`);
    router.replace("/profile");
  }
}, [searchParams, router]);
```

### 5. SIWE Verify vs Link — Different Flows

| Action | Method | Result |
| --- | --- | --- |
| Sign in with wallet | `authClient.siwe.verify()` | Creates/signs-in user (new session) |
| Link wallet to existing account | ORPC `client.wallet.linkWallet()` | Adds wallet to current user |
| Link Google to wallet user | `authClient.linkSocial()` | Adds Google provider to current user |

`siwe.verify()` always creates a **new user session** — it cannot link a wallet to an existing logged-in user. That's why `linkWallet` uses a custom ORPC endpoint with `viem.verifyMessage`.

### 6. Testing better-auth with `getTestInstance`

- Uses `bun test` with `bun:sqlite` — `better-sqlite3` is replaced via Bun's `mock.module()` in a preload script
- Preload at `packages/auth/src/__tests__/preload.ts` mocks both `better-sqlite3` → `bun:sqlite` and `vitest` → `bun:test`
- Root `bunfig.toml` and `packages/auth/bunfig.toml` both reference the preload for consistent behavior
- `getTestInstance` internally calls `better-sqlite3`, but the mock intercepts it transparently
- `getTestInstance` auto-provides Google/GitHub social providers with test credentials
- Mock Google provider via `auth.$context`:

```typescript
async function mockGoogleIdToken(auth, googleUserId, googleEmail) {
  const ctx = await auth.$context;
  const googleProvider = ctx.socialProviders.find((v) => v.id === "google")!;
  spyOn(googleProvider, "verifyIdToken").mockResolvedValue(true);
  spyOn(googleProvider, "getUserInfo").mockResolvedValue({
    user: { id: googleUserId, email: googleEmail, name: "Test", emailVerified: true, image: "" },
  });
}
```

- Use `mockResolvedValue` (not `Once`) so mock persists across multiple calls in same test
- Session headers from `sessionSetter` must be passed via `fetchOptions: { headers }` in first arg
- Use sync `describe()` with `beforeAll()` for async setup — avoid `async describe` callbacks

## Gotchas

| Issue | Symptom | Fix |
| --- | --- | --- |
| `fetchOptions` in wrong arg | 401 on linkSocial/unlinkAccount | Put `fetchOptions` inside first arg |
| Missing `allowDifferentEmails` | `email_doesn't_match` error | Add to `accountLinking` config |
| Missing `errorCallbackURL` | Errors show on backend page | Pass in `linkSocial` call |
| `bun test` with better-auth | `better-sqlite3 not supported` | Use preload mock (`packages/auth/src/__tests__/preload.ts`) to swap `better-sqlite3` → `bun:sqlite` |
| Duplicate toast in dev | StrictMode double-fires effect | Use `useRef` to deduplicate |
| `siwe.verify` for linking | Creates new user, doesn't link | Use custom ORPC endpoint |
