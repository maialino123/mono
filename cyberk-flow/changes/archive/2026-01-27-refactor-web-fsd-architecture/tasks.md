# Tasks: FSD Architecture Refactoring

## 1. Foundation - shared/ Layer

- [x] 1.1 Create directory structure `shared/{api,ui,lib,providers}/`
- [x] 1.2 Move `components/ui/*` → `shared/ui/`
- [x] 1.3 Move `lib/utils.ts` → `shared/lib/utils.ts`
- [x] 1.4 Move `utils/orpc.ts` → `shared/api/orpc.ts`
- [x] 1.5 Move `lib/auth-client.ts` → `shared/api/auth-client.ts`
- [x] 1.6 Move `components/providers.tsx` → `shared/providers/providers.tsx`
- [x] 1.7 Move `components/theme-provider.tsx` → `shared/providers/theme-provider.tsx`
- [x] 1.8 Create `shared/index.ts` (public API)
- [x] 1.9 Create `shared/AGENTS.md` (adapt from boilerplate)

## 2. Domain Layer - entities/

- [x] 2.1 Create `entities/todo/` structure
  - [x] 2.1.1 Create `api/todo.queries.ts` (ORPC-based)
  - [x] 2.1.2 Create `ui/todo-item.tsx`, `ui/todo-list.tsx`
  - [x] 2.1.3 Create `index.ts`
- [x] 2.2 Create `entities/AGENTS.md` (adapt from boilerplate)

## 3. Action Layer - features/

- [x] 3.1 Create `features/auth/` structure
  - [x] 3.1.1 Extract sign-in logic → `features/auth/sign-in/`
  - [x] 3.1.2 Extract sign-up logic → `features/auth/sign-up/`
  - [x] 3.1.3 Create `index.ts`
- [x] 3.2 Create `features/todo/` structure
  - [x] 3.2.1 Create `create-todo/` (hook + form UI)
  - [x] 3.2.2 Create `toggle-todo/` (hook)
  - [x] 3.2.3 Create `delete-todo/` (hook)
  - [x] 3.2.4 Create `index.ts`
- [x] 3.3 Create `features/AGENTS.md` (adapt from boilerplate)

## 4. Composition Layer - widgets/

- [x] 4.1 Create `widgets/layout/` structure
  - [x] 4.1.1 Move `components/header.tsx` → `widgets/layout/ui/header.tsx`
  - [x] 4.1.2 Move `components/user-menu.tsx` → `widgets/layout/ui/user-menu.tsx`
  - [x] 4.1.3 Move `components/mode-toggle.tsx` → `widgets/layout/ui/mode-toggle.tsx`
  - [x] 4.1.4 Create `index.ts`
- [x] 4.2 Create `widgets/AGENTS.md` (adapt from boilerplate)

## 5. Page Layer - screens/

- [x] 5.1 Create `screens/login/` (page composition)
- [x] 5.2 Create `screens/dashboard/` (page composition)
- [x] 5.3 Create `screens/todos/` (page composition)
- [x] 5.4 Create `screens/ai/` (page composition)
- [x] 5.5 Create `screens/home/` (page composition)
- [x] 5.6 Create `screens/AGENTS.md`

## 6. App Layer Cleanup

- [x] 6.1 Simplify `app/layout.tsx` (import from shared/providers)
- [x] 6.2 Simplify route pages (import from screens/)
- [x] 6.3 Remove business logic from app/ layer

## 7. Tooling & Documentation

- [x] 7.1 Copy skill `cyberk-fsd-fe` → `.agents/skills/cyberk-fsd-fe/`
- [x] 7.2 Adapt `SKILL.md` for ORPC patterns
- [x] 7.3 Copy relevant references from boilerplate
- [x] 7.4 Update skill references for this project's stack

## 8. Import Path Migration

- [x] 8.1 Update all `@/components/ui/*` → `@/shared/ui/*`
- [x] 8.2 Update all `@/lib/*` → `@/shared/lib/*` or `@/shared/api/*`
- [x] 8.3 Update all `@/utils/*` → `@/shared/api/*`
- [x] 8.4 Update all `@/components/*` → appropriate layer imports

## 9. Cleanup

- [x] 9.1 Remove old `components/` directory
- [x] 9.2 Remove old `lib/` directory
- [x] 9.3 Remove old `utils/` directory
- [x] 9.4 Verify no orphaned imports

## 10. Verification

- [x] 10.1 Run `bun run check-types` - no errors
- [ ] 10.2 Run `bun run dev:web` - app works
- [ ] 10.3 Test login flow
- [ ] 10.4 Test todos page
- [ ] 10.5 Test dashboard
