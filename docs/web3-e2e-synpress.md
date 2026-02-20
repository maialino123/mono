# Web3 E2E with Playwright + Synpress (Phantom)

This document describes the local-only setup for testing SIWE with Phantom wallet in this repository. Phantom replaces MetaMask as the primary wallet for E2E testing.

## Why MetaMask Was Abandoned

MetaMask's Manifest V3 (MV3) migration introduced a **service worker idle bug**: the extension's background service worker goes idle after ~30 seconds of inactivity, breaking Synpress wallet automation mid-test. This is a known MV3 limitation in Chromium where service workers are aggressively suspended. The bug caused flaky cache builds and unreliable test runs, with no reliable workaround available. Phantom does not suffer from this issue as its extension architecture handles the MV3 lifecycle correctly.

## Scope

- Local execution only (phase 1)
- Chromium + Phantom via Synpress (not MetaMask)
- First automated scenario: wallet SIWE sign-in success path (`/sign-in` → authenticated landing route, currently `/mint`)

## Architecture

The test harness uses Synpress v4's **cache-based wallet setup** to pre-configure Phantom state before tests run. Unlike the previous MetaMask setup, the cache phase only imports the wallet — it does **not** pre-connect to the dapp. Testnet is enabled by a post-cache script. The full connect flow (RainbowKit modal → Phantom approval) happens in each test.

```
Cache Phase (one-time)                  Test Phase (every run)
┌─────────────────────────────────┐     ┌─────────────────────────┐
│ 1. Download Phantom CRX         │     │ Load cached context     │
│ 2. Import wallet (synpress      │     │ goto /sign-in           │
│    --phantom)                   │────>│ Open RainbowKit modal   │
│ 3. Enable testnet via           │saved│ Select Phantom + approve│
│    enable-phantom-testnet.ts    │state│ Sign SIWE message       │
└─────────────────────────────────┘     │ Assert redirect         │
                                        └─────────────────────────┘
```

### Key design decision: connect in each test (not in cache)

Unlike the previous MetaMask approach where the full RainbowKit connection was performed during cache build, the Phantom setup only imports the wallet seed phrase during cache. The connect flow runs in each test. This is because:

1. **Phantom's state model** does not reliably persist dapp approvals across cache restores in the same way MetaMask did.
2. **Testnet enablement** is handled by a separate post-cache script (`enable-phantom-testnet.ts`), decoupling network config from wallet import.
3. **Simpler cache**: the cache only contains wallet identity, making it less fragile and less dependent on app state or origin matching.

## Required Environment Variables

Use one of these options before running cache/test commands:

1. Preferred: define variables in `.env.e2e.local` (loaded via `dotenv-cli` in all `e2e:*` scripts).
2. Alternative: export variables in the shell session where you run the commands.
3. CI: set variables directly in the CI environment (secrets); `dotenv-cli` won't override existing env vars.

Sample file: `.env.e2e.example`

```bash
E2E_WALLET_PASSWORD="your-wallet-password"
E2E_WALLET_SEED_PHRASE="word1 word2 ... word12"
```

Shell export option:

```bash
export E2E_WALLET_PASSWORD="your-wallet-password"
export E2E_WALLET_SEED_PHRASE="word1 word2 ... word12"
```

Notes:
- Use a dedicated test wallet only.
- `.env.e2e.local` is gitignored via `.env*.local` and should stay local-only.
- Dev servers are auto-started by Playwright via `webServer` config (`reuseExistingServer: true` skips if already running).
- **Important**: webServer commands run the actual server commands directly (not via turbo) to prevent orphaned processes. See `docs/knowledge/playwright-webserver-orphan-process.md`.

## Scripts Pipeline

The E2E pipeline is split into three stages defined in `package.json`:

| Script | Command | Purpose |
|--------|---------|---------|
| `e2e:download-phantom` | `bun run e2e/scripts/download-phantom.ts` | Download Phantom CRX extension file |
| `e2e:enable-testnet` | `bun run e2e/scripts/enable-phantom-testnet.ts` | Enable testnet mode in cached Phantom profile (via chrome.storage.local) |
| `e2e:cache` | `e2e:download-phantom` → `synpress --phantom` → `e2e:enable-testnet` | Full cache build pipeline |
| `e2e:cache:force` | Same as `e2e:cache` but with `--force` flag | Force rebuild ignoring existing cache |
| `e2e:test` | `dotenv -e .env.e2e.local -- playwright test` | Run all E2E tests |
| `e2e:test:siwe` | `dotenv -e .env.e2e.local -- playwright test e2e/specs/siwe-sign-in.spec.ts` | Run SIWE sign-in test only |

### Pipeline flow

```
e2e:download-phantom ──► e2e:cache ──► e2e:test
                          │
                          ├─ 1. Download Phantom CRX
                          ├─ 2. synpress e2e/wallet-setup --headless --phantom
                          └─ 3. enable-phantom-testnet.ts
```

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
- After changing `e2e/wallet-setup/phantom.setup.ts`
- After clearing `.cache-synpress/`

**What is cached:**
- Phantom extension state (imported wallet)
- Browser profile data
- Testnet enablement state (applied post-cache by `enable-phantom-testnet.ts`)

**Important**: unlike the MetaMask setup, the cache does **not** require the dev server to be running during build. The dev server is only needed at test time.

## Phantom-Specific Workarounds

### CRX Download

Phantom is not available in the Chrome Web Store as a direct CRX download. The `e2e/scripts/download-phantom.ts` script handles fetching the extension CRX from Phantom's distribution channel. This runs as the first step of `e2e:cache` to ensure the extension binary is available before Synpress launches.

### Testnet Toggle

Phantom does not expose testnet networks by default. The `e2e/scripts/enable-phantom-testnet.ts` script launches a browser with the cached Phantom profile and enables testnet mode by directly writing to Phantom's `chrome.storage.local` via the extension's service worker (`serviceWorker.evaluate()`). This avoids brittle UI automation — no password unlock, no selector dependencies.

**Storage location:** `mmkv:items:localStorage` → `accounts:developerMode` → `{ isDeveloperMode: true }`

This runs as the final step of `e2e:cache`, after wallet import. If Phantom changes its internal storage schema, the script will fail with diagnostic output listing available storage keys.

## Common Issues and Fixes

### 1. Phantom CRX download failure

Symptoms:
- `e2e:download-phantom` fails with network error
- Cache build fails at first step

Fix:
- Check network connectivity and retry.
- Verify the download URL in `e2e/scripts/download-phantom.ts` is still valid.

### 2. Stale Synpress cache

Symptoms:
- Wallet state inconsistent with updated setup
- Tests fail before reaching app flow

Fix:

```bash
rm -rf .cache-synpress
bun run e2e:cache:force
```

### 3. Testnet not enabled

Symptoms:
- Tests fail because Phantom is on mainnet
- Transaction/signing errors referencing wrong chain

Fix:
- Run `bun run e2e:enable-testnet` manually, or rebuild cache with `bun run e2e:cache:force`.
- If the enable script fails with `MMKV blob not found` or `Write verification failed`, Phantom may have changed its internal storage schema. See the troubleshooting section in `.agents/skills/e2e-testing/references/troubleshooting/web3-phantom.md` for key rediscovery steps.

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

### 6. Phantom extension not loading in cache build

Symptoms:
- Synpress cache build completes but Phantom UI never appears
- Tests fail with "extension not found" errors

Fix:
- Ensure `e2e:download-phantom` completed successfully and the CRX file exists.
- Force rebuild: `bun run e2e:cache:force`.
