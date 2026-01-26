import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    // Title has space: "Muebleria Iris"
    await expect(page).toHaveTitle(/Muebleria Iris/i);
  });

  test('should have navigation menu', async ({ page }) => {
    await page.goto('/');
    // Use first() to handle multiple nav elements
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });

  test('should have main content', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#main-content, main')).toBeVisible();
  });

  test('should have footer', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('footer')).toBeVisible();
  });
});
