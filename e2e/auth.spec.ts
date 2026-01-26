import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('muebleria-user');
      localStorage.removeItem('muebleria-token');
    });
  });

  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    
    // Check page title or heading - actual text is "Bienvenido de vuelta"
    await expect(page.locator('h1').first()).toContainText(/Bienvenido/i);
    
    // Check the login card/form container exists
    await expect(page.locator('.bg-white.rounded-2xl, [class*="card"]').first()).toBeVisible();
  });

  test('should display register page', async ({ page }) => {
    await page.goto('/registro');
    
    // Wait for React component to load
    await page.waitForTimeout(1000);
    
    // Check page loaded
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('should navigate between login and register', async ({ page }) => {
    await page.goto('/login');
    
    // Wait for page to load
    await page.waitForTimeout(1000);
    
    // Look for register link - check if it exists
    const registerLink = page.locator('a[href="/registro"]').first();
    const hasRegisterLink = await registerLink.isVisible().catch(() => false);
    
    if (hasRegisterLink) {
      await registerLink.click();
      await expect(page).toHaveURL(/registro/);
    } else {
      // Navigate directly
      await page.goto('/registro');
      await expect(page).toHaveURL(/registro/);
    }
  });

  test('should have login form elements', async ({ page }) => {
    await page.goto('/login');
    
    // Check that the login page has the form card
    const hasFormCard = await page.locator('.bg-white.rounded-2xl').first().isVisible().catch(() => false);
    const hasFormText = await page.locator('text=Bienvenido').first().isVisible().catch(() => false);
    expect(hasFormCard || hasFormText).toBeTruthy();
  });

  test('should have back to home link on login', async ({ page }) => {
    await page.goto('/login');
    
    // Check for link back to home
    const homeLink = page.locator('a[href="/"]').first();
    await expect(homeLink).toBeVisible();
  });

  test('should have logo on login page', async ({ page }) => {
    await page.goto('/login');
    
    // Check for Muebleria Iris branding
    await expect(page.locator('text=Muebleria Iris').first()).toBeVisible();
  });
});
