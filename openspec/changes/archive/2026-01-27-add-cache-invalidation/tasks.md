## 1. Refactor & Rename

- [x] 1.1 Create `packages/cache/src/utils.ts` with shared logic:
  - `resolveKeys(keys, input)` - resolve key generator to string[]
  - `invalidateKeys(keys)` - delete keys from Redis
- [x] 1.2 Rename `cache` → `httpCache` in `packages/cache/src/http.ts`
- [x] 1.3 Rename `cacheMiddleware` → `orpcCache` in `packages/cache/src/orpc.ts`
- [x] 1.4 Refactor `orpcInvalidate` to use shared `invalidateKeys()`

## 2. HTTP Invalidation

- [x] 2.1 Add `HTTPInvalidateOptions` type to `packages/cache/src/types.ts`
- [x] 2.2 Implement `httpInvalidate` middleware in `packages/cache/src/http.ts`
- [x] 2.3 Add unit tests for `httpInvalidate`

## 3. Update Exports & Usages

- [x] 3.1 Update `packages/cache/src/index.ts` with new names
- [x] 3.2 Update `packages/api/src/routers/todo.ts` to use `orpcCache`, `orpcInvalidate`
- [x] 3.3 Search and update any other usages of old names

## 4. Verification

- [x] 4.1 Run `bun run check-types`
- [x] 4.2 Run all cache tests (22 tests passed)
- [x] 4.3 Update `packages/cache/README.md` with new API names

## 5. Spec Delta

- [x] 5.1 Update spec delta to reflect HTTP invalidation requirement
