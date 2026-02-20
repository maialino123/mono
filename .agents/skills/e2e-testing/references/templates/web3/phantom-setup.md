# phantom.setup.ts

Phantom wallet setup for Synpress cache. Unlike MetaMask, Phantom setup only imports the wallet — pre-connect is NOT done in cache because the SIWE test handles the full connect flow. Testnet mode is enabled by a separate post-cache script.

```ts
import { defineWalletSetup } from "@synthetixio/synpress";
import { Phantom } from "@synthetixio/synpress/playwright";
import { requireEnv } from "../fixtures/required-env";

const walletPassword = requireEnv("E2E_WALLET_PASSWORD");
const seedPhrase = requireEnv("E2E_WALLET_SEED_PHRASE");

const phantomSetup = defineWalletSetup(walletPassword, async (context, walletPage) => {
	const phantom = new Phantom(context, walletPage, walletPassword);
	await phantom.importWallet(seedPhrase);
});

export default phantomSetup;
```
