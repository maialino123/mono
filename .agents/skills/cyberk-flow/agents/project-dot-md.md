# Agent: Generate `project.md`

## Goal

Analyze the current codebase and fill out the `project.md` template with accurate, evidence-based project metadata.

## Rules

- **Don't guess.** Only state facts backed by actual files. If unsure, write `N/A`.
- **Keep fields.** Use `N/A` for non-applicable fields; do not remove template sections.
- **Merge, don't overwrite.** If `cyberk-flow/project.md` already exists, update fields but preserve any manually-added notes.

## Steps

1. **Read references** — Check for `README.md`, `AGENTS.md`, `CLAUDE.md`, and existing `cyberk-flow/project.md` at the workspace root.

2. **Analyze source code** — Scan relevant manifests and configs for the repo's ecosystem:
   - Node/TS: `package.json`, `tsconfig.json`, `.eslintrc`
   - Python: `pyproject.toml`, `requirements.txt`
   - Go: `go.mod` · Rust: `Cargo.toml` · Java/Kotlin: `pom.xml`, `build.gradle`
   - Infra: `Dockerfile`, `docker-compose.yml`, CI configs
   - **Monorepo:** if workspaces exist, also inspect primary app/package manifests (`apps/*`, `packages/*`).
   - Determine: languages, frameworks, database/ORM, build/test tooling, code style, naming, file structure, constraints.
   - **Commands:** Identify type-check, lint, test, and e2e scripts from `package.json` scripts, `Makefile` targets, `Cargo.toml`, `pyproject.toml`, or CI configs. Map them to the `## Commands` section (Type check, Lint, Test, E2E).

3. **Fill the template** — Write concise, 1-line values. Cite source files where helpful (e.g., `Vite (vite.config.ts)`).
   - **Commands section**: Fill with backtick-wrapped commands (e.g., `` `npm run typecheck` ``). Use `N/A` if no matching script exists. These commands are run directly during implementation.

4. **Deduplicate with AGENTS.md / CLAUDE.md** — Compare the generated `project.md` against existing root config files. If overlap exists, suggest concrete edits to reduce redundancy. Present suggestions to the user — do **not** auto-apply.

## Output

- The completed `project.md` at `cyberk-flow/project.md` (data only, no meta commentary).
- A short summary: sources checked, any `N/A` fields, and deduplication suggestions for `AGENTS.md` / `CLAUDE.md`.
