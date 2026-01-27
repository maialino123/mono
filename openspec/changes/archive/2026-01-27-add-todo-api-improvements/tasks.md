## 1. Tag-based Cache Infrastructure

- [x] 1.1 Add `cacheWithTag(key, tag, value, ttl)` function to `packages/cache/src/utils.ts`
- [x] 1.2 Add `invalidateByTag(tag)` function to `packages/cache/src/utils.ts`
- [x] 1.3 Update `orpcCache` to support `tag` option for automatic tag registration
- [x] 1.4 Update `orpcInvalidate` to support `tags` option for tag-based invalidation
- [x] 1.5 Export new types from `packages/cache/src/index.ts`

## 2. Cache Key Refactoring

- [x] 2.1 Refactor `TODO_CACHE_KEYS` to use simplified pattern:
  ```ts
  const CACHE_KEYS = {
    tag: "todos",                                    // tag for all list variants
    list: (input: ListInput) => `todos:${JSON.stringify(input)}`,
    byId: (id: number) => `todo:${id}`,
  }
  ```
- [x] 2.2 Update all existing cache references to use new keys

## 3. Add findById Endpoint

- [x] 3.1 Add `findById` procedure with input `{ id: number }`
- [x] 3.2 Add cache middleware with key `CACHE_KEYS.byId(input.id)`
- [x] 3.3 Return single todo or null/error if not found

## 4. Add Pagination and Filtering to List

- [x] 4.1 Rename `getAll` to `list` (optional, for consistency)
- [x] 4.2 Add input schema:
  ```ts
  {
    page?: number,                        // default: 1
    limit?: number,                       // default: 10
    completed?: boolean,                  // exact match filter
    text?: string,                        // contains/like search
    sortBy?: "createdAt" | "text",        // field to sort
    sortOrder?: "asc" | "desc",           // default: "asc"
  }
  ```
- [x] 4.3 Implement offset-based pagination with Drizzle
- [x] 4.4 Implement filtering:
  - `completed` → `eq(todo.completed, input.completed)`
  - `text` → `ilike(todo.text, `%${input.text}%`)`
- [x] 4.5 Implement sorting:
  - `sortBy` + `sortOrder` → `orderBy(asc/desc(todo[sortBy]))`
- [x] 4.6 Return paginated response: `{ items, total, page, totalPages }`
- [x] 4.7 Apply cache with tag: `orpcCache({ key: CACHE_KEYS.list(input), tag: CACHE_KEYS.tag })`

## 5. Update Cache Invalidation

- [x] 5.1 Update `create` to invalidate by tag: `orpcInvalidate({ tags: CACHE_KEYS.tag })`
- [x] 5.2 Update `toggle` to invalidate tag + item: `orpcInvalidate({ tags: CACHE_KEYS.tag, keys: CACHE_KEYS.byId(id) })`
- [x] 5.3 Update `delete` to invalidate tag + item: `orpcInvalidate({ tags: CACHE_KEYS.tag, keys: CACHE_KEYS.byId(id) })`

## 6. Database Schema Update

- [x] 6.1 Add `createdAt` timestamp field to todo schema
- [ ] 6.2 Run `bun run db:push` to apply schema changes

## 7. Testing & Verification

- [x] 7.1 Run `bun run check-types` to verify TypeScript
- [x] 7.2 Write unit tests for `cacheWithTag` and `invalidateByTag`
- [ ] 7.3 Test endpoints manually or with existing test setup
