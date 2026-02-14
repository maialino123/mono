# Design: Rate Limiting

## Context

Need to protect API from abuse while providing good UX for legitimate users. Must handle both authenticated and anonymous requests with appropriate limits.

## Goals / Non-Goals

**Goals:**
- Prevent brute-force attacks on auth endpoints
- Fair resource allocation across users
- Proper client identification behind proxies/CDN

**Non-Goals:**
- Per-route granular limits (future enhancement)
- Geo-based rate limiting
- Rate limit dashboard/analytics

## Risk Map

| Component | Risk | Rationale | Verification |
|-----------|------|-----------|--------------|
| ioredis adapter | LOW | Standard Redis commands | Unit test |
| IP detection | MEDIUM | Header spoofing possible | Use `getConnInfo` as source of truth |
| User ID extraction | LOW | Existing `createContext()` | N/A |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      apps/server                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    Hono App                              ││
│  │                                                          ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ││
│  │  │ Auth Limiter │  │ API Limiter  │  │  AI Limiter  │  ││
│  │  │ 20/15min IP  │  │ 100/min User │  │ 10/min User  │  ││
│  │  │              │  │ 30/min Anon  │  │              │  ││
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  ││
│  │         │                 │                 │           ││
│  │         └────────────┬────┴─────────────────┘           ││
│  │                      │                                   ││
│  │              getClientIdentifier()                       ││
│  │     (getConnInfo → CF-Connecting-IP → X-Forwarded-For)  ││
│  └──────────────────────┼──────────────────────────────────┘│
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    packages/cache                            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │               Rate Limit Store (Redis)                   ││
│  │  ┌──────────────────────────────────────────────────┐   ││
│  │  │  @hono-rate-limiter/redis + ioredis adapter      │   ││
│  │  └──────────────────────────────────────────────────┘   ││
│  └──────────────────────┬──────────────────────────────────┘│
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
                    ┌───────────┐
                    │   Redis   │
                    └───────────┘
```

## Decisions

### Decision 1: Client IP Detection Strategy

**What**: Use Hono's `getConnInfo()` as primary source, with header fallbacks.

**Why**: `getConnInfo()` gets real socket IP (can't be spoofed), headers are used only when behind known proxies.

**Implementation**:
```typescript
import { getConnInfo } from "hono/bun";

export function getClientIP(c: Context): string {
  // 1. Try Hono's getConnInfo (real socket address)
  try {
    const info = getConnInfo(c);
    if (info.remote.address) return info.remote.address;
  } catch {}

  // 2. Trusted proxy headers (in priority order)
  const cfIP = c.req.header("cf-connecting-ip");
  if (cfIP) return cfIP;

  const realIP = c.req.header("x-real-ip");
  if (realIP) return realIP;

  // 3. X-Forwarded-For (first IP, be cautious)
  const xff = c.req.header("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();

  return "unknown";
}
```

### Decision 2: Key Generation for Rate Limiting

**What**: Different key strategies for different limiters.

| Limiter | Key Strategy |
|---------|-------------|
| Auth | Always IP (no auth yet) |
| API (authenticated) | User ID from session |
| API (anonymous) | Client IP |
| AI | User ID (require auth) |

**Implementation**:
```typescript
// Auth limiter - always IP based
const authKeyGenerator = (c) => `ip:${getClientIP(c)}`;

// API limiter - user ID or IP
const apiKeyGenerator = (c) => {
  const userId = c.get("userId");
  return userId ? `user:${userId}` : `ip:${getClientIP(c)}`;
};
```

### Decision 3: Rate Limit Tiers

| Endpoint | Auth Required | Window | Limit | Rationale |
|----------|---------------|--------|-------|-----------|
| `/api/auth/*` | No | 15 min | 20 | Prevent brute-force |
| `/rpc/*` (authenticated) | Yes | 1 min | 100 | Normal API usage |
| `/rpc/*` (anonymous) | No | 1 min | 30 | Conservative for unknown |
| `/ai` | Yes | 1 min | 10 | Resource intensive |

## Response Headers

Rate limited responses include (RFC draft-6):
- `RateLimit-Limit`: Maximum requests allowed
- `RateLimit-Remaining`: Remaining requests in window
- `RateLimit-Reset`: Seconds until window resets

When limit exceeded:
- HTTP 429 Too Many Requests
- `Retry-After` header

## Migration Plan

1. Deploy with monitoring (no blocking initially)
2. Analyze traffic patterns
3. Adjust limits based on real usage
4. Enable blocking

## Open Questions

- Should we add bypass for health checks / internal services?
