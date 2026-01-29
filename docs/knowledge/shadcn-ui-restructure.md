# shadcn UI Restructure & shadcn/studio Integration

> **Source Thread**:
> - [T-019c077e-a53b-732c-94d4-c4284ae85bb1](https://ampcode.com/threads/T-019c077e-a53b-732c-94d4-c4284ae85bb1) - Planning & implementation
>
> **Date**: January 2026

## Overview

Restructured the `shared/` layer in the Next.js FSD frontend to separate shadcn CLI-managed components from custom UI, removed the monolithic layer-level barrel, and integrated shadcn/studio registries.

## Changes Made

### 1. Folder Restructure

**Before:**
```
shared/
├── api/
├── lib/
├── providers/
├── ui/          ← mixed shadcn + custom
│   ├── button.tsx (shadcn)
│   ├── card.tsx (shadcn)
│   ├── loader.tsx (custom)
│   └── ...
└── index.ts     ← monolithic barrel
```

**After:**
```
shared/
├── api/              ← has index.ts barrel
│   ├── index.ts
│   ├── auth-client.ts
│   └── orpc.ts
├── lib/              ← has index.ts barrel
│   ├── index.ts
│   └── utils.ts
├── providers/        ← has index.ts barrel
│   ├── index.ts
│   ├── providers.tsx
│   └── theme-provider.tsx
├── shadcn/           ← NO barrel, CLI-managed
│   ├── button.tsx
│   ├── card.tsx
│   ├── checkbox.tsx
│   ├── dropdown-menu.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── skeleton.tsx
│   └── sonner.tsx
├── ui/               ← NO barrel, custom components
│   └── loader.tsx
└── (NO index.ts)     ← layer-level barrel removed
```

### 2. Import Pattern

```ts
// Segments WITH barrels (api, lib, providers)
import { orpc, queryClient } from "@/shared/api";
import { authClient } from "@/shared/api";
import { cn } from "@/shared/lib";
import { Providers } from "@/shared/providers";

// Segments WITHOUT barrels (shadcn, ui) — direct imports
import { Button } from "@/shared/shadcn/button";
import { Card, CardHeader } from "@/shared/shadcn/card";
import Loader from "@/shared/ui/loader";
```

### 3. shadcn/studio Integration

Updated `apps/web/components.json` with:
- Fixed aliases to point to actual FSD paths (`@/shared/shadcn`, `@/shared/lib`)
- Added all 4 shadcn/studio registries (CLI v3 format):

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
    "@shadcn-studio": "https://shadcnstudio.com/r/{name}.json",
    "@ss-components": "https://shadcnstudio.com/r/components/{name}.json",
    "@ss-blocks": "https://shadcnstudio.com/r/blocks/{name}.json",
    "@ss-themes": "https://shadcnstudio.com/r/themes/{name}.json"
  }
}
```

Usage:
```bash
bunx shadcn@latest add @shadcn-studio/button-01
bunx shadcn@latest add @ss-blocks/hero-section-01
```

## Decisions

| Decision | Rationale |
| --- | --- |
| `shared/shadcn/` (not `shared/ui/shadcn/`) | Cleaner path, less nesting |
| No barrel for `shadcn/` | Will grow to dozens of components; barrel becomes maintenance burden |
| Barrels for `api/`, `lib/`, `providers/` | Small, stable segments; barrel provides clean API |
| Remove layer-level `index.ts` | `shared` is an entire layer, not a module; forced updating barrel on every addition |
| All 4 registries (free-only) | Ready for premium later; just add `.env` with `EMAIL` and `LICENSE_KEY` |

## Files Changed

- **Moved**: 8 shadcn components from `shared/ui/` → `shared/shadcn/`
- **Created**: 3 barrel files (`shared/api/index.ts`, `shared/lib/index.ts`, `shared/providers/index.ts`)
- **Deleted**: `shared/index.ts`
- **Updated**: `components.json`, 12 consumer files, 7 documentation/skill files
- **Fixed**: `providers.tsx` import path (`../ui/sonner` → `../shadcn/sonner`)

## Documentation Updated

- `apps/web/src/shared/AGENTS.md`
- `apps/web/AGENTS.md`
- `.agents/skills/cyberk-fsd-fe/SKILL.md`
- `.agents/skills/cyberk-fsd-fe/references/fsd-layers.md`
- `.agents/skills/cyberk-fsd-fe/references/fsd-segments.md`
- `.agents/skills/cyberk-fsd-fe/references/fsd-import-rules.md`
- `apps/web/src/entities/AGENTS.md`
