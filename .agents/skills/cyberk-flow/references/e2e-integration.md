# E2E Testing Integration

Load `e2e-testing` skill for Playwright conventions, selectors, and authoring workflows.

## When E2E Applies

Changes that affect **user-visible UI behavior**: new pages/routes, auth flows, form submissions, navigation, critical user journeys. Skip for API-only, config-only, or refactors with no UI impact.

## Touchpoints

| Stage | When | Action |
|---|---|---|
| **Plan** | E2E applies | Add E2E tasks in `tasks.md` referencing spec sections. Append E2E verify command to Verify line. |
| **Implement** | Task has UI behavior | RED step: a failing `.spec.ts` is a valid first test. Follow `e2e-testing` skill workflows. |
| **Archive** | Always | E2E test plans (`e2e/plans/`) remain as living docs; test specs join regression suite. |

## Workflow Contract

When E2E is in scope, these workflow artifacts MUST be updated:

- **`tasks.md` Verify line**: use `bun run cf verify --e2e` (E2E command defined in `cyberk-flow/project.md` § Commands)
- **`tasks.md` task list**: add explicit E2E task(s) with spec Refs and measurable Done criteria
- **Verify gate**: E2E command must pass alongside other verify commands
