# Change: Todo API Improvements

## Why

The current todo router lacks essential CRUD operations (`findById`) and scalability features (pagination). Cache key patterns are verbose and inconsistent with industry standards.

## What Changes

- Add `findById` endpoint following industry naming conventions (Prisma/Spring style)
- Add pagination support to list operation using offset-based pagination
- Add filtering support for `completed` (exact match) and `text` (contains search)
- Add sorting support with `sortBy` and `sortOrder` parameters
- Refactor cache keys to use simplified, function-based patterns

## Impact

- Affected specs: `todo-api` (new capability)
- Affected code:
  - `packages/api/src/routers/todo.ts` - Main changes
