# Discovery: Update Mint Page UI

## 1. Feature Summary

Update the `/mint` page UI to match the `/stake` page layout — same heading, pills, and TVL chart — with an empty mint module placeholder on the right side.

## 2. Architecture Snapshot

### Relevant Packages

| Package | Purpose | Key Files |
| --- | --- | --- |
| `apps/web` | Next.js frontend | `src/app/mint/page.tsx` |
| `apps/web` | Stake screen (reference) | `src/screens/stake/ui/stake-screen.tsx` |
| `apps/web` | TVL chart widget | `src/widgets/tvl-chart/` |

### Entry Points

- UI: `apps/web/src/app/mint/page.tsx`

## 3. Existing Patterns

### Similar Implementations

| Feature | Location | Pattern Used |
| --- | --- | --- |
| Stake page | `screens/stake/ui/stake-screen.tsx` | FSD screen with heading + pills + grid (chart + module) |
| TVL chart | `widgets/tvl-chart/` | Reusable widget with chart header + period toggle |

### Reusable Utilities

- `TVLChart` widget — already shared, can be reused directly
- Heading + pills pattern from stake screen — extract to shared component

## 4. Technical Constraints

- Follow FSD architecture (screens → widgets)
- Reuse existing `TVLChart` widget
- Mint module is empty placeholder for now

## 5. Gap Analysis

| Component | Have | Need | Gap Size |
| --- | --- | --- | --- |
| Mint page | Empty div | Full screen layout | New |
| Mint screen | None | Screen component | New |
| Heading + pills | Inline in stake | Shared or duplicated | Small |
| TVL chart | Exists | Reuse | None |
| Mint module | None | Empty placeholder | New |
