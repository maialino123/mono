# Proposal: Add Redis Caching

## Why

Performance optimization for API endpoints. Currently all requests hit the database directly. Caching frequently accessed data will reduce database load and improve response times.

## What Changes

1. **New `packages/cache` package** - Redis client and caching utilities
2. **Cache middleware** - Hono middleware with flexible key generation
3. **Environment variables** - Add `REDIS_URL` to env validation
4. **Integration** - Wire up cache middleware in server

## Design Goals

- **Flexible key generation**: Support static keys or functions that receive request context
- **Middleware pattern**: Easy to apply per-route via Hono middleware
- **TTL support**: Configurable cache duration
- **Type-safe**: Full TypeScript support
- **Traditional Redis**: TCP connection via ioredis (not HTTP-based Upstash)

## API Design

```typescript
// Simple usage - uses c.req.url as default key (like NestJS getRequestUrl)
app.get('/users', cache(), handler)

// Custom static key
app.get('/users', 
  cache({ 
    key: 'users:list',
    ttl: 60 
  }),
  handler
)

// Dynamic key based on request
app.get('/users/:id',
  cache({ 
    key: (c) => `users:${c.req.param('id')}`,
    ttl: 300
  }),
  handler
)

// With query params
app.get('/search',
  cache({
    key: (c) => `search:${c.req.query('q')}:${c.req.query('page')}`,
    ttl: 120
  }),
  handler
)
```

**Note:** Only `GET` requests are cached (same as NestJS `allowedMethods = ['GET']`).

## Impact

- New package: `packages/cache`
- Modified: `packages/env/src/server.ts` (add REDIS_URL)
- Modified: `apps/server/src/index.ts` (optional global setup)
- Dependencies: `ioredis`

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| `hono-server-cache` | Ready-made | Limited customization |
| Upstash Redis | Edge-compatible | HTTP overhead, external service |
| **ioredis (chosen)** | Full Redis features, TCP | Requires Redis server |
| In-memory cache | No infra | Not persistent, no sharing |
