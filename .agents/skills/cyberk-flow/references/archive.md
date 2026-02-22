# Stage 3: Archive

**After deployment/merge:**

## Steps

1. **Post-merge Sanity Check** (lightweight — not a full code review):
   - Confirm the change references the final merged commit/PR.
   - Confirm no unaccounted files changed vs what specs/tasks expected (guard against drive-by edits).
   - Confirm deploy succeeded, smoke tests passed, migrations ran (if applicable).
   - **Escalation triggers** — only run full Oracle + Code Review again if:
     - There was a hotfix after merge
     - A rollback or incident occurred
     - The merged diff materially differs from what was verified in Implement
     - Production behavior deviates from spec

   > **Note**: Full code review (Oracle + code_review) is done in **Implement → "Review — Oracle" and "Review — Code Review"**. Archive does NOT repeat it unless escalation triggers fire.

2. **Extract Knowledge + Retrospective**:
   - Knowledge extraction is triggered by AGENTS.md auto-trigger rules (see `## Knowledge Extraction`)
   - **Estimate vs Actual**: Appetite was `__`, took `__`
   - **What worked**: [process feedback]
   - **What to improve**: [for next change]
   - Record in `workflow.md` Notes section

3. **Apply Delta Specs**: `bun run cf apply <change-id>`
   - Auto-ticks the "Apply deltas" checkbox in `workflow.md` — do NOT manually edit this line

4. **Archive**: `bun run cf archive <change-id>`
   - Auto-ticks the "Archive change" checkbox in `workflow.md` — do NOT manually edit this line
   - Moves change to `archive/YYYY-MM-DD-HHmm-<change-id>/` (UTC timestamp)

## When to Archive

- After PR is merged
- After deployment is verified
- When the change is considered "done"
