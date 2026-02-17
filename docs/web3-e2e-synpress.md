# Web3 E2E with Playwright + Synpress

This document describes the local-only setup for testing SIWE with MetaMask in this repository.

## Scope

- Local execution only (phase 1)
- Chromium + MetaMask via Synpress
- First automated scenario: wallet SIWE sign-in success path (`/sign-in` -> authenticated landing route, currently `/mint`)

## Architecture

The test harness uses Synpress v4's **cache-based wallet setup** to pre-configure MetaMask state before tests run. This eliminates repetitive RainbowKit modal interactions during test execution.

```
Cache Phase (one-time)          Test Phase (every run)
┌──────────────────────┐        ┌─────────────────────┐
│ Import wallet        │        │ Load cached context  │
│ Switch to Sepolia    │───────>│ goto /sign-in        │
│ Connect to dapp via  │ saved  │ Sign SIWE message    │
│   RainbowKit + MM    │ state  │ Assert redirect      │
└──────────────────────┘        └─────────────────────┘
```

### Key design decision: pre-connect in cache

The wallet setup (`e2e/wallet-setup/metamask.setup.ts`) performs the full RainbowKit connection flow during cache build. This works because:

1. **Synpress cache** persists the entire browser context including MetaMask extension state (approved sites, permissions) and app localStorage.
2. **wagmi/RainbowKit auto-reconnect**: on page reload, wagmi detects the existing MetaMask permission grant and reconnects automatically without UI interaction.
3. **Same-origin requirement**: cache must be built against the same origin (`http://localhost:3001`) used in tests. Origin mismatch breaks localStorage reuse and MetaMask site permissions.

**Result**: test runtime dropped from ~90s (with full modal flow) to ~9s (SIWE sign only).

### What was tested and ruled out

| Approach | Result |
|----------|--------|
| `metamask.connectToDapp()` alone (no UI clicks) | **Failed** — Synpress only handles the MetaMask popup; it does not trigger the popup. RainbowKit UI must be clicked first to open MetaMask's permission dialog. |
| Full RainbowKit flow in every test | **Works but slow** (~90s) and flaky due to modal timing |
| Pre-connect during cache + skip in tests | **Works** (~9s) — wagmi auto-reconnects from cached state |

## Required Environment Variables

Use one of these options before running cache/test commands:

1. Preferred: define variables in `.env.e2e.local` (loaded via `dotenv-cli` in all `e2e:*` scripts).
2. Alternative: export variables in the shell session where you run the commands.
3. CI: set variables directly in the CI environment (secrets); `dotenv-cli` won't override existing env vars.

Sample file: `.env.e2e.example`

```bash
E2E_WALLET_PASSWORD="your-wallet-password"
E2E_METAMASK_SEED_PHRASE="word1 word2 ... word12"
```

Shell export option:

```bash
export E2E_WALLET_PASSWORD="your-wallet-password"
export E2E_METAMASK_SEED_PHRASE="word1 word2 ... word12"
```

Notes:
- Use a dedicated test wallet only.
- `.env.e2e.local` is gitignored via `.env*.local` and should stay local-only.
- Dev servers are auto-started by Playwright via `webServer` config (`reuseExistingServer: true` skips if already running).

## Local Workflow

1. Build Synpress wallet cache (one-time).
2. Run SIWE test (Playwright auto-starts dev servers if not already running).

```bash
bun run e2e:cache
bun run e2e:test:siwe
```

## Cache Lifecycle

The Synpress cache is hash-based: changing the wallet setup function code generates a new hash and a new cache entry. Old caches are ignored.

**When to rebuild cache:**
- After changing `e2e/wallet-setup/metamask.setup.ts`
- After changing RainbowKit connect flow or selectors in the app
- After clearing `.cache-synpress/`

**Important**: cache build requires the dev server to be running at the same origin used in tests (`http://localhost:3001`). Start `bun run dev` before running `bun run e2e:cache`.

**What is cached:**
- MetaMask extension state (imported wallet, network, approved dapp origins)
- Browser localStorage/sessionStorage (wagmi connection state)
- Cookies

## Common Issues and Fixes

### 1. Playwright/Synpress version mismatch

Symptoms:
- Browser extension not loading
- Random startup failures for MetaMask context

Fix:
- Keep versions pinned in `package.json`.
- Reinstall dependencies and rebuild cache.

### 2. Stale Synpress cache

Symptoms:
- Wallet state inconsistent with updated setup
- Tests fail before reaching app flow

Fix:

```bash
rm -rf .cache-synpress
bun run e2e:cache:force
```

### 3. RainbowKit modal timing flake

Symptoms:
- `connectToDapp()` fails because wallet option was not selected yet

Fix:
- Wait for dialog visibility and click `MetaMask` before calling `metamask.connectToDapp()`.

### 4. Playwright UI mode instability

Symptoms:
- Test passes in CLI but fails in Playwright UI mode

Fix:
- Use CLI execution (`bun run e2e:test:siwe`) as baseline.
- Treat UI mode as debug-only for this phase.

### 5. Missing required environment variable

Symptoms:
- Error `Missing required environment variable: ...`

Fix:
- Ensure all required `E2E_*` values exist in `.env.e2e.local`, or export them in the same shell session used to run cache/test commands.
