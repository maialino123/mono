---
name: cyberk-flow
version: 1.6.0
description: |
  Spec-driven development workflow using Cyberk Flow for creating, validating, and managing change proposals.
  Use when:
  - User mentions "proposal", "change", or "spec" with "create", "plan", "make", "start", "help"
  - User says "implement", "add feature", "plan", "kế hoạch" for new capabilities
  - Adding features, breaking changes, architecture shifts, or security/performance work
  - Need to understand existing specs or pending changes
  - Archiving completed changes after deployment
  Skip for: bug fixes, typos, dependency updates, config changes, tests for existing behavior.
---

# Cyberk Flow Workflow

## Getting Started

Initialize cyberk-flow in your project → [references/init.md](references/init.md)

## Stages

3 stages: **Plan → Implement → Archive**

| Stage         | When                  | Reference                                          |
| ------------- | --------------------- | -------------------------------------------------- |
| **Plan**      | Starting a new change | [references/plan.md](references/plan.md)           |
| **Implement** | Executing tasks       | [references/implement.md](references/implement.md) |
| **Archive**   | After merge/deploy    | [references/archive.md](references/archive.md)     |

**Integration**: [E2E Testing](references/e2e-integration.md) — when changes affect user-visible UI behavior

## Mandatory Workflow Rules

Every change has a `workflow.md` that tracks state. Follow these rules:

1. **Before ANY stage**: Read `workflow.md` AND the stage's reference file (e.g., `references/implement.md`) before starting work.
2. **After EACH step**: Immediately mark `- [x]` in `workflow.md` for the completed step, update `tasks.md` if applicable, and add a Revision Log entry. Do NOT batch updates.
3. **Self-check before advancing**: Verify the step's artifact exists before marking `[x]`.
4. **NEVER skip stages or gates**: Complete each stage before moving to the next. Within Implementation, workflow is fluid (artifacts may be updated).
5. **STOP at gates**: Present a structured gate output (see below) and wait for user approval. When user approves, mark the gate `- [x]` in `workflow.md` before proceeding.
6. **Design step**: If skipping, record reason in Notes and mark `[-]`.

### Gate Output Format

At every gate, output exactly this structure:

```
## Gate: <gate name>
**Status**: <summary of what was completed>
**Options** (if applicable):
1. <option A> — pros / cons
2. <option B> — pros / cons
**Recommendation**: <your pick + reasoning>
**Decision needed**: <specific question for user>
```

### Deviation Rules

- **Auto-fix**: Typos, lint errors, minor naming — fix and note in workflow.md.
- **STOP**: Scope changes, new dependencies, architecture shifts, breaking changes — present to user first.

## Tool Selection

| Need                            | Tool                              |
| ------------------------------- | --------------------------------- |
| Codebase structure              | `gkg repo_map`                    |
| Find definitions                | `gkg search_codebase_definitions` |
| Find usages                     | `gkg get_references`              |
| OSS patterns                    | `librarian`                       |
| Library docs                    | `deepwiki`, `git-mcp`             |
| API docs                        | `web_search`                      |
| Gap analysis, Review, Synthesis | `oracle`                          |
| Visualize                       | `mermaid`                         |
| Index codebase                  | `gkg index_project`               |
| Search threads                  | `find_thread`                     |

**Fallback**: `finder`, `Grep`, `Read`

## Scripts

All scripts must be run from the **project root** directory via `bun run cf <command>`.

Requires `package.json` script: `"cf": "bun run .agents/skills/cyberk-flow/scripts/cf.ts"`

| Command                      | Description                       |
| ---------------------------- | --------------------------------- |
| `bun run cf init`            | Initialize cyberk-flow in project |
| `bun run cf changes`         | List changes with task progress   |
| `bun run cf specs`           | List specs with requirement count |
| `bun run cf new <change-id>`      | Create new change (kebab-case)    |
| `bun run cf validate <change-id>` | Validate delta specs              |
| `bun run cf apply <change-id>`    | Apply delta specs to main specs   |
| `bun run cf archive <change-id>`  | Move change to archive/           |
| `bun run cf release <change-id> <bump>` | Create a release (bump version + changelog) |
| `bun run cf migrate [source-dir]` | Migrate openspec/ to cyberk-flow/ |

> **Note:** `@huggingface/transformers` is required for memory semantic search and is auto-installed by `cf init`.
