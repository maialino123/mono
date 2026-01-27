# Features Layer - FSD Architecture Guide

> **Layer Purpose**: User interactions and actions — MUTATIONS only (create, update, delete).
> **Position**: Fourth layer from top in FSD hierarchy (below widgets/).

## When AI Should Work in This Layer

- Creating mutation hooks (useMutation) for user actions
- Building action UI components (forms, buttons, dialogs)
- Implementing cache invalidation after mutations

## Core Principles

1. **Mutations Only** — Features handle CREATE/UPDATE/DELETE, NOT read operations
2. **Reusability** — Only create feature if used on 2+ pages
3. **Cache Invalidation** — Always invalidate relevant queries after mutation success

## When to Create a Feature

✅ **YES**: Action reused on 2+ pages, mutation with complex UI
❌ **NO**: Action only on ONE page → `screens/{page}/api/`, read operation → `entities/`

## Import Rules

```
features/ → entities, shared
```

**Never import from:** `app/`, `screens/`, `widgets/`, other features

## Structure Pattern

```
features/{action}-{entity}/
├── api/
│   └── use-{action}-{entity}.ts   # Mutation hook
├── ui/
│   └── {action}-{entity}-form.tsx
└── index.ts
```

## Examples (ORPC)

### Basic Mutation Hook

```tsx
// features/create-todo/api/use-create-todo.ts
import { useMutation } from "@tanstack/react-query";
import { orpc, queryClient } from "@/shared";

export const useCreateTodo = () => {
  return useMutation(
    orpc.todo.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["todo"] });
      },
    })
  );
};
```

## Decision Guide

| Scenario                    | Location              | Reason               |
| --------------------------- | --------------------- | -------------------- |
| Create/Update/Delete action | `features/`           | Mutations → features |
| Action used on 1 page only  | `screens/{page}/api/` | No separate feature  |
| GET/Search operation        | `entities/{name}/api` | Read → entities      |

## Anti-Patterns

❌ Put GET/Search in features → use entities
❌ Create feature for one-page-only action
❌ Skip cache invalidation → causes stale data
