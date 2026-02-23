---
labels: [playwright, webserver, process, turbo]
source: migrated-from-docs/knowledge/playwright-webserver-orphan-process.md
summary: > Source Thread:
---
# Playwright webServer Orphan Process Fix
**Date**: 2026-02-23

# Playwright webServer Orphan Process Fix

> **Source Thread**:
> - [T-019c6a94-9fc6-7559-8ed7-778f61e87d95](https://ampcode.com/threads/T-019c6a94-9fc6-7559-8ed7-778f61e87d95) - Root cause analysis and fix
>
> **Date**: February 2026

## Problem

After Playwright E2E tests finish, ports 3000 and 3001 remain occupied (EADDRINUSE), blocking subsequent dev/test runs.

## Root Cause

The original `playwright.config.ts` used turbo as an intermediary to start dev servers:

```
Playwright → shell → bun → turbo → actual server process
```

**Turbo creates a new process group**, isolating the actual server processes from Playwright's process-tree kill mechanism. When Playwright sends `SIGKILL` to its process group on cleanup, turbo's children (the real servers) are in a different process group and become **orphaned processes** still bound to their ports.

### Contributing Factors

| Factor | Impact |
|--------|--------|
| **`turbo` as intermediary** | Creates its own process group (TUI mode), isolating actual servers |
| **`"persistent": true`** in turbo.json | Turbo treats dev processes with special lifecycle management |
| **`"ui": "tui"`** in turbo.json | Adds another layer of process management |
| **Synpress pins `@playwright/test@1.48.2`** | Cannot use `gracefulShutdown` (requires ≥1.50) |
| **3+ levels of process nesting** | Each level may create new process groups |

### Why `gracefulShutdown` is not an option

The `gracefulShutdown` webServer option (sends SIGTERM before SIGKILL, giving turbo time to cascade shutdown) was added in Playwright v1.50. However, **Synpress 4.0.6 hard-pins `@playwright/test@1.48.2`** as a direct dependency, making this option unavailable.

## Solution

**Bypass turbo entirely** in Playwright's webServer config. Run each app's own `dev` script directly with absolute `cwd`:

```ts
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Before (broken) — turbo creates orphan processes
webServer: [
  { command: "bun run dev:server", port: 3000 },  // → turbo → bun → server
  { command: "bun run dev:web", port: 3001 },      // → turbo → next
]

// After (fixed) — each app's own dev script, shallow process tree
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
]
```

This flattens the process tree to:
```
Playwright → shell → bun/next (actual server)
```

All processes stay in Playwright's process group and are correctly killed on cleanup.

### Additional hardening

| Change | Rationale |
|--------|-----------|
| **Absolute `cwd`** via `path.resolve(__dirname, ...)` | Prevents failures when Playwright is invoked from non-root directories |
| **`reuseExistingServer: !process.env.CI`** | CI fails fast on leaked processes; local dev reuses existing servers |
| **`bun run dev`** (app's own script) | Avoids `bunx` resolution surprises; keeps parity with normal dev workflow |

## Key Takeaway

**Never use process orchestrators (turbo, nx, lerna) as intermediaries in Playwright's webServer config.** They create independent process groups that escape Playwright's cleanup. Always run each app's own dev script directly with absolute `cwd`.

## Files Changed

- `playwright.config.ts` — webServer commands bypass turbo, use absolute `cwd`, CI-aware `reuseExistingServer`
