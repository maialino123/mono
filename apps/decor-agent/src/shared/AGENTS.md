# Shared Layer - DecorAgent

## Purpose
Foundation layer with reusable UI components, utilities, and types.

## Structure
- `ui/` - LiquidGlass wrappers (glass-card, glass-button)
- `shadcn/` - shadcn/ui components (button, card, input)
- `lib/` - Utilities (cn, sanitize, utils)
- `api/` - API clients (cloudflare-kv)
- `types/` - TypeScript definitions (product, profile)
- `providers/` - React context providers

## Rules
- This is the foundation layer - cannot import from other FSD layers
- All exports via index.ts barrels
- UI components must have WebGL fallback for TikTok in-app browser
