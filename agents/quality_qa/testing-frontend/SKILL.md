---
name: muebleria-test-ui
description: >
  Frontend testing patterns for MuebleriaIris UI components.
  Trigger: When writing tests for Astro pages or React components.
license: Apache-2.0
metadata:
  author: muebleria-iris
  version: "1.0"
  scope: [root]
  auto_invoke:
    - "Writing frontend tests"
    - "Testing React components"
    - "E2E testing with Playwright"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

# muebleria-test-ui

## Cuándo usar

Usa esta habilidad cuando:

- Escribas tests unitarios para componentes React
- Pruebes páginas Astro
- Realices pruebas E2E con Playwright
- Pruebes integración de API
- Asegures funcionalidad de UI

---

## Estrategia de Pruebas

### Tipos de Test

```
Tests Unitarios    → Componentes individuales (React Testing Library)
Integración        → Interacción Componente + API
Tests E2E          → Flujos de usuario completos (Playwright)
Tests Visuales     → Comparación de capturas de pantalla
```

---

## Patrones Críticos

### Patrón 1: Test de Componente React

```tsx
// src/components/ui/__tests__/ProductCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ProductCard } from '../ProductCard';

describe('ProductCard', () => {
  it('renders product information', () => {
    render(
      <ProductCard 
        nombre="Sofá 3 Cuerpos"
        precio={1500}
        imagen_principal="/sofá.jpg"
      />
    );
    
    expect(screen.getByText('Sofá 3 Cuerpos')).toBeInTheDocument();
    expect(screen.getByText('$1500')).toBeInTheDocument();
  });
  
  it('calls onAddToCart when button clicked', () => {
    const mockHandler = jest.fn();
    render(<ProductCard {...props} onAddToCart={mockHandler} />);
    
    fireEvent.click(screen.getByText('Agregar al Carrito'));
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });
});
```

### Patrón 2: Test E2E (Playwright)

```typescript
// tests/e2e/products.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Product Catalog', () => {
  test('displays product list', async ({ page }) => {
    await page.goto('http://localhost:4321/productos');
    
    // Esperar respuesta de API
    await page.waitForSelector('[data-testid="product-card"]');
    
    // Verificar que los productos se muestran
    const products = page.locator('[data-testid="product-card"]');
    await expect(products).toHaveCount(await products.count());
  });
  
  test('filters products by category', async ({ page }) => {
    await page.goto('http://localhost:4321/productos');
    
    // Clic en filtro de categoría
    await page.click('text=Sofás');
    
    // Verificar resultados filtrados
    await expect(page.locator('text=Sofá')).toBeVisible();
  });
});
```

### Patrón 3: Mock de Llamadas API

```tsx
// Mock fetch en tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
      { id: 1, nombre: 'Producto 1', precio: 100 }
    ])
  })
) as jest.Mock;

// En test
test('fetches and displays products', async () => {
  render(<ProductList />);
  
  await waitFor(() => {
    expect(screen.getByText('Producto 1')).toBeInTheDocument();
  });
  
  expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/productos');
});
```

---

## Estructura de Tests

```
src/
├── components/
│   └── ui/
│       ├── ProductCard.tsx
│       └── __tests__/
│           └── ProductCard.test.tsx
└── tests/
    └── e2e/
        ├── products.spec.ts
        ├── cart.spec.ts
        └── checkout.spec.ts
```

---

## Comandos

```bash
# Instalar dependencias de testing
npm install -D @testing-library/react @testing-library/jest-dom
npm install -D @playwright/test

# Ejecutar tests unitarios
npm test

# Ejecutar tests E2E
npx playwright test

# Ejecutar E2E con UI
npx playwright test --ui

# Generar reporte de test
npx playwright show-report
```

---

## Mejores Prácticas

```typescript
// ✅ SÍ: Usar data-testid para selectores estables
<button data-testid="add-to-cart">Agregar</button>
await page.click('[data-testid="add-to-cart"]');

// ❌ NO: Usar contenido de texto (frágil)
await page.click('text=Agregar');  // Se rompe si el texto cambia

// ✅ SÍ: Esperar inactividad de red
await page.goto(url, { waitUntil: 'networkidle' });

// ✅ SÍ: Probar comportamiento visible para usuario
expect(screen.getByRole('button', { name: 'Agregar' })).toBeEnabled();

// ❌ NO: Probar detalles de implementación
expect(component.state.count).toBe(1);  // Estado interno
```

---

## Checklist de QA

- [ ] Tests cubren happy path + casos de error
- [ ] Mocks de API no golpean backend real
- [ ] Tests son independientes (sin estado compartido)
- [ ] Usar queries semánticas (getByRole, getByLabelText)
- [ ] Limpiar después de tests (unmount, limpiar mocks)
- [ ] Probar accesibilidad (ARIA, teclado)
- [ ] Tests E2E esperan operaciones asíncronas

---

## Recursos

- **React Testing Library**: https://testing-library.com/react
- **Playwright**: https://playwright.dev
