# Web3 / Synpress Setup (Phantom)

Phantom wallet automation via Synpress v4. This is an **optional module** — only needed for Web3 wallet flows.

**Why Phantom over MetaMask:** MetaMask v13's MV3 service worker goes idle before state persistence fires, causing a fundamental Synpress bug that could not be worked around after 10+ attempts. Phantom works reliably with Synpress 4.1.2.

## Prerequisites
- Base Playwright setup completed
- Dedicated test wallet (seed phrase with no real funds)
- Testnet only (e.g., Sepolia)

## Constraints
- workers: 1 — wallet extension shares browser state
- fullyParallel: false — single browser context required
- Version pinning — Synpress 4.1.2 + Playwright 1.48.2 (pinned due to synpress-cache peerDependency on playwright-core 1.48.2)

## Step 1: Install Dependencies
```bash
<pm> add -D @synthetixio/synpress@4.1.2
<pm> add -D @playwright/test@1.48.2
<pm> add -D dotenv-cli
```

## Step 2: Phantom CRX Download Script
Synpress's built-in Phantom CRX URL (crx-backup.phantom.dev) is dead. Create `e2e/scripts/download-phantom.ts` to fetch from Chrome Web Store using extension ID `bfnaelmomeimhlpmgjnjophhpkkoljpa`. Places CRX at `.cache-synpress/phantom-chrome-latest.crx`.

## Step 3: Enable Testnet Script
Synpress's built-in `phantom.toggleTestnetMode()` doesn't work with Phantom v26 (outdated selectors). Create `e2e/scripts/enable-phantom-testnet.ts` as a post-cache step that unlocks the wallet and navigates the v26 UI to enable testnet mode.

## Step 4: Add Scripts
```json
{
  "e2e:download-phantom": "bun run e2e/scripts/download-phantom.ts",
  "e2e:enable-testnet": "dotenv -e .env.e2e.local -- bun run e2e/scripts/enable-phantom-testnet.ts",
  "e2e:cache": "bun run e2e:download-phantom && dotenv -e .env.e2e.local -- synpress e2e/wallet-setup --headless --phantom && bun run e2e:enable-testnet",
  "e2e:cache:force": "bun run e2e:download-phantom && dotenv -e .env.e2e.local -- synpress e2e/wallet-setup --headless --phantom --force && bun run e2e:enable-testnet",
  "e2e:test": "dotenv -e .env.e2e.local -- playwright test",
  "e2e:test:siwe": "dotenv -e .env.e2e.local -- playwright test e2e/specs/siwe-sign-in.spec.ts"
}
```
Note: Synpress CLI requires `--phantom` flag for Phantom wallet.

## Step 5: Environment Variables
Same as before: `.env.e2e.example` (committed) and `.env.e2e.local` (gitignored):
```bash
E2E_WALLET_PASSWORD="your-wallet-password"
E2E_WALLET_SEED_PHRASE="word1 word2 ... word12"
E2E_BASE_URL="http://localhost:3001"
```

## Step 6: Directory Structure
```
e2e/
├── fixtures/
│   ├── phantom.fixture.ts        # Synpress Phantom fixture
│   └── required-env.ts           # Env var validation
├── scripts/
│   ├── download-phantom.ts       # CRX download from Chrome Web Store
│   └── enable-phantom-testnet.ts # Post-cache testnet enablement
├── wallet-setup/
│   └── phantom.setup.ts          # Cached wallet setup (runs once)
└── specs/
    └── siwe-sign-in.spec.ts      # SIWE sign-in test
```

## Step 7: Create Files
See templates under `references/templates/web3/`:
- `required-env.ts` — fail-fast env validation
- `phantom-fixture.ts` — Synpress Phantom fixture
- `phantom-setup.ts` — wallet import
- `siwe-sign-in-spec.ts` — example SIWE test with Phantom

## Step 8: Build Cache and Run
Cache pipeline: download CRX → build Synpress cache → enable testnet mode
```bash
bun run dev        # Start dev servers first
bun run e2e:cache  # Build wallet cache (one-time)
bun run e2e:test   # Run tests
```

## Phantom-Specific Workarounds
1. **CRX Download**: Synpress's built-in URL dead → custom script fetches from Chrome Web Store
2. **Testnet Toggle**: Synpress's `toggleTestnetMode()` broken with Phantom v26 → custom post-cache script
3. **No pre-connect in cache**: Unlike MetaMask approach, Phantom setup only imports wallet. The SIWE test handles the full RainbowKit connect flow each time (~13s total).

## Adapting to Different Wallet UIs
| Library | Connect Flow |
|---------|-------------|
| RainbowKit | `button "Connect Wallet"` → dialog → `button "Phantom"` |
| ConnectKit | `button "Connect"` → modal → `button "Phantom"` |
| Custom | Find your connect button and wallet option selectors |

## Cache Lifecycle
Cache is hash-based. Rebuild when:
- `phantom.setup.ts` changes
- After clearing `.cache-synpress/`
- After Phantom extension updates

Command: `e2e:cache:force`

## Safety
- Use a dedicated test wallet with no real funds
- Testnet only
- Disable traces/videos in CI
- Never commit seed phrases or passwords
