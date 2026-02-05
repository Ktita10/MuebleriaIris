---
name: astro-islands
description: 'Astro 5 Islands Architecture patterns for hybrid static/dynamic sites. Use when creating Astro components, deciding between .astro and React components, configuring client:* directives, optimizing hydration, or building pages with partial interactivity. Triggers: "astro component", "island architecture", "client directive", "hydration", "static vs dynamic".'
license: MIT
metadata:
  framework: astro
  version: "5.x"
---

# Astro Islands Architecture

Guía para construir sitios híbridos con Astro 5, optimizando la hidratación parcial y el rendimiento.

## Cuándo Usar Esta Skill

- Crear componentes `.astro`
- Decidir entre componentes Astro vs React
- Configurar directivas `client:*`
- Optimizar hidratación y bundle size
- Construir páginas con interactividad parcial

## Principio Fundamental: HTML First

```
Por defecto: HTML estático (0 KB de JS)
Solo si necesitas interactividad: Añade JavaScript (React)
```

## Decisión: Astro vs React

```
┌─────────────────────────────────────────────────────────────┐
│                    ¿Necesita el componente...?              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Estado interno (useState)?          ──► React (.tsx)       │
│  Event handlers (onClick)?           ──► React (.tsx)       │
│  Efectos secundarios (useEffect)?    ──► React (.tsx)       │
│  Formularios interactivos?           ──► React (.tsx)       │
│  Animaciones JS complejas?           ──► React (.tsx)       │
│                                                             │
│  Solo renderizado estático?          ──► Astro (.astro)     │
│  Props desde el servidor?            ──► Astro (.astro)     │
│  Contenido que no cambia?            ──► Astro (.astro)     │
│  Layout/estructura de página?        ──► Astro (.astro)     │
│  SEO-critical content?               ──► Astro (.astro)     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Directivas Client

| Directiva | Cuándo Hidratar | Caso de Uso |
|-----------|-----------------|-------------|
| `client:load` | Inmediatamente | UI crítica, above-the-fold interactivo |
| `client:idle` | Cuando el browser está idle | Componentes importantes pero no urgentes |
| `client:visible` | Cuando entra al viewport | Below-the-fold, lazy loading |
| `client:media` | Cuando coincide media query | Solo desktop/mobile |
| `client:only="react"` | Solo cliente, sin SSR | Componentes que usan APIs del browser |

### Ejemplos Prácticos

```astro
---
// Hero.astro - Estático, no necesita JS
const { title, subtitle } = Astro.props;
---

<section class="hero">
  <h1>{title}</h1>
  <p>{subtitle}</p>
</section>
```

```astro
---
// Page con Islands
import Hero from '../components/home/Hero.astro';        // Estático
import CartButton from '../components/cart/CartButton';  // Interactivo
import Newsletter from '../components/home/Newsletter.astro'; // Estático
import ProductCarousel from '../components/ProductCarousel'; // Interactivo
---

<Hero title="Bienvenido" subtitle="Los mejores muebles" />

<!-- Island: Carrito siempre disponible -->
<CartButton client:load />

<!-- Island: Carousel cuando sea visible -->
<ProductCarousel client:visible products={products} />

<Newsletter />
```

## Patrones Recomendados

### 1. Contenedor Astro + Island React

```astro
---
// CatalogPage.astro
import CatalogContainer from '../components/catalog/CatalogContainer';

// Fetch data en el servidor
const response = await fetch(`${API_URL}/productos`);
const productos = await response.json();
---

<main>
  <h1>Catálogo</h1>
  <!-- Pasar datos pre-fetched al island -->
  <CatalogContainer 
    client:load 
    initialProducts={productos}
  />
</main>
```

### 2. Componente Astro con Slots para Islands

```astro
---
// Card.astro - Estructura estática con slot para interactividad
const { title, image } = Astro.props;
---

<article class="card">
  <img src={image} alt={title} />
  <h3>{title}</h3>
  <slot name="actions" /> <!-- Island va aquí -->
</article>
```

```astro
---
// Uso
import Card from './Card.astro';
import AddToCartButton from './AddToCartButton';
---

<Card title="Silla Moderna" image="/silla.jpg">
  <AddToCartButton slot="actions" client:visible productId={123} />
</Card>
```

### 3. Evitar Prop Drilling con Context

```tsx
// CartProvider.tsx - Envuelve toda la app
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState([]);
  // ...
  return (
    <CartContext.Provider value={{ items, addItem, removeItem }}>
      {children}
    </CartContext.Provider>
  );
}
```

```astro
---
// Layout.astro
import { CartProvider } from '../components/cart/CartProvider';
---

<CartProvider client:load>
  <slot />
</CartProvider>
```

## Anti-Patrones

### ❌ No hidratar componentes estáticos

```astro
<!-- MAL: Footer no necesita JS -->
<Footer client:load />

<!-- BIEN: Footer como Astro component -->
<Footer />
```

### ❌ No usar client:load para todo

```astro
<!-- MAL: Carga todo el JS inmediatamente -->
<Comments client:load />
<RelatedProducts client:load />
<Newsletter client:load />

<!-- BIEN: Hidratación progresiva -->
<Comments client:visible />
<RelatedProducts client:idle />
<Newsletter client:visible />
```

### ❌ No pasar funciones como props a islands

```astro
---
// MAL: Las funciones no se pueden serializar
const handleClick = () => console.log('clicked');
---
<Button client:load onClick={handleClick} />

<!-- BIEN: Define la función dentro del componente React -->
```

## Optimización de Bundle

### 1. Imports Directos (No Barrel Files)

```tsx
// ❌ MAL
import { Button, Input, Modal } from '../components/ui';

// ✅ BIEN
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
```

### 2. Dynamic Imports para Componentes Pesados

```astro
---
// Solo importar si es necesario
const ProductDetail = await import('../components/ProductDetail').then(m => m.default);
---

{showDetail && <ProductDetail client:visible product={product} />}
```

### 3. Preload en Hover

```astro
---
import { prefetch } from 'astro:prefetch';
---

<a href="/producto/123" data-astro-prefetch="hover">
  Ver Producto
</a>
```

## Estructura Recomendada

```
src/
├── components/
│   ├── home/           # Mayormente .astro (estáticos)
│   │   ├── Hero.astro
│   │   ├── Features.astro
│   │   └── Newsletter.astro
│   ├── ui/             # Mixto
│   │   ├── Button.tsx      # Interactivo
│   │   ├── Input.tsx       # Interactivo
│   │   └── Card.astro      # Estático
│   ├── cart/           # Mayormente .tsx (estado)
│   │   ├── CartProvider.tsx
│   │   ├── CartButton.tsx
│   │   └── CartDrawer.tsx
│   └── catalog/        # Mayormente .tsx (filtros, búsqueda)
│       ├── CatalogContainer.tsx
│       └── CatalogFilters.tsx
├── layouts/
│   └── Layout.astro    # Siempre .astro
└── pages/
    └── *.astro         # Siempre .astro
```

## Checklist de Optimización

- [ ] ¿Todos los componentes estáticos son `.astro`?
- [ ] ¿Los islands usan la directiva `client:*` apropiada?
- [ ] ¿Los componentes below-the-fold usan `client:visible`?
- [ ] ¿El contenido crítico para SEO está en Astro?
- [ ] ¿Los datos se pre-fetchean en el servidor cuando es posible?
- [ ] ¿Evitamos barrel imports?
