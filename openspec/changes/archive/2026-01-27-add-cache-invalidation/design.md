## Context

The caching system currently only supports read caching. Mutations don't invalidate related cache entries, causing stale data in list views. Also, current naming (`cache`, `cacheMiddleware`) is too generic and confusing.

## Goals / Non-Goals

- Goals:
  - Provide cache invalidation for both HTTP and oRPC
  - Clear, descriptive naming: `httpCache`, `orpcCache`, `httpInvalidate`, `orpcInvalidate`
  - Extract shared logic to avoid duplication
  - Support static keys, array of keys, and dynamic key functions
  - Only invalidate on successful operations
- Non-Goals:
  - Pattern/wildcard invalidation (YAGNI)
  - Automatic cache key inference

## Risk Map

| Component              | Risk   | Rationale                          | Verification |
| ---------------------- | ------ | ---------------------------------- | ------------ |
| Rename exports         | LOW    | Search & replace, type-safe        | N/A          |
| Shared utils           | LOW    | Simple pure functions              | N/A          |
| HTTP invalidation      | LOW    | Same pattern as oRPC               | N/A          |
| Redis del operation    | LOW    | Standard ioredis API               | N/A          |

## Decisions

- **Rename for clarity**: Use prefix convention `http*` and `orpc*` to distinguish middlewares
- **Extract shared logic**: Create `utils.ts` with `resolveKeys()` and `invalidateKeys()` to avoid duplication
- **Separate middleware**: Keep cache and invalidate as separate middlewares (single responsibility)
- **Keys option**: Support `string | string[] | ((input/context) => string | string[])` for flexibility
- **Post-execution**: Invalidate after `next()` succeeds to ensure we only invalidate on successful operations

## API Design

```typescript
// Shared utils (packages/cache/src/utils.ts)
export function resolveKeys<T>(keys: InvalidateKeyGenerator<T>, input: T): string[];
export async function invalidateKeys(keys: string[]): Promise<void>;

// HTTP (packages/cache/src/http.ts)
export function httpCache<E extends Env>(options?: HTTPCacheOptions<E>);
export function httpInvalidate<E extends Env>(options: HTTPInvalidateOptions<E>);

// oRPC (packages/cache/src/orpc.ts)
export function orpcCache<TInput>(options?: ORPCCacheOptions<TInput>);
export function orpcInvalidate<TInput>(options: ORPCInvalidateOptions<TInput>);

// Usage
const CACHE_KEYS = { todoList: "todo/getAll{}" };

// oRPC
getAll: publicProcedure
  .use(orpcCache({ key: CACHE_KEYS.todoList, ttl: 2 }))
  .handler(...)

create: publicProcedure
  .use(orpcInvalidate({ keys: CACHE_KEYS.todoList }))
  .input(...)
  .handler(...)

// HTTP
app.get("/users", httpCache({ ttl: 60 }), handler);
app.post("/users", httpInvalidate({ keys: "users:list" }), handler);
```

## Open Questions

None - design is straightforward.
