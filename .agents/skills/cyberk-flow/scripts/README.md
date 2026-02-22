# Cyberk Flow Scripts

CLI scripts for managing Cyberk Flow spec-driven development workflow.

## Scripts

| Script | Description |
| --- | --- |
| `new-change.ts` | Scaffold a new change proposal from templates |
| `validate-change.ts` | Validate delta specs (ADDED/MODIFIED/REMOVED/RENAMED requirements) |
| `apply-deltas.ts` | Apply delta specs to existing or new spec files |
| `list.ts` | List active changes with task progress and specs with requirement counts |
| `archive-change.ts` | Archive a completed change with date prefix |

## Lib

| Module | Description |
| --- | --- |
| `lib/parse-delta.ts` | Shared parser for delta spec markdown (extracts ADDED/MODIFIED/REMOVED/RENAMED sections) |

## Tests

All tests live in `__tests__/` and use `bun:test`.

```sh
bun test .agents/skills/cyberk-flow/scripts/__tests__/
```
