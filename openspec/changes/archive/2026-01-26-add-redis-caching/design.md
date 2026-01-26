# Design: Redis Caching

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
│                    │   (unified) │                     │
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

## Package Structure

```
packages/db/
├── src/
│   ├── index.ts           # PostgreSQL exports
│   └── redis.ts           # Redis client singleton only
├── docker-compose.yml     # PostgreSQL + Redis
└── package.json

packages/cache/
├── src/
│   ├── index.ts           # Public exports
│   ├── cached.ts          # Core cached() helper
│   ├── http.ts            # Hono HTTP middleware
│   ├── orpc.ts            # oRPC middleware  
│   └── types.ts           # TypeScript types
├── package.json
└── tsconfig.json
```

## Unified Caching Logic

All caching logic lives in `@cyberk-flow/cache`:

| Export | Use Case | Default Key |
|--------|----------|-------------|
| `cached(key, fn, ttl)` | Direct use in any handler | Manual |
| `cache(options)` | Hono HTTP middleware | `c.req.url` |
| `cacheMiddleware(options)` | oRPC middleware | `path.join('/') + JSON.stringify(input)` |

## Core Types

```typescript
// types.ts
import type { Context, Env } from 'hono'

// Shared
export interface BaseCacheOptions {
  ttl?: number // seconds, default 60
}

// HTTP middleware
export type HTTPCacheKeyGenerator<E extends Env = Env> = 
  | string 
  | ((c: Context<E>) => string | Promise<string>)

export interface HTTPCacheOptions<E extends Env = Env> extends BaseCacheOptions {
  key?: HTTPCacheKeyGenerator<E>  // default: c.req.url
  condition?: (c: Context<E>) => boolean
}

// oRPC middleware  
export type ORPCCacheKeyGenerator<TInput> =
  | string
  | ((input: TInput, path: string[]) => string)

export interface ORPCCacheOptions<TInput = unknown> extends BaseCacheOptions {
  key?: ORPCCacheKeyGenerator<TInput>  // default: path.join('/') + JSON.stringify(input)
}
```

## Implementation Details

### Redis Client (packages/db/src/redis.ts)

Only provides Redis connection, no caching logic:

```typescript
import Redis from 'ioredis'
import { env } from '@cyberk-flow/env/server'

let client: Redis | null = null

export function getRedis(): Redis {
  if (!client) {
    client = new Redis(env.REDIS_URL!, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    })
  }
  return client
}
```

### Core cached() Helper (packages/cache/src/cached.ts)

```typescript
import { getRedis } from '@cyberk-flow/db/redis'

export async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  ttl = 60
): Promise<T> {
  const redis = getRedis()
  const cachedValue = await redis.get(key)
  
  if (cachedValue) {
    return JSON.parse(cachedValue) as T
  }
  
  const result = await fn()
  await redis.setex(key, ttl, JSON.stringify(result))
  return result
}
```

### HTTP Cache Middleware (packages/cache/src/http.ts)

```typescript
import { createMiddleware } from 'hono/factory'
import { getRedis } from '@cyberk-flow/db/redis'
import type { HTTPCacheOptions } from './types'

export function cache<E extends Env = Env>(options: HTTPCacheOptions<E> = {}) {
  return createMiddleware<E>(async (c, next) => {
    // Only cache GET requests
    if (c.req.method !== 'GET') return next()
    
    // Check condition
    if (options.condition && !options.condition(c)) return next()

    // Generate key (default: c.req.url)
    const key = options.key 
      ? (typeof options.key === 'function' ? await options.key(c) : options.key)
      : c.req.url

    const redis = getRedis()
    const cached = await redis.get(key)
    if (cached) {
      c.header('X-Cache', 'HIT')
      return c.json(JSON.parse(cached))
    }

    await next()

    if (c.res.ok) {
      const body = await c.res.clone().text()
      await redis.setex(key, options.ttl ?? 60, body)
    }
    c.header('X-Cache', 'MISS')
  })
}
```

### oRPC Cache Middleware (packages/cache/src/orpc.ts)

```typescript
import { os } from '@orpc/server'
import { getRedis } from '@cyberk-flow/db/redis'
import type { ORPCCacheOptions } from './types'

export function cacheMiddleware<TInput = unknown>(
  options: ORPCCacheOptions<TInput> = {}
) {
  return os.middleware(async ({ next, path }, input: TInput, output) => {
    // Generate key (default: path + input)
    const key = options.key
      ? (typeof options.key === 'function' 
          ? options.key(input, path) 
          : options.key)
      : path.join('/') + JSON.stringify(input)

    const redis = getRedis()
    const cached = await redis.get(key)
    if (cached) {
      return output(JSON.parse(cached))
    }

    const result = await next({})
    await redis.setex(key, options.ttl ?? 60, JSON.stringify(result.output))
    return result
  })
}
```

## Usage Examples

### HTTP (Hono)

```typescript
import { cache } from '@cyberk-flow/cache'

// Default key = c.req.url
app.get('/users', cache(), handler)

// Custom key
app.get('/users/:id', cache({ 
  key: (c) => `users:${c.req.param('id')}`,
  ttl: 300 
}), handler)
```

### oRPC

```typescript
import { cacheMiddleware } from '@cyberk-flow/cache'

const todoRouter = {
  // Default key = 'getAll' + '{}'
  getAll: publicProcedure
    .use(cacheMiddleware())
    .handler(async () => db.select().from(todo)),

  // Custom key
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .use(cacheMiddleware({ 
      key: (input) => `todo:${input.id}`,
      ttl: 300 
    }))
    .handler(async ({ input }) => ...)
}
```

### Direct

```typescript
import { cached } from '@cyberk-flow/cache'

const data = await cached('my-key', () => fetchExpensiveData(), 60)
```

## Risk Map

| Component | Risk | Status |
|-----------|------|--------|
| ioredis + Bun | LOW | Verified compatible |
| HTTP middleware pattern | LOW | Standard Hono pattern |
| oRPC middleware pattern | LOW | Follows official docs |
| Response cloning | MEDIUM | May need buffering |
| Cache invalidation | MEDIUM | Deferred to v2 |

## Decisions

1. **Unified package** - All caching logic in `@cyberk-flow/cache`
2. **Consistent defaults** - Both HTTP and oRPC have sensible default keys
3. **Redis client separation** - `@cyberk-flow/db` only provides connection
4. **JSON serialization** - Simple, works for API responses
5. **TTL-based expiration** - No manual invalidation in v1
6. **X-Cache header** - Debug/monitoring support (HTTP only)
