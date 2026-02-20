# Change: Add inline editing for todo items

## Why

Users can create, toggle, and delete todos but cannot edit the text of an existing todo. This is a basic CRUD gap that forces users to delete and re-create items to fix typos or update text.

## Appetite

S (≤1d)

## Scope

- **In**: API update endpoint, web frontend inline edit UI, mutation hook, cache invalidation
- **Out**: Native mobile app edit, bulk editing, rich text editing
- **Cut list**: Edit icon button (keep double-click only if over budget)

## What Changes

- New `update` procedure in `packages/api/src/routers/todo.ts`
- New `features/todo/edit-todo/` feature (FSD) with `useEditTodo` hook
- Modified `entities/todo/ui/todo-item.tsx` to support inline edit mode
- Modified `screens/todos/ui/todos-screen.tsx` to wire edit handler

## Capabilities

- **Modified**: `specs/todo-frontend/spec.md` (delta — add edit requirement)

## UI Impact & E2E

- **User-visible UI behavior affected?** YES
- **E2E required?** REQUIRED
- **Justification**: New user interaction (inline edit) changes existing todo-item UI behavior
- **Target user journeys**: edit todo inline (double-click → type → Enter to save / Escape to cancel)

## Risk Level

LOW — standard CRUD addition following established patterns, no new dependencies, no schema changes.

## Impact

- Affected specs: `todo-frontend`
- Affected code: `packages/api/src/routers/todo.ts`, `apps/web/src/entities/todo/ui/todo-item.tsx`, `apps/web/src/features/todo/`, `apps/web/src/screens/todos/ui/todos-screen.tsx`

## Open Questions

- None
