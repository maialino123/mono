# Stage 0: Init

Run once per project to set up cyberk-flow.

## 0. Prerequisites

Check that `bun` is installed: run `bun --version`.

If **not installed**, ask the user to install it:

- **macOS / Linux:**
  ```bash
  curl -fsSL https://bun.sh/install | bash
  ```
- **Windows:**
  ```powershell
  powershell -c "irm bun.sh/install.ps1 | iex"
  ```

Ref: https://bun.com/docs/installation

## 1. Register `cf` CLI

Check if `package.json` already has a `"cf"` script. If not, add it:

```jsonc
// package.json → scripts
"cf": "bun run .agents/skills/cyberk-flow/scripts/cf.ts"
```

## 2. Initialize

```bash
bun run cf init
```

This creates:

```
cyberk-flow/
├── changes/          # Active change proposals
│   └── archive/      # Completed changes
├── knowledge/        # Extracted knowledge
│   ├── decisions/    # Architecture & design decisions
│   ├── debugging/    # Bug root causes & fixes
│   ├── patterns/     # Code patterns & conventions
│   ├── research/     # Research results (auto-expires)
│   └── conventions/  # Project conventions
├── specs/            # Consolidated specifications
└── project.md        # Project context
```

## 3. Fill out project.md

Spawn a sub-agent to introspect the codebase and generate `cyberk-flow/project.md`:

```
Task("Generate project.md: Follow the agent instructions in .agents/skills/cyberk-flow/agents/project-dot-md.md to introspect the codebase and fill out cyberk-flow/project.md.")
```

## 4. Merge root AGENTS.md

**Always run this step** — even on re-init. `cf init` only creates `AGENTS.md` from template when it doesn't exist. When it already exists, the agent must merge missing sections.

Read the template at `.agents/skills/cyberk-flow/templates/ROOT_AGENTS.md` and the existing `./AGENTS.md`, then:
1. Compare sections (by `##` headings) between template and existing file.
2. **Add** any sections from the template that are missing in the existing file (append at end).
3. **Preserve** all existing content — do NOT modify or remove any manually-added sections or edits.
4. Ensure YAML front matter (`trigger: always_on`) exists at the top.

If no sections are missing, skip silently.

## 5. Set up security permissions

Add `amp.permissions` to `.vscode/settings.json` to enforce secret file protection at the tool level:

```jsonc
"amp.permissions": [
  { "tool": "Read", "matches": { "path": ["*.env", "*.env.*", "**/.env", "**/.env.*", "**/secrets/**", "**/*.pem", "**/*.key"] }, "action": "reject" },
  { "tool": "Bash", "matches": { "cmd": ["*cat*.env*", "*less*.env*", "*head*.env*", "*tail*.env*", "*echo*ENV*", "*cat*secrets*", "*cat*.pem*", "*cat*.key*"] }, "action": "reject" }
]
```

This enforces at the Amp tool level — unlike AGENTS.md instructions which agents can bypass.

## 6. Set up MCP servers

Add the following to `.vscode/settings.json` under the `"amp.mcpServers"` field:

```jsonc
"gkg": {
  "type": "http",
  "url": "http://localhost:27495/mcp",
  "includeTools": [
    "list_projects",
    "repo_map",
    "search_codebase_definitions",
    "index_project",
    "get_references",
    "get_definition",
    "read_definitions"
  ]
},
"deepwiki": {
  "url": "https://mcp.deepwiki.com/mcp"
},
"git-mcp": {
  "url": "https://gitmcp.io/docs"
}
```

**Check gkg availability**: Run `gkg --version` to verify it's installed.

- If **not installed**, install it automatically (do NOT ask the user):

  ```bash
  curl -fsSL https://gitlab.com/gitlab-org/rust/knowledge-graph/-/raw/main/install.sh | bash
  ```

  After installing, ensure `gkg` is on PATH (the installer typically adds `~/.local/bin`). Source the shell profile or use the full path if needed.

  Ref: https://gitlab-org.gitlab.io/rust/knowledge-graph/getting-started/install/

- After installing (or if already installed), start the server:

  ```bash
  gkg server start --detached
  ```

- Verify by running `gkg server start --detached` (it will report if already running) and checking the MCP endpoint responds:

  ```bash
  curl -s -o /dev/null -w "%{http_code}" http://localhost:27495/mcp
  ```

## 7. Semantic Search Dependency

`cf init` auto-installs `@huggingface/transformers` as a dev dependency for semantic memory search. If you need to install it manually:

```bash
bun add -d @huggingface/transformers
```

## 8. Verify

```bash
bun run cf changes
bun run cf specs
```

Both should return empty results. You're ready to create your first change.
