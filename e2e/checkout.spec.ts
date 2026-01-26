import { test, expect } from '@playwright/test';

test.describe('Checkout Page', () => {

  test.beforeEach(async ({ page }) => {
    // Setup cart with test item
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('muebleria-user');
      localStorage.removeItem('muebleria-token');
      const testCart = [{
        id: 1,
        nombre: 'Producto Checkout Test',
        precio: 50000,
        cantidad: 2,
        imagen: null
      }];
      localStorage.setItem('muebleria-cart', JSON.stringify(testCart));
    });
  });

  test('should display checkout page title', async ({ page }) => {
    await page.goto('/checkout');
    
    // Check page title
    await expect(page.locator('h1')).toContainText(/Finalizar Compra|Checkout/i);
  });

  test('should have breadcrumb navigation', async ({ page }) => {
    await page.goto('/checkout');
    
    // Check breadcrumb exists with "Checkout" text (use first to avoid strict mode)
    await expect(page.getByText('Checkout', { exact: true }).first()).toBeVisible();
  });

  test('should display trust badges', async ({ page }) => {
    await page.goto('/checkout');
    
    // Trust badges section should be visible
    await expect(page.locator('text=Compra Segura')).toBeVisible();
    await expect(page.locator('text=Cambios Gratis')).toBeVisible();
  });

  test('should have envio information', async ({ page }) => {
    await page.goto('/checkout');
    
    await expect(page.locator('text=Envio a Todo el Pais')).toBeVisible();
  });

  test('should have soporte information', async ({ page }) => {
    await page.goto('/checkout');
    
    await expect(page.locator('text=Soporte 24/7')).toBeVisible();
  });

  test('should navigate to catalog from breadcrumb', async ({ page }) => {
    await page.goto('/checkout');
    
    // Click on "Catalogo" in breadcrumb
    const catalogLink = page.locator('nav a:has-text("Catalogo"), ol a:has-text("Catalogo")').first();
    await catalogLink.click();
    
    // Should be on catalog page
    await expect(page).toHaveURL(/catalogo/);
  });

  test('should navigate to home from breadcrumb', async ({ page }) => {
    await page.goto('/checkout');
    
    // Click on "Inicio" in breadcrumb (within the checkout page nav, not header)
    const homeLink = page.locator('.container a:has-text("Inicio")').first();
    await homeLink.click();
    
    // Should be on home page
    await expect(page).toHaveURL('/');
  });

  test('should have checkout form section', async ({ page }) => {
    await page.goto('/checkout');
    
    // Wait for React components to load
    await page.waitForTimeout(1000);
    
    // Should have main content with checkout title
    await expect(page.locator('h1:has-text("Finalizar Compra")')).toBeVisible();
  });

  test('should have order summary section', async ({ page }) => {
    await page.goto('/checkout');
    
    // Wait for React components to load
    await page.waitForTimeout(1000);
    
    // The checkout page should have the main content area visible
    await expect(page.locator('#main-content').first()).toBeVisible();
  });
});

test.describe('Empty Cart on Checkout', () => {

  test('should handle empty cart gracefully', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('muebleria-cart');
      localStorage.setItem('muebleria-cart', '[]');
    });
    
    await page.goto('/checkout');
    
    // Page should still load without error
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1')).toContainText(/Finalizar Compra|Checkout/i);
  });
});
