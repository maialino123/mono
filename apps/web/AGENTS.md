# apps/web - Next.js FSD Application

**Skill Required**: `cyberk-fsd-fe` (Read this first!)

## Architecture Overview
- **Framework**: Next.js 16 (App Router)
- **Design Pattern**: Feature Sliced Design (FSD)
- **API Client**: ORPC with TanStack Query (`@/shared/api/orpc`)
- **Auth**: better-auth
- **UI**: shadcn/ui + Tailwind CSS

## Layer Responsibility Map
| Layer | Path | Responsibility |
|-------|------|----------------|
| **App** | `app/` | Routing shell, layouts, global providers |
| **Screens** | `screens/` | Page composition (Widgets + Features) |
| **Widgets** | `widgets/` | Reusable large UI blocks (Header, Sidebar) |
| **Features** | `features/` | **Mutations** (Create/Update/Delete) |
| **Entities** | `entities/` | **Queries** (Read-only), Domain UI |
| **Shared** | `shared/` | Infrastructure, generic UI, utilities |

## Critical Rules
1. **Strict Imports**: Only import from layers **below**. `shared` imports nothing. `app` imports everything.
2. **Index Exports**: Always import via the layer's `index.ts` (e.g., `import { PostCard } from "@/entities/post"`).
3. **API Pattern**:
   - Reads → `entities/{name}/api/*.queries.ts`
   - Mutations → `features/{name}/api/use-*.ts`
