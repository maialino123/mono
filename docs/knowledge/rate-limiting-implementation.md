# Rate Limiting Implementation Knowledge

> **Source Thread**:
> - [T-019c02a3-9ac4-7528-b374-ac57492bd183](https://ampcode.com/threads/T-019c02a3-9ac4-7528-b374-ac57492bd183) - Rate limiting implementation
>
> **Date**: January 2026

## Overview

Implementation of rate limiting middleware for the Hono API server using `hono-rate-limiter` with Redis backend. Supports tiered limits for authenticated vs anonymous users.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      apps/server                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    Hono App                              ││
│  │                                                          ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ││
│  │  │ Auth Limiter │  │ API Limiter  │  │  AI Limiter  │  ││
│  │  │ 20/15min IP  │  │ 100/min User │  │ 10/min User  │  ││
│  │  │              │  │ 30/min Anon  │  │              │  ││
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  ││
│  │         │                 │                 │           ││
│  │         └────────────┬────┴─────────────────┘           ││
│  │                      │                                   ││
│  │              getClientIP()                               ││
│  │     (getConnInfo → CF-Connecting-IP → X-Forwarded-For)  ││
│  └──────────────────────┼──────────────────────────────────┘│
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    packages/cache                            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │               Rate Limit Store (Redis)                   ││
│  │  ┌──────────────────────────────────────────────────┐   ││
│  │  │  @hono-rate-limiter/redis + ioredis adapter      │   ││
│  │  └──────────────────────────────────────────────────┘   ││
│  └──────────────────────┬──────────────────────────────────┘│
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
                    ┌───────────┐
                    │   Redis   │
                    └───────────┘
```

## Key Files

| File | Purpose |
|------|---------|
| [`packages/cache/src/client-ip.ts`](packages/cache/src/client-ip.ts) | Client IP detection with `getConnInfo` + header fallbacks |
| [`packages/cache/src/rate-limit.ts`](packages/cache/src/rate-limit.ts) | Redis store adapter for `@hono-rate-limiter/redis` |
| [`apps/server/src/index.ts`](apps/server/src/index.ts) | Rate limiter middleware configuration |

## Rate Limit Tiers

| Endpoint | Key | Window | Limit | Rationale |
|----------|-----|--------|-------|-----------|
| `/api/auth/*` | IP | 15 min | 20 | Prevent brute-force attacks |
| `/rpc/*` (authenticated) | User ID | 1 min | 100 | Normal API usage |
| `/rpc/*` (anonymous) | IP | 1 min | 30 | Conservative for unknown |
| `/ai` | User ID | 1 min | 10 | Resource intensive |

## Design Decisions

### Client IP Detection Strategy

**Problem**: Getting real client IP behind proxies/CDN is complex. `X-Forwarded-For` can be spoofed.

**Solution**: Multi-source detection with priority:

```typescript
// packages/cache/src/client-ip.ts
export function getClientIP(c: Context): string {
  // 1. Hono's getConnInfo (real socket address - cannot be spoofed)
  try {
    const info = getConnInfo(c);
    if (info.remote.address) return normalizeIP(info.remote.address);
  } catch {}

  // 2. Cloudflare's CF-Connecting-IP (trusted, single IP)
  const cfIP = c.req.header("cf-connecting-ip");
  if (cfIP) return normalizeIP(cfIP);

  // 3. X-Real-IP (common with nginx)
  const realIP = c.req.header("x-real-ip");
  if (realIP) return normalizeIP(realIP);

  // 4. X-Forwarded-For (first/leftmost IP)
  const xff = c.req.header("x-forwarded-for");
  if (xff) return normalizeIP(xff.split(",")[0]?.trim());

  return "unknown";
}
```

**Header Priority**:

| Header | Provider | Trust Level |
|--------|----------|-------------|
| `getConnInfo()` | Bun socket | Highest (cannot spoof) |
| `CF-Connecting-IP` | Cloudflare | High (single IP) |
| `X-Real-IP` | nginx/custom | Medium |
| `X-Forwarded-For` | Standard | Low (can be spoofed) |

### Tiered Rate Limiting for API

**Problem**: Authenticated users need higher limits than anonymous users.

**Solution**: Two separate limiters applied conditionally:

```typescript
// apps/server/src/index.ts
app.use("/rpc/*", async (c, next) => {
  const context = await createContext({ context: c });
  const userId = context.session?.user?.id;
  
  if (userId) {
    c.set("userId", userId);
  }

  // Apply appropriate limiter
  const limiter = userId ? apiAuthenticatedLimiter : apiAnonymousLimiter;
  const limiterResponse = await limiter(c, async () => {});
  
  if (limiterResponse) return limiterResponse;
  
  // ... continue to handler
});
```

### ioredis Adapter

**Problem**: `@hono-rate-limiter/redis` expects a specific `RedisClient` interface, but we use `ioredis`.

**Solution**: Create adapter that maps ioredis methods:

```typescript
// packages/cache/src/rate-limit.ts
function createIoRedisAdapter(): RedisClient {
  const redis = getRedis();
  return {
    scriptLoad: (script) => redis.script("LOAD", script),
    evalsha: (sha1, keys, args) => redis.evalsha(sha1, keys.length, ...keys, ...args),
    decr: (key) => redis.decr(key),
    del: (key) => redis.del(key),
  };
}
```

### Hono AppEnv for Type Safety

**Problem**: `c.get("userId")` and `c.set("userId", ...)` need type safety.

**Solution**: Define `AppEnv` type for Hono app:

```typescript
type AppEnv = {
  Variables: {
    userId?: string;
  };
};

const app = new Hono<AppEnv>();
```

## Response Headers

Rate limited responses include (RFC draft-6 standard):

- `RateLimit-Limit`: Maximum requests allowed in window
- `RateLimit-Remaining`: Remaining requests in current window
- `RateLimit-Reset`: Seconds until window resets

When limit exceeded:
- HTTP 429 Too Many Requests
- `Retry-After` header

## Usage Patterns

### Basic Rate Limiter

```typescript
import { rateLimiter } from "hono-rate-limiter";
import { createRateLimitStore, getClientIP } from "@cyberk-flow/cache";

const limiter = rateLimiter<AppEnv>({
  windowMs: 60 * 1000,       // 1 minute
  limit: 100,                // 100 requests
  standardHeaders: "draft-6", // RFC headers
  keyGenerator: (c) => `ip:${getClientIP(c)}`,
  store: createRateLimitStore({ prefix: "rl:api:" }),
});

app.use("/api/*", limiter);
```

### Conditional Limiter (Auth vs Anon)

```typescript
app.use("/rpc/*", async (c, next) => {
  const context = await createContext({ context: c });
  const userId = context.session?.user?.id;
  
  if (userId) c.set("userId", userId);
  
  const limiter = userId ? authenticatedLimiter : anonymousLimiter;
  const response = await limiter(c, async () => {});
  if (response) return response;
  
  await next();
});
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `hono-rate-limiter` | Rate limiting middleware for Hono |
| `@hono-rate-limiter/redis` | Redis store for distributed rate limiting |

## Related

- [hono-rate-limiter docs](https://github.com/rhinobase/hono-rate-limiter)
- [Hono ConnInfo Helper](https://hono.dev/docs/helpers/conninfo)
- [MDN X-Forwarded-For](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Forwarded-For)
- [Cloudflare HTTP Headers](https://developers.cloudflare.com/fundamentals/reference/http-headers/)
- [Redis Caching Implementation](redis-caching-implementation.md)
