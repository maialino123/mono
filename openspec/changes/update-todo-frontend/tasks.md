# Tasks: Update Todo Frontend for New API

## 1. Web App Updates

- [x] 1.1 Update `todo.queries.ts` - change `getAll` to `list` with pagination params
- [x] 1.2 Update `Todo` interface in `todo-list.tsx` to include `createdAt: string`
- [x] 1.3 Update `TodoList` component to handle `items` from paginated response
- [x] 1.4 Add pagination state to `todos-screen.tsx`
- [x] 1.5 Add pagination UI controls (Previous/Next buttons)
- [x] 1.6 Add sonner/toast for create success feedback
- [x] 1.7 Add sonner/toast for delete success feedback
- [x] 1.8 Add sonner/toast for toggle success feedback

## 2. Native App Updates

- [x] 2.1 Update `todos.tsx` to use `list` endpoint with default params
- [x] 2.2 Update data access from `todos.data` to `todos.data?.items`
- [x] 2.3 Update count calculations for paginated response
- [x] 2.4 Add toast/snackbar for create success
- [x] 2.5 Add toast/snackbar for delete success
- [x] 2.6 Add toast/snackbar for toggle success

## 3. Testing & Verification

- [x] 3.1 Test web app pagination works correctly
- [x] 3.2 Test web app CRUD operations with feedback
- [x] 3.3 Test native app displays todos correctly
- [x] 3.4 Test native app CRUD operations with feedback
- [x] 3.5 Run `bun run check-types` to verify no type errors
