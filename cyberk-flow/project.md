# Project: cyberk-flow

## Overview

CyberK Flow is a full-stack TypeScript monorepo (web + mobile + API server) built for continuous technology adoption and AI-driven development. It serves as CyberK's reference platform, continuously updated with the latest frameworks and tooling.

## Purpose

1. **Continuous Technology Adoption** — Always adopt the latest technologies to keep up with the rapidly evolving software industry.
2. **AI-Driven Development** — Integrate AI tools to optimize the development workflow:
   - **Spec Management**: OpenSpec for requirements and change proposal management
   - **Task Management**: OpenSpec (using open spec to manage tasks)
   - **Knowledge Management**: Knowledge Skill (temporary)
   - **Code Intelligence**: MCP GKG for querying indexed source code locally

## Tech Stack

- **Language**: TypeScript (strict mode, ESM) — `tsconfig.base.json`
- **Runtime**: Bun v1.3.6 (`packageManager` in root `package.json`)
- **Monorepo**: Turborepo with Bun workspaces (`turbo.json`)
- **Frontend (Web)**: Next.js 16 (App Router, React Compiler enabled), React 19, TailwindCSS 4 — `apps/web`
- **Frontend (Mobile)**: React Native 0.81 + Expo 54 — `apps/native`
- **Backend**: Hono 4 HTTP server, oRPC (type-safe RPC + OpenAPI) — `apps/server`
- **Database**: PostgreSQL (Docker), Drizzle ORM 0.45 — `packages/db`
- **Cache**: Redis (Docker, redis-stack), ioredis — `packages/db/docker-compose.yml`, `packages/cache`
- **Authentication**: better-auth — `packages/auth`
- **AI**: Vercel AI SDK 6 with Google Gemini (`@ai-sdk/google`) — `apps/server/src/index.ts`
- **API Client**: oRPC client + TanStack Query 5 — `apps/web`, `apps/native`
- **UI Components**: shadcn/ui (base-lyra style), Lucide icons, class-variance-authority, tailwind-merge — `apps/web/components.json`
- **Web3**: wagmi + viem (EVM), Solana wallet-adapter — `apps/web/package.json`
- **Build (server)**: tsdown — `apps/server/package.json`
- **Build (web)**: Next.js built-in — `next build`
- **Lint / Format**: Biome 2 — `biome.json`
- **Formatter (TSX)**: Prettier + prettier-plugin-tailwindcss (Biome formatter disabled for `.tsx`) — `biome.json` overrides, `apps/web/prettier.config.mjs`
- **Git hooks**: Husky + lint-staged — root `package.json`
- **Test**: Vitest (used in `packages/cache`), Bun test runner — `bun test <file>`
- **Env validation**: `@t3-oss/env-core` / `@t3-oss/env-nextjs` + Zod — `packages/env`
- **Charts**: Recharts 3 — `apps/web/package.json`
- **Forms**: TanStack Form — `apps/web`, `apps/native`

## Commands

- **Type check**: `bun run check-types`
- **Lint**: `bun run check`
- **Test**: `bun test`
- **E2E**: `bun run e2e:test`

## Conventions

### Code Style

- TypeScript strict mode: `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` — `packages/config/tsconfig.base.json`
- ESM modules (`"type": "module"`) throughout
- Biome: 2-space indent, 120 char line width, double quotes, auto-organize imports — `biome.json`
- Biome linting: recommended rules + `useSortedClasses` (Tailwind class sorting via `clsx`/`cva`/`cn`)
- TSX files: Prettier formatting (Biome formatter disabled via override)
- Workspace catalog versions for shared dependencies (`catalog:` protocol) — root `package.json`
- Zod 4 for runtime validation

### Naming

- Packages scoped under `@cyberk-flow/*` (e.g., `@cyberk-flow/api`, `@cyberk-flow/db`)
- Apps use short names: `server`, `web`, `native`
- Path alias `@/*` → `./src/*` in both `apps/web` and `apps/server`

### File Structure

```
cyberk-flow/
├── apps/
│   ├── server/        # Hono API server (port 3000)
│   ├── web/           # Next.js 16 frontend (port 3001)
│   └── native/        # Expo React Native mobile app
├── packages/
│   ├── api/           # Shared oRPC routers, context, business logic
│   ├── auth/          # better-auth configuration
│   ├── cache/         # Redis caching layer, rate-limiter store
│   ├── config/        # Shared tsconfig.base.json
│   ├── db/            # Drizzle ORM schema, migrations, Redis client, Docker Compose
│   └── env/           # Zod-validated env vars (server / web / native exports)
├── cyberk-flow/       # OpenSpec: specs, changes, templates
└── docs/              # Project documentation
```

### Web App Architecture (FSD)

`apps/web/src/` follows **Feature-Sliced Design**:

| Layer | Path | Responsibility |
|-------|------|----------------|
| App | `app/` | Next.js routing, layouts, global providers |
| Screens | `screens/` | Page composition (widgets + features) |
| Widgets | `widgets/` | Reusable large UI blocks (Header, Sidebar) |
| Features | `features/` | Mutations (create/update/delete) |
| Entities | `entities/` | Queries (read-only), domain UI |
| Shared | `shared/` | Infrastructure, shadcn/ui, utilities, providers |

- **Strict layer imports**: only import from layers below; `shared` imports nothing.
- **Index exports**: import via `index.ts` barrel (e.g., `import { X } from "@/entities/post"`). Exception: `shared/` — import directly from segments (e.g., `@/shared/shadcn/button`).
- **API pattern**: reads → `entities/{name}/api/*.queries.ts`; mutations → `features/{name}/api/use-*.ts`

### Architecture Patterns

- **Type-safe APIs**: oRPC end-to-end type safety between client and server
- **Separation of concerns**: business logic in `packages/`, app-specific code in `apps/`
- **Rate limiting**: tiered via `hono-rate-limiter` + Redis store (auth, authenticated API, anonymous API, AI)
- **React Compiler**: enabled in Next.js config (`reactCompiler: true`)
- **Typed routes**: enabled in Next.js config (`typedRoutes: true`)

### Core Principles

- **KISS**: Prefer simple solutions over complex ones
- **DRY**: Extract reusable logic; avoid duplication
- **YAGNI**: Do not implement features until actually needed
- **Separation of Concerns**: Distinct code sections address distinct concerns
- **Single Responsibility**: Each module/function has one reason to change
- **Low Coupling, High Cohesion**: Minimize dependencies between modules

## Constraints

### Security

- All environment variables must be Zod-validated via `@cyberk-flow/env`
- `.env` files are gitignored and must never be read by AI agents
- CORS restricted to configured `CORS_ORIGIN`
- Rate limiting on all API endpoints (auth, RPC, AI)

### Performance

- Turborepo caching for builds and type-checks
- Redis caching layer (`packages/cache`)
- React Compiler for automatic memoization
- Tiered rate limiting to protect resource-intensive AI endpoints

### Compatibility

- Bun runtime required (v1.3.6+)
- Docker required for PostgreSQL and Redis (`bun run db:start`)
- Node.js ESM — no CommonJS

## External Dependencies

- **PostgreSQL**: Primary database (Docker via `packages/db/docker-compose.yml`)
- **Redis**: Caching and rate-limit store (Docker, redis-stack image)
- **Google AI (Gemini)**: AI SDK integration via `@ai-sdk/google`

## Domain Context

This is a general-purpose web application platform. Specific domain features (including Web3/blockchain via wagmi/Solana adapters) are being developed incrementally.

## Testing Strategy

- `bun run check-types` — TypeScript type checking across all packages
- `bun test <file>` — Run individual test files
- Vitest available in `packages/cache` for unit tests
- Tests should follow existing patterns when found in codebase
- **E2E**: Playwright + Synpress (Phantom wallet) for Web3 flows
  - `bun run e2e:cache` — Build wallet cache (download Phantom CRX + Synpress cache + enable testnet)
  - `bun run e2e:test` — Run all E2E tests
  - `bun run e2e:test:siwe` — Run SIWE sign-in test only
  - Pinned: Synpress 4.1.2 + Playwright 1.48.2

## Git Workflow

- Conventional commits: `feat:`, `fix:`, `chore:`, etc.
- Husky pre-commit hook runs lint-staged (Biome check)
