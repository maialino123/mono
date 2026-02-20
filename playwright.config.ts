import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  testDir: "./e2e/specs",
  timeout: 90_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["html", { outputFolder: "playwright-report", open: "never" }], ["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3001",
    trace: process.env.CI ? "off" : "retain-on-failure",
    screenshot: "only-on-failure",
    video: process.env.CI ? "off" : "retain-on-failure",
  },
  webServer: [
    {
      command: "bun run dev",
      port: 3000,
      cwd: path.resolve(__dirname, "apps/server"),
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "bun run dev",
      port: 3001,
      cwd: path.resolve(__dirname, "apps/web"),
      reuseExistingServer: !process.env.CI,
    },
  ],
  projects: [{ name: "chromium" }],
});
