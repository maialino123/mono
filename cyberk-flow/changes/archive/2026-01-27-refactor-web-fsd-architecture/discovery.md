# Discovery: Feature Sliced Design Architecture for apps/web

## 1. Feature Summary

Refactor `apps/web` from flat component structure to Feature Sliced Design (FSD) methodology, establishing clear layer boundaries (shared, entities, features, widgets, screens, app) with proper import rules and AGENTS.md guidance for each layer.

## 2. Architecture Snapshot

### Current Structure (apps/web/src)

| Folder | Purpose | Issues |
|--------|---------|--------|
| `app/` | Next.js routing | Mixed with business logic |
| `components/` | All UI components | No domain separation |
| `components/ui/` | shadcn/ui kit | Should be in shared |
| `lib/` | Utilities + Auth | Mixed concerns |
| `utils/` | ORPC client | Should be in shared/api |

### Entry Points

- UI: `app/layout.tsx`, `app/page.tsx`
- Auth: `lib/auth-client.ts`
- API: `utils/orpc.ts`

### Current Files (~26 files)

```
src/
├── app/
│   ├── ai/page.tsx
│   ├── dashboard/page.tsx, dashboard.tsx
│   ├── login/page.tsx
│   ├── todos/page.tsx
│   ├── layout.tsx, page.tsx
├── components/
│   ├── ui/ (button, card, input, label, checkbox, dropdown-menu, skeleton, sonner)
│   ├── header.tsx, loader.tsx, mode-toggle.tsx
│   ├── providers.tsx, theme-provider.tsx
│   ├── sign-in-form.tsx, sign-up-form.tsx
│   └── user-menu.tsx
├── lib/
│   ├── auth-client.ts
│   └── utils.ts
└── utils/
    └── orpc.ts
```

## 3. Existing Patterns

### Reference Implementation (cyberk-next-boilerplate)

| Layer | Structure | Pattern Used |
|-------|-----------|--------------|
| `shared/` | api/, ui/, lib/, config/, providers/, i18n/ | Infrastructure + UI kit |
| `entities/` | {entity}/api/, model/, ui/, index.ts | Query Factory + Zustand |
| `features/` | {action}-{entity}/api/, ui/, index.ts | Mutations only |
| `widgets/` | {widget}/ui/, index.ts | Reusable large blocks |
| `screens/` | {screen}/ui/, api/ | Page-specific composition |

### Reusable from Boilerplate

- **AGENTS.md files**: Layer-specific AI guidance (shared, entities, features, widgets)
- **Skill**: `cyberk-fsd-fe` with references
- **Patterns**: Query Factory, Mutation Hooks, Slots pattern

## 4. Technical Constraints

- **Framework**: Next.js 15 with App Router
- **UI Kit**: shadcn/ui (already installed)
- **Auth**: better-auth via `@repo/auth`
- **API Client**: ORPC (not Axios) - different from boilerplate
- **State**: No Zustand yet (may add if needed)
- **Monorepo**: Uses `@repo/*` packages

### Key Differences from Boilerplate

| Aspect | Boilerplate | apps/web |
|--------|-------------|----------|
| API Client | Axios + React Query | ORPC |
| Auth | Custom JWT | better-auth |
| i18n | Yes | No (not needed now) |
| Swagger Types | ApiTypes | ORPC types |

## 5. External References

- FSD Documentation: https://feature-sliced.design/docs
- Boilerplate: `/Users/huybuidac/Projects/cyberk/cyberk-next-boilerplate`

## 6. Gap Analysis (Synthesized)

| Component | Have | Need | Gap Size |
|-----------|------|------|----------|
| shared/ui | components/ui/* | shared/ui/* | Move |
| shared/lib | lib/utils.ts | shared/lib/utils.ts | Move |
| shared/api | utils/orpc.ts, lib/auth-client.ts | shared/api/* | Move + Reorganize |
| shared/providers | components/providers.tsx, theme-provider.tsx | shared/providers/* | Move |
| entities/ | None | entities/user/, entities/todo/ | New |
| features/ | components/sign-in-form.tsx | features/auth/* | Extract + Refactor |
| widgets/ | components/header.tsx, user-menu.tsx | widgets/layout/* | Move + Refactor |
| screens/ | None | screens/{page}/* | New |
| AGENTS.md | None | Per-layer guidance | New (copy + adapt) |
| Skill | None | cyberk-fsd-fe | Copy + Adapt |

## 7. Risk Assessment

| Component | Risk | Rationale |
|-----------|------|-----------|
| Import path changes | MEDIUM | All imports need updating |
| ORPC vs Axios | LOW | Pattern similar, just different client |
| Auth integration | LOW | Already works, just relocate |
| AGENTS.md adaptation | LOW | Copy from boilerplate, adjust for ORPC |

## 8. Open Questions

- [x] Keep i18n? → No, not needed now
- [x] Swagger types? → No, use ORPC types instead
- [ ] Add Zustand? → Defer until needed
