# cyberk-flow

Monorepo project of CyberK built on modern standards, continuously updated with the latest technologies.

> **Tại sao CyberK tạo dự án này?** Đọc thêm tại [docs/why-cyberk-flow.md](docs/why-cyberk-flow.md)

## Features

For detailed tech stack and architecture, see [openspec/project.md](openspec/project.md).

- **TypeScript** - Strict mode for type safety and improved developer experience
- **Next.js 16** - Full-stack React 19 framework
- **React Native + Expo** - Cross-platform mobile development
- **TailwindCSS 4** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **Hono** - Lightweight, performant server framework
- **oRPC** - End-to-end type-safe APIs with OpenAPI integration
- **Bun** - Runtime environment and package manager
- **Drizzle ORM** - TypeScript-first ORM
- **PostgreSQL** - Database engine
- **better-auth** - Authentication
- **AI SDK** - AI integration with Google Gemini
- **Biome** - Linting and formatting
- **Husky** - Git hooks for code quality
- **Turborepo** - Optimized monorepo build system

## Getting Started

Install dependencies:

```bash
bun install
```

## Development Setup

1. Start PostgreSQL via Docker:

```bash
bun run db:start
```

2. Create `.env` files from the examples:

```bash
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env
```

3. Apply the schema to your database:

```bash
bun run db:push
```

Then, run the development server:

```bash
bun run dev
```

- Web: [http://localhost:3001](http://localhost:3001)
- API: [http://localhost:3000](http://localhost:3000)
- Mobile: Use Expo Go app

## AI Setup

## Project Structure

```
cyberk-flow/
├── apps/
│   ├── web/          # Frontend (Next.js 16)
│   ├── native/       # Mobile (React Native, Expo)
│   └── server/       # Backend API (Hono, oRPC)
├── packages/
│   ├── api/          # Shared API routers & business logic
│   ├── auth/         # Authentication configuration
│   ├── cache/        # Caching layer
│   ├── config/       # Shared TypeScript configuration
│   ├── db/           # Database schema & queries (Drizzle)
│   ├── env/          # Zod-validated environment variables
```

## Available Scripts

| Command | Description |
| --- | --- |
| `bun run dev` | Start all apps in development mode |
| `bun run dev:web` | Start web app only |
| `bun run dev:server` | Start server only |
| `bun run dev:native` | Start React Native/Expo dev server |
| `bun run build` | Build all apps |
| `bun run check-types` | TypeScript type checking across all packages |
| `bun run check` | Biome formatting and linting |
| `bun run db:push` | Push schema changes to database |
| `bun run db:studio` | Open database studio UI |
| `bun run db:generate` | Generate database migrations |
| `bun run db:migrate` | Run database migrations |
| `bun run db:start` | Start PostgreSQL via Docker |
| `bun run db:stop` | Stop PostgreSQL container |
| `bun run prepare` | Initialize git hooks |

## AI-Powered Development Setup

This project leverages AI tools to optimize the development workflow. Follow the steps below to set up the AI tooling.

### 1. OpenSpec CLI

Install OpenSpec CLI for spec-driven development workflow:

```bash
npm install -g @openspec/cli
```

See [OpenSpec documentation](https://github.com/Fission-AI/OpenSpec?tab=readme-ov-file#updating-openspec) for more details.

### 2. MCP Config (Antigravity only)

Add the following MCP servers to `~/.gemini/antigravity/mcp_config.json`:

```json
{
  "mcpServers": {
    "gkg": {
      "serverUrl": "http://localhost:27495/mcp"
    },
    "deepwiki": {
      "serverUrl": "https://mcp.deepwiki.com/mcp"
    },
    "git-mcp": {
      "serverUrl": "https://gitmcp.io/docs"
    }
  }
}
```

### 3. Ampcode Setup

1. Register an account at [ampcode.com](https://ampcode.com/)
2. Go to [ampcode.com/settings](https://ampcode.com/settings) and connect with the company's GitHub organization
3. Install Amp CLI: [Getting Started Guide](https://ampcode.com/manual#get-started)
4. Install the **Sourcegraph Amp** extension in VS Code (`sourcegraph.amp`)

### 4. GitLab Knowledge Graph (GKG)

GKG provides local code intelligence via MCP for AI agents.

1. Install GKG following the [official guide](https://gitlab-org.gitlab.io/rust/knowledge-graph/getting-started/install/)
2. Start the server in background:

```bash
gkg server start --detached
```

## Replicating AI Setup to Other Projects

To bring the same AI-powered workflow to other projects, follow these steps:

### 1. Copy AGENTS.md

Copy the `AGENTS.md` file to the target project root. This is the single source of truth for agent rules.

### 2. Copy Skills

Copy the following skills from `.agents/skills/` to the target project:

- `openspec` - Spec-driven development workflow
- `cyberk-fsd-fe` - Next.js FSD architecture guide
- `librarian` - Codebase understanding agent
- `next-best-practices` - Next.js framework patterns
- `vercel-react-best-practices` - React performance optimization

### 3. Configure MCP Tools

**Ampcode** — add to `.vscode/settings.json`:

```json
{
  "amp.mcpServers": {
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
  }
}
```

**Claude Code** — add to `.claude/mcp.json`:

```json
{
  "mcpServers": {
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
  }
}
```

**Antigravity** — see [Section 1](#1-mcp-config-antigravity-only) above.

### 4. Unify Rules and Skills Across IDEs/CLIs

To avoid duplicating rules and skills for each tool, create symlinks pointing to a single source:

**Symlink rules** — point `CLAUDE.md` and `.agent/rules/GEMINI.md` to `AGENTS.md`:

```bash
ln -s AGENTS.md CLAUDE.md
mkdir -p .agent/rules && ln -s ../../AGENTS.md .agent/rules/GEMINI.md
```

**Symlink skills** — point `.agent/skills` and `.claude/skills` to `.agents/skills`:

```bash
ln -s ../.agents/skills .agent/skills
mkdir -p .claude && ln -s ../.agents/skills .claude/skills
```

This way, all AI tools (Ampcode, Claude Code, Antigravity) share the same rules and skills from a single location.

## Setup EasyCLI

[EasyCLI](https://github.com/router-for-me/EasyCLI) is a user-friendly application to run the proxy.

### 1. Installation

Download the latest version for your operating system from [GitHub Releases](https://github.com/router-for-me/EasyCLI/releases).

Install and open the application.

### 2. Configuration

**Basic Setting Tab:**

- Change Port to `8317` (General Port).
- Enable `Allow Remote Management`.
- Set a **Remote Management Secret Key** (this will be your password).
- Click **Apply**.

**Access Token Tab:**

- Delete all existing API keys.
- Create a new API key (you can choose any value).
- Click **Apply**.

### 3. Open Management Web UI

Navigate to [http://localhost:8317/management.html#](http://localhost:8317/management.html#).

Enter your **Remote Management Secret Key** when prompted.

### 4. Configure Custom Provider

You need two keys:

- **ai-provider.cyberk.io** — request the API key from the company
- **ampcode** — copy your access token from [https://ampcode.com/settings](https://ampcode.com/settings)

Go to the **Config Management** tab and add the following config:

```yaml
ampcode:
  upstream-url: https://ampcode.com/
  upstream-api-key: YOUR_AMPCODE_ACCESS_TOKEN
  restrict-management-to-localhost: false
  model-mappings:
    - from: claude-sonnet-4-5-20250929
      to: claude-sonnet-4-5-20250929
    - from: gemini-2.5-flash-lite
      to: gemini-3-flash-preview
    - from: gpt-5
      to: gemini-3-pro-preview
    - from: gpt-5.1
      to: gemini-3-pro-preview
    - from: gemini-3-flash-preview
      to: gemini-3-flash-preview
    - from: gemini-3-pro-preview
      to: gemini-3-pro-preview
    - from: claude-haiku-4-5-20251001
      to: claude-haiku-4-5-20251001
    - from: gpt-5.2
      to: gpt-5.2
    - from: gpt-5.2-codex
      to: gpt-5.3-codex
    - from: claude-opus-4-5-20251101
      to: claude-opus-4-5-20251101
    - from: claude-opus-4-6
      to: claude-opus-4-6
    - from: gemini-2.5-flash
      to: gemini-3-flash-preview
    - from: gemini-2.5-flash-lite-preview-09-2025
      to: gemini-3-flash-preview
  force-model-mappings: true
claude-api-key:
  - api-key: YOUR_COMPANY_API_KEY
    base-url: https://ai-proxy.cyberk.io
oauth-model-alias:
  antigravity:
    - name: rev19-uic3-1p
      alias: gemini-2.5-computer-use-preview-10-2025
    - name: gemini-3-pro-image
      alias: gemini-3-pro-image-preview
    - name: gemini-3-pro-high
      alias: gemini-3-pro-preview
    - name: gemini-3-flash
      alias: gemini-3-flash-preview
    - name: claude-sonnet-4-5
      alias: gemini-claude-sonnet-4-5
    - name: claude-sonnet-4-5-thinking
      alias: gemini-claude-sonnet-4-5-thinking
    - name: claude-opus-4-5-thinking
      alias: gemini-claude-opus-4-5-thinking
    - name: claude-sonnet-4-5
      alias: claude-haiku-4-5-20251001
    - name: claude-opus-4-5-thinking
      alias: claude-opus-4-5-20251101
    - name: claude-opus-4-6-thinking
      alias: claude-opus-4-6
    - name: claude-opus-4-6-thinking
      alias: gemini-claude-opus-4-6-thinking
gemini-api-key:
  - api-key: YOUR_COMPANY_API_KEY
    base-url: https://ai-proxy.cyberk.io
codex-api-key:
  - api-key: YOUR_COMPANY_API_KEY
    base-url: https://ai-proxy.cyberk.io/v1
```

If there is no claude, let oath with antigravtiy and config as below
```
oauth-model-alias:
  antigravity:
    - name: rev19-uic3-1p
      alias: gemini-2.5-computer-use-preview-10-2025
    - name: gemini-3-pro-image
      alias: gemini-3-pro-image-preview
    - name: gemini-3-pro-high
      alias: gemini-3-pro-preview
    - name: gemini-3-flash
      alias: gemini-3-flash-preview
    - name: claude-sonnet-4-5
      alias: gemini-claude-sonnet-4-5
    - name: claude-sonnet-4-5-thinking
      alias: gemini-claude-sonnet-4-5-thinking
    - name: claude-opus-4-5-thinking
      alias: gemini-claude-opus-4-5-thinking
    - name: claude-sonnet-4-5
      alias: claude-haiku-4-5-20251001
    - name: claude-opus-4-5-thinking
      alias: claude-opus-4-5-20251101
    - name: claude-opus-4-6-thinking
      alias: claude-opus-4-6
    - name: claude-opus-4-6-thinking
      alias: gemini-claude-opus-4-6-thinking
```

### 5. Integrate with Ampcode Extension

1. Open your IDE and ensure the Amp extension is installed.
2. Open the extension settings.
3. Scroll to the bottom and enter `http://localhost:8317` in the **Amp: Url** field.
4. Open the Amp Extension via the sidebar.
5. Select **Advance**.
6. Enter the API key you created earlier (in the Access Token tab) into the **Amp Access Token** field.
