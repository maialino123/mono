---
labels: [e2e, metamask, synpress, playwright]
source: migrated-from-docs/e2e-metamask-troubleshooting.md
summary: > Purpose: Document ALL approaches tried across ~10 Amp threads to solve MetaMask v13 MV3 + Synpress 4.1.2 E2E test setup issues. Prevents future agents from repeating failed approaches.
---
# MetaMask v13 Synpress E2E Troubleshooting
**Date**: 2026-02-23

# MetaMask v13 + Synpress 4.1.2 E2E Troubleshooting Log

> **Purpose**: Document ALL approaches tried across ~10 Amp threads to solve MetaMask v13 MV3 + Synpress 4.1.2 E2E test setup issues. Prevents future agents from repeating failed approaches.
>
> **Stack**: Synpress 4.1.2, MetaMask v13.13.1 (MV3), @playwright/test 1.48.2, Bun 1.3.6
>
> **Date**: 2026-02-19

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Root Cause: MV3 Service Worker Persistence](#2-root-cause-mv3-service-worker-persistence)
3. [Constraint: Synpress Hash System](#3-constraint-synpress-hash-system)
4. [Constraint: LavaMoat Scuttling](#4-constraint-lavamoat-scuttling)
5. [Chronological Thread Summary](#5-chronological-thread-summary)
6. [All Approaches Tried — Detailed](#6-all-approaches-tried--detailed)
7. [What Works (Current Solution)](#7-what-works-current-solution)
8. [Key Technical Facts](#8-key-technical-facts)

---

## 1. Architecture Overview

```
e2e:cache (build phase)
  └─ synpress CLI
       └─ compiles metamask.setup.ts with tsup
       └─ extracts function body via regex
       └─ hashes function body → cache dir name
       └─ launches Chromium + MetaMask extension
       └─ runs setup function (importWallet, click onboarding)
       └─ sleep(3000) → context.close()
       └─ profile saved to .cache-synpress/<hash>/

e2e:test (test phase)
  └─ playwright test runner
       └─ copies cached profile to temp dir
       └─ launches Chromium + MetaMask extension
       └─ navigates to chrome-extension://<id>/home.html
       └─ unlockForFixture (types password, clicks unlock)
       └─ runs test spec
```

## 2. Root Cause: MV3 Service Worker Persistence

MetaMask v13 uses Manifest V3 with a **service worker** instead of a persistent background page. The state persistence chain is:

```
MetaMaskController.sendUpdate (debounce 200ms)
  → emit("update") with full state
    → OperationSafener.execute (lodash.debounce 1000ms + navigator.locks("operation-safener-lock"))
      → PersistenceManager.set()
        → navigator.locks("state-lock")
          → ExtensionStore.set({data, meta})
            → chrome.storage.local.set({data, meta})  ← writes to LevelDB on disk
```

**The problem**: After the setup function completes, Synpress only waits 3 seconds before calling `context.close()`. The MV3 service worker goes idle/suspended before the 1000ms+ debounce chain completes. As a result:

- `CronjobControllerStorageManager` writes (uses `chrome.storage.local.set()` directly, no debounce) → **persists successfully** (`temp-cronjob-storage` appears in LevelDB)
- Main state (`data.KeyringController.vault`, `data.OnboardingController.completedOnboarding`) → **NOT persisted** (debounce chain never fires)

**Consequence**: At test time, MetaMask finds no vault in `chrome.storage.local`, shows the onboarding welcome screen instead of the unlock screen, and `unlockForFixture` fails.

## 3. Constraint: Synpress Hash System

Synpress generates a **deterministic cache directory name** from the setup function body:

1. **CLI path** (`compileWalletSetupFunctions.ts`): reads source → regex extracts function body → esbuild minifies → shake256 hash (10 bytes hex)
2. **Runtime path** (`defineWalletSetup`): `fn.toString()` → esbuild minifies → shake256 hash

**Critical regex limitation**: The extraction regex only handles **3 levels of brace nesting**:
```regex
/defineWalletSetup\s*\([^,]*,\s*(async\s*\([^)]*\)\s*=>\s*\{(?:[^{}]*|\{(?:[^{}]*|\{[^{}]*\})*\})*\})\s*\)/
```

This means:
- **2 levels** (simple if/catch blocks): ✅ matches
- **3 levels** (callback with nested blocks): ✅ matches
- **4+ levels** (`page.evaluate(() => { for() { if() { } } })`): ❌ **DOES NOT MATCH** → throws "Could not find defineWalletSetup callback"

**ANY change** to the setup function body produces a different hash → fresh cache directory → complete re-run of MetaMask onboarding from scratch. Some hashes trigger timing/animation issues in headless mode where `onboarding-import-with-srp-button` reports "element is not stable", causing the entire import to hang for 30s and timeout.

## 4. Constraint: LavaMoat Scuttling

MetaMask v13 uses LavaMoat which "scuttles" `globalThis` — replacing `eval()`, `Function()`, and other dangerous APIs with throwing stubs. Playwright's `page.evaluate()` uses `Runtime.callFunctionOn` which internally calls `Function()`.

- **Extension pages** (popup, home, offscreen): LavaMoat scuttling blocks `page.evaluate()`
- **Service worker context**: Same scuttling blocks `worker.evaluate()`
- **CDP `Runtime.evaluate`**: Evaluates expressions directly in V8, bypasses LavaMoat ✅ (but has other issues — see approach #14)

**Fix**: Patch `runtime-lavamoat.js` to set `"scuttleGlobalThis":{"enabled":false}`. This must be done on the downloaded extension at `.cache-synpress/metamask-chrome-13.13.1/scripts/runtime-lavamoat.js`.

The CSP for extension pages is `script-src 'self' 'wasm-unsafe-eval'` (no `unsafe-eval`), but CDP bypasses CSP since it operates at the V8 debugger level.

---

## 5. Chronological Thread Summary

| # | Thread | Title | Key Topic |
|---|--------|-------|-----------|
| 1 | `T-019c6547` | Setting up playwright e2e testing monorepo | Initial project structure, mock vs real MetaMask |
| 2 | `T-019c6574` | Fix wallet sign-in E2E test connection state | Wallet mock failures with wagmi v2 |
| 3 | `T-019c6605` | Switch to real MetaMask extension E2E testing | Transition from mock to real MetaMask |
| 4 | `T-019c6923` | E2E env loading for setup and test | dotenv-cli solution for env loading |
| 5 | `T-019c697b` | Run oracle and code review on e2e integration | Security, lint, eager connect issues |
| 6 | `T-019c7535` | Synpress MetaMask unlock password fill debug | Playwright version mismatch, unlock failures |
| 7 | `T-019c754d` | MetaMask wallet import hanging in E2E tests | Onboarding flow changes, Terms of Use |
| 8 | `T-019c755b` | Synpress MetaMask v13 Terms of Use blocking | Terms of Use popup analysis |
| 9 | `T-019c7561` | Synpress MetaMask v13 wallet state persistence | waitForTimeout, LevelDB inspection |
| 10 | `T-019c7577` | Synpress MetaMask v13 cache persistence | Extended waits, headed vs headless |
| 11 | `T-019c7587` | MetaMask v13 vault not persisting to cache | CDP, LavaMoat, keepalive, evaluate |
| 12 | `T-019c75c3` | MetaMask v13 E2E cache persistence with Synpress | Hash system discovery, post-cache fixup |

---

## 6. All Approaches Tried — Detailed

### Phase A: Initial Setup Issues (Threads 1–5)

#### Approach 1: Wallet Mock with EthereumWalletMock
- **What**: Used Synpress's `EthereumWalletMock` to inject `window.ethereum`
- **Result**: ❌ FAILED
- **Why**: wagmi v2's MetaMaskSDK connector has internal `isAuthorized()` logic that returns false even with mocked addresses. RainbowKit's reconnection relies on connector state the mock can't satisfy. Chain ID mismatch (mock defaults to Mainnet `0x1`, app uses Sepolia `0xaa36a7`).

#### Approach 2: Cookie/Storage Pre-seeding for Auto-connect
- **What**: Pre-seed wagmi localStorage and cookies to skip RainbowKit UI
- **Result**: ❌ FAILED
- **Why**: wagmi rehydration requires the actual connector to return `isAuthorized() === true`. Pre-seeded storage alone is insufficient.

#### Approach 3: Direct Side-effect Import for Env Loading
- **What**: Import `load-e2e-env.ts` (calls dotenv) at top of `metamask.setup.ts`
- **Result**: ⚠️ WORKED but fragile
- **Why**: Depends on `tsup` compilation bundling the import and `process.cwd()` resolving correctly. Replaced with `dotenv-cli` approach.

#### Approach 4: dotenv-cli for Environment Variables
- **What**: Wrap commands with `dotenv -e .env.e2e.local --`
- **Result**: ✅ WORKS
- **Why**: Process-level env injection works for both Synpress CLI and Playwright test runner.

#### Approach 5: Pre-connecting to Dapp During Cache Build
- **What**: Open dapp page in setup function, click Connect Wallet, select MetaMask, call `connectToDapp()`
- **Result**: ⚠️ PARTIALLY WORKED (when vault persists), but adds complexity
- **Why**: Requires dev server running during cache build. Origin mismatch risk (localhost vs 127.0.0.1). Also doesn't fix vault persistence.

---

### Phase B: Playwright/Chromium Version Mismatch (Thread 6)

#### Approach 6: Pin @playwright/test to 1.48.2
- **What**: Downgraded from `^1.58.2` to exact `1.48.2`
- **Result**: ✅ NECESSARY (but not sufficient)
- **Why**: `synpress-cache` has peerDependency on `playwright-core 1.48.2`. Mismatched Chromium versions (1140 vs 1208) caused extension state reset between cache build and test execution. Pinning ensures consistent Chromium rev 1140.

---

### Phase C: MetaMask v13 Onboarding Flow (Threads 7–8)

#### Approach 7: Handle Terms of Use Popup Manually
- **What**: Click `terms-of-use-checkbox`, `terms-of-use-scroll-button`, `terms-of-use-agree-button` before `importWallet()`
- **Result**: ⚠️ NOT NEEDED in practice
- **Why**: Synpress's `importWallet()` seems to handle Terms of Use internally (or it doesn't appear in headless). The real blocker was the post-import completion screen, not Terms of Use. Adding these selectors increased brace nesting beyond regex limit.

#### Approach 8: Click `onboarding-complete-done` After Import
- **What**: After `importWallet()`, wait for and click the "Open wallet" / "Done" button
- **Result**: ✅ NECESSARY
- **Why**: MetaMask v13 has a new `#onboarding/completion` screen after SRP import. Synpress 4.1.2's `importWallet()` stops after the SRP step and doesn't click through to completion. Without this click, `completedOnboarding` is never set to `true`.

#### Approach 9: Handle Pin Extension Popups
- **What**: Click `pin-extension-next` and `pin-extension-done` buttons
- **Result**: ✅ HELPFUL (prevents popups blocking tests)
- **Why**: MetaMask v13 shows "Pin MetaMask" prompts after onboarding. Dismissing them prevents interference with later test interactions.

#### Approach 10: Handle Download App Continue
- **What**: Click `download-app-continue` button
- **Result**: ⚠️ MIXED — sometimes disrupts persistence
- **Why**: Clicking this may navigate the extension page, potentially interrupting the service worker's state flush cycle. When combined with long waits, sometimes helps; sometimes hurts.

---

### Phase D: Vault Persistence Attempts (Threads 9–12)

#### Approach 11: waitForTimeout (various durations)
- **What**: Added `waitForTimeout(N)` at end of setup function, tried 5s, 10s, 13s, 15s, 20s
- **Result**: ❌ FAILED (all durations)
- **Why**: Keeping an extension page open does NOT keep the MV3 service worker alive. The SW still goes idle regardless of how long you wait. Even 20+ seconds of total wait (setup function + Synpress's internal 3s) didn't help.

#### Approach 12: Navigate to home.html + Wait
- **What**: `walletPage.goto("chrome-extension://<id>/home.html")` followed by 10s wait
- **Result**: ❌ FAILED (inconsistent — worked once for hash 828ec307, never again)
- **Why**: Navigation may trigger a state read but doesn't force a state write. The debounced persistence chain still depends on the SW staying active.

#### Approach 13: Page Reloads in a Loop
- **What**: Loop: wait 5s → `page.reload()` × 6 times
- **Result**: ❌ FAILED
- **Why**: Heavy-handed, reloads may reset debounce timers. Service worker still suspends between reloads.

#### Approach 14: CDP Runtime.evaluate (Bypass LavaMoat)
- **What**: Used `context.newCDPSession(page)` → `Runtime.evaluate` to poll `chrome.storage.local`
- **Result**: ❌ FAILED (setup hanged/timed out)
- **Why**: While CDP bypasses LavaMoat's `eval` scuttling, modifying the setup function to include CDP calls **changes the Synpress hash**. The new hash caused a fresh cache build where MetaMask's `onboarding-import-with-srp-button` reported "element is not stable" during animations in headless mode, hanging for 30s.

#### Approach 15: Service Worker evaluate (worker.evaluate)
- **What**: Used `context.serviceWorkers()` to find MetaMask SW, tried `sw.evaluate()`
- **Result**: ❌ FAILED
- **Why**: LavaMoat scuttling is active in the service worker context too, blocking evaluate.

#### Approach 16: Offscreen Page evaluate
- **What**: Opened `chrome-extension://<id>/offscreen.html`, tried running evaluation there
- **Result**: ❌ FAILED (hanged)
- **Why**: LavaMoat is present on all extension pages including offscreen documents. Also suffers from hash-change issues.

#### Approach 17: LavaMoat Patch + page.evaluate() in Setup Function
- **What**: Patched `runtime-lavamoat.js` to disable scuttling. Then added `walletPage.evaluate()` calls inside the setup function to: (a) open `chrome.runtime.connect()` Port for keepalive, (b) poll `chrome.storage.local`
- **Result**: ❌ FAILED (setup hanged on import)
- **Why**: **Two separate issues**:
  1. The `evaluate()` callbacks have 4+ levels of brace nesting, which exceeds Synpress's `extractWalletSetupFunction` regex limit → CLI throws "Could not find defineWalletSetup callback"
  2. Even if extraction worked, the changed function body produces a new hash → fresh cache build → "element is not stable" timing issue on `onboarding-import-with-srp-button` in headless mode

#### Approach 18: Headed Mode Cache Build
- **What**: Ran `synpress e2e/wallet-setup --force` (without `--headless`)
- **Result**: ⚠️ SLIGHTLY BETTER but still failed tests
- **Why**: Headed mode produced more LevelDB data (some `Keyring` references in logs), but the vault blob was still incomplete or the `completedOnboarding` flag was missing. Tests still failed to unlock.

---

## 7. What Works (Current Solution)

### Architecture: Post-Cache Fixup Script

Since the persistence fix CANNOT be placed inside the setup function (due to hash change + regex limit + onboarding timing), the solution operates **outside** the Synpress cache flow:

```
e2e:cache pipeline:
  1. e2e:patch-ext     → Patch LavaMoat scuttling in MetaMask extension
  2. synpress cache    → Build cache with simple setup function (stable hash)
  3. fixup-cache.ts    → Launch browser with cached profile, keep SW alive, wait for vault persistence
```

### Files

| File | Purpose |
|------|---------|
| `e2e/wallet-setup/metamask.setup.ts` | Simple setup: import wallet + click onboarding buttons. NO evaluate calls. |
| `e2e/scripts/patch-extension.ts` | Patches `runtime-lavamoat.js` to disable scuttling |
| `e2e/scripts/fixup-cache.ts` | Post-cache: launches browser, keeps SW alive via `chrome.runtime.connect()` Port, polls `chrome.storage.local` until vault persists |

### Setup Function (Keep Simple!)

```typescript
const metamaskSetup = defineWalletSetup(walletPassword, async (context, walletPage) => {
  const extensionId = await getExtensionId(context, "MetaMask");
  const metamask = new MetaMask(context, walletPage, walletPassword, extensionId);
  await metamask.importWallet(seedPhrase);

  // Handle v13 onboarding completion screen
  const doneButton = walletPage.getByTestId("onboarding-complete-done");
  await doneButton.waitFor({ state: "visible", timeout: 10_000 });
  await doneButton.click();

  // Dismiss pin extension popups
  const pinNextButton = walletPage.getByTestId("pin-extension-next");
  if (await pinNextButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await pinNextButton.click();
  }
  const pinDoneButton = walletPage.getByTestId("pin-extension-done");
  if (await pinDoneButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await pinDoneButton.click();
  }

  // Dismiss download app popup
  const downloadAppContinue = walletPage.getByTestId("download-app-continue");
  if (await downloadAppContinue.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await downloadAppContinue.click();
  }
});
```

### Package.json Scripts

```json
{
  "e2e:patch-ext": "bun run e2e/scripts/patch-extension.ts",
  "e2e:cache": "bun run e2e:patch-ext && dotenv -e .env.e2e.local -- synpress e2e/wallet-setup --headless && dotenv -e .env.e2e.local -- bun run e2e/scripts/fixup-cache.ts",
  "e2e:cache:force": "bun run e2e:patch-ext && dotenv -e .env.e2e.local -- synpress e2e/wallet-setup --headless --force && dotenv -e .env.e2e.local -- bun run e2e/scripts/fixup-cache.ts",
  "e2e:test": "dotenv -e .env.e2e.local -- playwright test",
  "e2e:test:siwe": "dotenv -e .env.e2e.local -- playwright test e2e/specs/siwe-sign-in.spec.ts"
}
```

---

## 8. Key Technical Facts

### Facts About Synpress Internals
- Hash length: 10 bytes (20 hex chars) via shake256
- Hash input: esbuild-minified function body (whitespace removed, console/debugger dropped)
- Regex for extraction: 3 levels of brace nesting max
- Internal wait after setup: `sleep(3000)` before `context.close()`
- Extension download: `.cache-synpress/metamask-chrome-13.13.1.zip` → unzipped to `metamask-chrome-13.13.1/`
- Cache dir: `.cache-synpress/<hash>/` (full Chromium persistent context profile)

### Facts About MetaMask v13 MV3
- Service worker entry: `scripts/app-init.js`
- Extension ID (from cache): `poenfhcndljpdlfdomaolhnjncnkpkek`
- LavaMoat scuttling config location: `scripts/runtime-lavamoat.js` → `"scuttleGlobalThis":{"enabled":true}`
- Vault storage: `chrome.storage.local` key `data` → `data.KeyringController.vault` (encrypted JSON)
- Onboarding flag: `data.OnboardingController.completedOnboarding` (boolean)
- Persistence chain total debounce: ~1200ms minimum (200ms + 1000ms)
- Direct storage writes (no debounce): `CronjobControllerStorageManager` → `temp-cronjob-storage`

### Facts About Playwright/Chromium
- Pinned to `@playwright/test@1.48.2` (required by synpress-cache peerDep)
- Chromium revision: 1140 (for PW 1.48.2)
- CDP `Runtime.evaluate` bypasses both LavaMoat scuttling and CSP
- CDP `Runtime.callFunctionOn` (used by `page.evaluate`) calls `Function()` internally → blocked by LavaMoat

### DO NOT TRY AGAIN
1. ❌ `waitForTimeout(N)` at end of setup function — SW suspends regardless of wait duration
2. ❌ `page.evaluate()` inside setup function — regex can't handle 4+ brace levels, hash changes
3. ❌ `worker.evaluate()` — LavaMoat blocks it
4. ❌ CDP inside setup function — hash changes → onboarding "element is not stable" in headless
5. ❌ Wallet mock with wagmi v2 — connector authorization state can't be mocked
6. ❌ Navigating to home.html + wait — doesn't keep SW alive
7. ❌ Page reload loops — resets debounce timers, SW still suspends
