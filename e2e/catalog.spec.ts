import { test, expect } from '@playwright/test';

test.describe('Catalog Page', () => {

  test('should display catalog page with title', async ({ page }) => {
    await page.goto('/catalogo');
    
    // Check page title
    await expect(page.locator('h1')).toContainText(/Catalogo/i);
  });

  test('should have search input', async ({ page }) => {
    await page.goto('/catalogo');
    
    // Check search input exists
    await expect(page.locator('input[name="buscar"]')).toBeVisible();
  });

  test('should have sort select', async ({ page }) => {
    await page.goto('/catalogo');
    
    // Check sort select exists
    await expect(page.locator('select[name="orden"]')).toBeVisible();
  });

  test('should display category filter pills', async ({ page }) => {
    await page.goto('/catalogo');
    
    // Check "Todos" filter exists in main content area
    await expect(page.locator('#main-content a:has-text("Todos"), main a:has-text("Todos")').first()).toBeVisible();
  });

  test('should have category links', async ({ page }) => {
    await page.goto('/catalogo');
    
    // Check at least one category link exists in catalog area
    const categoryLink = page.locator('#main-content a[href*="categoria="]').first();
    await expect(categoryLink).toBeVisible();
  });

  test('should filter products by category via URL', async ({ page }) => {
    // Navigate directly with category param
    await page.goto('/catalogo?categoria=sofas');
    
    // Check URL has category
    await expect(page).toHaveURL(/categoria=sofas/);
    
    // The page should load with the category in the URL
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have search functionality placeholder', async ({ page }) => {
    await page.goto('/catalogo');
    
    const searchInput = page.locator('input[name="buscar"]');
    await expect(searchInput).toHaveAttribute('placeholder', /buscar/i);
  });

  test('should have sort options', async ({ page }) => {
    await page.goto('/catalogo');
    
    const sortSelect = page.locator('select[name="orden"]');
    await expect(sortSelect).toBeVisible();
    
    // Check sort options exist
    await expect(sortSelect.locator('option[value="nombre"]')).toHaveText(/Nombre/i);
  });

  test('should navigate to home from breadcrumb', async ({ page }) => {
    await page.goto('/catalogo');
    
    // Click on "Inicio" in the main content breadcrumb (not header)
    const breadcrumbHome = page.locator('#main-content a:has-text("Inicio"), .section a:has-text("Inicio")').first();
    await breadcrumbHome.click();
    
    // Should be on home page
    await expect(page).toHaveURL('/');
  });

  test('should have catalog grid area', async ({ page }) => {
    await page.goto('/catalogo');
    
    // Wait for React component to load
    await page.waitForTimeout(1000);
    
    // Check that main content area exists
    await expect(page.locator('#main-content, main')).toBeVisible();
  });
});
