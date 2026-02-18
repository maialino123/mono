# metamask.setup.ts

Cached wallet setup — runs once during `e2e:cache`. All tests reuse this cached state.

The pre-connect section must match your app's wallet connection UI.

```ts
import { defineWalletSetup } from "@synthetixio/synpress";
import { getExtensionId, MetaMask } from "@synthetixio/synpress/playwright";
import { requireEnv } from "../fixtures/required-env";

const walletPassword = requireEnv("E2E_WALLET_PASSWORD");
const seedPhrase = requireEnv("E2E_METAMASK_SEED_PHRASE");
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

  // RainbowKit flow example:
  const connectWalletButton = page.getByRole("button", { name: "Connect Wallet" });
  await connectWalletButton.click();

  const rainbowKitDialog = page.getByRole("dialog");
  await rainbowKitDialog.waitFor();

  await page.getByRole("button", { name: "MetaMask" }).click();
  await metamask.connectToDapp();

  await rainbowKitDialog.waitFor({ state: "hidden" });
  await page.close();
});

export default metamaskSetup;
```

## Adapting for Other Wallet UIs

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
