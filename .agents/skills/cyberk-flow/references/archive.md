# Stage 3: Archive

**After deployment/merge:**

## Steps

1. **Review Code** (run first):
   - Run `oracle` (and `code_review` skill if available) on the change's diff
   - Consolidate findings and propose fixes to the user
   - **Gate: user approved code review findings** — present findings using Gate Output Format and wait for approval

2. **Extract Knowledge**:
   - Use `find_thread` to search for threads related to this change
   - Look for: new patterns, bug fixes, gotchas, architectural decisions, lessons learned
   - If valuable knowledge is found, invoke the `knowledge` skill to persist it (if available); otherwise document in `workflow.md` Notes

3. **Retrospective** (lightweight):
   - **Estimate vs Actual**: Appetite was `__`, took `__`
   - **What worked**: [process feedback]
   - **What to improve**: [for next change]
   - Record in `workflow.md` Notes section

4. **Apply Delta Specs**: `bun run cf apply <change-id>`

5. **Archive**: `bun run cf archive <change-id>`
   - Moves change to `archive/YYYY-MM-DD-HHmm-<change-id>/` (UTC timestamp)

## When to Archive

- After PR is merged
- After deployment is verified
- When the change is considered "done"
