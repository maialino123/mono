# enable-phantom-testnet.ts

Post-cache fixup: launches cached Synpress profile and toggles Phantom's "Testnet Mode". See [architecture rationale](../../setup/web3-synpress.md#architecture-post-cache-fixup).

```ts
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import { requireEnv } from "../fixtures/required-env";

const walletPassword = requireEnv("E2E_WALLET_PASSWORD");

async function main() {
  const cacheDir = path.join(process.cwd(), ".cache-synpress");
  const dirs = fs.readdirSync(cacheDir).filter((d) => {
    const full = path.join(cacheDir, d);
    return fs.statSync(full).isDirectory() && d !== "phantom-chrome-latest";
  });

  for (const dir of dirs) {
    const userDataDir = path.join(cacheDir, dir);
    const context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      args: [
        `--disable-extensions-except=${path.join(cacheDir, "phantom-chrome-latest")}`,
        `--load-extension=${path.join(cacheDir, "phantom-chrome-latest")}`,
      ],
    });

    const pages = context.pages();
    let phantomPage = pages.find((p) => p.url().includes("chrome-extension://"));
    if (!phantomPage) {
      phantomPage = await context.waitForEvent("page", {
        predicate: (p) => p.url().includes("chrome-extension://"),
      });
    }

    // Unlock
    await phantomPage.locator('input[type="password"]').fill(walletPassword);
    await phantomPage.getByRole("button", { name: "Unlock" }).click();

    // Dismiss onboarding
    const notNow = phantomPage.getByRole("button", { name: "Not Now" });
    if (await notNow.isVisible({ timeout: 3000 }).catch(() => false)) await notNow.click();
    const skip = phantomPage.getByRole("button", { name: "Skip" });
    if (await skip.isVisible({ timeout: 2000 }).catch(() => false)) await skip.click();

    // Enable testnet
    await phantomPage.locator('[data-testid="settings-menu-open-button"]').click();
    await phantomPage.locator('[data-testid="sidebar_menu-button-settings"]').click();
    await phantomPage.getByText("Developer Settings").click();
    await phantomPage.locator('[data-testid="toggleTestNetwork"]').click();

    await context.close();
  }
}

if (import.meta.main) {
  main();
}
```
