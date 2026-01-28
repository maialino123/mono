---
name: openspec
description: |
  Spec-driven development workflow using OpenSpec for creating, validating, and managing change proposals.
  Use when:
  - User mentions "proposal", "change", or "spec" with "create", "plan", "make", "start", "help"
  - User says "implement", "add feature", "plan", "kế hoạch" for new capabilities
  - Adding features, breaking changes, architecture shifts, or security/performance work
  - Need to understand existing specs or pending changes
  - Archiving completed changes after deployment
  Skip for: bug fixes, typos, dependency updates, config changes, tests for existing behavior.
---

# OpenSpec Skill

Spec-driven development workflow for managing change proposals.

## Quick Checklist

- Search existing: `openspec spec list --long`, `openspec list`
- Decide scope: new vs modify existing capability
- Pick unique `change-id`: kebab-case, verb-led (`add-`, `update-`, `remove-`, `refactor-`)
- Scaffold: `discovery.md`, `proposal.md`, `tasks.md`, `design.md`, delta specs
- Write deltas: `## ADDED|MODIFIED|REMOVED|RENAMED Requirements` with `#### Scenario:` per requirement
- Validate: `openspec validate [change-id] --strict --no-interactive`
- Request approval before implementation

## Three-Stage Workflow

### Stage 1: Creating Changes

**Workflow:**

1. **Context Review**: Read `openspec/project.md`, run `openspec list`, `openspec list --specs`
2. **Scaffold**: Create `openspec/changes/<id>/` folder
3. **Deep Planning**:
   - **Discovery**: Create `discovery.md` with architecture findings
   - **Analysis**: Identify risks; if HIGH RISK, create `spikes/`
   - **Design**: Create `design.md` with risk map
4. **Specification**: Write `proposal.md`, `tasks.md`, spec deltas in `specs/<capability>/spec.md`
5. **Validation**: Run `openspec validate <id> --strict --no-interactive`
6. **Wait for Approval**: Stop and request user review

### Stage 2: Implementing Changes

1. Read `proposal.md`, `design.md`, `tasks.md`
2. Implement tasks sequentially
3. Mark all tasks `- [x]` when complete
4. Do not start until proposal approved

### Stage 3: Archiving Changes

After deployment:
- Move `changes/[name]/` → `changes/archive/YYYY-MM-DD-[name]/`
- Update `specs/` if capabilities changed
- Run `openspec archive <change-id> --yes`

## CLI Commands

```bash
openspec list                  # List active changes
openspec list --specs          # List specifications
openspec show [item]           # Display change or spec
openspec validate [item]       # Validate changes
openspec archive <id> --yes    # Archive after deployment
```

**Flags:** `--json`, `--strict`, `--no-interactive`, `--skip-specs`, `--yes`

## Directory Structure

```
openspec/
├── project.md              # Project conventions
├── specs/                  # Current truth - what IS built
│   └── [capability]/
│       └── spec.md
├── changes/                # Proposals - what SHOULD change
│   ├── [change-name]/
│   │   ├── discovery.md
│   │   ├── proposal.md
│   │   ├── tasks.md
│   │   ├── design.md
│   │   ├── spikes/
│   │   └── specs/[capability]/spec.md
│   └── archive/
```

## Spec Format

### Delta Operations

- `## ADDED Requirements` - New capabilities
- `## MODIFIED Requirements` - Changed behavior
- `## REMOVED Requirements` - Deprecated features
- `## RENAMED Requirements` - Name changes

### Requirement Format (CORRECT)

```markdown
### Requirement: Feature Name

The system SHALL provide...

#### Scenario: Success case

- **WHEN** user performs action
- **THEN** expected result
```

**Every requirement MUST have at least one `#### Scenario:`**

### Common Mistakes

```markdown
- **Scenario: Name** ❌  # Don't use bullets
**Scenario**: Name ❌    # Don't use bold
### Scenario: Name ❌    # Use #### not ###
```

## Discovery Template

```markdown
# Discovery: <Feature Name>

## 1. Feature Summary
<1-2 sentence description>

## 2. Architecture Snapshot

### Relevant Packages
| Package        | Purpose | Key Files |
| -------------- | ------- | --------- |
| `packages/...` | ...     | ...       |

### Entry Points
- API: ...
- UI: ...

## 3. Existing Patterns

### Similar Implementations
| Feature | Location | Pattern Used |
| ------- | -------- | ------------ |
| ...     | ...      | ...          |

### Reusable Utilities
- Validation: ...
- Error handling: ...

## 4. Technical Constraints
- Dependencies: ...
- Build Requirements: ...
- Database: ...

## 5. External References
- Library Docs: ...
- Similar Projects: ...

## 6. Gap Analysis (Synthesized)
| Component | Have        | Need          | Gap Size |
| --------- | ----------- | ------------- | -------- |
| API       | None        | POST /v1/auth | New      |
| DB        | User Schema | 2FA Columns   | Small    |

## 7. Open Questions
- [ ] ...
```

## Risk Assessment

- **LOW**: Pattern exists AND impact < 5 files → Proceed
- **MEDIUM**: Variation of pattern OR medium impact → Sketch in `design.md`
- **HIGH**: New technique, external integration, OR impact > 5 files → **REQUIRE SPIKE**

> New external dependency = HIGH RISK

## Proposal Template

```markdown
# Change: [Brief description]

## Why
[1-2 sentences on problem/opportunity]

## What Changes
- [Bullet list]
- [Mark **BREAKING** changes]

## Impact
- Affected specs: [list]
- Affected code: [key files]
```

## Tasks Template

```markdown
## 1. Implementation

- [ ] 1.1 Create database schema
- [ ] 1.2 Implement API endpoint
- [ ] 1.3 Add frontend component
- [ ] 1.4 Write tests
```

## Spec Delta Template

```markdown
## ADDED Requirements

### Requirement: New Feature

The system SHALL provide...

#### Scenario: Success case

- **WHEN** user performs action
- **THEN** expected result

## MODIFIED Requirements

### Requirement: Existing Feature

[Complete modified requirement - copy full original, then edit]

## REMOVED Requirements

### Requirement: Old Feature

**Reason**: [Why removing]
**Migration**: [How to handle]
```

> If multiple capabilities affected, create `changes/[id]/specs/<capability>/spec.md` per capability.

## Design Template

Create `design.md` when: cross-cutting change, new external dependency, security/performance complexity, or ambiguity needing decisions.

```markdown
## Context
[Background, constraints, stakeholders]

## Goals / Non-Goals
- Goals: [...]
- Non-Goals: [...]

## Risk Map (REQUIRED)
| Component | Risk | Rationale | Verification (Spike) |
| --------- | ---- | --------- | -------------------- |
| Auth API  | HIGH | New lib   | Spike `test-auth.ts` |
| DB Schema | LOW  | Standard  | N/A                  |

## Decisions
- Decision: [What and why]
- Alternatives considered: [Options + rationale]

## Migration Plan
[Steps, rollback]

## Open Questions
- [...]
```

## Tool Selection

| Need               | Tool                                         |
| ------------------ | -------------------------------------------- |
| Codebase structure | `mcp__gkg__repo_map`, `Read`                 |
| Find definitions   | `mcp__gkg__search_codebase_definitions`      |
| Find usages        | `mcp__gkg__get_references`, `Grep`           |
| OSS patterns       | `librarian`                                  |
| API docs           | `web_search`                                 |
| Gap analysis       | `oracle`                                     |
