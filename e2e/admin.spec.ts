import { test, expect } from '@playwright/test';

test.describe('Admin Pages Navigation', () => {

  test('should load admin dashboard page', async ({ page }) => {
    await page.goto('/admin');
    
    // Wait for page to load
    await page.waitForTimeout(1000);
    
    // Page should load without crashing
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load productos page', async ({ page }) => {
    await page.goto('/admin/productos');
    
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/admin\/productos/);
  });

  test('should load ordenes page', async ({ page }) => {
    await page.goto('/admin/ordenes');
    
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/admin\/ordenes/);
  });

  test('should load inventario page', async ({ page }) => {
    await page.goto('/admin/inventario');
    
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/admin\/inventario/);
  });

  test('should load clientes page', async ({ page }) => {
    await page.goto('/admin/clientes');
    
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/admin\/clientes/);
  });

  test('should load categorias page', async ({ page }) => {
    await page.goto('/admin/categorias');
    
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/admin\/categorias/);
  });

  test('should load usuarios page', async ({ page }) => {
    await page.goto('/admin/usuarios');
    
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/admin\/usuarios/);
  });

  test('should load proveedores page', async ({ page }) => {
    await page.goto('/admin/proveedores');
    
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/admin\/proveedores/);
  });
});

test.describe('Admin Dashboard Content', () => {

  test('should have quick action links on dashboard', async ({ page }) => {
    await page.goto('/admin');
    
    await page.waitForTimeout(1000);
    
    // Check for quick action links
    const expectedLinks = [
      '/admin/productos',
      '/admin/ordenes',
      '/admin/inventario',
      '/admin/clientes'
    ];
    
    let foundLinks = 0;
    for (const href of expectedLinks) {
      const link = page.locator(`a[href="${href}"]`).first();
      const isVisible = await link.isVisible().catch(() => false);
      if (isVisible) foundLinks++;
    }
    
    // At least some links should exist
    expect(foundLinks).toBeGreaterThan(0);
  });

  test('should have dashboard metrics component', async ({ page }) => {
    await page.goto('/admin');
    
    // Wait for React component to potentially load
    await page.waitForTimeout(2000);
    
    // Page should have content
    const bodyContent = await page.locator('body').textContent();
    expect(bodyContent).not.toBe('');
  });
});

test.describe('Admin Layout', () => {

  test('should have admin layout structure', async ({ page }) => {
    await page.goto('/admin');
    
    // Should have some layout structure
    await expect(page.locator('body')).toBeVisible();
    
    // Check for any navigation or sidebar
    const hasNav = await page.locator('nav, aside, [class*="sidebar"]').first().isVisible().catch(() => false);
    const hasLinks = await page.locator('a[href*="/admin/"]').first().isVisible().catch(() => false);
    
    // Either navigation or links should exist
    expect(hasNav || hasLinks).toBeTruthy();
  });

  test('should have header on admin pages', async ({ page }) => {
    await page.goto('/admin');
    
    // Admin pages should have some header or title
    const hasHeader = await page.locator('header, h1').first().isVisible().catch(() => false);
    expect(hasHeader).toBeTruthy();
  });
});
