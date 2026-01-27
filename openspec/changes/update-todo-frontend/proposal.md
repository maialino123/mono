# Change: Update Todo Frontend for New API

## Why

The Todo API has breaking changes that require frontend updates:
- Endpoint renamed from `getAll` to `list`
- Response changed from `Todo[]` to `{ items: Todo[], total, page, totalPages }`
- New pagination, filtering, and sorting parameters added
- Schema includes new `createdAt` field

## What Changes

### Web App (`apps/web`)
- **BREAKING**: Update `todo.queries.ts` to use `list` instead of `getAll`
- **BREAKING**: Update `TodoList` component to handle `{ items }` response structure
- **BREAKING**: Update `Todo` interface to include `createdAt` field
- Add basic pagination controls
- Add snackbar feedback for create/delete/toggle operations

### Native App (`apps/native`)
- **BREAKING**: Update `todos.tsx` to use `list` instead of `getAll`
- **BREAKING**: Update data access from `todos.data` to `todos.data?.items`
- Add snackbar/toast feedback for CRUD operations

## Impact

- Affected specs: `todo-frontend` (new)
- Affected code:
  - `apps/web/src/entities/todo/api/todo.queries.ts`
  - `apps/web/src/entities/todo/ui/todo-list.tsx`
  - `apps/web/src/screens/todos/ui/todos-screen.tsx`
  - `apps/native/app/(drawer)/todos.tsx`
