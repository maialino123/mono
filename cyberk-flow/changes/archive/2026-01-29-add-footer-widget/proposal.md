# Change: Add Footer Widget

## Why

The web app currently has no footer. A minimal footer is needed displaying centered copyright text with a dynamic year and top border, matching the provided design.

## What Changes

- Add `footer.tsx` server component in `widgets/layout/ui/` — centered "© {year} All rights reserved" with top border
- Export `Footer` from `widgets/layout/index.ts`

## Impact

- Affected specs: `web-fsd-architecture`
- Affected code: `apps/web/src/widgets/layout/`
