# cyberk-flow

Monorepo project of CyberK built on modern standards, continuously updated with the latest technologies.

## Features

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

### 1. MCP Config (Antigravity only)

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

### 2. Ampcode Setup

1. Register an account at [ampcode.com](https://ampcode.com/)
2. Install Amp CLI: [Getting Started Guide](https://ampcode.com/manual#get-started)
3. Install the **Sourcegraph Amp** extension in VS Code (`sourcegraph.amp`)

### 3. GitLab Knowledge Graph (GKG)

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
