# Rate Limiting Specification

## ADDED Requirements

### Requirement: Client IP Detection

The system SHALL detect the real client IP address using multiple sources with proper priority.

#### Scenario: Direct connection (Bun runtime)

- **WHEN** a client connects directly to the server
- **THEN** the system uses `getConnInfo()` to get the socket address
- **AND** this cannot be spoofed by headers

#### Scenario: Behind Cloudflare

- **WHEN** request includes `CF-Connecting-IP` header
- **THEN** the system uses this as the client IP
- **AND** ignores `X-Forwarded-For`

#### Scenario: Behind reverse proxy

- **WHEN** request includes `X-Real-IP` header
- **THEN** the system uses this as the client IP

#### Scenario: X-Forwarded-For fallback

- **WHEN** only `X-Forwarded-For` is available
- **THEN** the system uses the first (leftmost) IP in the list

### Requirement: Auth Endpoint Rate Limiting

The system SHALL rate limit authentication endpoints to prevent brute-force attacks.

#### Scenario: Rate limit exceeded on auth endpoint

- **WHEN** a client makes more than 20 requests to `/api/auth/*` within 15 minutes
- **THEN** subsequent requests return HTTP 429 Too Many Requests
- **AND** response includes `Retry-After` header

#### Scenario: Rate limit not exceeded

- **WHEN** a client makes requests to `/api/auth/*` within the limit
- **THEN** requests are processed normally
- **AND** response includes `RateLimit-*` headers

### Requirement: Authenticated API Rate Limiting

The system SHALL rate limit authenticated API requests based on user ID.

#### Scenario: Authenticated user within limit

- **WHEN** an authenticated user makes up to 100 requests to `/rpc/*` within 1 minute
- **THEN** requests are processed normally

#### Scenario: Authenticated user exceeds limit

- **WHEN** an authenticated user makes more than 100 requests to `/rpc/*` within 1 minute
- **THEN** subsequent requests return HTTP 429 Too Many Requests

### Requirement: Anonymous API Rate Limiting

The system SHALL rate limit anonymous API requests based on client IP.

#### Scenario: Anonymous client within limit

- **WHEN** an anonymous client makes up to 30 requests to `/rpc/*` within 1 minute
- **THEN** requests are processed normally

#### Scenario: Anonymous client exceeds limit

- **WHEN** an anonymous client makes more than 30 requests to `/rpc/*` within 1 minute
- **THEN** subsequent requests return HTTP 429 Too Many Requests

### Requirement: AI Endpoint Rate Limiting

The system SHALL apply strict rate limiting to AI endpoints due to resource intensity.

#### Scenario: AI rate limit exceeded

- **WHEN** a user makes more than 10 requests to `/ai` within 1 minute
- **THEN** subsequent requests return HTTP 429 Too Many Requests

### Requirement: Rate Limit Headers

The system SHALL include standard rate limit headers in responses (RFC draft-6).

#### Scenario: Standard headers included

- **WHEN** any rate-limited request is processed
- **THEN** response includes `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` headers

### Requirement: Redis-backed Storage

The system SHALL use Redis for storing rate limit counters.

#### Scenario: Distributed rate limiting

- **WHEN** rate limits are applied across multiple server instances
- **THEN** limits are shared via Redis storage
- **AND** counters persist across server restarts
