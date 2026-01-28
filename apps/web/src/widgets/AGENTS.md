# Widgets Layer

**Role**: Reusable UI Blocks
**Imports**: features, entities, shared

## Primary Contents
- **UI**: `ui/{widget-name}.tsx` (Header, Sidebar, PostFeed)

## Rules
- **Composition**: Combine entities and features into a self-contained block.
- **Reusability**: Must be reused on at least 2 pages. If not, keep in `screens`.
- **Self-Sufficient**: Should handle its own data fetching/logic internally (via composed features/entities).
