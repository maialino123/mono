# Screens Layer - DecorAgent

## Purpose
Full page compositions. Landing page, product detail page (future).

## Slices
- `landing/` - Main landing page screen

## Rules
- Screens compose widgets into full pages
- Can import from: shared, entities, features, widgets
- Cannot import from: app

## Page Components
- Screens are pure presentation - data fetching happens in app/page.tsx
- Props receive data from parent, no internal data fetching
