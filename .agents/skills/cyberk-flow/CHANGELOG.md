# Changelog

All notable changes to the **cyberk-flow** skill will be documented in this file.

## [Unreleased]

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
