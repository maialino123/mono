# Design: FSD Architecture for apps/web

## Context

Migrating from flat component structure to Feature Sliced Design. Reference implementation exists in `cyberk-next-boilerplate`. Main difference: this project uses ORPC instead of Axios/React Query for API calls.

## Goals / Non-Goals

**Goals:**
- Establish FSD layer structure with clear boundaries
- Create AGENTS.md guidance for each layer
- Adapt skill for ORPC-based architecture
- Enable incremental migration (can be done in phases)

**Non-Goals:**
- Add new features during refactoring
- Change API client (keep ORPC)
- Add i18n support (not needed now)

## Risk Map

| Component | Risk | Rationale | Verification |
|-----------|------|-----------|--------------|
| Import path changes | MEDIUM | Many files affected | Manual testing |
| AGENTS.md adaptation | LOW | Template exists | Review content |
| Skill adaptation | LOW | Base exists | Test with AI |
| Feature extraction | LOW | Clear patterns | Code review |

## Decisions

### 1. Layer Structure
**Decision**: Use standard FSD layers with `screens/` instead of `pages/`
**Rationale**: Avoid Next.js `pages/` directory conflict, consistent with boilerplate

### 2. API Layer Pattern
**Decision**: Keep ORPC, adapt Query Factory pattern for ORPC
**Rationale**: ORPC already provides type-safe queries, no need for React Query wrapper
**Example**:
```tsx
// entities/todo/api/todo.queries.ts
import { orpc } from "@/shared/api/orpc";

export const todoQueries = {
  all: () => ["todos"],
  list: () => orpc.todos.list.queryOptions(),
  detail: (id: string) => orpc.todos.get.queryOptions({ id }),
};
```

### 3. Auth Pattern
**Decision**: Keep better-auth, move to `shared/api/auth-client.ts`
**Rationale**: Already working, just relocate

### 4. AGENTS.md Adaptation
**Decision**: Copy from boilerplate, update for ORPC patterns
**Changes needed**:
- Replace Axios examples with ORPC
- Replace `ApiTypes` with ORPC types
- Update import examples

### 5. Skill Adaptation
**Decision**: Copy `cyberk-fsd-fe` skill, update references for ORPC
**Changes needed**:
- Update API client examples
- Remove Axios-specific patterns
- Add ORPC-specific guidance

## Migration Plan

### Phase 1: Foundation (shared/)
1. Create `shared/` directory structure
2. Move UI kit, utils, providers
3. Create AGENTS.md for shared

### Phase 2: Domain Layers (entities/, features/)
1. Create `entities/` with user, todo
2. Extract features from sign-in/sign-up forms
3. Create AGENTS.md for each layer

### Phase 3: Composition Layers (widgets/, screens/)
1. Extract header/layout to widgets
2. Create screen compositions
3. Create AGENTS.md for each layer

### Phase 4: Tooling
1. Copy and adapt skill
2. Update all import paths
3. Clean up old structure

### Rollback
- Git revert if critical issues
- Can revert individual phases

## Open Questions

- None currently
