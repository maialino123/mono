# Stage 2: Implement

## Workflow

1. **Read**: `proposal.md`, `design.md` (if existing), and `tasks.md`. Refer `discovery.md` if needed.
2. **Execute**: Implement tasks sequentially. Can start before all artifacts done if tasks exist.
3. **Update**: Mark tasks `- [x]` as you go.
4. **Adapt**: If implementation reveals design issues, update artifacts — workflow is fluid.
5. **Verify**: Ensure code matches specs.

## Fluid Workflow

Implementation is NOT phase-locked:
- Can start before all artifacts are complete (if tasks exist)
- Can interleave with artifact updates
- Can pause to explore/brainstorm with user
- Can update design.md or specs if implementation reveals issues

## Task Execution

For each task in `tasks.md`:

1. Read the task description and acceptance criteria
2. Identify affected files from discovery.md or design.md
3. Implement the change
4. Run relevant tests/checks
5. Mark task complete: `- [x]`

## Guardrails

- Keep code changes minimal and scoped to each task
- Pause on errors, blockers, or unclear requirements — don't guess
- If task is ambiguous, ask before implementing
- Always run `bun run check-types` and `bun run check` after changes

## Output On Completion

```
## Implementation Complete

**Change:** <change-name>
**Progress:** 7/7 tasks complete ✓

### Completed This Session
- [x] Task 1
- [x] Task 2
...

All tasks complete! Ready to archive this change.
```

## Output On Pause (Issue Encountered)

```
## Implementation Paused

**Change:** <change-name>
**Progress:** 4/7 tasks complete

### Issue Encountered
<description of the issue>

**Options:**
1. <option 1>
2. <option 2>
3. Other approach

What would you like to do?
```
