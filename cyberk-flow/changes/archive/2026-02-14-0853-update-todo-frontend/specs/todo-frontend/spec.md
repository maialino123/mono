## ADDED Requirements

### Requirement: Todo List API Migration

The frontend applications SHALL use the new `list` endpoint instead of `getAll` for fetching todos.

#### Scenario: Web app fetches todos with pagination

- **WHEN** the web app loads the todos screen
- **THEN** it SHALL call `orpc.todo.list` with default pagination params `{ page: 1, limit: 10 }`
- **AND** it SHALL extract `items` array from the response for display

#### Scenario: Native app fetches todos with pagination

- **WHEN** the native app loads the todos screen
- **THEN** it SHALL call `orpc.todo.list` with default pagination params `{ page: 1, limit: 10 }`
- **AND** it SHALL extract `items` array from the response for display

### Requirement: Paginated Response Handling

The frontend applications SHALL handle the new paginated response structure `{ items, total, page, totalPages }`.

#### Scenario: Web app displays todo count from paginated response

- **WHEN** todos are loaded
- **THEN** the total count SHALL be derived from `response.total`
- **AND** the items SHALL be accessed via `response.items`

#### Scenario: Native app displays todo count from paginated response

- **WHEN** todos are loaded
- **THEN** the completed count SHALL be calculated from `response.items.filter(t => t.completed)`
- **AND** the total count SHALL be derived from `response.items.length` or `response.total`

### Requirement: Web Pagination UI

The web application SHALL provide pagination controls for navigating todo pages.

#### Scenario: User navigates to next page

- **WHEN** user clicks "Next" button
- **AND** current page is less than total pages
- **THEN** the page number SHALL increment
- **AND** todos for the new page SHALL be fetched

#### Scenario: User navigates to previous page

- **WHEN** user clicks "Previous" button
- **AND** current page is greater than 1
- **THEN** the page number SHALL decrement
- **AND** todos for the new page SHALL be fetched

#### Scenario: Pagination buttons are disabled appropriately

- **WHEN** on first page
- **THEN** "Previous" button SHALL be disabled
- **WHEN** on last page
- **THEN** "Next" button SHALL be disabled

### Requirement: CRUD Operation Feedback

The frontend applications SHALL provide visual feedback for create, delete, and toggle operations.

#### Scenario: Web app shows success toast on todo creation

- **WHEN** a new todo is successfully created
- **THEN** a success toast/snackbar SHALL be displayed with message like "Todo created"

#### Scenario: Web app shows success toast on todo deletion

- **WHEN** a todo is successfully deleted
- **THEN** a success toast/snackbar SHALL be displayed with message like "Todo deleted"

#### Scenario: Web app shows success toast on todo toggle

- **WHEN** a todo is successfully toggled
- **THEN** a success toast/snackbar SHALL be displayed with message like "Todo updated"

#### Scenario: Native app shows feedback on todo creation

- **WHEN** a new todo is successfully created
- **THEN** visual feedback (toast or alert) SHALL be displayed

#### Scenario: Native app shows feedback on todo deletion

- **WHEN** a todo is successfully deleted
- **THEN** visual feedback (toast or alert) SHALL be displayed

### Requirement: Todo Type Update

The Todo interface SHALL include the `createdAt` field from the updated schema.

#### Scenario: Todo type includes createdAt

- **WHEN** defining the Todo type/interface
- **THEN** it SHALL include `createdAt: string` (ISO date string)
