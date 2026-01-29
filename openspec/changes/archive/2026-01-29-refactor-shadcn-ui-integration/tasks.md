# Tasks: Refactor shadcn UI + shadcn/studio Integration

## 1. Restructure folders

- [ ] 1.1 Create `apps/web/src/shared/shadcn/` directory
- [ ] 1.2 Move 8 shadcn components from `shared/ui/` → `shared/shadcn/`: button, card, checkbox, dropdown-menu, input, label, skeleton, sonner
- [ ] 1.3 Keep `loader.tsx` in `shared/ui/`

## 2. Update configuration

- [ ] 2.1 Update `components.json` aliases to point to `@/shared/shadcn`, `@/shared/lib`, etc.
- [ ] 2.2 Add `@shadcn-studio` registry to `components.json`

## 3. Remove shared barrel + update imports

- [ ] 3.1 Delete `shared/index.ts`
- [ ] 3.2 Update 12 consumer files to use direct segment imports:
  - `@/shared` → `@/shared/shadcn/*` (UI components)
  - `@/shared` → `@/shared/api/orpc` (API)
  - `@/shared` → `@/shared/providers/providers` (Providers)
  - `@/shared` → `@/shared/ui/loader` (custom UI)

## 4. Validate

- [ ] 4.1 `bun run check-types` — no type errors
- [ ] 4.2 `bun run check` — lint/format pass
- [ ] 4.3 Test `bunx shadcn@latest add` installs to `shared/shadcn/`

## 5. Documentation

- [ ] 5.1 Update `shared/AGENTS.md` — add `shadcn/` segment, update `ui/` description
- [ ] 5.2 Update `web/AGENTS.md` — remove "Index Exports" rule for shared, update import examples
- [ ] 5.3 Update `cyberk-fsd-fe/SKILL.md` line 16 — `shared/ui` → `shared/shadcn`
- [ ] 5.4 Update `cyberk-fsd-fe/references/fsd-layers.md` — shared description includes `shadcn/` segment
- [ ] 5.5 Update `cyberk-fsd-fe/references/fsd-segments.md` — import examples use direct paths (`@/shared/api/orpc`) instead of barrel (`@/shared`)
- [ ] 5.6 Update `cyberk-fsd-fe/references/fsd-import-rules.md` — remove "only via index.ts" for shared, clarify direct segment imports
