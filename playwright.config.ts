import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e/specs",
  timeout: 90_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["html", { outputFolder: "playwright-report", open: "never" }], ["list"]],
  use: {
    baseURL: "http://localhost:3001",
    trace: process.env.CI ? "off" : "retain-on-failure",
    screenshot: "only-on-failure",
    video: process.env.CI ? "off" : "retain-on-failure",
  },
  webServer: [
    {
      command: "bun run dev:server",
      port: 3000,
      reuseExistingServer: true,
    },
    {
      command: "bun run dev:web",
      port: 3001,
      reuseExistingServer: true,
    },
  ],
  projects: [
    {
      name: "chromium",
    },
  ],
});
