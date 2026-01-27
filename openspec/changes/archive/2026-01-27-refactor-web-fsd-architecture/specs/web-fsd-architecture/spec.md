## ADDED Requirements

### Requirement: FSD Layer Structure

The `apps/web/src` directory MUST be organized into FSD layers with the following hierarchy:

1. `app/` - Next.js routing shell only
2. `screens/` - Page-specific composition
3. `widgets/` - Reusable large UI blocks
4. `features/` - User actions (mutations)
5. `entities/` - Business domain (queries)
6. `shared/` - Infrastructure and utilities

#### Scenario: Layer directories exist

- **GIVEN** the apps/web/src directory
- **WHEN** listing contents
- **THEN** directories `shared/`, `entities/`, `features/`, `widgets/`, `screens/`, `app/` MUST exist

#### Scenario: No flat components directory

- **GIVEN** the apps/web/src directory
- **WHEN** checking for legacy structure
- **THEN** `components/`, `lib/`, `utils/` directories MUST NOT exist at root level

---

### Requirement: FSD Import Rules

Each layer MUST only import from layers below it in the hierarchy. Cross-layer imports MUST go through the layer's `index.ts` public API.

#### Scenario: Valid import chain

- **GIVEN** code in `screens/login/`
- **WHEN** importing dependencies
- **THEN** imports from `widgets/`, `features/`, `entities/`, `shared/` are allowed
- **AND** imports from `app/` or other `screens/` are NOT allowed

#### Scenario: Public API enforcement

- **GIVEN** code in `widgets/layout/`
- **WHEN** importing from `entities/user/`
- **THEN** import MUST be from `@/entities/user` (index.ts)
- **AND** import from `@/entities/user/api/user.queries` is NOT allowed

---

### Requirement: Shared Layer Structure

The `shared/` layer MUST contain infrastructure code with NO business logic, organized into segments.

#### Scenario: Shared segments exist

- **GIVEN** the shared/ directory
- **WHEN** listing contents
- **THEN** segments `api/`, `ui/`, `lib/`, `providers/` MUST exist

#### Scenario: UI kit in shared

- **GIVEN** shadcn/ui components
- **WHEN** locating them in codebase
- **THEN** they MUST be in `shared/ui/`

#### Scenario: API clients in shared

- **GIVEN** ORPC client and auth-client
- **WHEN** locating them in codebase
- **THEN** they MUST be in `shared/api/`

---

### Requirement: Entities Layer Pattern

Each entity MUST contain query definitions and MAY contain UI components. Entities handle GET/SEARCH operations only.

#### Scenario: Entity structure

- **GIVEN** an entity `entities/todo/`
- **WHEN** examining its structure
- **THEN** it MUST have `api/` segment with query definitions
- **AND** it MUST have `index.ts` exporting public API

#### Scenario: No mutations in entities

- **GIVEN** entity code in `entities/*/`
- **WHEN** checking for API operations
- **THEN** only GET/SEARCH operations are allowed
- **AND** CREATE/UPDATE/DELETE operations MUST be in `features/`

---

### Requirement: Features Layer Pattern

Each feature MUST handle a single user action (mutation). Features are organized by action-entity naming.

#### Scenario: Feature structure

- **GIVEN** a feature `features/auth/sign-in/`
- **WHEN** examining its structure
- **THEN** it MUST have mutation logic
- **AND** it MUST have `index.ts` exporting public API

#### Scenario: Feature naming

- **GIVEN** a new mutation feature
- **WHEN** naming the feature
- **THEN** name SHOULD follow `{action}-{entity}` pattern (e.g., `create-todo`, `sign-in`)

---

### Requirement: Layer AGENTS.md Guidance

Each FSD layer MUST have an AGENTS.md file providing AI guidance for that layer.

#### Scenario: AGENTS.md exists per layer

- **GIVEN** the FSD layer structure
- **WHEN** checking for AI guidance
- **THEN** `shared/AGENTS.md`, `entities/AGENTS.md`, `features/AGENTS.md`, `widgets/AGENTS.md` MUST exist

#### Scenario: AGENTS.md content

- **GIVEN** a layer AGENTS.md file
- **WHEN** reading its content
- **THEN** it MUST describe layer purpose, import rules, and code patterns

---

### Requirement: FSD Skill Integration

The project MUST have a `cyberk-fsd-fe` skill in `.agents/skills/` adapted for ORPC patterns.

#### Scenario: Skill exists

- **GIVEN** the .agents/skills/ directory
- **WHEN** looking for FSD skill
- **THEN** `cyberk-fsd-fe/SKILL.md` MUST exist

#### Scenario: Skill adapted for ORPC

- **GIVEN** the cyberk-fsd-fe skill
- **WHEN** reading API examples
- **THEN** examples MUST use ORPC patterns (not Axios)
