# Screens Layer - FSD Architecture Guide

> **Layer Purpose**: Page-specific composition — combines widgets, features, and entities for each route.
> **Position**: Second layer from top in FSD hierarchy (below app/).

## When AI Should Work in This Layer

- Creating page-specific UI compositions
- Combining widgets, features, and entities for a route
- Handling page-specific state and data fetching coordination

## Core Principles

1. **Composition** — Screens compose from widgets, features, entities, shared
2. **Route-Specific** — Each screen corresponds to a route
3. **No Reusable Logic** — If logic is reused, extract to features/widgets

## Import Rules

```
screens/ → widgets, features, entities, shared
```

**Never import from:** `app/`, other screens

## Structure Pattern

```
screens/{page-name}/
├── ui/
│   └── {page-name}-screen.tsx
├── api/                      # Page-specific queries (optional)
└── index.ts
```

## Examples

### Basic Screen

```tsx
// screens/todos/ui/todos-screen.tsx
export function TodosScreen() {
  const { data: todos } = useQuery(todoQueries.list());
  
  return (
    <Card>
      <CreateTodoForm />
      <TodoList todos={todos} />
    </Card>
  );
}
```

## Decision Guide

| Scenario              | Location                | Reason                     |
| --------------------- | ----------------------- | -------------------------- |
| Page composition      | `screens/{page}/`       | Route-specific             |
| Reusable UI block     | `widgets/`              | Used on 2+ pages           |
| Data mutation         | `features/`             | Business action            |
| Data fetching         | `entities/`             | Domain query               |

## Anti-Patterns

❌ Put reusable logic in screens → extract to features/widgets
❌ Import from other screens → extract common parts
❌ Put business logic in app/ routes → use screens
