# Entities Layer - FSD Architecture Guide

> **Layer Purpose**: Business domain concepts — GET/SEARCH operations, Query Factory, and entity UI.
> **Position**: Fifth layer from top in FSD hierarchy (below features/).

## When AI Should Work in This Layer

- Creating business domain entities (User, Todo, Product)
- Implementing GET/SEARCH API calls with ORPC query options
- Building entity UI components (cards, rows, items)
- Defining custom domain models (only when different from backend)

## Core Principles

1. **Read Operations Only** — Entities handle GET/SEARCH, NOT mutations
2. **Query Factory** — Centralized query definitions with ORPC queryOptions
3. **Types from ORPC** — Use ORPC client types, don't create DTOs
4. **Reusable UI** — Entity components use slots/callbacks for flexibility
5. **Public API** — Higher layers can ONLY import what's exported in `index.ts`

## Import Rules

```
entities/ → shared (via index.ts only)
```

**Never import from:** `app/`, `screens/`, `widgets/`, `features/`, other entities (use `@x`)

## Structure Pattern

```
entities/{entity-name}/
├── api/
│   └── {entity}.queries.ts  # ORPC query factory
├── ui/
│   └── {entity}-item.tsx    # Entity UI components
└── index.ts                 # Public API
```

## Examples (ORPC)

### Query Factory

```tsx
// api/todo.queries.ts
import { orpc } from "@/shared/api/orpc";

export const todoQueries = {
  all: () => ["todo"] as const,
  list: () => orpc.todo.getAll.queryOptions(),
  detail: (id: number) => orpc.todo.get.queryOptions({ id }),
};
```

### Entity UI with Callbacks

```tsx
// ui/todo-item.tsx
export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <li>
      <Checkbox onChange={() => onToggle(todo.id)} />
      <span>{todo.text}</span>
      <Button onClick={() => onDelete(todo.id)}>Delete</Button>
    </li>
  );
}
```

## Decision Guide

| Scenario             | Location                 | Reason                |
| -------------------- | ------------------------ | --------------------- |
| GET/Search API calls | `entities/{name}/api/`   | Read operations       |
| Query Factory        | `entities/{name}/api/`   | Query definitions     |
| Entity card/item UI  | `entities/{name}/ui/`    | Entity presentation   |
| CREATE/UPDATE/DELETE | `features/`              | Mutations → features  |

## Anti-Patterns

❌ Put mutations in entities → use features
❌ Import from other entities directly → use `@x` or slots
❌ Import internal files from lower layers → only use `index.ts` exports
