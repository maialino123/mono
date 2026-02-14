## Context

The todo router is a basic CRUD example that needs to be enhanced with industry-standard patterns for API naming, pagination, and caching.

## Goals / Non-Goals

- Goals:
  - Add `findById` endpoint with proper caching
  - Implement offset-based pagination for list operation
  - Add filtering by `completed` and `text` fields
  - Add sorting by `createdAt` or `text` with asc/desc order
  - Simplify cache key patterns for maintainability
- Non-Goals:
  - Cursor-based pagination (overkill for simple todo list)
  - Complex filter operators like LHS brackets (can be added later)
  - Multi-field sorting (can be added later)

## Risk Map

| Component | Risk | Rationale | Verification |
|-----------|------|-----------|--------------|
| findById | LOW | Standard Drizzle query pattern | N/A |
| Pagination | LOW | Existing pattern in codebase | N/A |
| Filtering | LOW | Standard Drizzle where clauses | N/A |
| Sorting | LOW | Standard Drizzle orderBy | N/A |
| Cache refactor | LOW | Simple string changes | N/A |
| Tag-based invalidation | MEDIUM | New pattern in cache package | Unit test tag functions |

## Decisions

### 1. Naming Convention: `findById`

**Decision**: Use `findById` instead of `getById` or `get`

**Rationale**:
- Aligns with Prisma (`findUnique`), Spring Data (`findById`), TypeORM (`findOneBy`)
- Clear intent: "find" implies search that may return nothing
- Distinct from `get` which often implies guaranteed result

**Alternatives considered**:
- `getById`: More HTTP-like but less descriptive
- `get`: Too generic, conflicts with JS property access patterns

### 2. Pagination Style: Offset-based

**Decision**: Use offset-based pagination with `{ page, limit }` input

**Rationale**:
- Simpler to implement and understand
- Sufficient for small-to-medium datasets
- Familiar pattern for most developers

**Response format**:
```ts
{
  items: Todo[];
  total: number;
  page: number;
  totalPages: number;
}
```

**Alternatives considered**:
- Cursor-based (Stripe/Google style): More scalable but complex
- Keyset pagination: Better performance but harder to implement

### 3. Filtering Style: Simple Query Parameters

**Decision**: Use simple query parameters with type-safe Zod schema

```ts
{
  completed?: boolean,  // exact match
  text?: string,        // contains search (ilike)
}
```

**Rationale**:
- Type-safe with Zod validation
- Simple and intuitive for clients
- Easy to extend with more filters later
- Works well with oRPC's input schema

**Alternatives considered**:
- LHS Brackets (`?text[contains]=buy`): More powerful but complex parsing
- Google Filter Expression: Overkill for simple use case
- GraphQL-style filters: Not applicable to REST/RPC

### 4. Sorting Style: Two Parameters

**Decision**: Use explicit `sortBy` and `sortOrder` parameters

```ts
{
  sortBy?: "createdAt" | "text",  // enum of allowed fields
  sortOrder?: "asc" | "desc",     // default: "asc"
}
```

**Rationale**:
- Explicit and type-safe with Zod enum
- Easy to understand for clients
- Restricts sorting to indexed/allowed fields only

**Alternatives considered**:
- Single param with `-` prefix (`?sort=-price`): More compact but less explicit
- Multiple sort fields (`?sort=price,-name`): Overkill for simple use case

### 5. Cache Key Pattern

**Decision**: Function-based keys with simple prefixes

```ts
const CACHE_KEYS = {
  all: "todos",
  byId: (id: number) => `todo:${id}`,
  list: (input: ListInput) => `todos:${JSON.stringify(input)}`,
}
```

**Rationale**:
- Simple and readable
- Type-safe with function parameters
- List cache key includes all filter/pagination params for unique caching

### 6. Tag-based Cache Invalidation

**Decision**: Use Redis Sets for tag-based cache invalidation

**Problem**: List endpoint caches by input params (e.g., `todos:{"page":1,"limit":10}`). When a todo is created/updated/deleted, we need to invalidate ALL list cache variants without knowing their exact keys.

**Solution**: Tag-based caching using Redis Sets

```ts
// When caching list response:
SET todos:{"page":1} "data"
SADD tag:todos "todos:{"page":1}"  // track key in tag set

// When invalidating (on mutation):
SMEMBERS tag:todos        // get all keys: ["todos:{"page":1}", "todos:{"page":2}"]
DEL key1 key2 ...         // delete all cached keys
DEL tag:todos             // delete tag set
```

**Implementation**:
```ts
// packages/cache/src/utils.ts
export async function cacheWithTag(key: string, tag: string, value: string, ttl: number) {
  const redis = getRedis();
  await redis.setex(key, ttl, value);
  await redis.sadd(`tag:${tag}`, key);
  await redis.expire(`tag:${tag}`, ttl);
}

export async function invalidateByTag(tag: string) {
  const redis = getRedis();
  const keys = await redis.smembers(`tag:${tag}`);
  if (keys.length > 0) await redis.del(...keys);
  await redis.del(`tag:${tag}`);
}
```

**Alternatives considered**:

| Approach | Complexity | Performance | Production Ready |
|----------|------------|-------------|------------------|
| Prefix scan (`SCAN todos:*`) | Low | O(n) full Redis scan | ❌ Slow at scale |
| Tag-based (Redis Sets) | Medium | O(1) lookup + O(k) delete | ✅ Yes |
| Skip cache for filtered | Low | N/A | ❌ Poor cache hit rate |
| TTL-only (no invalidation) | Low | N/A | ❌ Stale data |

**Rationale**:
- O(1) tag lookup via Redis Sets
- Atomic invalidation of all related keys
- No need to track individual cache keys in application code
- Scales well with many cache variants

## Migration Plan

1. Refactor cache keys (non-breaking)
2. Add `findById` endpoint (additive)
3. Add pagination to `getAll`/`list` (potentially breaking if clients expect array)

**Note**: Step 3 changes response shape from `Todo[]` to `{ items: Todo[], ... }`. Consider:
- Keep `getAll` for backwards compatibility
- Add new `list` endpoint with pagination

## Open Questions

- None - all decisions made based on industry research
