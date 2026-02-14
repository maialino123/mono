# Design: Update Todo Frontend for New API

## Context

The backend Todo API has been updated with:
- Renamed endpoint: `getAll` → `list`
- Paginated response: `{ items, total, page, totalPages }`
- New query params: `page`, `limit`, `completed`, `text`, `sortBy`, `sortOrder`
- New schema field: `createdAt`

Frontend apps (web and native) must be updated to work with the new API.

## Goals / Non-Goals

**Goals:**
- Update API calls to use new `list` endpoint
- Handle paginated response structure
- Add basic pagination UI
- Add snackbar/toast feedback for mutations

**Non-Goals:**
- Advanced filtering UI (separate change)
- Advanced sorting UI (separate change)
- Infinite scroll (separate change)

## Risk Map

| Component        | Risk   | Rationale                        | Verification       |
| ---------------- | ------ | -------------------------------- | ------------------ |
| API Migration    | LOW    | Simple rename and response change| Manual test        |
| Pagination UI    | LOW    | Standard pattern exists          | N/A                |
| Snackbar (Web)   | LOW    | Use existing toast/sonner        | N/A                |
| Toast (Native)   | LOW    | Use Alert or toast library       | N/A                |

## Decisions

### 1. Pagination Approach
- **Decision**: Use simple page-based pagination with "Previous/Next" buttons
- **Alternatives**: Infinite scroll (more complex, better UX for mobile)
- **Rationale**: Simpler to implement, matches backend pagination model

### 2. Default Query Params
- **Decision**: Use `{ page: 1, limit: 10 }` as defaults
- **Rationale**: Matches backend defaults, reasonable page size

### 3. Snackbar Library (Web)
- **Decision**: Use `sonner` if available, fallback to native toast
- **Alternatives**: react-hot-toast, custom implementation
- **Rationale**: sonner is commonly used in Next.js apps

### 4. Native Feedback
- **Decision**: Use React Native's `ToastAndroid` / Alert for feedback
- **Alternatives**: External toast library
- **Rationale**: No new dependencies needed

## Migration Plan

1. Update web `todo.queries.ts` with new endpoint and params
2. Update web components to handle `{ items }` response
3. Add pagination state and UI to web
4. Add snackbar to web mutations
5. Update native `todos.tsx` with new endpoint
6. Update native data access patterns
7. Add toast feedback to native mutations

## Open Questions

None - all decisions made.
