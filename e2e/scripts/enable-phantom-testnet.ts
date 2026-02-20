/**
 * Post-cache script: enables testnet mode in Phantom wallet.
 * Unlocks wallet, navigates Developer Settings, toggles testnet mode.
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const CACHE_DIR = path.join(process.cwd(), ".cache-synpress");
const WALLET_PASSWORD = process.env.E2E_WALLET_PASSWORD;

if (!WALLET_PASSWORD) {
  console.error("[enable-phantom-testnet] E2E_WALLET_PASSWORD not set");
  process.exit(1);
}

function findPhantomExtDir(): string {
  const entries = fs.readdirSync(CACHE_DIR);
  const phantomDir = entries.find(
    (e) => e.startsWith("phantom-chrome") && !e.endsWith(".crx") && fs.statSync(path.join(CACHE_DIR, e)).isDirectory(),
  );
  if (!phantomDir) throw new Error("Phantom extension dir not found in .cache-synpress/");
  return path.join(CACHE_DIR, phantomDir);
}

function findCacheProfileDir(): string {
  const entries = fs.readdirSync(CACHE_DIR);
  const hashDirs = entries.filter(
    (e) => /^[0-9a-f]{20}$/.test(e) && fs.statSync(path.join(CACHE_DIR, e)).isDirectory(),
  );
  if (hashDirs.length === 0) throw new Error("No cache profile found in .cache-synpress/");
  hashDirs.sort((a, b) => fs.statSync(path.join(CACHE_DIR, b)).mtimeMs - fs.statSync(path.join(CACHE_DIR, a)).mtimeMs);
  return path.join(CACHE_DIR, hashDirs[0]!);
}

async function getExtensionId(context: Awaited<ReturnType<typeof chromium.launchPersistentContext>>): Promise<string> {
  for (let i = 0; i < 30; i++) {
    for (const worker of context.serviceWorkers()) {
      const url = worker.url();
      if (url.includes("chrome-extension://")) return url.split("/")[2]!;
    }
    for (const bg of context.backgroundPages()) {
      const url = bg.url();
      if (url.includes("chrome-extension://")) return url.split("/")[2]!;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("Could not find Phantom extension ID");
}

async function main() {
  const extensionDir = findPhantomExtDir();
  const cachePath = findCacheProfileDir();
  console.log("[enable-phantom-testnet] Cache:", path.basename(cachePath));

  const context = await chromium.launchPersistentContext(cachePath, {
    headless: false,
    args: [`--disable-extensions-except=${extensionDir}`, `--load-extension=${extensionDir}`],
  });

  try {
    const extensionId = await getExtensionId(context);
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);

    // Unlock if needed
    const unlockInput = page.locator("[data-testid='unlock-form-password-input']");
    const needsUnlock = await unlockInput
      .waitFor({ state: "visible", timeout: 3000 })
      .then(() => true)
      .catch(() => false);
    if (needsUnlock) {
      await unlockInput.fill(WALLET_PASSWORD);
      await page.locator("[data-testid='unlock-form-submit-button']").click();
      await page.waitForTimeout(3000);
      console.log("[enable-phantom-testnet] Wallet unlocked");
    }

    // Dismiss promo popups (Sui, Monad, etc.) — click "Not Now" not "Close"
    for (const label of ["Not Now", "Maybe Later", "Skip"]) {
      const btn = page.getByRole("button", { name: label });
      const isPromoVisible = await btn
        .waitFor({ state: "visible", timeout: 1500 })
        .then(() => true)
        .catch(() => false);
      if (isPromoVisible) {
        await btn.click();
        console.log(`[enable-phantom-testnet] Dismissed: ${label}`);
        await page.waitForTimeout(1000);
      }
    }

    // Navigate: Account menu → Settings → Developer Settings → Toggle Testnet
    await page.locator("[data-testid='settings-menu-open-button']").click({ timeout: 10_000 });
    console.log("[enable-phantom-testnet] Opened account menu");

    await page.locator("[data-testid='sidebar_menu-button-settings']").click({ timeout: 5000 });
    console.log("[enable-phantom-testnet] Opened settings");

    await page.getByRole("button", { name: "Developer Settings" }).click({ timeout: 5000 });
    console.log("[enable-phantom-testnet] Opened developer settings");

    const toggle = page.locator("[data-testid='toggleTestNetwork']");
    await toggle.waitFor({ state: "visible", timeout: 5000 });

    // Only enable if not already enabled — check aria-checked or input state
    const isAlreadyEnabled =
      (await toggle.getAttribute("aria-checked")) === "true" ||
      (await toggle
        .locator("input")
        .evaluate((el: HTMLInputElement) => el.checked)
        .catch(() => false));

    if (!isAlreadyEnabled) {
      await toggle.click();
      console.log("[enable-phantom-testnet] Testnet mode enabled!");
    } else {
      console.log("[enable-phantom-testnet] Testnet mode already enabled, skipping toggle");
    }

    // Wait for state to persist
    await page.waitForTimeout(2000);
  } finally {
    await context.close();
  }
}

main().catch((err) => {
  console.error("[enable-phantom-testnet] Error:", err);
  process.exit(1);
});
