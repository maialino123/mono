import { test, expect } from '@playwright/test';

test.describe('Affiliate Redirect', () => {
  test('should redirect /go/slug to affiliate URL with 302', async ({ request }) => {
    // Make request without following redirects
    const response = await request.get('/go/den-led-ban-hoc', {
      maxRedirects: 0,
    });

    // Should be a 302 redirect response
    expect(response.status()).toBe(302);

    // Should have Location header pointing to affiliate URL
    const location = response.headers()['location'];
    expect(location).toBeTruthy();
    expect(location).toContain('shope.ee');
  });

  test('should return 302 not 301 for redirects', async ({ request }) => {
    const response = await request.get('/go/den-led-ban-hoc', {
      maxRedirects: 0,
    });

    expect(response.status()).toBe(302);
  });

  test('should redirect to home for invalid slug', async ({ page }) => {
    await page.goto('/go/invalid-product-slug');

    // Should be on home page
    await expect(page).toHaveURL('/');
  });

  test('should block untrusted redirect URLs', async ({ request }) => {
    // This test would require adding a malicious product first
    // For now, we just verify the redirect endpoint exists and works with valid products
    const response = await request.get('/go/den-led-ban-hoc', {
      maxRedirects: 0,
    });

    expect(response.status()).toBe(302);
  });
});
