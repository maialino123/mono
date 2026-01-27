# Change: Add Cache Invalidation Middleware

## Why

Users experience stale data when performing mutations (add/delete/toggle todo). The `getAll` endpoint caches for 2 seconds, but mutations don't invalidate the cache, causing the list to show outdated data until cache expires.

## What Changes

- **Rename middlewares** for clarity:
  - `cache` → `httpCache`
  - `cacheMiddleware` → `orpcCache`
  - New: `httpInvalidate`, `orpcInvalidate`
- **Extract shared logic** to `packages/cache/src/utils.ts`:
  - `resolveKeys()` - resolve key generator to array of keys
  - `invalidateKeys()` - delete keys from Redis
- Add invalidation for both HTTP and oRPC
- Add `InvalidateOptions` type with `keys` option (string, array, or function)
- Define explicit cache key constants in todo router

## Impact

- Affected specs: `caching`
- Affected code:
  - `packages/cache/src/types.ts` - new types
  - `packages/cache/src/utils.ts` - new shared utilities
  - `packages/cache/src/http.ts` - rename + add invalidation
  - `packages/cache/src/orpc.ts` - rename + refactor
  - `packages/cache/src/index.ts` - update exports
  - `packages/api/src/routers/todo.ts` - use invalidation
- **BREAKING**: Renamed exports (need to update existing usages)
