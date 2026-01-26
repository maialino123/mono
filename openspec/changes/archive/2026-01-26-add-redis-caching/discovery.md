# Discovery: Redis Caching for Hono Server

## 1. Feature Summary

Implement server-side Redis caching middleware for Hono API server with flexible cache key generation based on request context.

## 2. Architecture Snapshot

### Relevant Packages

| Package | Purpose | Key Files |
|---------|---------|-----------|
| `apps/server` | Hono API server | `src/index.ts` |
| `packages/api` | oRPC routers & business logic | `routers/*.ts` |
| `packages/env` | Environment validation | `src/server.ts` |

### Entry Points

- API: Hono server at `apps/server/src/index.ts`
- RPC: oRPC handlers via `RPCHandler` and `OpenAPIHandler`

## 3. Existing Patterns

### Similar Implementations (from nestjs-boilerplate)

| Feature | Location | Pattern Used |
|---------|----------|--------------|
| AppCacheKey decorator | `nestjs-boilerplate/.../decorators/app-cache-key.decorator.ts` | NestJS metadata decorator |
| AppCacheInterceptor | `nestjs-boilerplate/.../interceptors/app-cache-interceptor.ts` | NestJS CacheInterceptor |

### Reference Code

```typescript
// NestJS pattern - decorator for custom cache key
export const AppCacheKey = (key: string | ((request: Request, context?: ExecutionContext) => string)) =>
  SetMetadata(APP_CACHE_KEY_KEY, key)

// NestJS pattern - interceptor reads metadata
trackBy(context: ExecutionContext): string | undefined {
  const cacheKey = this.reflector.get(APP_CACHE_KEY_KEY, context.getHandler())
  if (cacheKey) {
    return typeof cacheKey === 'function' ? cacheKey(context.switchToHttp().getRequest(), context) : cacheKey
  }
  return super.trackBy(context)
}
```

### Hono Ecosystem Options

| Library | Pattern | Notes |
|---------|---------|-------|
| `hono/cache` | Built-in middleware | Cloudflare/Deno only, uses Web Cache API |
| `hono-server-cache` | Storage adapter pattern | Generic, supports Redis |
| `hono-rate-limiter` | Redis store | Rate limiting specific |

## 4. Technical Constraints

- **Runtime**: Bun (supports TCP connections - can use traditional Redis)
- **Framework**: Hono (middleware-based)
- **Type Safety**: Must integrate with oRPC context
- **Environment**: All env vars via `@cyberk-flow/env`

## 5. External References

- [hono-server-cache](https://github.com/sammaji/hono-server-cache) - Flexible server-side caching
- [ioredis](https://github.com/redis/ioredis) - Robust Redis client for Node/Bun
- Hono GitHub Discussion #3499 - Redis connection patterns

## 6. Gap Analysis

| Component | Have | Need | Gap Size |
|-----------|------|------|----------|
| Redis client | None | ioredis connection | New |
| Cache middleware | None | Hono middleware | New |
| Cache key generator | None | Request-based key fn | New |
| Env vars | None | REDIS_URL | Small |
| Package structure | None | `packages/cache` | New |

## 7. Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| New external dependency (ioredis) | MEDIUM | Well-established lib, Bun compatible |
| Middleware pattern | LOW | Follow `hono-server-cache` pattern |
| Cache invalidation | MEDIUM | Start with TTL-based, add manual later |

## 8. Open Questions

- [ ] Should cache package be separate or part of existing package?
- [ ] TTL configuration - global vs per-route?
- [ ] Cache invalidation strategy for mutations?
