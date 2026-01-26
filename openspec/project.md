# Project Context

## Purpose

CyberK Flow is a full-stack monorepo project including both backend and frontend, designed to:

1. **Continuous Technology Adoption** - Always adopt the latest technologies to keep up with the rapidly evolving software industry
2. **AI-Driven Development** - Integrate AI tools to optimize the development workflow:
   - **Spec Management**: OpenSpec for requirements and change proposal management
   - **Task Management**: OpenSpec (using open spec to manage tasks)
   - **Knowledge Management**: Knowledge Skill (temporary)
   - **Code Intelligence**: MCP GKG for querying indexed source code locally

## Tech Stack

- **Runtime**: Bun (v1.3.6)
- **Monorepo**: Turborepo with workspace packages
- **Frontend**: Next.js 16, React 19, TailwindCSS 4, TanStack Query
- **Backend**: Hono API server, oRPC (type-safe APIs with OpenAPI)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: better-auth
- **AI**: AI SDK with Google Gemini integration
- **UI Components**: shadcn/ui, Lucide icons
- **Issue Tracking**: OpenSpec

## Project Conventions

### Core Principles

- **KISS** (Keep It Simple, Stupid): Prefer simple solutions over complex ones.
- **DRY** (Don't Repeat Yourself): Avoid duplication; extract reusable logic.
- **YAGNI** (You Ain't Gonna Need It): Do not implement features until they are actually needed.
- **No Copy-Pasta**: Do not blindly copy-paste code; understand and refactor.
- **Single-Method Consistency**: Maintain consistent patterns within methods.
- **Separation of Concerns**: Distinct sections of code should address distinct concerns.
- **Single Responsibility**: Each module/class/function should have one reason to change.
- **Clear Abstractions & Contracts**: Define clear interfaces and boundaries.
- **Low Coupling, High Cohesion**: Minimize dependencies between modules; keep related code together.

### Code Style

- TypeScript strict mode with `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`
- ESM modules (`"type": "module"`)
- Use workspace catalog versions for shared deps (`catalog:`)
- Zod for runtime validation

### Architecture Patterns

- **Monorepo structure**:
  - `apps/server` - Hono API server with oRPC endpoints
  - `apps/web` - Next.js frontend application
  - `packages/api` - Shared API routers and context (business logic)
  - `packages/auth` - Authentication configuration
  - `packages/db` - Drizzle ORM schema and queries
  - `packages/env` - Zod-validated environment variables
  - `packages/config` - Shared TypeScript configuration
- **Type-safe APIs**: oRPC for end-to-end type safety between client/server
- **Separation of concerns**: Business logic in packages, app-specific code in apps

### Testing Strategy

- Run `bun run check-types` to verify TypeScript across all packages
- Tests should follow existing patterns when found in codebase

### Git Workflow

- Conventional commits: `feat:`, `fix:`, `chore:`, etc.

## Domain Context

This is a general-purpose web application platform. Specific domain features are being developed incrementally.

## Important Constraints

- All environment variables must be Zod-validated via `@cyberk-flow/env`
- Database schema changes require `bun run db:push` after modification
- Server runs on port 3000, web on port 3001

## External Dependencies

- **PostgreSQL**: Primary database (start with `bun run db:start`)
- **Google AI (Gemini)**: AI SDK integration via `@ai-sdk/google`
- **Polar.sh**: Payment integration via `@polar-sh/better-auth`
