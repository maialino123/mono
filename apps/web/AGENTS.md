# apps/web - Next.js Frontend with FSD Architecture

## Overview

Frontend application using **Feature Sliced Design (FSD)** with **ORPC** for type-safe API communication.

## Architecture

```
src/
├── app/        # Next.js routing shell (minimal logic)
├── screens/    # Page compositions (login, dashboard, todos, ai, home)
├── widgets/    # Reusable large blocks (layout)
├── features/   # Mutations only (auth, todo)
├── entities/   # Queries only (user, todo)
├── shared/     # Infrastructure (api, ui, lib, providers)
└── index.css
```

## Import Rules (Critical)

```
app/      → screens, widgets, shared
screens/  → widgets, features, entities, shared
widgets/  → features, entities, shared
features/ → entities, shared
entities/ → shared
shared/   → nothing external
```

**Always import via `index.ts`** - never import internal files directly.

## Key Patterns

### ORPC Query (entities)

```tsx
// entities/todo/api/todo.queries.ts
export const todoQueries = {
  all: () => ["todo"] as const,
  list: () => orpc.todo.getAll.queryOptions(),
};

// Usage
const { data } = useQuery(todoQueries.list());
```

### ORPC Mutation (features)

```tsx
// features/todo/create-todo/api/use-create-todo.ts
export function useCreateTodo() {
  return useMutation(
    orpc.todo.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: todoQueries.all() });
      },
    })
  );
}
```

### Screen Composition

```tsx
// screens/todos/ui/todos-screen.tsx
export function TodosScreen() {
  const { data } = useQuery(todoQueries.list());
  return (
    <Card>
      <CreateTodoForm />
      <TodoList todos={data} />
    </Card>
  );
}
```

## Where to Put Code

| Type | Location | Example |
|------|----------|---------|
| API client, QueryClient | `shared/api/` | orpc.ts, auth-client.ts |
| UI kit (shadcn) | `shared/ui/` | button.tsx, card.tsx |
| Business data queries | `entities/{name}/api/` | todoQueries |
| Entity UI components | `entities/{name}/ui/` | TodoItem, TodoList |
| Mutations | `features/{entity}/{action}/` | useCreateTodo |
| Page composition | `screens/{page}/` | TodosScreen |
| Reusable layouts | `widgets/` | Header, UserMenu |
| Route handlers | `app/` | page.tsx (minimal) |

## Commands

```bash
bun run dev:web     # Start dev server (port 3001)
bun run check-types # Type check
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **API Client**: ORPC with TanStack Query
- **Auth**: better-auth
- **UI**: shadcn/ui + Tailwind CSS
- **State**: React Query (via ORPC)

## AI Skill

Use `cyberk-fsd-fe` skill for detailed FSD guidance:
- Layer hierarchy and patterns
- Entity/feature creation checklists
- ORPC-specific examples

## Layer Documentation

Each layer has its own AGENTS.md:
- `src/shared/AGENTS.md` - Infrastructure patterns
- `src/entities/AGENTS.md` - Query factory patterns
- `src/features/AGENTS.md` - Mutation patterns
- `src/widgets/AGENTS.md` - Composition patterns
- `src/screens/AGENTS.md` - Page composition patterns
