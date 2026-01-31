---
name: muebleria-mobile
description: >
  Mobile-responsive patterns for MuebleriaIris UI.
  Trigger: When working on mobile layouts, responsive design, or mobile-first components.
license: Apache-2.0
metadata:
  author: muebleria-iris
  version: "1.0"
  scope: [root]
  auto_invoke:
    - "Creating mobile layouts"
    - "Implementing responsive design"
    - "Working on mobile-first components"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

# muebleria-mobile

## Cuándo usar

Usa esta habilidad cuando:

- Crees diseños específicos para móvil
- Implementes diseño responsivo con Tailwind
- Optimices para rendimiento móvil
- Construyas componentes mobile-first
- Pruebes en diferentes tamaños de pantalla

---

## Estrategia Mobile-First

```
1. Diseñar para móvil primero (pantallas más pequeñas)
2. Usar breakpoints de Tailwind para agregar características de escritorio
3. Probar en dispositivos reales
4. Optimizar imágenes y recursos
5. Implementar UI amigable al tacto
```

---

## Patrones Críticos

### Patrón 1: Breakpoints de Tailwind

```tsx
// Enfoque Mobile-first
<div className="
  w-full              {/* Móvil: ancho completo */}
  p-4                 {/* Móvil: padding 16px */}
  sm:w-1/2            {/* Pequeño: 50% ancho */}
  md:w-1/3            {/* Mediano: 33% ancho */}
  lg:w-1/4            {/* Grande: 25% ancho */}
  lg:p-8              {/* Grande: 32px padding */}
">
  Contenido
</div>
```

**Breakpoints:**
- `sm:` 640px y superior
- `md:` 768px y superior
- `lg:` 1024px y superior
- `xl:` 1280px y superior
- `2xl:` 1536px y superior

### Patrón 2: Estructura de Componente

```
src/components/
├── mobile/
│   ├── MobileNav.tsx        # Navegación móvil
│   ├── MobileProductCard.tsx
│   └── MobileFilters.tsx
├── desktop/
│   ├── DesktopNav.tsx       # Navegación escritorio
│   └── DesktopSidebar.tsx
└── ui/
    └── ProductCard.tsx       # Componente responsivo
```

### Patrón 3: Componente Responsivo

```tsx
// src/components/ui/ProductCard.tsx
export function ProductCard({ nombre, precio, imagen }: Props) {
  return (
    <div className="
      bg-white rounded-lg shadow-md
      p-3 sm:p-4 md:p-6                    {/* Padding responsivo */}
      w-full sm:w-1/2 lg:w-1/3             {/* Ancho responsivo */}
    ">
      <img 
        src={imagen} 
        alt={nombre}
        className="
          w-full h-32 sm:h-40 md:h-48      {/* Altura responsiva */}
          object-cover
        " 
      />
      <h3 className="
        text-base sm:text-lg md:text-xl    {/* Texto responsivo */}
        font-semibold mt-2
      ">
        {nombre}
      </h3>
      <p className="text-lg sm:text-xl text-green-600">
        ${precio}
      </p>
    </div>
  );
}
```

---

## Patrón de Navegación Móvil

```tsx
// src/components/mobile/MobileNav.tsx
import { useState } from 'react';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      {/* Botón hamburguesa (solo móvil) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden p-2"
      >
        <svg>...</svg>
      </button>
      
      {/* Menú lateral (drawer) */}
      {isOpen && (
        <div className="
          fixed inset-0 z-50 bg-black bg-opacity-50
          lg:hidden
        ">
          <nav className="
            fixed right-0 top-0 h-full w-64
            bg-white shadow-lg
            transform transition-transform
          ">
            {/* Ítems del menú */}
          </nav>
        </div>
      )}
      
      {/* Nav escritorio (oculto en móvil) */}
      <nav className="hidden lg:flex gap-4">
        {/* Ítems del menú */}
      </nav>
    </>
  );
}
```

---

## Interfaz Amigable al Tacto

```tsx
// Objetivo táctil mínimo: 44x44px
<button className="
  min-h-[44px] min-w-[44px]     {/* Objetivo táctil */}
  p-3                            {/* Padding cómodo */}
  active:scale-95                {/* Feedback táctil */}
  transition-transform
">
  Tócame
</button>

// Espaciado entre elementos interactivos
<div className="space-y-4">      {/* Espacio vertical 16px */}
  <button>Botón 1</button>
  <button>Botón 2</button>
</div>
```

---

## Optimización de Rendimiento

```astro
---
// src/pages/productos.astro

// Optimizar imágenes para móvil
import { Image } from 'astro:assets';
---

<Image
  src={producto.imagen}
  alt={producto.nombre}
  width={400}
  height={300}
  loading="lazy"                  {/* Carga diferida de imágenes */}
  format="webp"                   {/* Formato moderno */}
/>
```

---

## Grid Responsivo

```tsx
// Grid auto-responsivo
<div className="
  grid
  grid-cols-1              {/* Móvil: 1 columna */}
  sm:grid-cols-2           {/* Pequeño: 2 columnas */}
  md:grid-cols-3           {/* Mediano: 3 columnas */}
  lg:grid-cols-4           {/* Grande: 4 columnas */}
  gap-4
">
  {products.map(p => <ProductCard key={p.id} {...p} />)}
</div>
```

---

## Pruebas en Móvil

```bash
# Chrome DevTools
1. Abrir DevTools (F12)
2. Alternar barra de herramientas de dispositivo (Ctrl+Shift+M)
3. Seleccionar dispositivo (iPhone, iPad, etc.)
4. Probar interacciones táctiles

# Pruebas en dispositivo real
npm run dev -- --host
# Acceder desde móvil: http://TU_IP:4321
```

---

## Patrones Comunes

### Mostrar/Ocultar Basado en Tamaño de Pantalla

```tsx
{/* Mostrar solo en móvil */}
<div className="block lg:hidden">
  <MobileSidebar />
</div>

{/* Mostrar solo en escritorio */}
<div className="hidden lg:block">
  <DesktopSidebar />
</div>

{/* Componentes diferentes para tamaños diferentes */}
<div className="block md:hidden">
  <MobileNav />
</div>
<div className="hidden md:block">
  <DesktopNav />
</div>
```

### Tipografía Responsiva

```tsx
<h1 className="
  text-2xl sm:text-3xl md:text-4xl lg:text-5xl
  font-bold
">
  Encabezado
</h1>

<p className="
  text-sm sm:text-base md:text-lg
  leading-relaxed
">
  Texto del cuerpo
</p>
```

---

## Checklist de QA

- [ ] Probar en múltiples tamaños de pantalla (320px, 768px, 1024px, 1920px)
- [ ] Objetivos táctiles mínimo 44x44px
- [ ] Texto es legible sin hacer zoom
- [ ] Sin scroll horizontal
- [ ] Imágenes cargan rápido (optimizadas)
- [ ] Formularios son usables en móvil
- [ ] Navegación es accesible
- [ ] Probar en dispositivos móviles reales

---

## Recursos

- **Tailwind Responsive**: https://tailwindcss.com/docs/responsive-design
- **Mejores Prácticas Web Móvil**: Guía móvil de Web.dev
