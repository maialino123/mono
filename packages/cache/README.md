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
import { cache } from "@cyberk-flow/cache";

// Default key = c.req.url, default TTL = 2s
app.get("/users", cache(), handler);

// Custom key and TTL
app.get("/users/:id", 
  cache({ 
    key: (c) => `users:${c.req.param("id")}`,
    ttl: 300 
  }), 
  handler
);

// Conditional caching
app.get("/public",
  cache({
    condition: (c) => !c.req.header("Authorization"),
  }),
  handler
);
```

### oRPC (Middleware)

```typescript
import { cacheMiddleware } from "@cyberk-flow/cache";

const todoRouter = {
  // Default key = path + JSON.stringify(input), default TTL = 2s
  getAll: publicProcedure
    .use(cacheMiddleware())
    .handler(async () => db.select().from(todo)),

  // Custom TTL
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .use(cacheMiddleware({ ttl: 300 }))
    .handler(async ({ input }) => ...),
};
```

## API

### `cache(options?)` - HTTP Middleware

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `key` | `string \| (c) => string` | `c.req.url` | Cache key |
| `ttl` | `number` | `2` | TTL in seconds |
| `condition` | `(c) => boolean` | - | Skip cache if false |

**Response Headers:** `X-Cache: HIT` or `X-Cache: MISS`

**Behavior:** Only caches GET requests with successful responses.

### `cacheMiddleware(options?)` - oRPC Middleware

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `key` | `string \| (input, path) => string` | `path.join('/') + JSON.stringify(input)` | Cache key |
| `ttl` | `number` | `2` | TTL in seconds |
