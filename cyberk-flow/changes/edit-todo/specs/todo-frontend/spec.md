## ADDED Requirements

### Requirement: Edit Todo API

The API SHALL provide an `update` procedure that updates the text of an existing todo by ID.

#### Scenario: Successfully update todo text

- **WHEN** client calls `orpc.todo.update` with `{ id: 1, text: "Updated text" }`
- **THEN** the todo with id 1 SHALL have its text updated to "Updated text"
- **AND** the response SHALL return the update result
- **AND** the todo list cache SHALL be invalidated

#### Scenario: Reject empty or whitespace-only text

- **WHEN** client calls `orpc.todo.update` with `{ id: 1, text: "" }` or `{ id: 1, text: "   " }`
- **THEN** the request SHALL be rejected by Zod validation (trim + min length 1)

### Requirement: Inline Edit UI

The TodoItem component SHALL support an inline edit mode allowing users to modify the todo text directly in the list.

#### Scenario: Enter edit mode

- **WHEN** user double-clicks on the todo text span OR clicks the edit icon button
- **THEN** the text span SHALL be replaced with an input field pre-filled with the current text
- **AND** the input field SHALL be focused with all text selected
- **AND** the text element SHALL NOT use `<label htmlFor>` to avoid triggering checkbox toggle on click

#### Scenario: Save edit via Enter key

- **WHEN** user is in edit mode and presses Enter
- **AND** the input text is non-empty and different from original
- **THEN** the `onEdit` callback SHALL be called with `(id, newText)`
- **AND** the component SHALL exit edit mode

#### Scenario: Cancel edit via Escape key

- **WHEN** user is in edit mode and presses Escape
- **THEN** the input text SHALL revert to the original value
- **AND** the component SHALL exit edit mode

#### Scenario: Cancel edit via blur

- **WHEN** user is in edit mode and clicks outside the input
- **THEN** the edit SHALL be cancelled and revert to display mode

#### Scenario: Ignore save when text unchanged

- **WHEN** user presses Enter but text is identical to original
- **THEN** the component SHALL exit edit mode without calling `onEdit`

### Requirement: Edit Todo Mutation Hook

The web app SHALL provide a `useEditTodo` mutation hook following the FSD feature pattern.

#### Scenario: Successful edit triggers cache invalidation and toast

- **WHEN** the edit mutation succeeds
- **THEN** `todoQueries.all()` query cache SHALL be invalidated
- **AND** a success toast "Todo updated" SHALL be displayed

### Requirement: Edit Todo Screen Wiring

The TodosScreen SHALL wire the edit functionality from feature to entity layers.

#### Scenario: Screen passes onEdit handler

- **WHEN** TodosScreen renders the TodoList
- **THEN** it SHALL pass an `onEdit` callback that calls `editMutation.mutate({ id, text })`
