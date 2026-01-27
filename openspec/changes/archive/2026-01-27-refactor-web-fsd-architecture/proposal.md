# Change: Refactor apps/web to Feature Sliced Design Architecture

## Why

The current `apps/web` has a flat component structure without clear domain boundaries, making it hard to scale and maintain. Feature Sliced Design (FSD) provides a proven methodology to organize code by business domains with strict import rules, improving maintainability and onboarding.

## What Changes

### Structure Changes

- **NEW** `shared/` layer - Infrastructure, UI kit, utilities
- **NEW** `entities/` layer - Business domain entities (user, todo)
- **NEW** `features/` layer - User actions/mutations (auth, todo CRUD)
- **NEW** `widgets/` layer - Reusable large UI blocks (layout)
- **NEW** `screens/` layer - Page-specific composition
- **MOVE** `components/ui/*` → `shared/ui/`
- **MOVE** `lib/*` → `shared/lib/` and `shared/api/`
- **MOVE** `utils/orpc.ts` → `shared/api/orpc.ts`
- **REFACTOR** `components/*.tsx` → appropriate layers

### Tooling Changes

- **NEW** AGENTS.md files for each FSD layer (AI guidance)
- **NEW** `cyberk-fsd-fe` skill (copy from boilerplate, adapt for ORPC)
- **UPDATE** Import paths throughout codebase

## Impact

- Affected specs: NEW `web-fsd-architecture` capability
- Affected code: All files in `apps/web/src/` (~26 files)
- Breaking changes: None (internal refactoring only)

## Target Structure

```
apps/web/src/
├── app/                    # Next.js routing (minimal)
│   ├── (routes)/           # Route groups
│   └── layout.tsx          # Root layout only
├── screens/                # Page composition
│   ├── login/
│   ├── dashboard/
│   ├── todos/
│   └── ai/
├── widgets/                # Reusable large blocks
│   └── layout/             # Header, Sidebar, MainLayout
├── features/               # Mutations
│   ├── auth/               # sign-in, sign-out, sign-up
│   └── todo/               # create, update, delete
├── entities/               # Domain + Queries
│   ├── user/
│   └── todo/
├── shared/                 # Foundation
│   ├── api/                # orpc, auth-client
│   ├── ui/                 # shadcn components
│   ├── lib/                # utils, hooks
│   └── providers/          # theme, query providers
└── index.css
```
