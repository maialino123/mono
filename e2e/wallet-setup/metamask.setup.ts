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
  await metamask.switchNetwork("Sepolia", true);

  // Pre-connect to dapp during cache build so tests skip RainbowKit UI
  const page = await context.newPage();
  await page.goto(`${dappBaseUrl}/sign-in`, { waitUntil: "domcontentloaded" });

  const connectWalletButton = page.getByRole("button", { name: "Connect Wallet" });
  await connectWalletButton.click();

  const rainbowKitDialog = page.getByRole("dialog");
  await rainbowKitDialog.waitFor();

  await page.getByRole("button", { name: "MetaMask" }).click();
  await metamask.connectToDapp();

  // Wait for connected state
  await rainbowKitDialog.waitFor({ state: "hidden" });

  await page.close();
});

export default metamaskSetup;
