import { test, expect } from '@playwright/test';

test.describe('Landing Page (Sora Theme)', () => {
  test('should display Sora header with profile', async ({ page }) => {
    await page.goto('/');

    // Header should be visible with data-testid
    await expect(page.locator('[data-testid="sora-header"]')).toBeVisible();

    // Profile section visible
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Avatar image should be present
    await expect(page.locator('[data-testid="sora-header"] img')).toBeVisible();
  });

  test('should display showcase card with product', async ({ page }) => {
    await page.goto('/');

    // Showcase card should be visible
    await expect(page.locator('[data-testid="showcase-card"]')).toBeVisible();

    // Should have product image
    await expect(page.locator('[data-testid="showcase-card"] img').first()).toBeVisible();

    // Should have CTA button
    await expect(
      page.locator('[data-testid="showcase-card"] button')
    ).toBeVisible();
  });

  test('should display link cards when available', async ({ page }) => {
    await page.goto('/');

    // Check if link cards exist
    const linkCards = page.locator('[data-testid="link-card"]');
    const count = await linkCards.count();

    if (count > 0) {
      // If link cards exist, verify they're visible
      await expect(linkCards.first()).toBeVisible();
      await expect(linkCards.first().locator('img')).toBeVisible();
    }
    // If no link cards, that's OK - depends on data
  });

  test('should NOT contain banned keywords in HTML', async ({ page }) => {
    await page.goto('/');

    const html = await page.content();
    const bannedKeywords = ['shopee', 'lazada', 'mua ngay', 'giảm giá'];

    for (const keyword of bannedKeywords) {
      expect(html.toLowerCase()).not.toContain(keyword);
    }
  });

  test('should have proper meta tags for SEO', async ({ page }) => {
    await page.goto('/');

    // Title
    await expect(page).toHaveTitle(/decor|góc/i);

    // Meta description
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute('content', /.+/);

    // OG image
    const ogImage = page.locator('meta[property="og:image"]');
    await expect(ogImage).toHaveAttribute('content', /.+/);
  });

  test('should NOT auto-redirect on page load', async ({ page }) => {
    await page.goto('/');

    // Wait 3 seconds - should stay on same page
    await page.waitForTimeout(3000);

    expect(page.url()).toBe('http://localhost:3002/');
  });

  test('showcase card button should be clickable', async ({ page }) => {
    await page.goto('/');

    const ctaButton = page.locator('[data-testid="showcase-card"] button');
    await expect(ctaButton).toBeEnabled();
    await expect(ctaButton).toBeVisible();
  });

  test('link cards should be interactive when present', async ({ page }) => {
    await page.goto('/');

    const linkCard = page.locator('[data-testid="link-card"]').first();
    const count = await page.locator('[data-testid="link-card"]').count();

    if (count > 0) {
      await expect(linkCard).toBeEnabled();

      // Cards should be clickable buttons
      const role = await linkCard.getAttribute('role');
      expect(role).toBe('button');
    }
  });

  test('should have Sora-themed colors and styling', async ({ page }) => {
    await page.goto('/');

    // Check for Sora background color
    const mainDiv = page.locator('div').first();
    const bgClass = await mainDiv.locator('div').first().getAttribute('class');

    // Should contain sora theme classes
    expect(bgClass || '').toMatch(/sora|bg-/);
  });
});
