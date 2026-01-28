# Change: Add Rate Limiting to Backend

## Why

Protect the API from abuse, prevent brute-force attacks on auth endpoints, and ensure fair usage across users. Rate limiting is essential for production readiness.

## What Changes

- Add `hono-rate-limiter` and `@hono-rate-limiter/redis` dependencies
- Create `getClientIdentifier()` utility using Hono's `getConnInfo` + standard headers
- Create rate limiting store adapter in `packages/cache`
- Apply tiered rate limiting middleware to `apps/server`:
  - **Auth endpoints**: Strict (20 req/15min per IP)
  - **Authenticated API**: Standard (100 req/min per user ID)
  - **Anonymous API**: Conservative (30 req/min per IP)
  - **AI endpoint**: Restricted (10 req/min per user ID)

## Impact

- **Affected packages**: `packages/cache`, `apps/server`
- **Affected code**: `apps/server/src/index.ts`
- **New dependencies**: `hono-rate-limiter`, `@hono-rate-limiter/redis`
- **Breaking changes**: None

## Design Decisions

1. **Client IP Detection**: Use Hono's `getConnInfo()` for Bun, with fallback to standard headers (`CF-Connecting-IP` > `X-Real-IP` > `X-Forwarded-For`)
2. **Tiered Limits**: Different limits for auth, authenticated, anonymous, and AI
3. **Key Strategy**: 
   - Authenticated: User ID from session
   - Anonymous: Client IP address
4. **Standard Headers**: Use `RateLimit-*` headers (draft-6 standard)
