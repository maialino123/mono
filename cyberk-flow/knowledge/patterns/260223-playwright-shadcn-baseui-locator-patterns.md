---
labels: [playwright, shadcn, e2e, locators]
source: migrated-from-docs/knowledge/playwright-shadcn-baseui-locators.md
summary: When writing Playwright E2E tests for components using shadcn/ui (which wraps @base-ui/react), standard locator strategies can fail due to how base-ui renders DOM elements.
---
# Playwright shadcn BaseUI Locator Patterns
**Date**: 2026-02-23

# Playwright E2E Testing with shadcn/ui + @base-ui/react

## Context

When writing Playwright E2E tests for components using shadcn/ui (which wraps `@base-ui/react`), standard locator strategies can fail due to how base-ui renders DOM elements.

## Key Findings

### @base-ui/react Input DOM Output

The shadcn `Input` component (`@/shared/shadcn/input.tsx`) wraps `@base-ui/react`'s `Input`, which renders via `Field.Control`. The final DOM is a **plain `<input>` element** with implicit `textbox` role.

| Attribute | Source | Notes |
|---|---|---|
| `data-slot="input"` | shadcn wrapper | **NOT** from base-ui — added by the shadcn component via spread props |
| `role` (implicit `textbox`) | Native `<input>` | No explicit `role` attribute; use `getByRole('textbox')` |
| `id` | base-ui auto-generated | Unstable IDs like `:r0:` — **do not use** for selectors |
| `data-dirty`, `data-touched`, etc. | base-ui state | Only present after user interaction |

### Critical: `hasText` vs `<input value>`

**Playwright's `filter({ hasText })` matches inner text content, NOT `<input>` `value` attributes.**

When a component switches from display mode (`<span>text</span>`) to edit mode (`<input value="text">`), `hasText` will **no longer match** the element:

```typescript
// ❌ FAILS after entering edit mode — hasText doesn't match input values
const todoItem = page.getByRole("listitem").filter({ hasText: "My Todo" });
const editInput = todoItem.getByRole("textbox"); // not found!

// ✅ WORKS — scope to parent container, find textbox directly
const list = page.getByRole("list");
const editInput = list.getByRole("textbox");
await expect(editInput).toHaveValue("My Todo");
```

### Locator Strategy for shadcn Components

```typescript
// ✅ Preferred: role-based locators
page.getByRole("textbox", { name: "Email" })  // if labeled
page.getByRole("textbox")                      // if only one textbox in scope
page.getByRole("button", { name: "Edit todo" }) // aria-label on Button
page.getByRole("checkbox")                      // shadcn Checkbox
page.getByPlaceholder("Add a new task...")      // placeholder text

// ✅ Scoping: narrow down with container roles
const list = page.getByRole("list");
const editInput = list.getByRole("textbox");

// ⚠️ Use hasText ONLY when text is in a text node (span, p, div), not input value
page.getByRole("listitem").filter({ hasText: "My Todo" }) // only works in view mode

// ❌ Avoid: unstable auto-generated IDs
page.locator("#\\:r0\\:")  // changes across renders
```

## Common Pitfalls

### 1. `waitForLoadState("networkidle")` Hangs

Next.js dev server maintains HMR websocket connections, causing `networkidle` to never resolve.

```typescript
// ❌ Hangs in dev mode
await page.waitForLoadState("networkidle");

// ✅ Wait for specific UI element
await expect(page.getByText("Todo List")).toBeVisible();
```

### 2. Stale Test Data

E2E tests that create data without cleanup will accumulate stale items, causing:
- Strict mode violations (multiple elements match)
- Pagination pushing new items off-screen

```typescript
// ✅ Use unique text + cleanup in beforeEach
const uniqueText = `Test-${Date.now()}`;

async function deleteAllTodos(page: Page) {
  const maxAttempts = 20;
  for (let i = 0; i < maxAttempts; i++) {
    const count = await page.getByRole("button", { name: "Delete todo" }).count();
    if (count === 0) break;
    await page.getByRole("button", { name: "Delete todo" }).first().click();
    await page.waitForTimeout(500);
  }
}
```

### 3. Inline Edit Pattern (span ↔ input toggle)

Components that toggle between `<span>` (view) and `<input>` (edit) need different locator strategies per state:

```typescript
// View mode: text in <span> — use getByText or hasText filter
await page.getByText("My Todo").dblclick();

// Edit mode: text in <input value> — use getByRole scoped to container
const editInput = page.getByRole("list").getByRole("textbox");
await expect(editInput).toBeVisible();
await expect(editInput).toHaveValue("My Todo");
await editInput.fill("Updated");
await editInput.press("Enter");
```

### 4. Timeout Strategy

The global `playwright.config.ts` timeout (90s) is sized for heavy flows (Web3/SIWE). Fast CRUD test suites should set their own timeout at describe level:

```typescript
test.describe("Edit Todo", () => {
  // Fast CRUD tests — fail quickly instead of waiting 90s global timeout
  test.setTimeout(15_000);
  // ...
});
```

Rule of thumb: **set timeout to ~5x the expected runtime**. A 3s test → 15s timeout. Failures surface in seconds, not minutes.

## Debugging Tips

- Use `playwright-cli` to inspect live DOM snapshots and identify exact element roles/refs
- Use `playwright-cli snapshot` to see the accessibility tree (same as what `getByRole` queries)
- Check screenshots in `test-results/` for visual state at failure point
- Avoid `--trace` and `--video` during debugging iterations (adds overhead/hangs)
