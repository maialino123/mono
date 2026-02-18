# Web3 / Synpress Setup

MetaMask wallet automation via Synpress v4. This is an **optional module** — only needed for Web3 wallet flows.

## Prerequisites

- Base Playwright setup completed (see [base-playwright.md](base-playwright.md))
- Dedicated test wallet (seed phrase with no real funds)
- Testnet only (e.g., Sepolia)

## Constraints

| Constraint | Reason |
|------------|--------|
| `workers: 1` | MetaMask extension shares browser state |
| `fullyParallel: false` | Single browser context required |
| Version pinning | Synpress is tightly coupled to specific Playwright versions |

**Always pin exact versions** — no caret (`^`). Upgrade Playwright + Synpress together and rebuild cache.

## Step 1: Install Dependencies

```bash
# Use your package manager — pin exact versions (no caret)
<pm> add -D @synthetixio/synpress@4.0.6
<pm> add -D dotenv-cli
```

Check Synpress release notes for compatible Playwright version before upgrading.

## Step 2: Add Scripts

```json
{
  "e2e:cache": "dotenv -e .env.e2e.local -- synpress <wallet-setup-dir> --headless",
  "e2e:cache:force": "dotenv -e .env.e2e.local -- synpress <wallet-setup-dir> --headless --force",
  "e2e:test:web3": "dotenv -e .env.e2e.local -- playwright test <web3-specs-dir>"
}
```

Replace `<wallet-setup-dir>` and `<web3-specs-dir>` with your project paths.

## Step 3: Environment Variables

Create `.env.e2e.example` (committed) and `.env.e2e.local` (gitignored):

```bash
E2E_WALLET_PASSWORD="your-wallet-password"
E2E_METAMASK_SEED_PHRASE="word1 word2 ... word12"
E2E_BASE_URL="http://localhost:3001"   # must match playwright.config baseURL
```

Add to `.gitignore`:
```
.cache-synpress
.env.e2e.local
```

## Step 4: Directory Structure

Extends the base structure:

```
e2e/
├── fixtures/
│   ├── base.fixture.ts          # Plain Playwright fixture
│   ├── metamask.fixture.ts      # Synpress fixture composition
│   └── required-env.ts          # Env var validation
├── wallet-setup/
│   └── metamask.setup.ts        # Cached wallet setup (runs once)
└── specs/
    ├── ui/                      # Plain UI tests (parallel OK)
    └── web3/                    # Web3 tests (single worker)
        └── siwe-sign-in.spec.ts
```

## Step 5: Create Files

See templates under `references/templates/web3/` for complete files:
- `required-env.ts` — fail-fast env validation
- `metamask.fixture.ts` — Synpress fixture wiring
- `metamask.setup.ts` — wallet import + dapp pre-connect
- `siwe-sign-in.spec.ts` — example SIWE test

## Step 6: Build Cache and Run

```bash
# Start dev servers first (cache requires running app)
<pm> run dev

# Build wallet cache (one-time, or after setup changes)
<pm> run e2e:cache

# Run Web3 tests
<pm> run e2e:test:web3
```

## Architecture: Pre-Connect in Cache

The wallet setup performs the **full connection flow** (wallet UI modal → MetaMask approval) during cache build. Tests skip the connect UI entirely.

This works because:
1. **Synpress cache** persists MetaMask extension state + browser localStorage
2. **wagmi/RainbowKit auto-reconnect** detects existing permission on reload
3. **Same-origin requirement** — cache and tests must use identical origin (`E2E_BASE_URL`)

**Performance**: ~90s (full modal flow) → ~9s (sign only)

### Critical: `connectToDapp()` Does NOT Trigger the Popup

Synpress's `connectToDapp()` only **approves** the MetaMask permission popup. The wallet selection UI (RainbowKit, ConnectKit, etc.) must be clicked first to trigger the popup.

## Adapting to Different Wallet UIs

| Library | Connect Flow |
|---------|-------------|
| RainbowKit | `button "Connect Wallet"` → dialog → `button "MetaMask"` |
| ConnectKit | `button "Connect"` → modal → `button "MetaMask"` |
| Web3Modal | `w3m-connect-button` → `w3m-wallet-button[name="MetaMask"]` |
| Custom | Find your connect button and wallet option selectors |

## Cache Lifecycle

Cache is hash-based: changing wallet setup code generates a new hash.

**Rebuild when:**
- `metamask.setup.ts` changes
- Wallet connect UI in app changes
- After clearing `.cache-synpress/`

**Command**: `e2e:cache:force` (or `rm -rf .cache-synpress && e2e:cache`)

## Safety

- Use a **dedicated test wallet** with no real funds
- **Testnet only** — never configure mainnet in test setup
- Disable traces/videos in CI (`process.env.CI ? "off" : ...`)
- Never commit seed phrases or passwords
