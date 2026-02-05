---
name: tailwind-patterns
description: 'TailwindCSS 4 patterns for responsive, maintainable UI. Use when styling components, creating responsive layouts, implementing design systems, or optimizing CSS bundle. Triggers: "tailwind", "responsive", "css classes", "dark mode", "design tokens", "utility classes".'
license: MIT
metadata:
  framework: tailwindcss
  version: "4.x"
---

# TailwindCSS 4 Patterns

Patrones y mejores prácticas para TailwindCSS 4 en proyectos de producción.

## Cuándo Usar Esta Skill

- Estilizar componentes React/Astro
- Crear layouts responsive
- Implementar sistema de diseño
- Optimizar bundle CSS
- Configurar dark mode

## Principios Fundamentales

1. **Utility-First**: Componer estilos con clases utilitarias
2. **Responsive por defecto**: Mobile-first con breakpoints
3. **Consistencia**: Usar design tokens del sistema
4. **Legibilidad**: Agrupar clases por categoría

## Orden de Clases (Recomendado)

```tsx
<div className="
  {/* 1. Layout */}
  flex flex-col items-center justify-between
  {/* 2. Sizing */}
  w-full max-w-md h-auto min-h-screen
  {/* 3. Spacing */}
  p-4 px-6 py-8 m-2 gap-4
  {/* 4. Typography */}
  text-lg font-semibold text-gray-900
  {/* 5. Background */}
  bg-white bg-gradient-to-r from-blue-500
  {/* 6. Border */}
  border border-gray-200 rounded-lg
  {/* 7. Effects */}
  shadow-lg opacity-90
  {/* 8. Transitions */}
  transition-all duration-300 ease-in-out
  {/* 9. States */}
  hover:bg-gray-100 focus:ring-2 active:scale-95
  {/* 10. Responsive */}
  sm:flex-row md:text-xl lg:p-8
">
```

## Patrones de Componentes

### Button Variants

```tsx
// Button.tsx
const variants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300',
  outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
  ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function Button({ variant = 'primary', size = 'md', children, ...props }) {
  return (
    <button
      className={`
        inline-flex items-center justify-center
        font-medium rounded-lg
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Card Pattern

```tsx
// Card.tsx
export function Card({ children, className = '' }) {
  return (
    <div className={`
      bg-white rounded-xl
      border border-gray-200
      shadow-sm hover:shadow-md
      transition-shadow duration-200
      overflow-hidden
      ${className}
    `}>
      {children}
    </div>
  );
}

export function CardHeader({ children }) {
  return <div className="px-6 py-4 border-b border-gray-100">{children}</div>;
}

export function CardBody({ children }) {
  return <div className="px-6 py-4">{children}</div>;
}

export function CardFooter({ children }) {
  return <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">{children}</div>;
}
```

### Input Pattern

```tsx
// Input.tsx
export function Input({ label, error, ...props }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-2
          text-gray-900 placeholder-gray-400
          bg-white border rounded-lg
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-0
          ${error 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          }
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
```

## Layouts Responsive

### Grid Responsive

```tsx
// ProductGrid.tsx
<div className="
  grid gap-6
  grid-cols-1      /* Mobile: 1 columna */
  sm:grid-cols-2   /* Tablet: 2 columnas */
  lg:grid-cols-3   /* Desktop: 3 columnas */
  xl:grid-cols-4   /* Wide: 4 columnas */
">
  {products.map(product => <ProductCard key={product.id} {...product} />)}
</div>
```

### Container Pattern

```tsx
// Container.tsx
export function Container({ children, className = '' }) {
  return (
    <div className={`
      w-full mx-auto px-4
      sm:px-6 lg:px-8
      max-w-7xl
      ${className}
    `}>
      {children}
    </div>
  );
}
```

### Stack Pattern (Vertical Spacing)

```tsx
// Stack.tsx
const gaps = {
  xs: 'space-y-1',
  sm: 'space-y-2',
  md: 'space-y-4',
  lg: 'space-y-6',
  xl: 'space-y-8',
};

export function Stack({ gap = 'md', children }) {
  return <div className={gaps[gap]}>{children}</div>;
}
```

## Tailwind CSS 4 Features

### CSS Variables Nativas

```css
/* tailwind.config.cjs ya no es necesario para tokens básicos */
/* Usa CSS variables directamente */

@theme {
  --color-brand: #1a56db;
  --color-brand-hover: #1e40af;
  --font-display: 'Inter', sans-serif;
  --radius-card: 0.75rem;
}
```

```tsx
// Uso en componentes
<button className="bg-[--color-brand] hover:bg-[--color-brand-hover]">
  Click
</button>
```

### Container Queries

```tsx
// Componente que responde a su contenedor, no al viewport
<div className="@container">
  <div className="@sm:flex @lg:grid @lg:grid-cols-2">
    {/* Responde al tamaño del contenedor padre */}
  </div>
</div>
```

## Patrones de E-commerce

### Product Card

```tsx
export function ProductCard({ name, price, image, originalPrice, badge }) {
  return (
    <div className="group relative bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors">
      {/* Badge */}
      {badge && (
        <span className="absolute top-3 left-3 z-10 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-full">
          {badge}
        </span>
      )}
      
      {/* Image */}
      <div className="aspect-square overflow-hidden bg-gray-100">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="font-medium text-gray-900 line-clamp-2">{name}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">
            ${price.toLocaleString()}
          </span>
          {originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              ${originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
      
      {/* Hover Actions */}
      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-white via-white opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Agregar al carrito
        </button>
      </div>
    </div>
  );
}
```

### Price Display

```tsx
export function Price({ amount, currency = 'MXN', size = 'md' }) {
  const sizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };
  
  return (
    <span className={`font-bold text-gray-900 ${sizes[size]}`}>
      <span className="text-[0.6em] align-super">{currency}</span>
      {amount.toLocaleString('es-MX')}
    </span>
  );
}
```

## Dark Mode

### Setup

```tsx
// Con class strategy (recomendado)
<html className="dark">
  {/* Todo hereda dark mode */}
</html>
```

### Componente con Dark Mode

```tsx
<div className="
  bg-white dark:bg-gray-900
  text-gray-900 dark:text-gray-100
  border-gray-200 dark:border-gray-700
">
  <h2 className="text-gray-900 dark:text-white">Título</h2>
  <p className="text-gray-600 dark:text-gray-400">Descripción</p>
</div>
```

## Animaciones

### Transiciones Suaves

```tsx
// Base transitions para estados
const transitions = {
  colors: 'transition-colors duration-200',
  transform: 'transition-transform duration-200',
  all: 'transition-all duration-300',
  slow: 'transition-all duration-500',
};

// Uso
<button className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
  Hover me
</button>
```

### Animaciones con Keyframes

```tsx
// Spin
<div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />

// Pulse
<div className="animate-pulse bg-gray-200 h-4 rounded" />

// Bounce
<div className="animate-bounce">↓</div>
```

## Checklist de Calidad

- [ ] ¿Mobile-first? (sin prefijo = mobile, sm: tablet, lg: desktop)
- [ ] ¿Clases ordenadas consistentemente?
- [ ] ¿Estados interactivos? (hover, focus, active, disabled)
- [ ] ¿Focus visible para accesibilidad?
- [ ] ¿Transiciones suaves en interacciones?
- [ ] ¿Espaciado consistente? (usa escala: 1, 2, 4, 6, 8...)
- [ ] ¿Colores del sistema de diseño?
- [ ] ¿Dark mode soportado si es necesario?

## Anti-Patrones

### ❌ Clases duplicadas

```tsx
// MAL
<div className="p-4 p-6 text-lg text-sm">

// BIEN
<div className="p-6 text-sm">
```

### ❌ Estilos inline cuando hay utilidad

```tsx
// MAL
<div style={{ marginTop: '16px' }}>

// BIEN
<div className="mt-4">
```

### ❌ Responsive sin mobile-first

```tsx
// MAL (desktop-first)
<div className="grid-cols-4 md:grid-cols-2 sm:grid-cols-1">

// BIEN (mobile-first)
<div className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
```
