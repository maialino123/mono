# Workflow State: <change-id>

> **Source of truth:** Workflow stages/gates → this file · Task completion → `tasks.md`

## Plan

- [x] Read references/plan.md before starting
- [x] 1. Context Review
- [x] 2. Discovery
- [x] **Gate: user approved direction**
- [x] 3. Proposal
- [x] 4. Specs
- [x] 5. Design _(skip if not needed)_
- [x] 6. Verification _(spikes — skip if no HIGH risk items)_
- [x] 7. Tasks
- [x] 8. Validation _(see references/plan.md § 8 for full checklist)_
  - [x] Oracle reviewed plan completeness, task deps, and gaps
  - [x] `bun run cf validate <change-id>` passes (or errors justified)
- [x] **Gate: user approved plan**

## Implement

<!-- RULE: After completing each task, immediately mark it [x] in tasks.md AND log in Revision Log below. -->
- [ ] Read references/implement.md before starting
- [ ] All tasks in tasks.md are complete (update tasks.md after EACH task)
- [ ] Verify: check-types, check, tests
- [ ] **Gate: all tasks done + verification passed**

## Archive

- [ ] Code review
- [ ] **Gate: user approved code review findings**
- [ ] Extract knowledge + retrospective
- [ ] Apply deltas + archive change

## Notes

_(Key decisions, blockers, user feedback — persists across compaction)_

## Revision Log

| Date | Phase | What Changed | Why |
| ---- | ----- | ------------ | --- |
