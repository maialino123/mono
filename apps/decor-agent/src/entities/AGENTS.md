# Entities Layer - DecorAgent

## Purpose
Business entities with data access. Product and Profile queries.

## Slices
- `product/` - Product data access and types
- `profile/` - Profile data access

## Rules
- Entities handle READ operations (queries)
- Queries run at BUILD TIME only (Cloudflare Workers don't have fs)
- Can import from: shared
- Cannot import from: features, widgets, screens, app
