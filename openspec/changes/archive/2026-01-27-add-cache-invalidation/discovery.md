# Discovery: Cache Invalidation

## 1. Feature Summary

Add cache invalidation mechanism to delete cached data when mutation operations (create/update/delete) succeed, solving stale data issues in list views.

## 2. Architecture Snapshot

### Relevant Packages

| Package          | Purpose                    | Key Files                           |
| ---------------- | -------------------------- | ----------------------------------- |
| `packages/cache` | Redis caching middlewares  | `orpc.ts`, `http.ts`, `types.ts`    |
| `packages/api`   | oRPC routers               | `routers/todo.ts`                   |
| `packages/db`    | Redis client               | `src/redis.ts`                      |

### Entry Points

- API: `packages/api/src/routers/todo.ts` - uses `cacheMiddleware` on `getAll`
- Cache: `packages/cache/src/orpc.ts` - `cacheMiddleware` implementation

## 3. Existing Patterns

### Similar Implementations

| Feature          | Location                          | Pattern Used                    |
| ---------------- | --------------------------------- | ------------------------------- |
| cacheMiddleware  | `packages/cache/src/orpc.ts`      | oRPC middleware with Redis      |
| HTTP cache       | `packages/cache/src/http.ts`      | Hono middleware with Redis      |

### Reusable Utilities

- Redis client: `getRedis()` from `@cyberk-flow/db/redis`
- oRPC middleware: `os.middleware()` from `@orpc/server`

## 4. Technical Constraints

- Dependencies: `ioredis` already available via `@cyberk-flow/db`
- Build Requirements: None additional
- Database: Redis (already configured)

## 5. External References

- ioredis `del()` method: supports single key or array of keys
- NestJS Cache Manager pattern: uses `cacheManager.del(key)` for invalidation

## 6. Gap Analysis (Synthesized)

| Component           | Have                  | Need                       | Gap Size |
| ------------------- | --------------------- | -------------------------- | -------- |
| Cache middleware    | Read-only caching     | Invalidation middleware    | New      |
| Types               | ORPCCacheOptions      | InvalidateOptions          | Small    |
| Todo router         | Auto-generated keys   | Explicit cache key const   | Small    |

## 7. Open Questions

- [x] Should invalidation be a separate middleware or option in cacheMiddleware? → Separate (SoC)
- [x] Support pattern-based invalidation (wildcards)? → No, keep simple for now
