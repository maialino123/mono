# Tasks: Add Rate Limiting

## 1. Dependencies & Infrastructure

- [x] 1.1 Add `hono-rate-limiter` to `apps/server/package.json`
- [x] 1.2 Add `@hono-rate-limiter/redis` to `packages/cache/package.json`
- [x] 1.3 Run `bun install`

## 2. Client IP Detection (packages/cache)

- [x] 2.1 Create `src/client-ip.ts` with `getClientIP()` using `getConnInfo` + header fallbacks
- [x] 2.2 Export from `src/index.ts`

## 3. Rate Limit Store (packages/cache)

- [x] 3.1 Create `src/rate-limit.ts` with ioredis adapter for `@hono-rate-limiter/redis`
- [x] 3.2 Export `createRateLimitStore()` from `src/index.ts`

## 4. Server Integration (apps/server)

- [x] 4.1 Create auth rate limiter (20 req/15min per IP)
- [x] 4.2 Create API rate limiter with user/IP key generator:
  - Authenticated: 100 req/min per user ID
  - Anonymous: 30 req/min per IP
- [x] 4.3 Create AI rate limiter (10 req/min per user ID)
- [x] 4.4 Apply limiters to routes

## 5. Verification

- [x] 5.1 Run `bun run check-types`
- [x] 5.2 Run `bun run check` (biome)
- [ ] 5.3 Manual test with curl
