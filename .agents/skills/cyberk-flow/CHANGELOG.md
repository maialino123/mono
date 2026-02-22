# Changelog

All notable changes to the **cyberk-flow** skill will be documented in this file.

## [Unreleased]

## [1.5.0] - 2026-02-22

### Changed

- integrate-knowledge-extraction: The standalone `knowledge` skill is redundant — its memory storage already depends on `cf learn`/`cf search` (cyberk-flow). The extraction workflow should live in archive.md as a handoff to a deep-mode thread, not a separate skill.

- memory-knowledge-v2: The `knowledge` skill (thread extraction → doc updates) and the `cyberk-flow` memory system (SQLite + vector search + PageRank) are disconnected. Extracted knowledge doesn't enter the searchable memory store, and there's no quality gate to prevent memory bloat. Additionally, we lack structured knowledge categories (decisions, debugging/mistakes, patterns, research) that would make accumulated knowledge actually useful.

## [1.4.0] - 2026-02-21

### Changed

- enhance-memory-intelligence: The memory store currently provides basic FTS5 keyword + vector hybrid search. Adding confidence scoring, access tracking, knowledge graph (PageRank), document type classification, consolidation, contradiction detection, and co-access patterns will make search results more relevant, surface relationships between documents, and keep the index clean over time.

- integrate-memory-discovery: The memory-graph system (indexer + hybrid search) is fully built but only accessible via manual `cf search` commands. Agents performing discovery have no automatic access to prior specs, archived changes, or project docs. This creates a gap where agents re-discover context that already exists in the project's history — wasting time and producing less informed proposals.

## [1.3.0] - 2026-02-19

### Changed

- add-semantic-embeddings: Memory search currently degrades to keyword-only (FTS5) because the default `NoopEmbeddingProvider` produces no vectors. Queries like "login" cannot find documents about "authentication". A real embedding provider enables semantic similarity search, completing the hybrid search pipeline.

- memory-graph: Currently cyberk-flow has no search capability — agents must read files one-by-one to find relevant specs, archived changes, or docs. A local memory/search system enables instant semantic + keyword retrieval across all project knowledge, making agents significantly more effective at understanding context.

## [1.2.0] - 2026-02-19

### Changed

- redesign-release: Current release model creates 1 version per change (`cf release <id> <bump>`), leading to version inflation. There's no natural grouping of changes into releases. A git-based approach is simpler: unreleased = committed but not pushed, release = bump version + push.

- add-hooks: Users need a way to run custom scripts before/after cyberk-flow CLI commands (e.g., auto-format after apply-deltas, notify after archive). Currently there is no extensibility point.
- fix-plan-workflow: Two bugs in cyberk-flow planning stage: 1. `cf new` copies unnecessary templates (`project.md`, `ROOT_AGENTS.md`, `spike.md`, `spike-learning.md`, `task.md`) into every change — these are global/on-demand templates, not per-change artifacts. 2. Step 8 (Validation) is effectively invisible — its checklist only exists in `references/plan.md`, not in the change's `workflow.md`. The agent skips validation because it only sees a single checkbox.
- add-openspec-migration: Projects currently using the `openspec/` directory structure need a way to migrate to the new `cyberk-flow/` format. The formats are very similar but cyberk-flow adds new artifacts (workflow.md), richer templates (proposal with Appetite/Scope/Risk, tasks with Tracks/Deps), and uses `cyberk-flow/` as root directory instead of `openspec/`.
- add-update-command: Users need a simple way to update cyberk-flow skills to the latest version. Currently there's no built-in command — users must manually run external tools.
- shorten-archive-format: Current archive format `yyyy-MM-dd-HHmm-<name>` is verbose (15 chars for date). Shorten to `yyMMdd-HHmm-<name>` (11 chars) for cleaner directory listings while retaining sortability and time precision.
- integrate-e2e-testing: e2e-testing skill hardcodes cyberk-flow workflow stages (inverted dependency). cyberk-flow doesn't reference e2e-testing, so users following cyberk-flow never discover E2E planning. Need to fix dependency direction and add E2E touchpoints in cyberk-flow.
- integrate-biome: The project has no automated code quality tooling — style conventions exist only as prose in AGENTS.md. Adding Biome provides fast, unified linting + formatting + import sorting with a single dependency.
- redesign-release: Redesign release workflow — git-based versioning with unreleased accumulation.

## [1.1.3] - 2026-02-15

### Changed

- remove-project-templates: Remove project-local `cyberk-flow/templates/`, centralize template management within the skill
- enhance-implement-stage: Relocate comprehensive code review from Archive to Implement phase, add review fix loop and post-merge sanity check

### Fixed

- fix-spec-format-drift: Standardize spec format by updating templates and documentation for renamed requirements, explicit headings, and mandatory validation

## [1.1.2] - 2026-02-14

### Added

- `bun run cf update` command — fetches latest skills via `npx skills add cyberk-dev/cyberk-skills --skill cyberk-flow --agent amp`
- Archive guard — `bun run cf archive` now validates that all `## Archive` workflow checkboxes are ticked before proceeding

## [1.1.1] - 2026-02-14

### Fixed

- `archive-change.ts` now auto-ticks "Archive change" checkbox in `workflow.md` before moving directory
- `release.ts` uses env vars (`CF_SKILL_MD_PATH`, `CF_CHANGELOG_PATH`) for test isolation — tests no longer modify real files
- `release.ts` preserves existing content under `[Unreleased]` section in CHANGELOG
- `release.ts` collapses multi-line proposal summary into single line for changelog entries
- Removed unused `resolve` import in `release.ts`
- Fixed usage strings to reference `bun run cf ...` instead of direct script paths

## [1.1.0] - 2026-02-14

### Changed

- add-changelog-versioning: cyberk-flow has no way to track its version or communicate what changed between releases. Users installing/updating the skill have no visibility into breaking changes, new features, or fixes. The archive system records individual changes but lacks a consolidated, human-readable changelog.

## [1.0.0] - 2026-02-14

### Added

- Spec-driven development workflow with Plan → Implement → Archive stages
- CLI commands: `init`, `changes`, `specs`, `new`, `validate`, `apply`, `archive`, `migrate`
- Delta spec format with ADDED/MODIFIED/REMOVED/RENAMED sections
- Workflow state tracking via `workflow.md`
- Gate-based approval system
- Parallel execution protocol for multi-track task execution
- Discovery workstreams (Architecture Snapshot, Internal/External Patterns, Constraint Check, Documentation)
- Oracle-driven design and verification pipeline
