# Phase 05: Testing & Polish

**Status:** Pending
**Priority:** Medium
**Estimated Effort:** Small
**Blocked By:** Phase 04

## Context Links
- [E2E Tests](../../tests/e2e/)
- [Playwright Config](../../playwright.config.ts)

## Overview

Cập nhật E2E tests và thực hiện final polish cho Sora theme.

## Requirements

### Functional
- Update existing E2E tests for new selectors
- Add visual regression tests (optional)
- Test responsive breakpoints
- Test reduced motion

### Non-Functional
- All tests pass
- Build successful
- No console errors

## Implementation Steps

### Step 1: Update landing.spec.ts

```typescript
test('should display Sora header', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('header h1')).toContainText(/Sora|profile.name/);
});

test('should display showcase card', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-testid="showcase-card"]')).toBeVisible();
});

test('should display link cards', async ({ page }) => {
  await page.goto('/');
  const links = page.locator('[data-testid="link-card"]');
  await expect(links).toHaveCount(4);
});
```

### Step 2: Update mobile.spec.ts

```typescript
test('should render correctly on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');

  // Check centered layout
  const header = page.locator('header');
  await expect(header).toHaveCSS('text-align', 'center');
});
```

### Step 3: Add data-testid attributes

Add to components:
- `data-testid="showcase-card"` on ShowcaseCard
- `data-testid="link-card"` on LinkCard
- `data-testid="sora-header"` on SoraHeader

### Step 4: Run full test suite

```bash
bun run test
bun run build
bun run lint
```

### Step 5: Final polish

- Check font loading
- Check image optimization
- Check Lighthouse score
- Fix any accessibility issues

## Todo List

- [ ] Add data-testid to components
- [ ] Update landing.spec.ts
- [ ] Update mobile.spec.ts
- [ ] Run test suite
- [ ] Run build
- [ ] Check Lighthouse
- [ ] Fix any issues

## Success Criteria

- [ ] All E2E tests pass
- [ ] Build successful
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Lighthouse performance > 90
- [ ] Accessibility score > 90

## Risk Assessment

- **Low:** Test selectors may need adjustment → Use data-testid
- **Low:** Image optimization → Use next/image properly

## Completion

After all phases complete:
1. Run `bun run dev` to verify
2. Create PR with changes
3. Deploy to staging for review
