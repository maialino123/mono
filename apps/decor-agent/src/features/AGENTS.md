# Features Layer - DecorAgent

## Purpose
Handle user actions (mutations). Currently only click tracking.

## Slices
- `track-click/` - Affiliate link click tracking

## Rules
- Features handle WRITES only (mutations)
- No direct database access - use API routes
- Must be client-side for user interactions
- Can import from: shared, entities
- Cannot import from: widgets, screens, app

## Adding New Features
1. Create `features/{action}-{entity}/` directory
2. Add `api/use-{action}.ts` for client hook
3. Add `lib/{action}.ts` for server logic
4. Export via `index.ts`
