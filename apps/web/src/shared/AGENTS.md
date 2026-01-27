# Shared Layer - FSD Architecture Guide

> **Layer Purpose**: Foundation layer — infrastructure, UI kit, utilities, and configurations.
> **Position**: Bottom layer in FSD hierarchy (imported by all other layers).

## When AI Should Work in This Layer

- Setting up ORPC client configuration
- Building reusable UI components (Button, Input, Card)
- Writing utility functions (cn, formatDate, debounce)
- Managing providers (Theme, Query)

## Core Principles

1. **No Business Logic** — Only infrastructure and generic utilities
2. **No Slices** — Segments directly, no business domains
3. **Foundation** — All other layers depend on Shared

## Import Rules

```
shared/ → (nothing external, only internal + npm packages)
```

**Imported by:** `app/`, `screens/`, `widgets/`, `features/`, `entities/`

## Structure Pattern

```
shared/
├── api/          # ORPC client, Query client, auth-client
├── ui/           # Button, Input, Card, Dialog (shadcn)
├── lib/          # cn(), formatDate(), hooks
├── providers/    # Theme, Query providers
└── index.ts      # Public API
```

## Examples

### ORPC Infrastructure

```tsx
// api/orpc.ts
import { createORPCClient } from "@orpc/client";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

export const client = createORPCClient(link);
export const orpc = createTanstackQueryUtils(client);
```

### Auth Client

```tsx
// api/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_SERVER_URL,
});
```

## Decision Guide

| Scenario               | Location         | Reason              |
| ---------------------- | ---------------- | ------------------- |
| ORPC instance          | `shared/api/`    | Infrastructure      |
| Auth client            | `shared/api/`    | Infrastructure      |
| Button, Input, Card    | `shared/ui/`     | Generic UI          |
| `cn()`, hooks          | `shared/lib/`    | Utilities           |
| User, Todo entities    | `entities/`      | Business → NOT here |

## Anti-Patterns

❌ Put business entities here → use `entities/`
❌ Create dump folders → use focused segments
❌ Import from higher layers
