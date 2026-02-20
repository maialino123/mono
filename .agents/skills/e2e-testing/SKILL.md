---
name: e2e-testing
description: "Playwright-based E2E testing with optional Web3/Phantom module. Use when adding UI acceptance tests, creating test plans, generating specs from plans, or healing failing tests."
---

# E2E Testing

Playwright-based E2E testing skill with two browser automation backends (CLI default, Test Agents MCP optional) and optional Web3/Synpress module. Can integrate with spec-driven workflows.

## When to Use

- Adding acceptance tests for user-visible UI flows
- Regression safety for auth, navigation, critical journeys
- Generating E2E tests from specs or test plans
- Healing/fixing broken E2E tests automatically
- Web3 wallet flows (Phantom connect, SIWE sign-in, transactions) — optional module

## Artifacts

| Artifact | Location | Description |
|----------|----------|-------------|
| Test plans | `e2e/plans/*.md` | Human-readable scenario plans |
| Test specs | `e2e/specs/**/*.spec.ts` | Executable Playwright tests |
| Fixtures | `e2e/fixtures/*` | Shared test helpers and setup |
| Wallet setup | `e2e/wallet-setup/*` | Synpress cache config (Web3 only) |

## Core Rules

1. **No orchestrators in webServer** — never use turbo/nx/lerna as Playwright `webServer.command`. Run app dev scripts directly with absolute `cwd`. See [troubleshooting/webserver-orphans.md](references/troubleshooting/webserver-orphans.md).
2. **Test isolation** — each test should be independent and runnable in any order.
3. **Resilient selectors** — prefer `getByRole()` > `getByText()` > `getByLabel()` > `getByTestId()` > CSS.
4. **CI safety** — disable traces/videos in CI to prevent secrets leakage.

## Browser Automation Backends

Two approaches for AI-assisted browser exploration and test authoring:

| | **Playwright CLI** (default) | **Test Agents MCP** (optional) |
|---|---|---|
| **Interface** | Bash commands (`playwright-cli open/click/snapshot`) | MCP tool calls (`mcp__playwright-test__*`) |
| **Token cost** | **~27K** — snapshots/screenshots saved to disk | **~114K** — returned inline in context |
| **Best for** | Explore UI, author tests, quick debugging | Planner→Generator→Healer workflow, deep introspection |
| **Setup** | `npm install -g @playwright/cli` | Auto-loaded via skill `mcp.json` |

**Recommendation**: Use CLI as default. Escalate to Test Agents MCP when you need step-by-step replay, auto-healing loops, or locator generation.

→ CLI details: load `playwright-cli` skill (full command reference, test generation, session management, etc.)

## Workflows

### 1. Manual — Write tests directly

Read setup guide → write `.spec.ts` files → run with `npx playwright test`.

### 2. CLI-assisted — Explore → Snapshot → Write tests (recommended)

Token-efficient workflow using Playwright CLI. Load `playwright-cli` skill for full command reference.

1. **Explore** — `playwright-cli open http://localhost:3001 --headed` → `snapshot` → discover element refs
2. **Author** — map snapshot refs to `getByRole()` locators, write `.spec.ts` (see `playwright-cli` skill's test-generation reference)
3. **Run** — `npx playwright test`
4. **Heal** — `playwright-cli open` failing page → `snapshot` → compare with test selectors → fix

### 3. Test Agents MCP — Plan → Generate → Heal

AI-assisted test authoring using Playwright Test Agents MCP server. Higher token cost but richer introspection.

| Agent | Input | Output |
|-------|-------|--------|
| **Planner** | App URL + seed test | Markdown test plan |
| **Generator** | Markdown plan | `.spec.ts` files |
| **Healer** | Failing test name | Fixed/passing test |

→ [references/workflows/test-agents-mcp/planner.md](references/workflows/test-agents-mcp/planner.md) | [generator.md](references/workflows/test-agents-mcp/generator.md) | [healer.md](references/workflows/test-agents-mcp/healer.md)

## Modules

### Base Playwright (default)

Standard Playwright E2E — parallel-friendly, no special constraints.

→ Setup: [references/setup/base-playwright.md](references/setup/base-playwright.md)
→ Templates: [references/templates/base/playwright-config.md](references/templates/base/playwright-config.md) | [seed-spec.md](references/templates/base/seed-spec.md)

### Web3 / Synpress (optional)

Phantom wallet automation via Synpress. **Phantom replaces MetaMask** — MetaMask was abandoned due to MV3 service worker idle bug. Adds constraints:
- **Single worker** (`workers: 1`, `fullyParallel: false`)
- **Pinned versions** — Synpress 4.1.2 + Phantom + Playwright 1.48.2
- **Cache pipeline** — `download-phantom` → `synpress cache --phantom` → `enable-testnet`
- **Synpress CLI** — always pass `--phantom` flag
- **Workarounds** — Synpress's built-in Phantom CRX URL is dead; custom download script needed. Synpress's `phantom.toggleTestnetMode()` broken with Phantom v26; custom post-cache script needed for testnet enablement.
- **Env vars** — `E2E_WALLET_PASSWORD`, `E2E_WALLET_SEED_PHRASE`

→ Setup: [references/setup/web3-synpress.md](references/setup/web3-synpress.md)
→ Templates: [references/templates/web3/phantom-setup.md](references/templates/web3/phantom-setup.md) | [phantom-fixture.md](references/templates/web3/phantom-fixture.md) | [playwright-web3-config.md](references/templates/web3/playwright-web3-config.md)

## References

| Topic | File |
|-------|------|
| **Setup** | |
| Playwright CLI | Load `playwright-cli` skill |
| Base Playwright setup | [setup/base-playwright.md](references/setup/base-playwright.md) |
| Test Agents MCP setup | [setup/test-agents-mcp.md](references/setup/test-agents-mcp.md) |
| Web3/Synpress setup | [setup/web3-synpress.md](references/setup/web3-synpress.md) |
| webServer integration | [setup/webserver-integration.md](references/setup/webserver-integration.md) |
| **Workflows — Test Agents MCP** | |
| MCP planner | [workflows/test-agents-mcp/planner.md](references/workflows/test-agents-mcp/planner.md) |
| MCP generator | [workflows/test-agents-mcp/generator.md](references/workflows/test-agents-mcp/generator.md) |
| MCP healer | [workflows/test-agents-mcp/healer.md](references/workflows/test-agents-mcp/healer.md) |
| **Templates** | |
| Base config template | [templates/base/playwright-config.md](references/templates/base/playwright-config.md) |
| Base seed test | [templates/base/seed-spec.md](references/templates/base/seed-spec.md) |
| Web3 wallet setup | [templates/web3/phantom-setup.md](references/templates/web3/phantom-setup.md) |
| Web3 fixture | [templates/web3/phantom-fixture.md](references/templates/web3/phantom-fixture.md) |
| Web3 config | [templates/web3/playwright-web3-config.md](references/templates/web3/playwright-web3-config.md) |
| Web3 SIWE spec | [templates/web3/siwe-sign-in-spec.md](references/templates/web3/siwe-sign-in-spec.md) |
| **Troubleshooting** | |
| webServer orphans | [troubleshooting/webserver-orphans.md](references/troubleshooting/webserver-orphans.md) |
