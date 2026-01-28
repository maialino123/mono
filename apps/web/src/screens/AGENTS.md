# Screens Layer

**Role**: Page Composition
**Imports**: widgets, features, entities, shared

## Primary Contents
- **UI**: `ui/{page}-screen.tsx` (Root component for the route)
- **API**: `api/*` (Page-specific queries only - rare)

## Rules
- **Route-One-to-One**: Each screen corresponds to one App Router route.
- **Composition Only**: Combine widgets/features/entities. Avoid complex logic here.
- **No Reuse**: If logic/UI is needed on another page, move it to `features` or `widgets`.
