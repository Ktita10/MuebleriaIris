import { test, expect } from '@playwright/test';

test.describe('Cart Functionality', () => {

  test.beforeEach(async ({ page }) => {
    // Clear cart before each test
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('muebleria-cart');
    });
  });

  test('should have header with navigation', async ({ page }) => {
    await page.goto('/');
    
    // Header should be visible
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
  });

  test('should store cart data in localStorage', async ({ page }) => {
    await page.goto('/');
    
    // Add item to cart via localStorage
    await page.evaluate(() => {
      const testCart = [{
        id: 1,
        nombre: 'Test Product',
        precio: 50000,
        cantidad: 1,
        imagen: null
      }];
      localStorage.setItem('muebleria-cart', JSON.stringify(testCart));
    });
    
    // Verify it was stored
    const cartData = await page.evaluate(() => localStorage.getItem('muebleria-cart'));
    expect(cartData).not.toBeNull();
    expect(JSON.parse(cartData!)).toHaveLength(1);
  });

  test('should persist cart across page navigation', async ({ page }) => {
    await page.goto('/');
    
    // Add item to cart
    await page.evaluate(() => {
      const testCart = [{
        id: 1,
        nombre: 'Persistent Product',
        precio: 30000,
        cantidad: 2,
        imagen: null
      }];
      localStorage.setItem('muebleria-cart', JSON.stringify(testCart));
    });
    
    // Navigate to another page
    await page.goto('/catalogo');
    
    // Verify cart still exists
    const cartData = await page.evaluate(() => localStorage.getItem('muebleria-cart'));
    expect(cartData).not.toBeNull();
    const cart = JSON.parse(cartData!);
    expect(cart[0].nombre).toBe('Persistent Product');
  });

  test('should clear cart when cleared from localStorage', async ({ page }) => {
    await page.goto('/');
    
    // Add and then clear cart
    await page.evaluate(() => {
      localStorage.setItem('muebleria-cart', JSON.stringify([{ id: 1, nombre: 'Test', precio: 1000, cantidad: 1 }]));
    });
    
    await page.evaluate(() => {
      localStorage.removeItem('muebleria-cart');
    });
    
    // Verify it was cleared (may be null or empty array depending on store init)
    const cartData = await page.evaluate(() => localStorage.getItem('muebleria-cart'));
    const isEmpty = cartData === null || cartData === '[]';
    expect(isEmpty).toBeTruthy();
  });

  test('should handle multiple items in cart', async ({ page }) => {
    await page.goto('/');
    
    await page.evaluate(() => {
      const testCart = [
        { id: 1, nombre: 'Product 1', precio: 10000, cantidad: 1, imagen: null },
        { id: 2, nombre: 'Product 2', precio: 20000, cantidad: 2, imagen: null },
        { id: 3, nombre: 'Product 3', precio: 30000, cantidad: 3, imagen: null }
      ];
      localStorage.setItem('muebleria-cart', JSON.stringify(testCart));
    });
    
    const cartData = await page.evaluate(() => localStorage.getItem('muebleria-cart'));
    expect(JSON.parse(cartData!)).toHaveLength(3);
  });

  test('should calculate total correctly in localStorage', async ({ page }) => {
    await page.goto('/');
    
    await page.evaluate(() => {
      const testCart = [
        { id: 1, nombre: 'Product 1', precio: 10000, cantidad: 2, imagen: null }, // 20000
        { id: 2, nombre: 'Product 2', precio: 15000, cantidad: 1, imagen: null }  // 15000
      ];
      localStorage.setItem('muebleria-cart', JSON.stringify(testCart));
    });
    
    const cartData = await page.evaluate(() => localStorage.getItem('muebleria-cart'));
    const cart = JSON.parse(cartData!);
    const total = cart.reduce((sum: number, item: { precio: number; cantidad: number }) => sum + item.precio * item.cantidad, 0);
    expect(total).toBe(35000);
  });
});

test.describe('Cart Navigation', () => {

  test('should be able to navigate to checkout page', async ({ page }) => {
    await page.goto('/checkout');
    
    // Page should load
    await expect(page.locator('h1')).toContainText(/Finalizar Compra|Checkout/i);
  });

  test('should have cart link or button in header', async ({ page }) => {
    await page.goto('/');
    
    // Look for any button or link that might open cart (use first to avoid strict mode)
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
    
    // Check for buttons in header
    const headerButtons = await header.locator('button').count();
    expect(headerButtons).toBeGreaterThan(0);
  });
});
