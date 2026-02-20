# File Templates

Complete file templates for Web3 E2E testing setup. Adapt selectors, ports, network, and paths to the target project.

## e2e/fixtures/required-env.ts

```ts
export function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}
```

## e2e/fixtures/metamask.fixture.ts

```ts
import { testWithSynpress } from "@synthetixio/synpress";
import { metaMaskFixtures } from "@synthetixio/synpress/playwright";
import metamaskSetup from "../wallet-setup/metamask.setup";

export const test = testWithSynpress(metaMaskFixtures(metamaskSetup));
export const { expect } = test;
```

## e2e/wallet-setup/metamask.setup.ts

This is the **cached wallet setup**. It runs once during `e2e:cache` and the browser state is persisted. All tests reuse this cached state.

The pre-connect section must match your app's wallet connection UI. The example below uses RainbowKit.

```ts
import { defineWalletSetup } from "@synthetixio/synpress";
import { getExtensionId, MetaMask } from "@synthetixio/synpress/playwright";
import { requireEnv } from "../fixtures/required-env";

const walletPassword = requireEnv("E2E_WALLET_PASSWORD");
const seedPhrase = requireEnv("E2E_WALLET_SEED_PHRASE");
const dappBaseUrl = process.env.E2E_BASE_URL ?? "http://localhost:3001";

const metamaskSetup = defineWalletSetup(walletPassword, async (context, walletPage) => {
  const extensionId = await getExtensionId(context, "MetaMask");
  const metamask = new MetaMask(context, walletPage, walletPassword, extensionId);

  await metamask.importWallet(seedPhrase);
  // Change network to match your dapp's target chain
  await metamask.switchNetwork("Sepolia", true);

  // --- Pre-connect to dapp (adapt selectors to your wallet UI) ---
  const page = await context.newPage();
  await page.goto(`${dappBaseUrl}/sign-in`, { waitUntil: "domcontentloaded" });

  // RainbowKit flow: click connect → select MetaMask → approve
  const connectWalletButton = page.getByRole("button", { name: "Connect Wallet" });
  await connectWalletButton.click();

  const rainbowKitDialog = page.getByRole("dialog");
  await rainbowKitDialog.waitFor();

  await page.getByRole("button", { name: "MetaMask" }).click();
  await metamask.connectToDapp();

  // Wait for connected state before closing
  await rainbowKitDialog.waitFor({ state: "hidden" });

  await page.close();
});

export default metamaskSetup;
```

### Adapting for other wallet UIs

Replace the "Pre-connect" section. Examples:

**ConnectKit:**
```ts
await page.getByRole("button", { name: "Connect" }).click();
await page.getByRole("button", { name: "MetaMask" }).click();
await metamask.connectToDapp();
```

**Custom connect button:**
```ts
await page.locator("#connect-wallet-btn").click();
await page.locator("[data-wallet='metamask']").click();
await metamask.connectToDapp();
```

## e2e/specs/siwe-sign-in.spec.ts

Example SIWE happy-path test. Wallet is already connected via cached setup.

```ts
import { expect, test } from "../fixtures/metamask.fixture";

test("sign in with MetaMask via SIWE", async ({ page, metamask }) => {
  await page.goto("/sign-in");

  // Wallet is pre-connected via cached setup — skip connect flow
  const signInWithWalletButton = page.getByRole("button", { name: "Sign in with Wallet" });
  await expect(signInWithWalletButton).toBeVisible();

  await signInWithWalletButton.click();
  await metamask.confirmSignature();

  // Assert redirect away from sign-in to authenticated route
  await page.waitForURL((url) => !url.pathname.startsWith("/sign-in"));
  await expect(page).toHaveURL(/\/(mint)?$/);
});
```

## .env.e2e.example

```bash
E2E_WALLET_PASSWORD="your-wallet-password"
E2E_WALLET_SEED_PHRASE="word1 word2 ... word12"
```

## .gitignore additions

```
.cache-synpress
.env.e2e.local
playwright-report
test-results
```

## Version Pinning Note

Synpress v4 is tightly coupled to specific Playwright versions. Always pin both:

```json
{
  "devDependencies": {
    "@playwright/test": "1.48.2",
    "@synthetixio/synpress": "4.0.6"
  }
}
```

Upgrade them together and rebuild cache after upgrading.
