import { expect, test } from "@playwright/test";

function getTodoItem(page: import("@playwright/test").Page, text: string) {
  return page.getByRole("listitem").filter({ has: page.getByText(text, { exact: true }) });
}

async function createTodoViaUI(page: import("@playwright/test").Page, text: string) {
  await page.getByPlaceholder(/add/i).fill(text);
  await page.getByRole("button", { name: /add/i }).click();
  await expect(getTodoItem(page, text)).toBeVisible();
}

function getEditingTodoItem(page: import("@playwright/test").Page) {
  return page
    .getByRole("listitem")
    .filter({ has: page.getByRole("textbox") })
    .first();
}

test.describe("Edit Todo", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/todos");
    await expect(page.getByText("Todo List")).toBeVisible();
  });

  test("edit todo via edit button and save with Enter", async ({ page }) => {
    const todoText = `Edit-btn-${Date.now()}`;
    const updatedText = `Updated-${Date.now()}`;

    await createTodoViaUI(page, todoText);

    const todoItem = getTodoItem(page, todoText);
    await todoItem.getByRole("button", { name: "Edit todo" }).click();

    const editingItem = getEditingTodoItem(page);
    const editInput = editingItem.getByRole("textbox");
    await expect(editInput).toBeVisible();
    await expect(editInput).toHaveValue(todoText);

    await editInput.fill(updatedText);
    await editInput.press("Enter");

    await expect(getTodoItem(page, updatedText)).toBeVisible();
    await expect(getTodoItem(page, todoText)).toHaveCount(0);
  });

  test("cancel edit with Escape key", async ({ page }) => {
    const todoText = `Edit-escape-${Date.now()}`;

    await createTodoViaUI(page, todoText);

    const todoItem = getTodoItem(page, todoText);
    await todoItem.getByRole("button", { name: "Edit todo" }).click();

    const editingItem = getEditingTodoItem(page);
    const editInput = editingItem.getByRole("textbox");
    await expect(editInput).toBeVisible();

    await editInput.fill("Should not save");
    await editInput.press("Escape");

    await expect(getTodoItem(page, todoText)).toBeVisible();
    await expect(page.getByText("Should not save", { exact: true })).toHaveCount(0);
  });

  test("edit todo via double-click on text", async ({ page }) => {
    const todoText = `Edit-dblclick-${Date.now()}`;
    const updatedText = `Dblclick-edited-${Date.now()}`;

    await createTodoViaUI(page, todoText);

    await getTodoItem(page, todoText).getByText(todoText, { exact: true }).dblclick();

    const editingItem = getEditingTodoItem(page);
    const editInput = editingItem.getByRole("textbox");
    await expect(editInput).toBeVisible();

    await editInput.fill(updatedText);
    await editInput.press("Enter");

    await expect(getTodoItem(page, updatedText)).toBeVisible();
  });
});
