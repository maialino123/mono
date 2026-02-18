# siwe-sign-in.spec.ts

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
