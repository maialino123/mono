# Discovery: Edit Todo

## 1. Feature Summary

Add inline editing capability to todo items, allowing users to update the text of an existing todo directly in the list without navigating away.

## 2. Workstreams Used / Skipped

| Workstream           | Used? | Justification |
| -------------------- | ----- | ------------- |
| Architecture Snapshot | ✅    | Need to understand full stack layers |
| Internal Patterns    | ✅    | Follow existing create/toggle/delete patterns |
| External Patterns    | ⏭️    | Standard CRUD — no novel architecture |
| Constraint Check     | ⏭️    | No new dependencies needed |
| Documentation        | ⏭️    | No new libraries |

## 3. Architecture Snapshot

### Relevant Packages
| Package | Purpose | Key Files |
| ------- | ------- | --------- |
| `packages/db` | Drizzle ORM schema | `src/schema/todo.ts` — `todo` table (id, text, completed, createdAt) |
| `packages/api` | oRPC routers | `src/routers/todo.ts` — list, findById, create, toggle, delete |
| `apps/web` | Next.js frontend (FSD) | entities/todo, features/todo, screens/todos |

### Entry Points
- API: `packages/api/src/routers/todo.ts` — needs new `update` procedure
- UI: `apps/web/src/entities/todo/ui/todo-item.tsx` — needs inline edit mode
- Feature: `apps/web/src/features/todo/` — needs new `edit-todo` feature folder

## 4. Internal Patterns

### Similar Implementations
| Feature | Location | Pattern Used |
| ------- | -------- | ------------ |
| Create Todo | `features/todo/create-todo/` | `api/use-create-todo.ts` + `ui/create-todo-form.tsx` |
| Toggle Todo | `features/todo/toggle-todo/api/use-toggle-todo.ts` | mutation hook only (no UI) |
| Delete Todo | `features/todo/delete-todo/api/use-delete-todo.ts` | mutation hook only (no UI) |

### Reusable Utilities
- Mutation pattern: `useMutation` + `orpc.todo.<op>.mutationOptions` + `queryClient.invalidateQueries`
- Cache invalidation: `todoQueries.all()` query key + `orpcInvalidate` middleware
- Toast feedback: `toast.success("Todo <action>")` via sonner
- FSD barrel export: `features/todo/index.ts` re-exports all hooks/components

## 7. Gap Analysis (Synthesized)

| Component | Have | Need | Gap Size |
| --------- | ---- | ---- | -------- |
| DB Schema | `text` column exists | No schema change | None |
| API | CRUD without update | `update` procedure (set text by id) | Small — follows toggle pattern |
| Feature hook | create/toggle/delete | `useEditTodo` mutation hook | Small — follows existing pattern |
| UI | Static label in TodoItem | Inline edit mode (input + save/cancel) | Medium — new UI state |
| Screen | Passes onToggle/onDelete | Pass onEdit handler | Small |

## 8. Key Decisions

| Decision | Options Considered | Chosen | Rationale |
| -------- | ------------------ | ------ | --------- |
| Edit UX | Modal dialog vs Inline edit | Inline edit | Simpler, matches todo app conventions, less disruptive |
| Edit trigger | Edit button vs Double-click | Double-click on text + edit icon button | Double-click for power users, button for discoverability |
| Save trigger | Save button vs Enter key + blur | Enter key to save, Escape to cancel | Standard inline edit UX |

## 10. Risks & Constraints
- **Must**: Invalidate cache after update (same pattern as toggle/delete)
- **Should**: Follow FSD structure exactly as existing features

## 11. Open Questions
- None — straightforward CRUD addition following established patterns
