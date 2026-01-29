# Shared Layer

**Role**: Infrastructure, Utilities, Generic UI
**Imports**: external packages only (NO internal layer imports)

## Primary Contents
- **API Clients**: `api/orpc.ts`, `api/auth-client.ts`, `api/query-client.ts`
- **shadcn Components**: `shadcn/` (CLI-managed: Button, Input, Card — NO barrel, import directly)
- **Custom UI**: `ui/` (custom components: Loader)
- **Libraries**: `lib/` (utils: `cn`, `formatDate`)
- **Providers**: `providers/` (Theme, QueryClientProvider)

## Import Pattern
```ts
// Segments with barrels (api, lib, providers)
import { orpc, queryClient } from "@/shared/api";
import { cn } from "@/shared/lib";
import { Providers } from "@/shared/providers";

// Segments without barrels (shadcn, ui) — import directly
import { Button } from "@/shared/shadcn/button";
import Loader from "@/shared/ui/loader";
```

## Rules
- **No Barrel**: No `index.ts` at layer level.
- **Barrels**: `api/`, `lib/`, `providers/` have `index.ts`. `shadcn/` and `ui/` do NOT — import directly.
- **No Business Logic**: Never put domain data (User, Post) here.
- **No Slices**: Structure is flat/segmented, not sliced by domain.
- **Foundation**: This is the only layer that can be imported by everyone.
- **shadcn folder**: CLI-managed, safe to overwrite via `shadcn add`. Custom UI goes in `ui/`.
