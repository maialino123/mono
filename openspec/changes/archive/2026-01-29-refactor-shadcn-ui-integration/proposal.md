# Change: Refactor shadcn UI folder structure + integrate shadcn/studio

## Why

1. `shared/ui/` mixes shadcn-generated components with custom UI — unclear which files are CLI-managed
2. `components.json` aliases are misaligned with actual paths
3. `shared/index.ts` barrel re-exports everything — a whole layer shouldn't have a single barrel, it forces updating the barrel every time a new component is added
4. shadcn/studio registry is not configured

## What Changes

1. **Move shadcn components** from `shared/ui/` → `shared/shadcn/`
   - `button.tsx`, `card.tsx`, `checkbox.tsx`, `dropdown-menu.tsx`, `input.tsx`, `label.tsx`, `skeleton.tsx`, `sonner.tsx`
2. **Keep custom UI** in `shared/ui/`
   - `loader.tsx` stays in `shared/ui/`
3. **No barrel for `shared/shadcn/`** — consumers import directly: `@/shared/shadcn/button`
4. **Remove `shared/index.ts`** — shared is a layer, not a module. Each segment has its own imports:
   - `@/shared/shadcn/button` (shadcn components — no barrel)
   - `@/shared/ui/loader` (custom UI — no barrel)
   - `@/shared/api` (API clients — barrel)
   - `@/shared/lib` (utilities — barrel)
   - `@/shared/providers` (providers — barrel)
5. **Update `components.json`** aliases to point to new paths + add shadcn/studio registry
6. **Update all consumer imports** (12 files) to use direct segment paths

## Impact

- Affected specs: `web-fsd-architecture`
- Affected code:
  - `apps/web/components.json` — alias + registry update
  - `apps/web/src/shared/ui/*.tsx` → `shared/shadcn/` (move 8 files)
  - `apps/web/src/shared/index.ts` — **delete**
  - 12 consumer files — update imports from `@/shared` to `@/shared/shadcn/*`, `@/shared/api/*`, etc.
- **No breaking changes** — import paths change but functionality is identical
