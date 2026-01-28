# Discovery: Rate Limiting for Hono Server

## 1. Feature Summary

Implement rate limiting middleware for Hono API server using `hono-rate-limiter` with Redis backend, with proper client IP detection and tiered limits for authenticated/anonymous users.

## 2. Architecture Snapshot

### Relevant Packages

| Package | Purpose | Key Files |
|---------|---------|-----------|
| `apps/server` | Hono API server | `src/index.ts` |
| `packages/cache` | Existing Redis caching (ioredis) | `src/index.ts` |
| `packages/api` | oRPC routers & context | `routers/*.ts`, `context.ts` |
| `packages/auth` | Authentication (better-auth) | `src/index.ts` |
| `packages/env` | Environment validation | `src/server.ts` |

### Entry Points

- API: Hono server at `apps/server/src/index.ts`
- RPC: oRPC handlers via `RPCHandler` and `OpenAPIHandler`
- Auth: better-auth at `/api/auth/*`

## 3. Existing Patterns

### Redis Infrastructure (packages/cache)

Project already has Redis setup via `ioredis` in `packages/cache`:
- `httpCache` - HTTP middleware for caching
- `orpcCache` - oRPC procedure caching
- Tag-based cache invalidation

### Hono ConnInfo Helper

Hono provides `getConnInfo()` helper for Bun runtime to get real client IP:
```typescript
import { getConnInfo } from "hono/bun";
const info = getConnInfo(c); // info.remote.address
```

### Standard IP Headers (Priority Order)

| Header | Provider | Trust Level |
|--------|----------|-------------|
| `CF-Connecting-IP` | Cloudflare | High (single IP) |
| `True-Client-IP` | Cloudflare Enterprise | High (single IP) |
| `X-Real-IP` | Nginx/custom | Medium |
| `X-Forwarded-For` | Standard | Low (can be spoofed) |

**Best Practice**: Use rightmost trusted IP from `X-Forwarded-For`, or provider-specific headers.

## 4. Technical Constraints

- **Runtime**: Bun (supports TCP connections, ioredis works)
- **Framework**: Hono (middleware-based)
- **Redis**: Already available via `packages/cache`
- **Auth**: User session available via `createContext()`
- **Environment**: All env vars via `@cyberk-flow/env`

## 5. External References

- [hono-rate-limiter](https://github.com/rhinobase/hono-rate-limiter) - Rate limiting for Hono
- [@hono-rate-limiter/redis](https://www.npmjs.com/package/@hono-rate-limiter/redis) - Redis store
- [Hono ConnInfo Helper](https://hono.dev/docs/helpers/conninfo) - Get client connection info
- [MDN X-Forwarded-For](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Forwarded-For)
- [Cloudflare HTTP Headers](https://developers.cloudflare.com/fundamentals/reference/http-headers/)

## 6. Gap Analysis

| Component | Have | Need | Gap Size |
|-----------|------|------|----------|
| Redis client | ioredis in `packages/cache` | Compatible adapter | Small |
| Rate limit middleware | None | `hono-rate-limiter` | New |
| Redis store | None | `@hono-rate-limiter/redis` | New |
| IP detection | None | `getConnInfo` + headers | New |
| User ID extraction | `createContext()` | Key generator integration | Small |
| Env vars | REDIS_URL exists | Already have | None |

## 7. Risk Assessment

| Area | Risk Level | Rationale |
|------|------------|-----------|
| Redis integration | LOW | Already have ioredis working |
| Hono middleware | LOW | Standard Hono pattern |
| Library maturity | LOW | `hono-rate-limiter` well-maintained |
| IP spoofing | MEDIUM | Need proper header validation |
| User context access | LOW | Already have `createContext()` |

**Overall Risk**: LOW - Follows existing patterns with mature libraries.

## 8. Open Questions

- [ ] Should we add `TRUSTED_PROXIES` env var for X-Forwarded-For validation?
- [ ] Do we need separate limits for different API routes within `/rpc/*`?
