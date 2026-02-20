import { expect, test } from "../fixtures/phantom.fixture";

test("sign in with Phantom via SIWE", async ({ page, phantom }) => {
  await page.goto("/sign-in");

  // Step 1: Click "Connect Wallet" (or "Sign in with Wallet") to open RainbowKit modal
  const walletButton = page.getByRole("button", { name: /Connect Wallet|Sign in with Wallet/ });
  await expect(walletButton).toBeVisible();
  await walletButton.click();

  // Step 2: If RainbowKit modal opens, select Phantom
  const rainbowKitDialog = page.getByRole("dialog");
  if (await rainbowKitDialog.isVisible({ timeout: 3000 }).catch(() => false)) {
    await page.getByRole("button", { name: "Phantom" }).click();
    await phantom.connectToDapp();
    await rainbowKitDialog.waitFor({ state: "hidden", timeout: 10_000 });
  }

  // Step 3: After wallet connected, click "Sign in with Wallet"
  const signInButton = page.getByRole("button", { name: "Sign in with Wallet" });
  await expect(signInButton).toBeVisible({ timeout: 10_000 });
  await signInButton.click();

  // Step 4: Approve SIWE signature in Phantom
  await phantom.confirmSignature();

  // Step 5: Assert redirect to authenticated route
  await page.waitForURL((url) => !url.pathname.startsWith("/sign-in"), { timeout: 15_000 });
});
