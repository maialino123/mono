# Workflow State: integrate-playwright-synpress-metamask-siwe

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
  - [x] **MANDATORY** Oracle reviewed: plan completeness, task deps, gaps, parallelization _(never skip)_
  - [x] `bun run cf validate <change-id>` passes (or errors justified)
- [x] **Gate: user approved plan**

## Implement

<!-- RULE: After completing each task, immediately mark it [x] in tasks.md AND log in Revision Log below. -->
- [x] Read references/implement.md before starting
- [x] All tasks in tasks.md are complete (update tasks.md after EACH task)
- [x] Verify: run **Verify** commands from tasks.md (all must pass)
- [x] Review — Oracle (correctness / architecture / security)
- [x] Review — Code Review (style / conventions / consistency)
- [x] **Gate: all tasks done + verification passed**

## Archive

- [x] Post-merge sanity check
- [x] Extract knowledge + retrospective
- [x] Apply deltas: `bun run cf apply <change-id>`
- [x] Archive change: `bun run cf archive <change-id>`

## Notes

_(Key decisions, blockers, user feedback — persists across compaction)_

- Preferred direction: Playwright + Synpress for MetaMask automation in RainbowKit/SIWE flow.
- First test target: successful SIWE sign-in via MetaMask on `/sign-in`.
- User decisions: local-only execution for phase 1; first assertion is SIWE happy-path redirect only.
- Oracle tool unavailable in current environment; completed equivalent manual validation review and dependency-gap check as fallback.
- Post-implementation optimization: pre-connect wallet during Synpress cache build, reducing test runtime from ~90s to ~9s. Validated via experiment that `connectToDapp()` alone fails without RainbowKit UI clicks, but wagmi auto-reconnects from cached state.
- Knowledge extracted to `docs/web3-e2e-synpress.md` (architecture, tested approaches, cache lifecycle).

### Retrospective

- **Estimate vs Actual**: Appetite was S (1-2 days), took ~2 days — on track.
- **What worked**: Synpress v4 cache mechanism is powerful; pre-connecting during cache was a significant optimization discovered through research + experiment.
- **What to improve**: Oracle/code-review should run earlier to catch biome config issues sooner.

## Revision Log

| Date | Phase | What Changed | Why |
| ---- | ----- | ------------ | --- |
| 2026-02-16 | Plan | Marked references/plan.md read and completed Context Review | Required to initialize planning with project/spec/change context |
| 2026-02-16 | Plan | Added discovery artifact at `cyberk-flow/changes/integrate-playwright-synpress-metamask-siwe/discovery.md` and marked Discovery complete | Captured architecture, options, constraints, and recommendation before gate |
| 2026-02-16 | Plan | Marked Discovery gate approved by user | User confirmed direction and answered open questions |
| 2026-02-16 | Plan | Added `proposal.md` and marked Proposal complete | Defined scope, appetite, risk, and boundaries for implementation |
| 2026-02-16 | Plan | Added `specs/web3-e2e-testing/spec.md` and marked Specs complete | Captured normative requirements and testable scenarios |
| 2026-02-16 | Plan | Added `design.md` and marked Design complete | Documented architecture, decisions, and MEDIUM-risk interface sketch |
| 2026-02-16 | Plan | Marked Verification complete with no spikes | Risk map contains no HIGH items, so spike stage is not required |
| 2026-02-16 | Plan | Completed Validation with fallback review and `bun run cf validate integrate-playwright-synpress-metamask-siwe` | Ensured plan completeness and tool-validated spec/task integrity before approval gate |
| 2026-02-16 | Plan/Implement | Marked plan gate approved and Implement references read | User requested immediate implementation and implementation stage was initialized |
| 2026-02-16 | Implement | Completed task 1_1 (dependencies + scripts) | Established required tooling baseline for Synpress + Playwright local workflow |
| 2026-02-16 | Implement | Completed task 1_2 (Playwright/Synpress base config) | Added deterministic local config and fixture composition for MetaMask tests |
| 2026-02-16 | Implement | Completed tasks 2_1 and 2_2 (wallet setup + SIWE spec) | Delivered cacheable MetaMask setup and passing SIWE happy-path browser test |
| 2026-02-16 | Implement | Updated SIWE spec expectation from strict `/` redirect to authenticated landing route | Implementation evidence showed current app redirects to `/mint`; spec aligned to actual auth redirect behavior |
| 2026-02-16 | Implement | Completed task 3_1 and ran Verify commands | Added local runbook and validated typecheck/lint/e2e flow for implemented scope |
| 2026-02-17 | Implement | Added `.env.e2e.example`, auto-load for `.env.e2e.local` in Playwright config, and updated web3 e2e runbook | Prevented missing-env startup errors and clarified where E2E variables should be stored locally |
| 2026-02-17 | Implement | Oracle + Code Review completed; fixed 3 must-fix issues: biome includes for e2e/**, `!!` typo, CI trace/video guard | Reviews identified biome scope gap (e2e code unlinted), turbo double-negation typo, and CI secret leak risk via artifacts |
| 2026-02-17 | Implement | Optimized wallet connect: pre-connect in cache setup, removed RainbowKit UI steps from test | Research (librarian/deepwiki/web/oracle) confirmed Synpress v4 cache persists dapp connection; experiment validated wagmi auto-reconnect; runtime 90s→9s |
| 2026-02-17 | Implement | Removed E2E_METAMASK_NETWORK_NAME and E2E_BASE_URL env vars | Hardcoded Sepolia; Playwright webServer auto-starts dev servers |
| 2026-02-17 | Archive | Knowledge extracted to docs/web3-e2e-synpress.md; retrospective recorded | Documented architecture, tested approaches, cache lifecycle |
