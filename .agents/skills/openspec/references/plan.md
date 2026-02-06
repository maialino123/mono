# Stage 1: Plan

Flow: `context review` → `discovery` → `proposal` → `specs` → `design` → `tasks` → `validation`

**Global Rules**:
- **Mermaid for all diagrams**: All architecture diagrams, dependency graphs, flow visualizations, and decision trees MUST use Mermaid syntax — never ASCII art.
- **User decisions**: If any step reveals multiple valid solutions with trade-offs, document all options with a Mermaid diagram and pause to ask the user before proceeding.
- **Open questions**: After completing each artifact, proactively surface any unresolved questions to the user. Don't bury uncertainties in documents — ask directly.

## 1. Context Review

- Review `openspec/project.md`, `openspec list`, and `openspec list --specs`.
- Choose a unique verb-led `change-id`, scaffold: `openspec new change "<change-id>"`

## 2. Discovery (Adaptive Exploration)

Template: `openspec/templates/discovery.md`

Populate `discovery.md` by selecting tracks appropriate to the change's complexity.

**Available tracks** (pick what's relevant — not all are needed for every change):

| Track | When to use | Primary tools | Fallback tools |
| --- | --- | --- | --- |
| **Architecture Snapshot** | Always (at minimum read affected files) | `gkg repo_map`, `gkg search_codebase_definitions` | `finder`, `Read` |
| **Internal Patterns** | When similar features exist in codebase | `gkg get_references` | `Grep`, `finder` |
| **External Patterns** | Novel architecture or unfamiliar domain | `librarian` | `deepwiki`, `web_search` |
| **Constraint Check** | New dependencies or build changes | `Read` (`package.json`, `tsconfig.json`) | `Grep` |
| **Documentation** | New external library or API integration | `deepwiki`, `git-mcp` | `web_search`, `read_web_page` |

**Execution**: Run selected tracks as **parallel sub-agents**. Each Task receives the change-id and its track assignment.

```
Task("Architecture Snapshot: Use `gkg repo_map` and `gkg search_codebase_definitions` to map affected modules for change '<change-id>'. Output a summary of affected files, key definitions, and dependency graph. Write results to the Architecture Snapshot section of openspec/changes/<change-id>/discovery.md."),

Task("Internal Patterns: Use `gkg get_references` to find similar patterns in the codebase for change '<change-id>'. Identify reusable code, existing conventions, and potential conflicts. Write results to the Internal Patterns section of openspec/changes/<change-id>/discovery.md."),

Task("External Patterns: Use `librarian` to research how similar OSS projects solve the problem for change '<change-id>'. Summarize applicable patterns and anti-patterns. Write results to the External Patterns section of openspec/changes/<change-id>/discovery.md."),

Task("Documentation: Use `deepwiki` and `git-mcp` to gather API docs and integration guides for external dependencies in change '<change-id>'. Write results to the Documentation section of openspec/changes/<change-id>/discovery.md."),
```

**Guidelines**:
- **Small/well-documented changes**: Architecture Snapshot + Constraint Check may suffice — run 1-2 Tasks.
- **Large/novel changes**: Run all applicable tracks as parallel Tasks.
- **Always justify** in discovery.md which tracks were used and why others were skipped.
- **Flag blockers for user input**: Sub-agents should document (not resolve) issues requiring user decisions:
  - Ambiguous scope boundaries (what's in/out of this change?)
  - External dependencies requiring credentials or license evaluation
  - Multiple viable libraries/frameworks with different trade-offs
  - Conflicts between existing codebase patterns

## 3. Proposal

Template: `openspec/templates/proposal.md`

- **Why**: Problem/Opportunity (1-2 sentences).
- **What Changes**: Bullet list of new/mod/removed capabilities.
- **Capabilities**: List new (`specs/new-cap/spec.md`) and mod (`specs/existing-cap/spec.md` delta).
- **Impact**: Affected areas.

## 4. Specs (Delta Format)

Create ONE spec file per capability. **Path**: `openspec/changes/<change-id>/specs/<capability-name>/spec.md`.
Follow format in `openspec/templates/spec.md`.

**Format rules**:
- Sections: `ADDED`, `MODIFIED`, `REMOVED`, `RENAMED`
- `#### Scenario:` — exactly 4 hashtags, ≥1 per requirement
- MODIFIED: copy FULL original requirement block, then edit. Partial = data loss at archive.
- Use SHALL/MUST for normative requirements.

**Quality rules** (keep specs dense, not verbose):
- **One scenario per distinct behavior**, not per input variant. If bold/italic/links all just "render markdown" → one scenario.
- **Scenarios MUST add info beyond the requirement**. If deleting the scenario loses nothing, delete it.
- **Don't scenario infrastructure wiring** ("plugin is configured", "provider wraps app"). State in requirement sentence.
- **Omit obvious defaults** ("plain text stays plain", "missing input shows error") unless AI is likely to miss them.
- **Inline constraints** (sanitization, open-in-new-tab) as bullets under one scenario, not separate scenarios.
- **≤ 3 scenarios per requirement**. If more, consolidate.

## 5. Design

Template: `openspec/templates/design.md`

Defines **HOW** to implement. Create only if: cross-cutting, new external dep, high risk/ambiguity.

**Process**: Feed discovery, specs, proposal, and the design template to Oracle.

```
oracle(
  task: "Analyze gap and produce design document",
  context: "Discovery (what exists), specs (what's needed), proposal (why + impact) attached. Produce design document following the template in design.md.",
  files: [
    "openspec/changes/<change-id>/discovery.md",
    "openspec/changes/<change-id>/specs/<cap>/spec.md",
    "openspec/changes/<change-id>/proposal.md",
    "openspec/templates/design.md"
  ]
)
```

**Risk scale** for Risk Map:

| Level  | Criteria                      | Verification                 |
| ------ | ----------------------------- | ---------------------------- |
| LOW    | Pattern exists in codebase    | Proceed                      |
| MEDIUM | Variation of existing pattern | Interface sketch, type-check |
| HIGH   | Novel or external integration | Spike required               |

## 6. Tasks

Template: `openspec/templates/tasks.md`

Verifiable implementation checklist. Reference Specs (what) and Design (how).

## 7. Validation

- Oracle Final Review:
```
oracle(
  task: "Review plan completeness and clarity",
  context: "Plan ready. Check for gaps, unclear beads, missing deps.",
  files: ["openspec/changes/<change-id>/tasks.md"]
)
```
- Run: `openspec validate <change-id> --strict --no-interactive`
- If errors, debug with: `openspec show <change-id> --json --deltas-only`
- **STOP** and ask for user approval before moving to Implementation.
