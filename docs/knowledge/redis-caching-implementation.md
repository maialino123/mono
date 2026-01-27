# Redis Caching Implementation Knowledge

> **Source Threads**:
> - [T-019bfb5c-40e3-70b1-a2c5-5b6454a4605b](https://ampcode.com/threads/T-019bfb5c-40e3-70b1-a2c5-5b6454a4605b) - Initial caching implementation
> - [T-019bfea3-186d-752d-b75c-b460f2342c75](https://ampcode.com/threads/T-019bfea3-186d-752d-b75c-b460f2342c75) - Cache invalidation
> - [T-019bffcb-0208-764f-a2a8-824df2462e93](https://ampcode.com/threads/T-019bffcb-0208-764f-a2a8-824df2462e93) - Tag-based caching
>
> **Date**: January 2026

## Overview

Implementation of Redis caching middleware for both HTTP (Hono) and oRPC endpoints in the cyberk-flow monorepo, including cache invalidation for mutations.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Hono Server                          │
│  ┌─────────────┐   ┌─────────────┐   ┌──────────────┐  │
│  │   Request   │──▶│   Cache     │──▶│   Handler    │  │
│  │             │   │  Middleware │   │              │  │
│  └─────────────┘   └──────┬──────┘   └──────────────┘  │
│                           │                             │
│                    ┌──────▼──────┐                     │
│                    │ @cyberk-flow/cache                │
│                    └──────┬──────┘                     │
│                           │                             │
│                    ┌──────▼──────┐                     │
│                    │ @cyberk-flow/db                   │
│                    │   (redis)   │                     │
│                    └──────┬──────┘                     │
└───────────────────────────┼─────────────────────────────┘
                            │
                     ┌──────▼──────┐
                     │   Redis     │
                     │   Server    │
                     └─────────────┘
```

## Key Files

| File | Purpose |
|------|---------|
| [`packages/cache/src/http.ts`](packages/cache/src/http.ts) | Hono HTTP cache + invalidation middleware |
| [`packages/cache/src/orpc.ts`](packages/cache/src/orpc.ts) | oRPC cache + invalidation middleware |
| [`packages/cache/src/utils.ts`](packages/cache/src/utils.ts) | Shared utilities (resolveKeys, invalidateKeys, cacheWithTag, invalidateByTag) |
| [`packages/cache/src/types.ts`](packages/cache/src/types.ts) | TypeScript types |
| [`packages/db/src/redis.ts`](packages/db/src/redis.ts) | Redis client singleton |
| [`packages/db/docker-compose.yml`](packages/db/docker-compose.yml) | Redis + PostgreSQL infrastructure |

## Package Structure

```
packages/cache/          # Caching logic
├── src/
│   ├── http.ts         # httpCache, httpInvalidate
│   ├── orpc.ts         # orpcCache, orpcInvalidate
│   ├── utils.ts        # Shared utilities
│   ├── types.ts        # Types
│   └── index.ts        # Exports
└── package.json

packages/db/             # Infrastructure
├── src/
│   └── redis.ts        # Redis connection only
└── docker-compose.yml  # Redis + PostgreSQL
```

## Design Decisions

### Separation of Concerns

- **`@cyberk-flow/db`**: Redis connection management only
- **`@cyberk-flow/cache`**: All caching logic (HTTP + oRPC middleware)

**Rationale**: Keeps `db` package focused on infrastructure/connections, while `cache` owns business logic.

### Unified Default Keys

| Middleware | Default Key | Example |
|------------|-------------|---------|
| HTTP (`httpCache()`) | `c.req.url` | `http://localhost:3000/users?page=1` |
| oRPC (`orpcCache()`) | `path.join('/') + JSON.stringify(input)` | `users/getById{"id":123}` |

**Rationale**: Follows NestJS CacheInterceptor pattern where default key is derived from request.

### Default TTL = 60 seconds

Default TTL is 60 seconds. Override with `ttl` option for different caching needs.

### Cache Invalidation Strategy

**Problem**: Users experienced stale data when performing mutations (add/delete/toggle). List endpoints cached data but mutations didn't invalidate the cache.

**Solution**: Separate invalidation middlewares (`httpInvalidate`, `orpcInvalidate`) that delete cache keys on successful operations.

**Design Decisions**:

1. **Separate middlewares** - Cache and invalidation are separate middlewares (single responsibility principle)
2. **Post-execution invalidation** - Only invalidate after handler succeeds (not on errors)
3. **Explicit keys** - Must specify exact keys to invalidate (no pattern/wildcard support for simplicity)
4. **Shared utilities** - `utils.ts` contains `resolveKeys()` and `invalidateKeys()` used by both HTTP and oRPC

**Naming Convention**: Prefix-based naming (`http*`, `orpc*`) to distinguish middleware types clearly.

### Tag-based Cache Invalidation

**Problem**: List endpoints with pagination/filtering create many cache variants (e.g., `todos:{"page":1}`, `todos:{"page":2}`). On mutation, all variants need invalidation but exact keys are unknown.

**Solution**: Tag-based caching using Redis Sets.

```
# When caching list response:
SET todos:{"page":1} "data"
SADD tag:todos "todos:{"page":1}"   # Register key in tag set

# When invalidating (on mutation):
SMEMBERS tag:todos                  # Get all keys: ["todos:{"page":1}", ...]
DEL key1 key2 ...                   # Delete all cached keys
DEL tag:todos                       # Delete tag set
```

**Design Decisions**:

1. **Redis Sets** - O(1) tag lookup via SMEMBERS, vs O(n) SCAN for pattern matching
2. **Tag prefix** - All tags stored with `tag:` prefix (e.g., `tag:todos`)
3. **TTL sync** - Tag set TTL matches cache TTL to avoid orphaned tags
4. **Atomic invalidation** - All keys in tag deleted in single operation

**Utility Functions**:

```typescript
// packages/cache/src/utils.ts
cacheWithTag(key, tag, value, ttl)  // Store + register in tag set
invalidateByTag(tag)                 // Delete all keys in tag + tag itself
invalidateTags(tags: string[])       // Invalidate multiple tags
```

| Middleware | Purpose |
|------------|---------|
| `httpCache` | Cache GET responses (HTTP) |
| `httpInvalidate` | Delete cache on mutation (HTTP) |
| `orpcCache` | Cache procedure output (oRPC) |
| `orpcInvalidate` | Delete cache on mutation (oRPC) |

## Usage Patterns

### HTTP (Hono)

```typescript
import { httpCache, httpInvalidate } from "@cyberk-flow/cache";

// Default: key = c.req.url, ttl = 2s
app.get("/users", httpCache(), handler);

// Custom key and TTL
app.get("/users/:id", 
  httpCache({ 
    key: (c) => `users:${c.req.param("id")}`,
    ttl: 300 
  }), 
  handler
);

// Conditional caching (skip for authenticated requests)
app.get("/public",
  httpCache({
    condition: (c) => !c.req.header("Authorization"),
  }),
  handler
);

// Invalidate cache on mutation
app.post("/users", httpInvalidate({ keys: "users:list" }), handler);
```

### oRPC

```typescript
import { orpcCache, orpcInvalidate } from "@cyberk-flow/cache";

const CACHE_KEYS = {
  tag: "todos",
  list: (input) => `todos:${JSON.stringify(input)}`,
  byId: (id: number) => `todo:${id}`,
};

const todoRouter = {
  // List with tag-based caching (all variants tracked)
  list: publicProcedure
    .input(listInputSchema)
    .use(orpcCache({ key: (input) => CACHE_KEYS.list(input), tag: CACHE_KEYS.tag, ttl: 60 }))
    .handler(async ({ input }) => db.select().from(todo).limit(input.limit)),

  // Single item cache (no tag needed)
  findById: publicProcedure
    .input(z.object({ id: z.number() }))
    .use(orpcCache({ key: (input) => CACHE_KEYS.byId(input.id), ttl: 60 }))
    .handler(async ({ input }) => db.select().from(todo).where(eq(todo.id, input.id))),

  // Create: invalidate all list variants via tag
  create: publicProcedure
    .input(z.object({ text: z.string() }))
    .use(orpcInvalidate({ tags: CACHE_KEYS.tag }))
    .handler(async ({ input }) => db.insert(todo).values(input)),

  // Update/Delete: invalidate tag + specific item
  toggle: publicProcedure
    .input(z.object({ id: z.number(), completed: z.boolean() }))
    .use(orpcInvalidate({ tags: CACHE_KEYS.tag, keys: (input) => CACHE_KEYS.byId(input.id) }))
    .handler(async ({ input }) => db.update(todo).set({ completed: input.completed })),
};
```

**Key Pattern from oRPC docs**:

```typescript
// oRPC middleware has access to path, input, and output()
os.middleware(async ({ next, path }, input, output) => {
  const key = path.join('/') + JSON.stringify(input);
  
  if (cached) {
    return output(cachedValue);  // Return cached via output()
  }
  
  const result = await next({});
  // Cache result.output
  return result;
});
```

## Infrastructure

### Redis via Docker

```yaml
# packages/db/docker-compose.yml
redis:
  image: redis/redis-stack:latest
  ports:
    - "6379:6379"   # Redis
    - "8001:8001"   # RedisInsight UI
  environment:
    REDIS_ARGS: "--requirepass password"
```

**Connection URL**: `redis://:password@localhost:6379`

### Environment Variable

```typescript
// packages/env/src/server.ts
REDIS_URL: z.string().min(1).optional(),
```

**Optional**: App works without Redis; middleware throws if `REDIS_URL` not set when cache is used.

## Response Headers

HTTP middleware adds `X-Cache` header for debugging:

- `X-Cache: HIT` - Response served from cache
- `X-Cache: MISS` - Response generated and cached

## Testing Pattern

Mock `@cyberk-flow/db/redis` before importing middleware:

```typescript
vi.mock("@cyberk-flow/db/redis", () => ({
  getRedis: () => ({
    get: mockGet,
    setex: mockSetex,
    del: mockDel,
  }),
}));

const { httpCache, httpInvalidate } = await import("../http");
```

## Limitations

- **JSON serialization** - Only supports JSON-serializable responses
- **GET only** - HTTP cache middleware only caches GET requests
- **Tag-based only for oRPC** - HTTP middleware doesn't support tags (use explicit keys)

## Related

- [oRPC Middleware Docs](https://orpc.dev/docs/middleware)
- [Hono Middleware](https://hono.dev/docs/guides/middleware)
- [ioredis](https://github.com/redis/ioredis)
