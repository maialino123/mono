# Stage 2: Implement

## Workflow

1. **Read**: `workflow.md`, `proposal.md`, `design.md` (if existing), and `tasks.md`. Refer to `discovery.md` if needed.
2. **Execute**: Run tasks using the parallel execution protocol (see below). Artifacts may still be refined during implementation.
3. **Update**: After each task, mark `- [x]` in `tasks.md` and add an entry to `workflow.md` Revision Log. Only tick the overall "All tasks complete" checkbox in `workflow.md` once all tasks are done.
4. **Adapt**: If implementation reveals design issues, update artifacts — workflow is fluid.
5. **Merge**: After all parallel tracks complete, run the integration merge protocol.
6. **Verify — Final Verify Gate**: Run the **Verify** commands from top of `tasks.md` (may include type-check, lint, unit tests, E2E tests, etc.). All must pass.
7. **Review — Oracle** (mandatory tool invocation): Run the `oracle` tool on **all files changed in this change since the base branch** (including newly added files). Focus: semantic correctness vs spec/design, edge cases, regression risks, security violations, architectural alignment. Categorize output into **must-fix** (blocking) and **nice-to-fix** (non-blocking).
8. **Review — Code Review** (mandatory tool invocation): Load the `code-review` skill and run the `code_review` tool on the **full diff vs base branch** (not just last commit). Categorize output into **must-fix** (blocking) and **nice-to-fix** (non-blocking).
9. **Review Fix Loop** (max 3 rounds; tool-driven; no self-assessment):

   Repeat up to **3 rounds**. A "round" is complete only after executing **9.1 → 9.4** in order.

   9.1 **Fix** all **must-fix** from the **latest** Oracle + Code Review outputs (latest outputs are canonical; includes any newly discovered items). If multiple valid fixes → **STOP** and ask user.

   9.2 **Nice-to-fix**: auto-fix only if trivial (localized rename/formatting; no behavioral change). Otherwise list for user. Avoid opportunistic refactors during fix loop — minimal fixes only.

   9.3 **Re-Verify**: Re-run step 6 (all Verify commands). All must pass before continuing.

   9.4 **Re-Review** (mandatory, cannot be skipped or self-assessed):
       - Re-run step 7 (`oracle` tool) on all changed files.
       - Re-run step 8 (load `code-review` skill + run `code_review` tool) on the full diff.
       - **Record** the updated must-fix/nice-to-fix lists from both tools — this is the **only source of truth** for loop decisions. If a must-fix is disputed or unclear → **STOP** and ask user.

   **Exit (only after 9.4):** If the **latest** Oracle AND Code Review outputs both have **0 must-fix** → exit loop. Otherwise → next round.

   **After 3 rounds**: **STOP and wait for user decision**. Present remaining **must-fix** and **nice-to-fix** separately. Do not run further steps or mark gates complete.
10. **Gate: all tasks done + verification passed** — only mark this after steps 6-9 are all complete.

## Parallel Execution Protocol

Parse the dependency graph and tracks from `tasks.md`. Launch sub-agents per track.

1. **Spikes first**: If section `0. Spikes` exists, complete ALL spike tasks before starting any track.
2. **Launch tracks concurrently**: Each track (A, B, C, …) runs as a separate sub-agent. Within a track, tasks execute sequentially following `Deps` order. A task may only begin when **all** of its `Deps` (including cross-track) are marked complete in `tasks.md`. If blocked on a cross-track dep, the sub-agent reports `BLOCKED on <task-id>` to the main agent and waits until the main agent confirms the dep is complete.
3. **File ownership**: No two concurrent tracks may edit the same file. Tasks sharing files MUST be in the same track. When parallelization is used, `Files:` is required per task (not optional). Sub-agents may read any file but may only modify files listed in their track's tasks. If a sub-agent discovers it needs an unlisted file, STOP and request re-assignment (main agent updates `tasks.md` tracks and ownership).
4. **Metadata single-writer**: Only the main agent may edit `tasks.md` and `workflow.md` during parallel execution. Sub-agents report task completion + self-check logs to the main agent, who updates checkboxes and the Revision Log.
5. **Sub-agent scope**: Each sub-agent receives: the track's task list, relevant specs/design refs, affected file paths, and the verify commands. It follows the Task Execution steps below for each task in its track.
6. **Single-track fallback**: If all tasks are on one track, or any task lacks a `Track` field, execute sequentially in a single agent — skip this protocol.
7. **Invalid graph**: If the dependency graph is inconsistent or cyclic across tracks, abort parallel execution and revert to single-track sequential execution (or re-plan `tasks.md`).
8. **Parallel safety**: Avoid repo-wide formatters or codemods during parallel execution. If tests are not parallel-safe (shared ports/db), sub-agents run targeted tests only; the main agent runs the full suite during the merge gate.

## Integration Merge Protocol

After all parallel tracks complete:

1. **Merge in dependency order**: Derive a track DAG from task deps (Track X depends on Track Y if any task in X has a `Deps` entry pointing to a task in Y). Topologically sort tracks and merge in that order. Example: if task 3_1 (Track C) depends on 3_2 (Track A) and 2_2 (Track B), then Track C depends on both A and B → merge order: A, B, C.
2. **Verify after each merge**: Run the **Verify** commands from top of `tasks.md` after merging each track.
3. **Resolve conflicts centrally**: If merge conflicts arise, resolve in the merge phase — do not re-enter parallel execution.
4. **Single-writer rule**: During the merge phase, only one agent writes code. No parallel edits.
5. **No partial merges**: Do not merge partial tracks unless the plan explicitly allows it.

## Task Execution

For each task in `tasks.md`:

1. Read the task description, **Refs** (specs + design sections), and **Done** criteria.
2. Confirm the task's `Files:` list (from `tasks.md`) is complete. If implementation requires touching a file not listed, STOP and request re-assignment (main agent updates `tasks.md`). Use design/discovery only to validate `Files:` completeness, not to expand it unilaterally.
3. **RED — Write a failing test first**: Identify the observable behavior change for the task. Add or update the smallest appropriate automated test (unit/integration/contract/e2e) that demonstrates the behavior change. Confirm the test fails. If the baseline suite is not green, stop and fix baseline first (as its own task). For UI acceptance behavior, the RED test may be an E2E spec — see [e2e-integration.md](e2e-integration.md).
4. **GREEN — Make it pass**: Make the minimal code change to pass the test.
5. **REFACTOR — Clean up**: Restructure while keeping tests green. Keep behavior constant.
6. Run verification: in **single-track mode**, run the full **Verify** commands from top of `tasks.md`. In **parallel mode**, run lint + typecheck (e.g., `check-types`, `check`) and task-scoped/targeted tests only — the full test suite runs during the merge gate.
7. Record self-check log (see Author Self-Check section below): test added, commands run, deviations.
8. Mark task complete: `- [x]` (main agent updates `tasks.md` in parallel mode).

> **Test-first is mandatory** for any task that changes observable behavior. Skip only for pure refactors, doc-only, or config-only changes — note justification as a sub-bullet under the task's **Done** field in `tasks.md`.

## Author Self-Check (per task, during execution)

Each agent must record per task:
- **Single-track mode**: as a sub-bullet under the task in `tasks.md`.
- **Parallel mode**: in `notes/track-<X>.md` under the change folder (e.g., `cyberk-flow/changes/<change-id>/notes/track-A.md`). Sub-agents must NOT edit `tasks.md` directly (see metadata single-writer rule). The main agent may later consolidate logs into `tasks.md`.

Items to record:
- What test was added/updated (RED→GREEN note).
- Commands run and results.
- Any intentional deviations from spec.

## Fluid Workflow

Implementation begins after **Gate: user approved plan** is passed. Within the stage:
- Can interleave task execution with artifact updates
- Can pause to explore/brainstorm with user
- Can update design.md or specs if implementation reveals issues — log changes in `workflow.md` Revision Log

## Guardrails

- Keep code changes minimal and scoped to each task.
- Pause on errors, blockers, or unclear requirements — don't guess.
- If task is ambiguous, ask before implementing.
- Always run the **Verify** commands from `tasks.md` after changes.
- Production code changes require corresponding test changes (see test-first rule in Task Execution above).
- Every task with a behavior change must have a "Done" criteria that is test-verifiable.

## Output On Completion

```
## Implementation Complete

**Change:** <change-name>
**Progress:** 7/7 tasks complete ✓

### Completed This Session
- [x] Task 1
- [x] Task 2
...

## Gate: all tasks done + verification passed
**Status**: All tasks complete and verified.
**Options**: N/A
**Recommendation**: Proceed to Archive.
**Decision needed**: Approve to proceed to Archive?
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
