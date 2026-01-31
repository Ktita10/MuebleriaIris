---
name: muebleria-astro
description: >
  Astro 5-specific patterns for MuebleriaIris.
  Trigger: When working with Astro pages, routing, SSR, Islands, or integrations.
license: Apache-2.0
metadata:
  author: muebleria-iris
  version: "1.0"
  scope: [root]
  auto_invoke:
    - "Working with Astro routing"
    - "Creating Astro pages"
    - "Using Astro Islands"
    - "Configuring Astro integrations"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

# muebleria-astro

## Cuándo usar

Usa esta habilidad cuando:

- Crees o modifiques páginas de Astro
- Trabajes con enrutamiento basado en archivos
- Uses la arquitectura de Astro Islands
- Configures integraciones (@astrojs/react)
- Realices Renderizado del lado del servidor (SSR)
- Realices Generación de sitios estáticos (SSG)

---

## Stack Tecnológico

```
Astro 5.16.4 | Enrutamiento basado en archivos | Arquitectura Islands
Híbrido SSR + SSG | Integración @astrojs/react
```

---

## Patrones Críticos

### Patrón 1: Estructura de Componente Astro

```astro
---
// Frontmatter (se ejecuta en el servidor, una sola vez)
import Layout from '@/layouts/Layout.astro';
import { ProductCard } from '@/components/ui/ProductCard';

interface Props {
  title: string;
}

const { title } = Astro.props;

// Obtener datos en el servidor (se ejecuta en build o request time)
const response = await fetch('http://localhost:5000/api/productos');
const productos = await response.json();
---

<!-- Plantilla (HTML + componentes) -->
<Layout title={title}>
  <main>
    <h1>{title}</h1>
    {productos.map(p => (
      <ProductCard {...p} client:load />
    ))}
  </main>
</Layout>
```

### Patrón 2: Enrutamiento Basado en Archivos

```
src/pages/
├── index.astro                  → /
├── productos/
│   ├── index.astro             → /productos
│   ├── [id].astro              → /productos/123
│   └── categoria/
│       └── [slug].astro        → /productos/categoria/sofas
├── admin/
│   ├── index.astro             → /admin
│   └── productos.astro         → /admin/productos
└── api/
    └── products.json.ts        → /api/products.json (API endpoint)
```

### Patrón 3: Arquitectura Islands

```astro
---
// Componente React interactivo en Astro
import { ProductCard } from '@/components/ui/ProductCard';
import { ShoppingCart } from '@/components/ui/ShoppingCart';
---

<div>
  <!-- Estático (sin JS enviado) -->
  <h1>Productos</h1>
  
  <!-- Interactivo al cargar la página -->
  <ProductCard client:load nombre="Sofá" precio={1500} />
  
  <!-- Interactivo cuando es visible -->
  <ProductCard client:visible nombre="Mesa" precio={800} />
  
  <!-- Interactivo en inactividad -->
  <ShoppingCart client:idle />
  
  <!-- Hidratar inmediatamente (para interactividad crítica) -->
  <button client:only="react">Comprar Ahora</button>
</div>
```

---

## Directivas de Cliente

```astro
<!-- SIN JavaScript (HTML estático) -->
<Component />

<!-- Cargar inmediatamente -->
<Component client:load />

<!-- Cargar cuando sea visible (lazy load) -->
<Component client:visible />

<!-- Cargar cuando el navegador esté inactivo -->
<Component client:idle />

<!-- Cargar en media query -->
<Component client:media="(max-width: 768px)" />

<!-- Solo lado cliente (sin SSR) -->
<Component client:only="react" />
```

**Elige sabiamente:**
- `client:load` → UI crítica (navegación, formularios)
- `client:visible` → Debajo del pliegue (tarjetas de productos)
- `client:idle` → No crítico (chat, modales)

---

## Rutas Dinámicas

```astro
---
// src/pages/productos/[id].astro
export async function getStaticPaths() {
  // Generar todas las rutas posibles en tiempo de construcción
  const productos = await fetch('http://localhost:5000/api/productos').then(r => r.json());
  
  return productos.map(p => ({
    params: { id: p.id.toString() },
    props: { producto: p }
  }));
}

const { id } = Astro.params;
const { producto } = Astro.props;
---

<Layout title={producto.nombre}>
  <h1>{producto.nombre}</h1>
  <p>${producto.precio}</p>
</Layout>
```

---

## Endpoints API

```typescript
// src/pages/api/productos.json.ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const productos = await fetch('http://localhost:5000/api/productos').then(r => r.json());
  
  return new Response(
    JSON.stringify(productos),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
};

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  
  // Proxy al backend Flask
  const response = await fetch('http://localhost:5000/api/productos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  return new Response(await response.text(), {
    status: response.status
  });
};
```

---

## Layouts

```astro
---
// src/layouts/Layout.astro
import '@/styles/global.css';

interface Props {
  title: string;
  description?: string;
}

const { title, description = 'Sistema ERP MuebleriaIris' } = Astro.props;
---

<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <meta name="description" content={description} />
    <title>{title}</title>
  </head>
  <body>
    <slot />
  </body>
</html>
```

---

## Configuración (astro.config.mjs)

```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Integrations
  integrations: [react()],
  
  // Vite config
  vite: {
    plugins: [tailwindcss()]
  },
  
  // Output mode
  output: 'static',  // o 'server' para SSR
  
  // Build config
  build: {
    assets: '_astro'
  },
  
  // Server config
  server: {
    port: 4321,
    host: true
  }
});
```

---

## Árboles de Decisión

### Cuándo usar Astro vs React

```
¿Necesitas datos del servidor?     → Página Astro
¿Contenido estático?               → Componente Astro
¿Necesitas interactividad?         → Componente React con directiva client:*
¿Formulario con validación?        → Componente React
¿SEO crítico?                      → Página Astro (SSR/SSG)
¿Necesitas actualizaciones reales? → Componente React con client:load
```

### ¿Qué directiva de cliente?

```
¿Interacción crítica?              → client:load
¿Debajo del pliegue?               → client:visible
¿No crítico?                       → client:idle
¿Solo móvil?                       → client:media
¿No necesitas SSR?                 → client:only
```

---

## Patrones Comunes

### Obtener Datos en el Servidor

```astro
---
// Se ejecuta una vez en tiempo de construcción/solicitud
const productos = await fetch('http://localhost:5000/api/productos')
  .then(r => r.json())
  .catch(() => []);  // Fallback
---

<div>
  {productos.length === 0 ? (
    <p>No hay productos</p>
  ) : (
    productos.map(p => <ProductCard {...p} />)
  )}
</div>
```

### Pasar Props a Islands

```astro
---
import { InteractiveCard } from '@/components/ui/InteractiveCard';

const data = { id: 1, name: 'Producto' };
---

<!-- Pasar datos del servidor al componente cliente -->
<InteractiveCard client:load data={data} />
```

---

## Comandos

```bash
npm run dev          # Servidor de desarrollo (localhost:4321)
npm run build        # Construir para producción
npm run preview      # Vista previa de la construcción
npm run astro add react  # Agregar integración
npm run astro check  # Verificación de tipos
```

---

## Checklist de QA

- [ ] Usar directiva client:* solo cuando sea necesario
- [ ] Obtener datos en frontmatter (lado del servidor)
- [ ] Usar la directiva de cliente adecuada (load/visible/idle)
- [ ] Las rutas dinámicas tienen getStaticPaths()
- [ ] Los layouts son reutilizables
- [ ] Los endpoints API devuelven códigos de estado adecuados
- [ ] Meta etiquetas SEO en las páginas
- [ ] No se envía JavaScript innecesario
```