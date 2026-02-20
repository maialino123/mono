# E2E Testing Integration

Load `e2e-testing` skill for Playwright conventions, selectors, and authoring workflows.

## When E2E Applies

Changes that affect **user-visible UI behavior**: new pages/routes, auth flows, form submissions, navigation, critical user journeys. Skip for API-only, config-only, or refactors with no UI impact.

> **Decision point**: E2E applicability is determined during **Plan → Proposal** (not during Tasks). The agent MUST record the decision in `proposal.md` § "UI Impact & E2E". E2E is **behavior-based, not risk-based** — a LOW-risk UI change still requires E2E.

## Touchpoints

| Stage         | When                 | Action                                                                                                           |
| ------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Plan**      | E2E applies          | Add E2E tasks in `tasks.md` referencing spec sections. Implement will run the **E2E** command from `project.md`. |
| **Implement** | Task has UI behavior | RED step: a failing `.spec.ts` is a valid first test. Follow `e2e-testing` skill workflows.                      |
| **Archive**   | Always               | E2E test plans (`e2e/plans/`) remain as living docs; test specs join regression suite.                           |

## Workflow Contract

When E2E is in scope, these workflow artifacts MUST be updated:

- **`tasks.md` task list**: add explicit E2E task(s) with spec Refs and measurable Done criteria
- **Verify Gate**: run the **E2E** command from `project.md` § Commands (alongside **Test** as applicable) — all must pass
