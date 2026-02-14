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
├── specs/            # Consolidated specifications
├── templates/        # Templates for new changes
└── project.md        # Project context
```

## 3. Fill out project.md

Spawn a sub-agent to introspect the codebase and generate `cyberk-flow/project.md`:

```
Task("Generate project.md: Follow the agent instructions in .agents/skills/cyberk-flow/agents/project-dot-md.md to introspect the codebase and fill out cyberk-flow/project.md.")
```

## 4. Generate root AGENTS.md

Spawn a sub-agent to generate or update the root `AGENTS.md` with agent-only directives (no project info — that lives in `cyberk-flow/project.md`):

```
Task("Generate/update root AGENTS.md: Read the template at .agents/skills/cyberk-flow/templates/ROOT_AGENTS.md and create or update ./AGENTS.md following its structure (including YAML front matter). The file must contain only agent instructions: skill loader, tool selection guide, sub-agent best practices, commands, language/security requirements. Do NOT include project-specific info — only reference cyberk-flow/project.md for that. If AGENTS.md already exists, merge missing sections while preserving manually-added content. Output: updated AGENTS.md + brief summary of changes.")
```

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

## 7. Verify

```bash
bun run cf changes
bun run cf specs
```

Both should return empty results. You're ready to create your first change.
