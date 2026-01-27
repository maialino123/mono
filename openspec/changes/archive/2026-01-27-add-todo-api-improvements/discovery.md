# Discovery: Todo API Improvements

## 1. Feature Summary

Enhance the todo router with `findById` endpoint, pagination support for list operations, and simplified cache key patterns following industry standards.

## 2. Architecture Snapshot

### Relevant Packages

| Package | Purpose | Key Files |
|---------|---------|-----------|
| `packages/api` | oRPC routers and business logic | `src/routers/todo.ts` |
| `packages/db` | Drizzle ORM schema | `src/schema/todo.ts` |
| `packages/cache` | Redis caching middleware | `src/index.ts` |

### Entry Points

- API: `apps/server/src/index.ts` → oRPC handler
- Router: `packages/api/src/routers/todo.ts`

## 3. Existing Patterns

### Similar Implementations

| Feature | Location | Pattern Used |
|---------|----------|--------------|
| `getAll` | `packages/api/src/routers/todo.ts:14` | `publicProcedure` with `orpcCache` |
| Cache invalidation | `packages/api/src/routers/todo.ts:19` | `orpcInvalidate` with static keys |

### Reusable Utilities

- Validation: Zod schemas in procedure `.input()`
- Caching: `orpcCache({ key, ttl })` and `orpcInvalidate({ keys })`
- Database: Drizzle `db.select().from(table)`

## 4. Technical Constraints

- Dependencies: `@cyberk-flow/cache`, `@cyberk-flow/db`, `drizzle-orm`, `zod`
- Database: PostgreSQL with Drizzle ORM
- Current schema: `todo` table with `id` (serial), `text`, `completed`

## 5. External References

### Naming Conventions (Industry Standards)

| Source | CRUD Method | Recommendation |
|--------|-------------|----------------|
| Google AIP-131 | Get single | `Get{Resource}` |
| Spring Data | Get by ID | `findById` (returns Optional) |
| Prisma | Get single | `findUnique`, `findFirst` |
| REST | GET /:id | Resource-based URI |

**Decision**: Use `findById` - aligns with Prisma/Spring patterns, clear intent.

### Pagination Standards

| API | Style | Parameters |
|-----|-------|------------|
| Google AIP-158 | Cursor-based | `page_size`, `page_token`, `next_page_token` |
| Stripe | Cursor-based | `limit`, `starting_after`, `ending_before` |
| GitHub GraphQL | Cursor-based | `first`, `after`, `endCursor` |
| Traditional REST | Offset-based | `page`, `limit`, `total`, `totalPages` |

**Decision**: Start with offset-based pagination (simpler for small datasets):
- Input: `{ page?: number, limit?: number }`
- Output: `{ items: T[], total: number, page: number, totalPages: number }`

### Filtering Standards

| Style | Example | Used By |
|-------|---------|---------|
| Simple Query Params | `?completed=true&text=buy` | Most REST APIs |
| LHS Brackets | `?price[gte]=10&text[contains]=buy` | Stripe |
| RHS Colon | `?price=gte:10` | Some APIs |
| Google Filter Expression | `?filter=text:"buy" AND completed=true` | Google APIs |

**Decision**: Use **Simple Query Parameters** for exact match + text search:
- `completed?: boolean` - exact match filter
- `text?: string` - contains/like search (case-insensitive)

### Sorting Standards

| Style | Example | Used By |
|-------|---------|---------|
| Single param | `?sort=price` or `?sort=-price` (desc) | JSON:API, many APIs |
| Two params | `?sortBy=price&sortOrder=desc` | Common REST pattern |
| Multiple sort | `?sort=price,-name` | Advanced APIs |

**Decision**: Use **Two params** style (simpler, explicit):
- `sortBy?: "createdAt" | "text"` - field to sort by
- `sortOrder?: "asc" | "desc"` - sort direction (default: "asc")

### Cache Key Patterns

| Pattern | Example | Use Case |
|---------|---------|----------|
| Simple prefix | `todos` | List/collection |
| ID-based | `todo:123` | Single resource |
| Query-based | `todos:page=1&limit=10` | Paginated list |

**Decision**: Simplified pattern:
```ts
const CACHE_KEYS = {
  all: "todos",
  byId: (id: number) => `todo:${id}`,
}
```

## 6. Gap Analysis

| Component | Have | Need | Gap Size |
|-----------|------|------|----------|
| findById | None | `findById(id)` with cache | New |
| Pagination | None | `list({ page, limit })` | New |
| Filtering | None | `list({ completed?, text? })` | New |
| Sorting | None | `list({ sortBy?, sortOrder? })` | New |
| Cache keys | Complex string | Simple functions | Refactor |

## 7. Open Questions

- [x] Naming convention for single resource fetch → `findById`
- [x] Pagination style → Offset-based (simpler)
- [x] Filtering style → Simple query parameters
- [x] Sorting style → Two params (`sortBy`, `sortOrder`)
- [x] Cache key format → Simple prefix + ID pattern
