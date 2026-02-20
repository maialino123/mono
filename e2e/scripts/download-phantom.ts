/**
 * Downloads the Phantom Chrome extension CRX from Chrome Web Store.
 * This is needed because the Synpress built-in URL (crx-backup.phantom.dev) is dead.
 * Places the CRX at .cache-synpress/phantom-chrome-latest.crx where Synpress expects it.
 */
import fs from "node:fs";
import path from "node:path";

const PHANTOM_EXTENSION_ID = "bfnaelmomeimhlpmgjnjophhpkkoljpa";
const CHROME_UPDATE_URL = `https://clients2.google.com/service/update2/crx?response=redirect&prodversion=120.0.0.0&acceptformat=crx2,crx3&x=id%3D${PHANTOM_EXTENSION_ID}%26uc`;
const CACHE_DIR = path.join(process.cwd(), ".cache-synpress");
const OUTPUT_PATH = path.join(CACHE_DIR, "phantom-chrome-latest.crx");

async function main() {
  if (fs.existsSync(OUTPUT_PATH)) {
    console.log("[download-phantom] CRX already exists at", OUTPUT_PATH);
    return;
  }

  fs.mkdirSync(CACHE_DIR, { recursive: true });

  console.log("[download-phantom] Downloading Phantom extension from Chrome Web Store...");

  const response = await fetch(CHROME_UPDATE_URL, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  fs.writeFileSync(OUTPUT_PATH, Buffer.from(buffer));

  const sizeMB = (buffer.byteLength / 1024 / 1024).toFixed(2);
  console.log(`[download-phantom] Downloaded ${sizeMB}MB to ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error("[download-phantom] Error:", err.message);
  process.exit(1);
});
