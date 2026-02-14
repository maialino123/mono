## ADDED Requirements

### Requirement: Find Todo by ID

The system SHALL provide a `findById` endpoint that retrieves a single todo item by its ID with caching support.

#### Scenario: Todo exists

- **GIVEN** a todo with ID `123` exists in the database
- **WHEN** `findById({ id: 123 })` is called
- **THEN** the todo object is returned
- **AND** the response is cached with key `todo:123`

#### Scenario: Todo not found

- **GIVEN** no todo with ID `999` exists
- **WHEN** `findById({ id: 999 })` is called
- **THEN** `null` is returned (or appropriate error)

#### Scenario: Cache hit

- **GIVEN** a cached response exists for `todo:123`
- **WHEN** `findById({ id: 123 })` is called
- **THEN** the cached response is returned without database query

### Requirement: Paginated Todo List

The system SHALL provide pagination support for listing todos using offset-based pagination.

#### Scenario: Default pagination

- **GIVEN** 25 todos exist in the database
- **WHEN** `list()` is called without pagination params
- **THEN** the first 10 items are returned (default limit)
- **AND** response includes `{ items: Todo[], total: 25, page: 1, totalPages: 3 }`

#### Scenario: Custom page and limit

- **GIVEN** 50 todos exist in the database
- **WHEN** `list({ page: 2, limit: 20 })` is called
- **THEN** items 21-40 are returned
- **AND** response includes `{ items: Todo[], total: 50, page: 2, totalPages: 3 }`

#### Scenario: Last page with fewer items

- **GIVEN** 25 todos exist in the database
- **WHEN** `list({ page: 3, limit: 10 })` is called
- **THEN** items 21-25 are returned (5 items)
- **AND** response includes `{ items: Todo[], total: 25, page: 3, totalPages: 3 }`

#### Scenario: Empty page beyond data

- **GIVEN** 10 todos exist in the database
- **WHEN** `list({ page: 5, limit: 10 })` is called
- **THEN** empty items array is returned
- **AND** response includes `{ items: [], total: 10, page: 5, totalPages: 1 }`

### Requirement: Todo List Filtering

The system SHALL provide filtering capabilities for listing todos using simple query parameters.

#### Scenario: Filter by completed status

- **GIVEN** 10 todos exist: 6 completed, 4 incomplete
- **WHEN** `list({ completed: true })` is called
- **THEN** only the 6 completed todos are returned
- **AND** `total` reflects filtered count (6)

#### Scenario: Filter by text (contains search)

- **GIVEN** todos with texts: "Buy milk", "Buy bread", "Call mom"
- **WHEN** `list({ text: "buy" })` is called
- **THEN** "Buy milk" and "Buy bread" are returned (case-insensitive)
- **AND** "Call mom" is NOT returned

#### Scenario: Combined filters

- **GIVEN** todos: "Buy milk" (completed), "Buy bread" (incomplete), "Call mom" (incomplete)
- **WHEN** `list({ text: "buy", completed: false })` is called
- **THEN** only "Buy bread" is returned

#### Scenario: Filter with pagination

- **GIVEN** 25 todos matching filter `completed: true`
- **WHEN** `list({ completed: true, page: 2, limit: 10 })` is called
- **THEN** items 11-20 of filtered results are returned
- **AND** `total` is 25, `totalPages` is 3

#### Scenario: No filter results

- **GIVEN** no todos with text containing "xyz"
- **WHEN** `list({ text: "xyz" })` is called
- **THEN** empty items array is returned
- **AND** `total` is 0

### Requirement: Todo List Sorting

The system SHALL provide sorting capabilities for listing todos using `sortBy` and `sortOrder` parameters.

#### Scenario: Sort by text ascending (default)

- **GIVEN** todos: "Call mom", "Buy milk", "Study"
- **WHEN** `list({ sortBy: "text" })` is called
- **THEN** items are returned in order: "Buy milk", "Call mom", "Study"

#### Scenario: Sort by text descending

- **GIVEN** todos: "Call mom", "Buy milk", "Study"
- **WHEN** `list({ sortBy: "text", sortOrder: "desc" })` is called
- **THEN** items are returned in order: "Study", "Call mom", "Buy milk"

#### Scenario: Sort by createdAt

- **GIVEN** todos created at different times
- **WHEN** `list({ sortBy: "createdAt", sortOrder: "desc" })` is called
- **THEN** newest todos are returned first

#### Scenario: Sort with filter and pagination

- **GIVEN** 30 completed todos
- **WHEN** `list({ completed: true, sortBy: "text", page: 2, limit: 10 })` is called
- **THEN** items 11-20 are returned sorted alphabetically by text

#### Scenario: Default sort order

- **GIVEN** `sortBy` is provided without `sortOrder`
- **WHEN** `list({ sortBy: "text" })` is called
- **THEN** items are sorted in ascending order (default)

### Requirement: Tag-based Cache System

The system SHALL use tag-based caching with Redis Sets for efficient cache invalidation.

#### Scenario: List cache with tag

- **GIVEN** cache middleware is applied to list operation
- **WHEN** `list({ page: 1, limit: 10 })` is called
- **THEN** the response is cached with key `todos:{"page":1,"limit":10}`
- **AND** the key is registered in Redis Set `tag:todos`

#### Scenario: Different list params create different cache keys

- **GIVEN** `list({ page: 1 })` has been cached
- **WHEN** `list({ page: 2 })` is called
- **THEN** a new cache entry is created with key `todos:{"page":2}`
- **AND** both keys are tracked in `tag:todos` Set

#### Scenario: Single item cache key

- **GIVEN** cache middleware is applied to findById
- **WHEN** `findById({ id: 42 })` is called
- **THEN** the cache key is `todo:42`

#### Scenario: Cache invalidation by tag on create

- **GIVEN** multiple list cache entries exist (`todos:{"page":1}`, `todos:{"page":2}`)
- **WHEN** a new todo is created
- **THEN** all keys in `tag:todos` are invalidated
- **AND** the `tag:todos` Set is deleted

#### Scenario: Cache invalidation on update/delete

- **GIVEN** a todo with ID `42` is updated or deleted
- **WHEN** the mutation completes successfully
- **THEN** all keys in `tag:todos` are invalidated (list caches)
- **AND** the specific item cache `todo:42` is invalidated
