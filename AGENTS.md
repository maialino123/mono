# AGENTS.md

## Commands
- `bun install` - Install dependencies
- `bun run dev` - Start all apps (server + web)
- `bun run dev:server` - Start server only (Hono on port 3000)
- `bun run dev:web` - Start web only (Next.js on port 3001)
- `bun run check-types` - Typecheck all packages
- `bun run db:start` - Start PostgreSQL via Docker
- `bun run db:push` - Push schema changes to database

## Architecture
Turborepo monorepo with Bun as package manager and runtime.
- **apps/server**: Hono API server with oRPC, better-auth, AI SDK (Gemini)
- **apps/web**: Next.js 16 frontend with React 19, TailwindCSS 4, TanStack Query
- **packages/api**: oRPC API routers and context
- **packages/auth**: better-auth configuration
- **packages/db**: Drizzle ORM with PostgreSQL
- **packages/env**: Zod-validated environment variables
- **packages/config**: Shared TypeScript config

## Code Style
- TypeScript strict mode with `noUncheckedIndexedAccess`, `noUnusedLocals`
- ESM modules (`"type": "module"`)
- Use workspace catalog versions for shared deps (`catalog:`)
- Zod for validation, oRPC for type-safe APIs
- No semicolons required, use double quotes for imports
