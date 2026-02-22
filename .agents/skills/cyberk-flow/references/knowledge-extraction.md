# Knowledge Extraction

Extract knowledge from threads and persist to `cyberk-flow/knowledge/` via `cf learn`.

## Pipeline Overview

```
0. Bootstrap   — read this reference, orient in project
1. Discover    — find related threads via cluster_of
2. Extract     — read threads, pull candidate topics
3. Verify      — check factual claims against actual code
4. Dedup       — search existing knowledge (memory + filesystem)
5. Reconcile   — Oracle synthesizes: topics + verification + dedup → action per topic
6. Store       — execute `bun run cf learn` commands
```

---

## Phase 1: Discover

Find all threads in the work chain:

```
find_thread cluster_of:<thread-id>
```

Read up to **7 threads** from the cluster. Prioritize threads with the most substantive work (implementation, debugging, decisions).

## Phase 2: Extract

Read each thread with a goal template matched to the work type:

### Goal Templates for `read_thread`

**Architecture / Decision:**

```
Extract architectural decisions, patterns established, design rationale,
trade-offs considered, and alternatives rejected. Include file paths.
```

**Feature:**

```
Extract feature requirements, implementation approach, API surface,
usage examples, and configuration options.
```

**Refactor:**

```
Extract what was refactored, motivation, approach taken,
pattern changes, and migration guidance.
```

**Bug Fix:**

```
Extract bug description, root cause, fix approach,
and patterns to prevent recurrence.
```

**Research:**

```
Extract research findings, libraries/tools evaluated, comparison results,
recommendations, and applicability to our codebase.
```

### Output Format

For each extracted topic, record internally:

| Field          | Description                                                         |
| -------------- | ------------------------------------------------------------------- |
| title          | Short descriptive title                                             |
| category       | decisions / debugging / patterns / research / conventions           |
| summary        | 1-sentence description for search/listing (auto-derived if omitted) |
| body           | Rich markdown content (~200-750 words) with sections                |
| labels         | Domain labels (comma-separated)                                     |
| source         | Thread ID (T-xxx)                                                   |
| confidence     | high / medium / low                                                 |
| factual_claims | List of claims that reference code, files, APIs, behavior           |

### Body Structure

Adapt sections per category. All entries MUST have TL;DR + Evidence. Other sections are category-specific.

**All categories:**

```markdown
## TL;DR

- Key points (1-3 bullets)

## Context

Why this matters, what triggered it

## Evidence

- File paths, line numbers, symbols
- Commands, config keys, API endpoints

## When to apply

- [symptom / log signature / code shape that signals this knowledge is relevant]
```

**Debugging** — add root cause ladder + prevention gate:

```markdown
## Root cause

- Symptom: [what was observed]
- Immediate cause: [direct trigger]
- Deeper cause: [system/design flaw]

## Fix

What was done, with specifics

## Prevention gate

BEFORE [risky action]:

- Check: [specific condition / invariant]
- If fails: [what to do instead]
```

**Decisions** — add trade-offs:

```markdown
## Decision

What was chosen, with rationale

## Trade-offs

Alternatives considered, why rejected
```

**Patterns / Conventions** — add prevention gate when applicable:

```markdown
## Pattern

What to do, with specifics

## Prevention gate (optional)

BEFORE [action]:

- Check: [condition]
- If fails: [alternative]
```

### Category Mapping

| Thread Signal                                                  | Category    |
| -------------------------------------------------------------- | ----------- |
| "decided to", "chose X over Y", "trade-off", "why we"          | decisions   |
| "bug", "fix", "root cause", "debugging", "mistake", "broke"    | debugging   |
| "pattern", "always do X", "convention established", "approach" | patterns    |
| "researched", "evaluated", "compared", "library", "framework"  | research    |
| "code style", "naming", "import order", "formatting"           | conventions |

Limit to **0-3 topics** max. Prioritize knowledge that directly affects source code (architecture decisions, bug root causes, code patterns). Skip process/workflow learnings.

### Exclusion Rules

Do NOT extract:

- Knowledge about the knowledge extraction process itself (meta/self-referential)
- Trivial config values or default settings that are obvious from code
- Process steps that are already documented in reference files (e.g., archive.md, implement.md)
- Topics where the only insight is "we did X" without explaining why or trade-offs
- Generic methodology (e.g., "add logging", "do root cause analysis", "test before deploying")
  - **Exception**: methodology IS allowed when it's a concrete, reusable diagnostic heuristic tied to a specific failure mode and expressible as a prevention gate. Store as `patterns` with label `methodology`.

## Phase 3: Verify

Check factual claims against actual code. Verification level depends on **claim type**, not category:

| Level                | When                                                                                                | How                                                                                                                                             |
| -------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **V2 (mandatory)**   | Claims about code behavior, API shape, file paths, config, performance, bug root cause, concurrency | Use `gkg search_codebase_definitions` / `gkg get_references` for symbols & APIs. Fallback: `finder`, `Grep`, `Read`. Batch across shared files. |
| **V1 (recommended)** | Conventions/patterns that should map to code usage                                                  | Spot-check 1-2 references via `gkg get_references` or `Grep`                                                                                    |
| **V0 (skip)**        | Pure subjective decisions or external research with no internal code assertions                     | No verification needed                                                                                                                          |

**Rules:**

- Even for **decisions**, verify factual anchors (e.g., "we changed file X", "config key is Y") when included in the summary.
- Mark each topic's verification result: `verified` / `partially-verified` / `unverified` / `skipped(V0)`.
- If verification **fails** (code doesn't match claim), downgrade confidence to `low` and note discrepancy.

## Phase 4: Dedup

Two-layer dedup to catch both indexed and un-indexed duplicates:

### Layer 1: Memory Store (semantic + keyword)

```bash
bun run cf search "<topic keywords>" --label knowledge
bun run cf search "<key file path or API name>" --label knowledge
```

### Layer 2: Filesystem (authoritative)

```bash
# Grep for title keywords in existing knowledge files
Grep pattern="<key term>" path="cyberk-flow/knowledge/"
# Read close matches to confirm overlap
Read path="cyberk-flow/knowledge/<category>/<matched-file>.md"
```

**Rule:** If either layer finds a close match, default action is `update` (not `create`). If the existing entry is already accurate and complete, action is `skip`.

## Phase 5: Reconcile

Single Oracle call that synthesizes all inputs and decides per-topic actions.

### Oracle Prompt

```
Review these knowledge extraction candidates and decide what to store.

## Inputs
1. Extracted topics (with verification status, confidence, and draft body)
2. Dedup search results (existing knowledge matches)
3. Category: {category}

## For each topic, decide:
- **create**: new knowledge, no existing match
- **update**: existing match needs refresh (provide --action update)
- **skip**: already covered, low confidence, or verification failed

## Output format (one row per topic):
| Topic | Category | Labels | Verification | Dedup | Action | Summary (1-liner) | Expires |
```

**Rules:**

- Default to **skip** when uncertain — aggressively filter, don't hoard.
- **Must have** at least one verified factual anchor (file path, symbol, API) to store.
- High confidence + verified + non-obvious insight → store.
- Medium confidence + verified → store only if it would save future agents significant time.
- Low confidence or unverified → skip (or store as `research` with `--expires 7`).
- If the topic restates what's already in reference docs or code comments → skip.

## Phase 6: Store

Execute `bun run cf learn` for each topic where action is `create` or `update`.

**IMPORTANT:** The `cf learn` script writes the markdown file and re-indexes automatically. Do NOT write to `cyberk-flow/knowledge/` directly.

### Command Format

Rich body content is passed via **stdin**. `--summary` is optional (auto-derived from first paragraph if omitted).

```bash
cat <<'EOF' | bun run cf learn "<title>" \
  --category <decisions|debugging|patterns|research|conventions> \
  --source <T-thread-id> \
  --labels <comma,separated,labels> \
  --action <create|update> \
  [--summary "<optional 1-liner for search>"] \
  [--expires <days>]
## TL;DR
- Key insight here

## Context
Why this matters...

## Decision / Fix / Pattern
What was done, with file paths and specifics...

## Evidence
- `path/to/file.ts` L42-50
- Config key: `DATABASE_TIMEOUT`
EOF
```

**Backward compat:** `--summary` alone (no stdin) still works for simple entries.

### Behavior Notes

- **Create**: writes `cyberk-flow/knowledge/<category>/YYMMDD-<slug>.md` with YAML frontmatter
- **Update**: matches by slug only (source is provenance metadata, not a matching key)
- **Summary in frontmatter**: stored as `summary:` for search/listing; body is the full content
- **Research category**: auto-expires in 14 days unless `--expires` overrides
- **Re-index**: `cf learn` calls `store.index()` automatically — no separate indexing step needed

### Examples

```bash
# Decision with rich body
cat <<'EOF' | bun run cf learn "Use Drizzle ORM" \
  --category decisions \
  --source T-abc123 \
  --labels orm,database \
  --summary "Chose Drizzle over Prisma for type safety and performance."
## TL;DR
- Drizzle chosen over Prisma for type safety and lower overhead
- Benchmarks show 2x faster queries on our schema

## Context
Evaluated ORMs for the new data layer. Key requirements: type-safe queries,
minimal runtime overhead, good migration story.

## Decision
Chose Drizzle ORM. Prisma's generated client adds 2MB+ to bundle and query
latency was consistently higher in our benchmarks.

## Evidence
- Benchmark: `scripts/benchmarks/orm-comparison.ts`
- Config: `src/db/client.ts` — `createDbClient()`

## Trade-offs
Prisma has better docs and larger community. Drizzle's migration tooling is
less mature. Accepted because performance wins outweigh.
EOF

# Simple entry (backward compat, no stdin)
bun run cf learn "Research auto-expires in 14 days" \
  --summary "Knowledge entries in research category default to 14-day expiry." \
  --category conventions \
  --source T-abc456 \
  --labels knowledge,expiry

# Update existing entry
cat <<'EOF' | bun run cf learn "Use Drizzle ORM" \
  --category decisions \
  --source T-ghi789 \
  --labels orm,database \
  --action update
## TL;DR
- Updated with production benchmark data confirming 2x faster than Prisma
- Added migration tooling workaround

## Evidence
- Production metrics: `docs/benchmarks/orm-prod-results.md`
EOF
```
