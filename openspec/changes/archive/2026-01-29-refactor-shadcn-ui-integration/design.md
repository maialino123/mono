# Design: Refactor shadcn UI + shadcn/studio

## Context

The `shared/` layer has a monolithic `index.ts` barrel that re-exports everything. This is anti-pattern for a whole FSD layer — it forces maintaining the barrel on every addition. Additionally, shadcn components mixed with custom UI makes CLI management confusing.

## Goals / Non-Goals

- **Goals**: Separate shadcn-managed from custom UI; direct imports per segment; correct CLI config; shadcn/studio registry
- **Non-Goals**: Migrating component library; changing FSD architecture; premium shadcn/studio content

## Risk Map

| Component | Risk | Rationale | Verification |
| --- | --- | --- | --- |
| File moves | LOW | Simple rename | `bun run check-types` |
| Remove barrel | LOW | Find-and-replace imports | `bun run check-types` |
| `components.json` | LOW | Standard shadcn config | `bunx shadcn@latest add` test |
| shadcn/studio registry | LOW | Additive config | `bunx shadcn@latest add shadcn-studio/button` |

## Decisions

### Folder structure

```
shared/
├── api/               ← API clients (orpc, auth-client)
├── lib/               ← Utilities (cn, formatDate)
├── providers/         ← Theme, QueryClient
├── shadcn/            ← CLI-managed shadcn components (NO index.ts)
│   ├── button.tsx
│   ├── card.tsx
│   ├── checkbox.tsx
│   ├── dropdown-menu.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── skeleton.tsx
│   └── sonner.tsx
├── ui/                ← Custom UI components
│   └── loader.tsx
└── (NO index.ts)      ← Layer-level barrel removed
```

### Import pattern (after)

```ts
// shadcn — direct import, no barrel
import { Button } from "@/shared/shadcn/button";
import { Card, CardHeader } from "@/shared/shadcn/card";

// custom UI
import Loader from "@/shared/ui/loader";

// api, lib, providers — via barrel index.ts
import { orpc, queryClient } from "@/shared/api";
import { cn } from "@/shared/lib";
import { Providers } from "@/shared/providers";
```

**Why no barrel for shadcn?**
- shadcn components will grow to dozens — barrel becomes maintenance burden
- Each component is self-contained, direct imports are natural
- IDE auto-import handles this well

### components.json update

```json
{
  "aliases": {
    "components": "@/shared/shadcn",
    "utils": "@/shared/lib/utils",
    "ui": "@/shared/shadcn",
    "lib": "@/shared/lib",
    "hooks": "@/shared/hooks"
  },
  "registries": {
    "shadcn-studio": {
      "url": "https://shadcnstudio.com/r"
    }
  }
}
```

### Alternatives considered

1. **`shared/ui/shadcn/`** — Rejected: extra nesting, `shared/shadcn/` is cleaner
2. **Keep barrel** — Rejected: layer-level barrel is anti-pattern for FSD shared layer
3. **Separate package `@repo/ui`** — Rejected: over-engineering for current scale

## Migration Impact

12 files need import updates. All are mechanical find-and-replace — no logic changes.
