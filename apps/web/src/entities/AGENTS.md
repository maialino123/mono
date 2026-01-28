# Entities Layer

**Role**: Business Domain Data (READ-ONLY)
**Imports**: shared (via index only)

## Primary Contents
- **API**: `api/{entity}.queries.ts` (ORPC Query Factory)
- **UI**: `ui/{entity}-card.tsx` (Presentational components)
- **Model**: `model/types.ts` (Domain types - optionally)

## Rules
- **Read Only**: PUT/POST/DELETE go to `features`. Get/List go here.
- **Query Factory**: Define all query keys and options in `api/*.queries.ts`.
- **Slots Pattern**: Use slots for interactive elements to avoid circular imports.
