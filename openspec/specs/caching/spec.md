# caching Specification

## Purpose
TBD - created by archiving change add-redis-caching. Update Purpose after archive.
## Requirements
### Requirement: Redis Connection

The system SHALL provide a Redis client that connects via TCP using the `REDIS_URL` environment variable.

#### Scenario: Successful connection

- **GIVEN** a valid `REDIS_URL` environment variable
- **WHEN** the cache middleware is used
- **THEN** the system establishes a Redis connection
- **AND** reuses the connection for subsequent requests

#### Scenario: Missing Redis URL

- **GIVEN** `REDIS_URL` is not set
- **WHEN** the application starts
- **THEN** environment validation fails with a clear error message

### Requirement: Cache Middleware

The system SHALL provide Hono middleware (`httpCache`) and oRPC middleware (`orpcCache`) that cache responses in Redis.

#### Scenario: Cache miss

- **GIVEN** a route with cache middleware configured
- **WHEN** a GET request is made with no cached response
- **THEN** the handler executes normally
- **AND** the response is stored in Redis with the configured TTL
- **AND** the response includes `X-Cache: MISS` header

#### Scenario: Cache hit

- **GIVEN** a route with cache middleware configured
- **AND** a cached response exists for the cache key
- **WHEN** a GET request is made
- **THEN** the cached response is returned
- **AND** the handler is NOT executed
- **AND** the response includes `X-Cache: HIT` header

#### Scenario: Non-GET requests bypass cache

- **GIVEN** a route with cache middleware configured
- **WHEN** a POST/PUT/DELETE request is made
- **THEN** the cache is bypassed
- **AND** the handler executes normally

### Requirement: Flexible Cache Key Generation

The system SHALL support both static and dynamic cache keys. Default key is `c.req.url` (equivalent to NestJS `httpAdapter.getRequestUrl(request)`).

#### Scenario: Default cache key (no key option)

- **GIVEN** cache middleware with no `key` option: `cache()`
- **WHEN** a request is made to `/users?page=1`
- **THEN** the cache key is the full URL: `http://localhost:3000/users?page=1`

#### Scenario: Static cache key

- **GIVEN** cache middleware with `key: "users:list"`
- **WHEN** requests are made
- **THEN** all requests use the same cache key

#### Scenario: Dynamic cache key from request

- **GIVEN** cache middleware with `key: (c) => \`users:\${c.req.param('id')}\``
- **WHEN** a request is made to `/users/123`
- **THEN** the cache key is `users:123`

#### Scenario: Cache key with query parameters

- **GIVEN** cache middleware with key function accessing query params
- **WHEN** requests with different query params are made
- **THEN** each unique query combination has its own cache entry

### Requirement: TTL Configuration

The system SHALL support configurable cache expiration times.

#### Scenario: Default TTL

- **GIVEN** cache middleware without TTL specified
- **WHEN** a response is cached
- **THEN** it expires after 60 seconds (default)

#### Scenario: Custom TTL

- **GIVEN** cache middleware with `ttl: 300`
- **WHEN** a response is cached
- **THEN** it expires after 300 seconds

### Requirement: Conditional Caching

The system SHALL support conditional caching based on request context.

#### Scenario: Skip cache based on condition

- **GIVEN** cache middleware with `condition: (c) => !c.req.header('Authorization')`
- **WHEN** a request includes Authorization header
- **THEN** caching is bypassed and handler executes directly

### Requirement: oRPC Cache Invalidation

The system SHALL provide an oRPC middleware (`orpcInvalidate`) that invalidates (deletes) cache entries when mutations succeed.

#### Scenario: Invalidate single key on success

- **GIVEN** a mutation endpoint with `orpcInvalidate({ keys: "todo:list" })`
- **WHEN** the mutation executes successfully
- **THEN** the cache entry for `todo:list` is deleted from Redis

#### Scenario: Invalidate multiple keys on success

- **GIVEN** a mutation endpoint with `orpcInvalidate({ keys: ["todo:list", "todo:count"] })`
- **WHEN** the mutation executes successfully
- **THEN** all specified cache entries are deleted from Redis

#### Scenario: Dynamic key invalidation

- **GIVEN** a mutation endpoint with `orpcInvalidate({ keys: (input) => \`todo:\${input.id}\` })`
- **WHEN** the mutation executes with `{ id: 123 }`
- **THEN** the cache entry for `todo:123` is deleted from Redis

#### Scenario: No invalidation on failure

- **GIVEN** a mutation endpoint with invalidation configured
- **WHEN** the mutation throws an error
- **THEN** cache entries are NOT invalidated

### Requirement: HTTP Cache Invalidation

The system SHALL provide a Hono middleware (`httpInvalidate`) that invalidates cache entries when non-GET requests succeed.

#### Scenario: Invalidate on POST success

- **GIVEN** a route with `httpInvalidate({ keys: "users:list" })`
- **WHEN** a POST request completes successfully (2xx status)
- **THEN** the cache entry for `users:list` is deleted from Redis

#### Scenario: Dynamic key from request context

- **GIVEN** a route with `httpInvalidate({ keys: (c) => \`users:\${c.req.param("id")}\` })`
- **WHEN** a DELETE request to `/users/456` completes successfully
- **THEN** the cache entry for `users:456` is deleted from Redis

#### Scenario: No invalidation on error response

- **GIVEN** a route with HTTP invalidation configured
- **WHEN** the handler returns an error status (4xx, 5xx)
- **THEN** cache entries are NOT invalidated

