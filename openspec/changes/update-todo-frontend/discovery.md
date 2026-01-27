# Discovery: Update Todo Frontend for New API

## 1. Feature Summary

Update web and native frontends to work with new Todo API that changed from `getAll` to `list` with paginated response structure and added filtering/sorting capabilities.

## 2. Architecture Snapshot

### Relevant Packages

| Package        | Purpose              | Key Files                                              |
| -------------- | -------------------- | ------------------------------------------------------ |
| `apps/web`     | Next.js web app      | `entities/todo/`, `features/todo/`, `screens/todos/`   |
| `apps/native`  | Expo mobile app      | `app/(drawer)/todos.tsx`                               |
| `packages/api` | ORPC API definitions | `routers/todo.ts`                                      |

### Entry Points

- Web UI: `apps/web/src/screens/todos/ui/todos-screen.tsx`
- Native UI: `apps/native/app/(drawer)/todos.tsx`
- API Queries: `apps/web/src/entities/todo/api/todo.queries.ts`

## 3. Existing Patterns

### Similar Implementations

| Feature        | Location                        | Pattern Used                    |
| -------------- | ------------------------------- | ------------------------------- |
| Todo List (Web)| `entities/todo/ui/todo-list.tsx`| FSD with entities/features      |
| Todo CRUD      | `features/todo/*/`              | Mutation hooks with invalidation|

### Reusable Utilities

- ORPC client: `@/shared/api/orpc` (web), `@/utils/orpc` (native)
- React Query: Already used for data fetching

## 4. Technical Constraints

- Dependencies: `@tanstack/react-query`, `@cyberk-flow/api`
- Both apps use ORPC generated types
- Native uses refetch pattern, web uses query invalidation

## 5. External References

- ORPC docs for query options
- React Query pagination patterns

## 6. Gap Analysis (Synthesized)

| Component         | Have                     | Need                                | Gap Size |
| ----------------- | ------------------------ | ----------------------------------- | -------- |
| Web Query         | `orpc.todo.getAll`       | `orpc.todo.list` with params        | Small    |
| Web Response      | `Todo[]`                 | `{ items, total, page, totalPages }`| Small    |
| Web Todo Type     | Missing `createdAt`      | Include `createdAt` field           | Small    |
| Native Query      | `orpc.todo.getAll`       | `orpc.todo.list` with params        | Small    |
| Native Response   | `Todo[]`                 | `{ items, total, page, totalPages }`| Small    |
| Pagination UI     | None                     | Optional pagination controls        | Medium   |
| Filter UI         | None                     | Optional filter controls            | Medium   |
| Snackbar/Toast    | None                     | Feedback for CRUD operations        | Medium   |

## 7. Open Questions

- [x] Should pagination UI be added in this change? → Yes, basic pagination
- [x] Should filtering/sorting UI be added? → Optional, can be separate change
- [x] Should snackbar feedback be added? → Yes, for CRUD operations
