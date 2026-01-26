# Redis Caching Implementation Knowledge

> **Source Thread**: [T-019bfb5c-40e3-70b1-a2c5-5b6454a4605b](http://localhost:8317/threads/T-019bfb5c-40e3-70b1-a2c5-5b6454a4605b)  
> **Date**: January 2026

## Overview

Implementation of Redis caching middleware for both HTTP (Hono) and oRPC endpoints in the cyberk-flow monorepo.

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
| [`packages/cache/src/http.ts`](packages/cache/src/http.ts) | Hono HTTP cache middleware |
| [`packages/cache/src/orpc.ts`](packages/cache/src/orpc.ts) | oRPC cache middleware |
| [`packages/cache/src/types.ts`](packages/cache/src/types.ts) | Shared TypeScript types |
| [`packages/db/src/redis.ts`](packages/db/src/redis.ts) | Redis client singleton |
| [`packages/db/docker-compose.yml`](packages/db/docker-compose.yml) | Redis + PostgreSQL infrastructure |

## Package Structure

```
packages/cache/          # Caching logic
├── src/
│   ├── http.ts         # Hono middleware
│   ├── orpc.ts         # oRPC middleware
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
| HTTP (`cache()`) | `c.req.url` | `http://localhost:3000/users?page=1` |
| oRPC (`cacheMiddleware()`) | `path.join('/') + JSON.stringify(input)` | `users/getById{"id":123}` |

**Rationale**: Follows NestJS CacheInterceptor pattern where default key is derived from request.

### Default TTL = 2 seconds

Short default TTL prevents stale data issues during development. Override with `ttl` option for production caching.

## Usage Patterns

### HTTP (Hono)

```typescript
import { cache } from "@cyberk-flow/cache";

// Default: key = c.req.url, ttl = 2s
app.get("/users", cache(), handler);

// Custom key and TTL
app.get("/users/:id", 
  cache({ 
    key: (c) => `users:${c.req.param("id")}`,
    ttl: 300 
  }), 
  handler
);

// Conditional caching (skip for authenticated requests)
app.get("/public",
  cache({
    condition: (c) => !c.req.header("Authorization"),
  }),
  handler
);
```

### oRPC

```typescript
import { cacheMiddleware } from "@cyberk-flow/cache";

const todoRouter = {
  getAll: publicProcedure
    .use(cacheMiddleware({ ttl: 60 }))
    .handler(async () => db.select().from(todo)),
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
  }),
}));

const { cache } = await import("../http");
```

## Limitations (v1)

- **No cache invalidation** - TTL-based expiration only
- **JSON serialization** - Only supports JSON-serializable responses
- **GET only** - HTTP middleware only caches GET requests

## Related

- [oRPC Middleware Docs](https://orpc.dev/docs/middleware)
- [Hono Middleware](https://hono.dev/docs/guides/middleware)
- [ioredis](https://github.com/redis/ioredis)
