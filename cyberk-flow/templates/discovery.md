# Discovery: <Feature Name>

## 1. Feature Summary
<1-2 sentence description>

## 2. Workstreams Used / Skipped

| Workstream           | Used? | Justification |
| -------------------- | ----- | ------------- |
| Architecture Snapshot | ✅/⏭️  | ...           |
| Internal Patterns    | ✅/⏭️  | ...           |
| External Patterns    | ✅/⏭️  | ...           |
| Constraint Check     | ✅/⏭️  | ...           |
| Documentation        | ✅/⏭️  | ...           |

## 3. Architecture Snapshot

### Relevant Packages
| Package        | Purpose | Key Files |
| -------------- | ------- | --------- |
| `packages/...` | ...     | ...       |

### Entry Points
- API: ...
- UI: ...

## 4. Internal Patterns

### Similar Implementations
| Feature | Location | Pattern Used |
| ------- | -------- | ------------ |
| ...     | ...      | ...          |

### Reusable Utilities
- Validation: ...
- Error handling: ...

## 5. Constraint Check
- Dependencies: ...
- Build Requirements: ...
- Database: ...

## 6. External Patterns & Documentation
- Library Docs: ...
- Similar Projects: ...
- API Docs: ...

## 7. Gap Analysis (Synthesized)
| Component | Have        | Need          | Gap Size |
| --------- | ----------- | ------------- | -------- |
| API       | None        | POST /v1/auth | New      |
| DB        | User Schema | 2FA Columns   | Small    |

## 8. Key Decisions

| Decision | Options Considered | Chosen | Rationale |
| -------- | ------------------ | ------ | --------- |
| ...      | ...                | ...    | ...       |

<!-- If multiple viable solutions, add decision diagram + pros/cons for approval gate -->

## 9. Options Comparison _(only if multiple viable solutions)_

```mermaid
flowchart TD
    Problem --> OptionA
    Problem --> OptionB
```

| Option   | Pros | Cons | Recommendation |
| -------- | ---- | ---- | -------------- |
| Option A | ...  | ...  | ...            |
| Option B | ...  | ...  | ...            |

## 10. Risks & Constraints
- **Must**: [hard constraints — security, compat, perf]
- **Should**: [soft constraints — conventions, preferences]

## 11. Open Questions
- [ ] ...
