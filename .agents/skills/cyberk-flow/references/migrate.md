# Docs → Knowledge Migration

After `cf migrate` detects a `docs/` directory, follow this guide to classify each markdown file and store it in `cyberk-flow/knowledge/` using `cf learn`.

## Knowledge Categories

| Category | Description | Examples |
|----------|-------------|----------|
| `decisions` | Architecture & design decisions, strategic rationale | "Why we chose X", tech stack decisions, migration rationale |
| `debugging` | Bug root causes, troubleshooting logs, fix approaches | Error investigations, failed approaches, workaround logs |
| `patterns` | Code patterns, implementation guides, integration knowledge | How feature X works, API integration, library usage patterns |
| `research` | Research results, library comparisons (auto-expires 14 days) | Library evaluation, PoC findings, benchmark results |
| `conventions` | Project setup guides, coding standards, workflow guides | Getting started, env setup, naming conventions |

## Process

For each `.md` file listed by `cf migrate`:

1. **Read** the file to understand its content
2. **Classify** into one of the 5 categories above
3. **Extract labels** — 2-4 lowercase kebab-case tags (e.g., `auth`, `playwright`, `redis`, `e2e`)
4. **Run** `cf learn` with the file content piped via stdin:

```bash
cat docs/<path-to-file> | bun run cf learn "<title>" \
  --category <category> \
  --source "migrated-from-docs/<path-to-file>" \
  --labels "<label1>,<label2>,<label3>"
```

5. **Verify** the file was created in `cyberk-flow/knowledge/<category>/`

## After All Files Are Processed

Delete the `docs/` directory:

```bash
rm -rf docs/
```

## Example

Given `docs/knowledge/rate-limiting-implementation.md`:

```bash
cat docs/knowledge/rate-limiting-implementation.md | bun run cf learn "Rate Limiting Implementation" \
  --category patterns \
  --source "migrated-from-docs/knowledge/rate-limiting-implementation.md" \
  --labels "rate-limiting,hono,redis,middleware"
```

Given `docs/getting-started.md`:

```bash
cat docs/getting-started.md | bun run cf learn "Getting Started Guide" \
  --category conventions \
  --source "migrated-from-docs/getting-started.md" \
  --labels "setup,docker,development"
```

Given `docs/e2e-metamask-troubleshooting.md`:

```bash
cat docs/e2e-metamask-troubleshooting.md | bun run cf learn "MetaMask E2E Troubleshooting" \
  --category debugging \
  --source "migrated-from-docs/e2e-metamask-troubleshooting.md" \
  --labels "e2e,metamask,synpress,playwright"
```
