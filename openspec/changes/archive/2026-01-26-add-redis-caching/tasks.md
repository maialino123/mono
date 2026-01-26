# Tasks: Add Redis Caching

## 1. Setup

- [x] 1.1 Create `packages/cache` directory structure
- [x] 1.2 Add `package.json` with dependencies
- [x] 1.3 Add `tsconfig.json` extending base config

## 2. Environment

- [x] 2.1 Add `REDIS_URL` to `packages/env/src/server.ts`

## 3. Infrastructure

- [x] 3.1 Add Redis service to `packages/db/docker-compose.yml`
- [x] 3.2 Implement `packages/db/src/redis.ts` with Redis singleton (connection only)

## 4. Core Implementation (packages/cache)

- [x] 4.1 Implement `types.ts` - shared types for HTTP and oRPC
- [x] 4.2 Implement `http.ts` - Hono HTTP middleware (default key: `c.req.url`)
- [x] 4.3 Implement `orpc.ts` - oRPC middleware (default key: `path + input`)
- [x] 4.4 Update `index.ts` - export all public APIs
- [x] 4.5 Update README with usage examples
- [x] 4.6 Default TTL = 2 seconds

## 5. Integration

- [x] 5.1 Add `@cyberk-flow/cache` to server dependencies
- [x] 5.2 Update `packages/api/src/routers/todo.ts` to use oRPC cache middleware

## 6. Testing

- [x] 6.1 Add `http.test.ts` for HTTP middleware (6 tests)
- [x] 6.2 Add `orpc.test.ts` for oRPC middleware (6 tests)

## 7. Validation

- [x] 7.1 Run `bun run check-types` ✓
- [x] 7.2 Run `bun test` - 12 tests pass ✓
- [ ] 7.3 Manual integration test with real Redis
