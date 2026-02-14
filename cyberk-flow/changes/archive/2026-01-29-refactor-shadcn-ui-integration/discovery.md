# Discovery: Refactor shadcn UI Integration + shadcn/studio

## 1. Feature Summary

Restructure shadcn/ui components into a dedicated `shared/ui/shadcn/` subfolder to separate generated (CLI-managed) components from custom UI, and integrate shadcn/studio registry for enhanced components/blocks/themes.

## 2. Architecture Snapshot

### Relevant Packages
| Package | Purpose | Key Files |
| --- | --- | --- |
| `apps/web` | Next.js frontend | `components.json`, `src/shared/ui/*`, `src/shared/index.ts` |

### Entry Points
- CLI config: `apps/web/components.json`
- UI barrel: `apps/web/src/shared/index.ts`
- Components: `apps/web/src/shared/ui/*.tsx`

## 3. Existing Patterns

### Current UI Components
| File | Type | Notes |
| --- | --- | --- |
| `button.tsx` | shadcn (base-lyra style) | Uses `@base-ui/react`, `cva` |
| `card.tsx` | shadcn | Standard card variants |
| `checkbox.tsx` | shadcn | Uses `@base-ui/react` |
| `dropdown-menu.tsx` | shadcn | Uses `@base-ui/react` |
| `input.tsx` | shadcn | Standard input |
| `label.tsx` | shadcn | Uses `@base-ui/react` |
| `skeleton.tsx` | shadcn | Standard skeleton |
| `sonner.tsx` | shadcn | Toast wrapper |
| `loader.tsx` | **Custom** | Simple Loader2 spinner |

### Import Pattern
All consumers import via `@/shared` barrel:
```ts
import { Button, Card, Input } from "@/shared";
```

### Current components.json
- Style: `base-lyra`
- Aliases point to `@/components/ui` (misaligned with actual path `@/shared/ui`)
- No registries configured

## 4. Technical Constraints
- shadcn CLI v3 uses `components.json` aliases to determine output path
- Current aliases (`@/components/ui`) don't match actual location (`@/shared/ui`)
- All imports go through barrel `@/shared` — re-export changes needed
- `loader.tsx` is custom, NOT a shadcn component

## 5. External References
- [shadcn/studio CLI docs](https://shadcnstudio.com/docs/getting-started/how-to-use-shadcn-cli)
- [shadcn/ui CLI v3 docs](https://ui.shadcn.com/docs/cli)
- [shadcn/studio registries](https://shadcnstudio.com/docs/getting-started/introduction)

## 6. Gap Analysis
| Component | Have | Need | Gap Size |
| --- | --- | --- | --- |
| CLI alias config | Points to `@/components/ui` | Point to `@/shared/ui/shadcn` | Small |
| Folder structure | Flat `ui/` | `ui/shadcn/` + `ui/` custom | Small |
| shadcn/studio registry | None | `@shadcn-studio` in registries | Small |
| Re-exports | Flat barrel | Updated barrel with subfolder | Small |
| Import paths | `@/shared` barrel | No change (barrel absorbs) | None |

## 7. Open Questions
- [ ] Do we need premium shadcn/studio content or free-only?
- [ ] Should we add more registries (`@ss-components`, `@ss-blocks`, `@ss-themes`) now or later?
