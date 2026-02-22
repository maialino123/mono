# Stage 1: Plan

Flow: `context review` → `discovery` → `proposal` → `specs` → `design` → `verification` → `tasks` → `validation`

**Global Rules**:

- **Mermaid only**: All diagrams MUST use Mermaid syntax — never ASCII art.
- **Approval gates**: STOP and present deliverables to the user before proceeding:
  - After Discovery → present Mermaid decision diagram + pros/cons (if multiple viable solutions)
  - After Verification → summarize spike outcomes + updated Risk Map + any spec deltas
  - After Validation → final checklist status + unresolved open questions
- **Risk matrix**:

| Risk   | Review Required                        | Verification         |
| ------ | -------------------------------------- | -------------------- |
| LOW    | Owner self-review                      | Proceed              |
| MEDIUM | + 1 domain peer                        | Interface sketch     |
| HIGH   | + security / platform lead as relevant | Spike required       |

- **Open questions**: Surface unresolved questions to the user after each artifact — don't bury uncertainties.

**Templates**: Each stage follows its template in the skill's `templates/` directory (resolved automatically by scripts). Artifacts go in `cyberk-flow/changes/<change-id>/`. Only stage-specific rules are listed below.

**Tool fallback**: If primary tools (`gkg`, `librarian`, `deepwiki`, `git-mcp`) are unavailable, use `glob` + `Grep` + `Read` + `web_search` to replicate the intent.

## 1. Context Review

- Read `cyberk-flow/project.md`, run `bun run cf changes` and `bun run cf specs`.
- Choose a unique verb-led `change-id`, scaffold: `bun run cf new "<change-id>"`

## 2. Discovery

Template: `discovery.md` — select relevant workstreams, run as parallel sub-agents, justify omissions.

**Workstreams**:

| Workstream                | When to use                             | Primary tools                                      |
| ------------------------- | --------------------------------------- | -------------------------------------------------- |
| **Memory Recall**         | Always                                  | `bun run cf search`                                |
| **Architecture Snapshot** | Always                                  | `gkg repo_map`, `gkg search_codebase_definitions`  |
| **Internal Patterns**     | Similar features exist in codebase      | `gkg get_references`                                |
| **External Patterns**     | Novel architecture or unfamiliar domain | `librarian`                                         |
| **Constraint Check**      | New dependencies or build changes       | `Read` (`package.json`, `tsconfig.json`)            |
| **Documentation**         | New external library or API integration | `deepwiki`, `git-mcp`                               |

**Guidelines**: Run Memory Recall first to seed context before other workstreams. Small changes → 1-2 workstreams. Large/novel → all applicable. Flag blockers for user input (scope ambiguity, credentials, competing libs, pattern conflicts).

## 3. Proposal

Template: `proposal.md` — fill why, appetite (`S ≤1d` / `M ≤3d` / `L ≤2w`), scope boundaries + cuts, capability list, impact, risk rating.

- **MANDATORY**: Determine whether the change affects **user-visible UI behavior** (new pages, form interactions, navigation, etc.). Record the decision in `proposal.md` § "UI Impact & E2E". If YES → E2E is **in scope** by default; follow [e2e-integration.md](e2e-integration.md). If UI Impact = YES but E2E = NOT REQUIRED, **STOP at the gate** and request explicit user approval of the justification.

## 4. Specs (Delta Format)

Create ONE spec file per capability. **Path**: `cyberk-flow/changes/<change-id>/specs/<capability-name>/spec.md`.
Follow format in `templates/spec.md`.

**Heading format** (must match exactly for the delta parser):
- H2 section headers: `## ADDED Requirements`, `## MODIFIED Requirements`, `## REMOVED Requirements`, `## RENAMED Requirements`
- Requirements under ADDED/MODIFIED: `### Requirement: <name>` (H3 heading)
- Requirements under REMOVED: `### Requirement: <name>` (one per line)
- Requirements under RENAMED: `FROM: ### Requirement: <old>` / `TO: ### Requirement: <new>` (line pairs)
- Use SHALL/MUST for normative requirements.

**Format rules**:
- MODIFIED: quote original requirement in blockquote (`>`), then show changed version below. Reference original spec path.
- `#### Scenario:` — consistent heading level, ≥1 per requirement.

**Quality rules** (keep specs dense, not verbose):
- One scenario per distinct behavior, not per input variant. Inline constraints as bullets under one scenario.
- Scenarios MUST add info beyond the requirement; delete if redundant.
- Don't scenario infrastructure wiring. Omit obvious defaults unless AI is likely to miss them.

## 5. Design

Template: `design.md` — create if: cross-cutting, new external dep, or any MEDIUM/HIGH risk item.

**Process**: Ask Oracle to generate design from {discovery, specs, proposal} using template. Oracle produces gap analysis, architecture decisions, and Risk Map. MEDIUM risk items require an interface sketch (Mermaid). Overall change risk = highest Risk Map item.

## 6. Verification (Spikes)

Templates: `spike.md` (definition) + `spike-learning.md` (results). Output: `cyberk-flow/spikes/<capability>/<spike-id>/`

Create spikes **iff** design Risk Map has **HIGH** entries. 1 spike per HIGH item.

**Workflow**:
1. Create spike definition — question, hypothesis, success/failure criteria.
2. Write throwaway code in `spikes/<capability>/<spike-id>/index.ts` to prove/disprove.
3. Document learnings in `spikes/<capability>/<spike-id>/learnings.md` — decision, findings, plan deltas.

**Timebox**: 30 min default, 2h hard cap. Stop early if criteria met or blocker hit.

**Feed back**: update design Risk Map (downgrade if PASS, rewrite if FAIL), update specs only if requirement changes, update tasks to reflect validated approach. If FAIL and not viable within appetite → recommend abandon/defer and STOP for user.

## 7. Tasks

Template: `tasks.md` — execution-ordered checklist referencing specs (what) and design (how).

- **E2E testing (mandatory when `proposal.md` marks E2E = REQUIRED)**: Add explicit E2E task(s) with spec **Refs** and measurable **Done** criteria. Implement will run the **E2E** command from `project.md` § Commands. See [e2e-integration.md](e2e-integration.md) for the workflow contract.
- **Spikes first**: section 0 (`0_x`), completed before any track starts.
- Each task: **Track** (letter), **Deps**, **Refs** (spec/design anchors), **Done** (measurable criteria), **Files** (required when parallel tracks are used; optional for single-track).

**Tracks**: A track is a sequential chain executed by one sub-agent. Different tracks run concurrently. A track may contain tasks from different sections. Tasks sharing files MUST be in the same track. Mermaid node IDs use `t` prefix (`t1_1`); labels show task ID (`"1_1"`). Every Deps entry MUST match a graph arrow.

## 8. Validation

- **MUST** ask Oracle to review plan completeness, task deps, gaps, and parallelization opportunities — even for LOW risk changes. This step is never skippable.
- Run: `bun run cf validate <change-id>` — fix any reported errors.
- **Checklist** (present status at approval gate):
  - [ ] Every spec requirement has ≥1 testable scenario
  - [ ] Rollout/migration plan exists (if user-facing or data-changing)
  - [ ] Security/privacy review triggered (if auth/data involved)
  - [ ] Breaking changes have migration path documented
  - [ ] Appetite is set and scope boundaries are clear
  - [ ] All open questions from previous stages resolved or escalated
