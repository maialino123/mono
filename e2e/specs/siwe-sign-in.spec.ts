import { expect, test } from "../fixtures/metamask.fixture";

test("sign in with MetaMask via SIWE", async ({ page, metamask }) => {
  await page.goto("/sign-in");

  // Wallet is pre-connected via cached setup — skip RainbowKit connect flow
  const signInWithWalletButton = page.getByRole("button", { name: "Sign in with Wallet" });
  await expect(signInWithWalletButton).toBeVisible();

  await signInWithWalletButton.click();
  await metamask.confirmSignature();

  await page.waitForURL((url) => !url.pathname.startsWith("/sign-in"));
  await expect(page).toHaveURL(/\/(mint)?$/);
});
