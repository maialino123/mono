# Features Layer

**Role**: User Actions & Mutations
**Imports**: entities, shared

## Primary Contents
- **API**: `api/use-{action}.ts` (Mutation hooks e.g `useCreatePost`)
- **UI**: `ui/{action}-form.tsx` (Forms, Dialogs, Action Buttons)

## Rules
- **Mutations Only**: If it changes data, it lives here. Reading data lives in `entities`.
- **No Direct API Calls in UI**: UI components (`ui/`) must NEVER call API clients directly. Always use `useQuery`/`useMutation` hooks from `api/` segment.
- **Invalidation**: Always invalidate relevant entity queries on success.
- **Non-ORPC clients** (e.g., `authClient`): Wrap in `useMutation` manually. Check `res.error` and throw — these clients may not throw on failure.
- **Reusability**: Only create a feature if the action is complex or reused. One-off buttons can live in `screens`.
