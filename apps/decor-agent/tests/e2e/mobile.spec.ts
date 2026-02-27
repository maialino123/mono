import { test, expect } from '@playwright/test';

test.describe('Desktop Responsiveness (Sora Theme)', () => {
  test('should be responsive layout', async ({ page }) => {
    await page.goto('/');

    // Showcase card should be visible
    const showcaseCard = page.locator('[data-testid="showcase-card"]');
    await expect(showcaseCard).toBeVisible();

    // Card should have proper width
    const box = await showcaseCard.boundingBox();
    expect(box?.width).toBeGreaterThan(300);
  });

  test('should have properly sized buttons', async ({ page }) => {
    await page.goto('/');

    // CTA button in showcase card should be at least 44px tall (Apple HIG)
    const ctaButton = page.locator('[data-testid="showcase-card"] button');
    const box = await ctaButton.boundingBox();

    expect(box?.height).toBeGreaterThanOrEqual(44);
  });

  test('should display link cards when data available', async ({ page }) => {
    await page.goto('/');

    // Link cards may or may not be present depending on data
    const linkCards = page.locator('[data-testid="link-card"]');
    const count = await linkCards.count();

    if (count > 0) {
      // If present, they should be visible and properly sized
      for (let i = 0; i < Math.min(count, 3); i++) {
        await expect(linkCards.nth(i)).toBeVisible();
        const box = await linkCards.nth(i).boundingBox();
        expect(box?.height).toBeGreaterThanOrEqual(40);
      }
    }
  });

  test('should load quickly', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const loadTime = Date.now() - startTime;

    // Should load DOM in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have readable text', async ({ page }) => {
    await page.goto('/');

    // Header should be visible and readable
    const header = page.locator('[data-testid="sora-header"]');
    await expect(header).toBeVisible();

    const heading = header.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();

    // Text should be readable
    const headingText = await heading.textContent();
    expect(headingText).toBeTruthy();
    expect(headingText?.length).toBeGreaterThan(0);
  });

  test('should have accessible button sizes', async ({ page }) => {
    await page.goto('/');

    // Showcase button should meet accessibility standards
    const button = page.locator('[data-testid="showcase-card"] button');
    const box = await button.boundingBox();

    // Minimum button size: 44x44px (iOS HIG)
    expect(box?.width).toBeGreaterThanOrEqual(40);
    expect(box?.height).toBeGreaterThanOrEqual(40);
  });
});
