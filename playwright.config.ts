import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  testDir: "./e2e/specs",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["html", { outputFolder: "playwright-report", open: "never" }], ["list"]],
  use: {
    baseURL: "http://localhost:3001",
    trace: process.env.CI ? "off" : "retain-on-failure",
    screenshot: "only-on-failure",
    video: process.env.CI ? "off" : "retain-on-failure",
  },
  webServer: [
    {
      command: "bun run dev",
      port: 3000,
      reuseExistingServer: !process.env.CI,
      cwd: path.resolve(__dirname, "apps/server"),
    },
    {
      command: "bun run dev",
      port: 3001,
      reuseExistingServer: !process.env.CI,
      cwd: path.resolve(__dirname, "apps/web"),
    },
  ],
  projects: [
    {
      name: "chromium",
    },
  ],
});
