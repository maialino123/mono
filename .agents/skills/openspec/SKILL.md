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

# OpenSpec Workflow

3 stages: **Plan → Implement → Archive**

| Stage | When | Reference |
| --- | --- | --- |
| **Plan** | Starting a new change | [references/plan.md](references/plan.md) |
| **Implement** | Executing tasks | [references/implement.md](references/implement.md) |
| **Archive** | After merge/deploy | [references/archive.md](references/archive.md) |

## Tool Selection

| Need | Tool |
| --- | --- |
| Codebase structure | `gkg repo_map` |
| Find definitions | `gkg search_codebase_definitions` |
| Find usages | `gkg get_references` |
| OSS patterns | `librarian` |
| Library docs | `deepwiki`, `git-mcp` |
| API docs | `web_search` |
| Gap analysis, Review, Synthesis | `oracle` |
| Visualize | `mermaid` |

**Fallback**: `finder`, `Grep`, `Read`

## CLI Reference

```bash
openspec new change "<name>"                     # Create change
openspec status --change "<name>" --json         # Check status
openspec validate <name> --strict --no-interactive         # Validate
openspec archive <name> --yes                    # Archive after merge
openspec list                                    # List changes
openspec list --specs                            # List specs
openspec show <id> --json --deltas-only          # Debug delta parsing
```
