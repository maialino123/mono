# Features Layer

**Role**: User Actions & Mutations
**Imports**: entities, shared

## Primary Contents
- **API**: `api/use-{action}.ts` (Mutation hooks e.g `useCreatePost`)
- **UI**: `ui/{action}-form.tsx` (Forms, Dialogs, Action Buttons)

## Rules
- **Mutations Only**: If it Changes data, it lives here. Reading data lives in `entities`.
- **Invalidation**: Always invalidate relevant entity queries on success.
- **Reusability**: Only create a feature if the action is complex or reused. One-off buttons can live in `screens`.
