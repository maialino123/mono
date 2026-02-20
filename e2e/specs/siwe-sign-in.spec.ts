import { expect, test } from "../fixtures/phantom.fixture";

test("sign in with Phantom via SIWE", async ({ page, phantom }) => {
  await page.goto("/sign-in");

  // Connect wallet if not pre-connected from cache
  const connectWalletButton = page.getByRole("button", { name: "Connect Wallet" });
  await expect(connectWalletButton).toBeVisible();
  await connectWalletButton.click();

  // RainbowKit connect dialog
  const rainbowKitDialog = page.getByRole("dialog");
  await rainbowKitDialog.waitFor();
  await page.getByRole("button", { name: "Phantom" }).click();
  await phantom.connectToDapp();
  await rainbowKitDialog.waitFor({ state: "hidden" });

  // Now sign the SIWE message
  const signInWithWalletButton = page.getByRole("button", { name: /sign in with wallet/i });
  await expect(signInWithWalletButton).toBeVisible({ timeout: 10_000 });
  await signInWithWalletButton.click();
  await phantom.confirmSignature();

  await page.waitForURL((url) => !url.pathname.startsWith("/sign-in"));
  await expect(page).toHaveURL(/\/(mint)?$/);
});
