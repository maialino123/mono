# Workflow State: <change-id>

> **Source of truth:** Workflow stages/gates → this file · Task completion → `tasks.md`

## Plan

- [ ] Read references/plan.md before starting
- [ ] 1. Context Review
- [ ] 2. Discovery
- [ ] **Gate: user approved direction**
- [ ] 3. Proposal
- [ ] 4. Specs
- [ ] 5. Design _(skip if not needed)_
- [ ] 6. Verification _(spikes — skip if no HIGH risk items)_
- [ ] 7. Tasks
- [ ] 8. Validation _(see references/plan.md § 8 for full checklist)_
  - [ ] **MANDATORY** Oracle reviewed: plan completeness, task deps, gaps, parallelization _(never skip)_
  - [ ] `bun run cf validate <change-id>` passes (or errors justified)
- [ ] **Gate: user approved plan**

## Implement

<!-- RULE: After completing each task, immediately mark it [x] in tasks.md AND log in Revision Log below. -->
- [ ] Read references/implement.md before starting
- [ ] All tasks in tasks.md are complete (update tasks.md after EACH task)
- [ ] Verify: run **Verify** commands from tasks.md (all must pass)
- [ ] Review — Oracle (correctness / architecture / security)
- [ ] Review — Code Review (style / conventions / consistency)
- [ ] **Gate: all tasks done + verification passed**

## Archive

- [ ] Post-merge sanity check
- [ ] Extract knowledge + retrospective
- [ ] Apply deltas: `bun run cf apply <change-id>`
- [ ] Archive change: `bun run cf archive <change-id>`

## Notes

_(Key decisions, blockers, user feedback — persists across compaction)_

## Revision Log

| Date | Phase | What Changed | Why |
| ---- | ----- | ------------ | --- |
