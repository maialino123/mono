# @cyberk-flow/cache

Unified Redis caching for HTTP (Hono) and oRPC.

## Setup

1. Add `REDIS_URL` to your environment:

```bash
REDIS_URL=redis://:password@localhost:6379
```

2. Start Redis with Docker:

```bash
bun run db:start
```

## Usage

### HTTP (Hono Middleware)

```typescript
import { httpCache, httpInvalidate } from "@cyberk-flow/cache";

// Cache: default key = c.req.url, default TTL = 2s
app.get("/users", httpCache(), handler);

// Cache: custom key and TTL
app.get("/users/:id", 
  httpCache({ 
    key: (c) => `users:${c.req.param("id")}`,
    ttl: 300 
  }), 
  handler
);

// Cache: conditional caching
app.get("/public",
  httpCache({
    condition: (c) => !c.req.header("Authorization"),
  }),
  handler
);

// Invalidate: delete cache on mutation
app.post("/users", httpInvalidate({ keys: "users:list" }), handler);
app.delete("/users/:id", 
  httpInvalidate({ keys: (c) => `users:${c.req.param("id")}` }), 
  handler
);
```

### oRPC (Middleware)

```typescript
import { orpcCache, orpcInvalidate } from "@cyberk-flow/cache";

const CACHE_KEYS = {
  todoList: "todo/getAll{}",
};

const todoRouter = {
  // Cache with explicit key
  getAll: publicProcedure
    .use(orpcCache({ key: CACHE_KEYS.todoList, ttl: 2 }))
    .handler(async () => db.select().from(todo)),

  // Invalidate on mutation
  create: publicProcedure
    .use(orpcInvalidate({ keys: CACHE_KEYS.todoList }))
    .input(z.object({ text: z.string() }))
    .handler(async ({ input }) => db.insert(todo).values(input)),

  // Invalidate multiple keys
  deleteAll: publicProcedure
    .use(orpcInvalidate({ keys: [CACHE_KEYS.todoList, "todo:count"] }))
    .handler(async () => db.delete(todo)),

  // Dynamic key invalidation
  delete: publicProcedure
    .use(orpcInvalidate({ keys: (input) => `todo:${input.id}` }))
    .input(z.object({ id: z.number() }))
    .handler(async ({ input }) => db.delete(todo).where(eq(todo.id, input.id))),
};
```

## API

### `httpCache(options?)` - HTTP Cache Middleware

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `key` | `string \| (c) => string` | `c.req.url` | Cache key |
| `ttl` | `number` | `2` | TTL in seconds |
| `condition` | `(c) => boolean` | - | Skip cache if false |

**Response Headers:** `X-Cache: HIT` or `X-Cache: MISS`

**Behavior:** Only caches GET requests with successful responses.

### `httpInvalidate(options)` - HTTP Invalidation Middleware

| Option | Type | Description |
|--------|------|-------------|
| `keys` | `string \| string[] \| (c) => string \| string[]` | Cache keys to invalidate |

**Behavior:** Deletes cache entries when response is successful (2xx).

### `orpcCache(options?)` - oRPC Cache Middleware

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `key` | `string \| (input, path) => string` | `path.join('/') + JSON.stringify(input)` | Cache key |
| `ttl` | `number` | `2` | TTL in seconds |

### `orpcInvalidate(options)` - oRPC Invalidation Middleware

| Option | Type | Description |
|--------|------|-------------|
| `keys` | `string \| string[] \| (input) => string \| string[]` | Cache keys to invalidate |

**Behavior:** Deletes cache entries when handler returns output (not undefined/null).
