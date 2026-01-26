# Google OAuth Implementation Knowledge

> **Source Thread**: [T-019bf980-8b16-71ff-90a7-6a1c3932e1bf](http://localhost:8317/threads/T-019bf980-8b16-71ff-90a7-6a1c3932e1bf)  
> **Date**: January 2026

## Overview

Implementation of Google OAuth login using `better-auth` in the cyberk-flow monorepo.

## Architecture

```
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   Web App (3001)    │────▶│  API Server (3000)   │────▶│  Google OAuth   │
│   sign-in-form.tsx  │     │  packages/auth       │     │                 │
└─────────────────────┘     └──────────────────────┘     └─────────────────┘
         │                           │
         │ callbackURL               │ redirect
         ▼                           ▼
    /dashboard              /api/auth/callback/google
```

## Key Files

| File | Purpose |
|------|---------|
| [`packages/auth/src/index.ts`](file:///Users/huybuidac/Projects/cyberk/cyberk-flow/packages/auth/src/index.ts#L18-L25) | Backend auth config with socialProviders |
| [`packages/env/src/server.ts`](file:///Users/huybuidac/Projects/cyberk/cyberk-flow/packages/env/src/server.ts) | Environment validation for Google credentials |
| [`apps/web/src/components/sign-in-form.tsx`](file:///Users/huybuidac/Projects/cyberk/cyberk-flow/apps/web/src/components/sign-in-form.tsx#L159-L163) | Frontend Google sign-in trigger |
| [`docs/google-auth-setup.md`](file:///Users/huybuidac/Projects/cyberk/cyberk-flow/docs/google-auth-setup.md) | Setup guide for GCP OAuth |

## Patterns

### Conditional Provider Activation

```typescript
// packages/auth/src/index.ts
socialProviders: {
  google: env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
    ? {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      }
    : undefined,
},
```

**Rationale**: Only enable Google provider when credentials are available, preventing server crashes.

### Optional Environment Validation

```typescript
// packages/env/src/server.ts
GOOGLE_CLIENT_ID: z.string().min(1).optional(),
GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
```

**Rationale**: Allows feature toggling without crashes when credentials are missing.

## Bug Fix: Callback URL Redirection

### Problem

```typescript
// ❌ BUG: Relative callbackURL
authClient.signIn.social({
  provider: "google",
  callbackURL: "/dashboard",  // → Redirects to API domain!
});
```

When using a relative path, OAuth redirects to `https://api-server.com/dashboard` instead of `https://web-app.com/dashboard`.

### Root Cause

- OAuth flow is processed by the Better-Auth backend (port 3000)
- Relative redirect is resolved based on the API server domain
- Web app runs on a different domain (port 3001)

### Solution

```typescript
// ✅ FIX: Absolute callbackURL with window.location.origin
authClient.signIn.social({
  provider: "google",
  callbackURL: `${window.location.origin}/dashboard`,
});
```

**Why `window.location.origin`?**
- Automatically adapts to the environment (localhost, staging, production)
- No need for additional `NEXT_PUBLIC_WEB_URL` env variable
- Client-side only, safe for SSR

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_CLIENT_ID` | Optional | OAuth Client ID from GCP |
| `GOOGLE_CLIENT_SECRET` | Optional | OAuth Client Secret from GCP |
| `BETTER_AUTH_URL` | Required | Auth server URL (for redirect URI config) |

## GCP Configuration

### Redirect URI Format
```
{BETTER_AUTH_URL}/api/auth/callback/google
```

### OAuth Scopes
- `email`
- `profile`  
- `openid`

## Troubleshooting

### "redirect_uri_mismatch"
- Check redirect URI in GCP Console matches exactly with `{BETTER_AUTH_URL}/api/auth/callback/google`
- Verify no trailing slash differences

### Redirect to wrong domain after login
- Check if `callbackURL` uses an absolute URL
- Must use `window.location.origin` or full URL

## Related

- [Google Auth Setup Guide](google-auth-setup.md)
- [Better-Auth Documentation](https://better-auth.js.org/)
