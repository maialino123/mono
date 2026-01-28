# Shared Layer

**Role**: Infrastructure, Utilities, Generic UI
**Imports**: external packages only (NO internal layer imports)

## Primary Contents
- **API Clients**: `api/orpc.ts`, `api/auth-client.ts`, `api/query-client.ts`
- **UI Kit**: `ui/` (shadcn components: Button, Input, Card)
- **Libraries**: `lib/` (utils: `cn`, `formatDate`)
- **Providers**: `providers/` (Theme, QueryClientProvider)

## Rules
- **No Business Logic**: Never put domain data (User, Post) here.
- **No Slices**: Structure is flat/segmented, not sliced by domain.
- **Foundation**: This is the only layer that can be imported by everyone.
