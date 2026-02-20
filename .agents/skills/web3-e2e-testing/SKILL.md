---
name: web3-e2e-testing
description: "Set up Playwright + Synpress for Web3 E2E testing with MetaMask wallet automation. Use when adding e2e tests for wallet connection, SIWE sign-in, or dapp interactions in projects using RainbowKit, wagmi, or similar Web3 UI libraries."
---

# Web3 E2E Testing with Playwright + Synpress

Sets up a complete E2E testing harness for Web3 dapps using Synpress v4's cache-based MetaMask automation with Playwright.

## When to Use

- Adding E2E tests for MetaMask wallet flows (connect, sign, transact)
- Testing SIWE (Sign-In with Ethereum) authentication
- Projects using RainbowKit, wagmi, ConnectKit, or similar Web3 UI libraries
- Need deterministic, fast wallet tests (not mock — real MetaMask extension)

## Tech Stack Requirements

- **Runtime**: Node.js or Bun
- **Test runner**: Playwright
- **Wallet automation**: Synpress v4 (`@synthetixio/synpress`)
- **Target dapps**: Any Web3 app with MetaMask support

## Installation Workflow

Follow these steps in order. Adapt file paths, ports, selectors, and network names to the target project.

### Step 1: Install Dependencies

Add to root `devDependencies` (pin exact versions — Synpress is sensitive to Playwright version):

```bash
# Bun
bun add -d @playwright/test@1.48.2 @synthetixio/synpress@4.0.6 dotenv-cli
bunx playwright install chromium

# npm/pnpm
npm install -D @playwright/test@1.48.2 @synthetixio/synpress@4.0.6 dotenv-cli
npx playwright install chromium
```

### Step 2: Add Scripts

Add to root `package.json` scripts:

```json
{
  "e2e:cache": "dotenv -e .env.e2e.local -- synpress <wallet-setup-dir> --headless",
  "e2e:cache:force": "dotenv -e .env.e2e.local -- synpress <wallet-setup-dir> --headless --force",
  "e2e:test": "dotenv -e .env.e2e.local -- playwright test",
  "e2e:test:siwe": "dotenv -e .env.e2e.local -- playwright test <spec-path>"
}
```

Replace `<wallet-setup-dir>` with the path to wallet setup files (e.g., `e2e/wallet-setup`).

### Step 3: Create Playwright Config

Create `playwright.config.ts` at project root. Key constraints for Synpress:
- `fullyParallel: false` — wallet extension shares state
- `workers: 1` — single browser context required
- `webServer` — auto-start dev servers with `reuseExistingServer: true`
- CI guard on trace/video to prevent secret leakage

```ts
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  testDir: "./e2e/specs",
  timeout: 90_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["html", { outputFolder: "playwright-report", open: "never" }], ["list"]],
  use: {
    baseURL: "http://localhost:<WEB_PORT>",
    trace: process.env.CI ? "off" : "retain-on-failure",
    screenshot: "only-on-failure",
    video: process.env.CI ? "off" : "retain-on-failure",
  },
  webServer: [
    {
      command: "bun run dev", // runs each app's own dev script directly
      port: <SERVER_PORT>,
      reuseExistingServer: !process.env.CI,
      cwd: path.resolve(__dirname, "<server-app-dir>"), // e.g. "apps/server"
    },
    {
      command: "bun run dev",
      port: <WEB_PORT>,
      reuseExistingServer: !process.env.CI,
      cwd: path.resolve(__dirname, "<web-app-dir>"), // e.g. "apps/web"
    },
  ],
  projects: [{ name: "chromium" }],
});
```

> **⚠️ Critical: webServer process cleanup rules**
> 1. **Do NOT use turbo/nx/lerna** in webServer commands — they create independent process groups that escape Playwright's cleanup (EADDRINUSE).
> 2. **Use absolute `cwd`** via `path.resolve(__dirname, ...)` — prevents failures when Playwright is invoked from non-root directories.
> 3. **Use `!process.env.CI`** for `reuseExistingServer` — CI should fail fast on leaked processes, local reuses existing servers.
> 4. **Use each app's own `dev` script** (`bun run dev`) — avoids `bunx` resolution surprises and keeps parity with normal dev workflow.
>
> See `docs/knowledge/playwright-webserver-orphan-process.md` for full root cause analysis.

### Step 4: Create E2E Directory Structure

```
e2e/
├── fixtures/
│   ├── metamask.fixture.ts    # Synpress fixture composition
│   └── required-env.ts        # Env var validation helper
├── wallet-setup/
│   └── metamask.setup.ts      # Cached wallet setup (runs once)
└── specs/
    └── siwe-sign-in.spec.ts   # Test specs
```

### Step 5: Create Files

See `reference/templates.md` for complete file templates. Key files:

1. **`e2e/fixtures/required-env.ts`** — fail-fast env validation
2. **`e2e/fixtures/metamask.fixture.ts`** — Synpress fixture wiring
3. **`e2e/wallet-setup/metamask.setup.ts`** — wallet import + dapp pre-connect
4. **`e2e/specs/siwe-sign-in.spec.ts`** — SIWE happy-path test

### Step 6: Environment Setup

Create `.env.e2e.example` (committed) and `.env.e2e.local` (gitignored):

```bash
E2E_WALLET_PASSWORD="your-wallet-password"
E2E_WALLET_SEED_PHRASE="word1 word2 ... word12"
```

Add to `.gitignore`:
```
.cache-synpress
.env.e2e.local
```

### Step 7: Add to Linter Scope

If using Biome, ESLint, or similar — ensure `e2e/**` and `playwright.config.ts` are included in the linting scope.

### Step 8: Build Cache and Run

```bash
# Start dev servers first (or let webServer config handle it for tests)
# Cache requires dev server running at the same origin as baseURL
bun run dev

# Build wallet cache (one-time, or after setup changes)
bun run e2e:cache

# Run tests
bun run e2e:test:siwe
```

## Key Architecture Decision: Pre-Connect in Cache

The wallet setup performs the **full wallet connection flow** (RainbowKit modal → MetaMask approval) during cache build. Tests then skip the connect UI entirely.

This works because:
1. **Synpress cache** persists MetaMask extension state (approved sites, permissions) + browser localStorage
2. **wagmi auto-reconnect** detects existing permission on page reload
3. **Same-origin requirement** — cache and tests must use identical origin

**Performance**: ~90s (full modal flow) → ~9s (SIWE sign only)

### Critical: `connectToDapp()` Does NOT Trigger the Popup

Synpress's `metamask.connectToDapp()` only **approves** the MetaMask permission popup. It does not click the app's UI. The wallet selection UI (RainbowKit modal, ConnectKit, etc.) must be clicked first to trigger the popup.

**This means**: you must replicate the app's connect button clicks before calling `connectToDapp()` — either in the cache setup (preferred) or in each test.

## Adapting to Different Wallet UIs

The templates use RainbowKit selectors. Adapt the wallet setup's connect flow for your UI:

| Library | Connect Button | Wallet Selector |
|---------|---------------|-----------------|
| RainbowKit | `button "Connect Wallet"` → dialog → `button "MetaMask"` |
| ConnectKit | `button "Connect"` → modal → `button "MetaMask"` |
| Web3Modal | `w3m-connect-button` → `w3m-wallet-button[name="MetaMask"]` |
| Custom | Find your connect button and wallet option selectors |

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Cache build fails | Ensure dev server is running at the same origin |
| `connectToDapp()` times out | Click wallet connect UI before calling it |
| Stale cache after setup change | `rm -rf .cache-synpress && bun run e2e:cache:force` |
| Extension not loading | Reinstall: `bunx playwright install chromium` |
| Works in CLI, fails in UI mode | Use CLI as baseline; UI mode is debug-only |
| Missing env var error | Check `.env.e2e.local` has all required values |
| Origin mismatch (cache vs test) | Ensure `baseURL` in playwright config matches the URL used in wallet setup |
| EADDRINUSE after tests finish | **Do NOT use turbo/nx in webServer commands.** Run actual server commands directly with `cwd`. See knowledge doc. |
