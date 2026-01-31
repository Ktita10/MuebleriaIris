---
name: muebleria-react
description: >
  React 19 patterns for MuebleriaIris interactive components.
  Trigger: When writing React components with hooks, forms, or state management.
license: Apache-2.0
metadata:
  author: muebleria-iris
  version: "1.0"
  scope: [root]
  auto_invoke:
    - "Creating React components"
    - "Using React hooks"
    - "Building forms with validation"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

# muebleria-react

## Cuándo usar

Usa esta habilidad cuando:

- Crees componentes interactivos de React
- Uses hooks (useState, useEffect, etc.)
- Construyas formularios con validación
- Gestiones estado del lado del cliente
- Obtengas datos de una API

---

## Stack Tecnológico

```
React 19.2.1 | TypeScript | React Hooks
No useMemo/useCallback (El compilador de React lo maneja)
```

---

## Patrones Críticos

### Patrón 1: Estructura de Componente

```tsx
// src/components/ui/ComponentName.tsx
import { useState, useEffect } from 'react';

interface ComponentNameProps {
  title: string;
  onAction: () => void;
}

export function ComponentName({ title, onAction }: ComponentNameProps) {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    // Efectos secundarios
  }, []);
  
  return <div>{title}</div>;
}
```

### Patrón 2: Petición de API

```tsx
import { useState, useEffect } from 'react';

export function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetch('http://localhost:5000/api/productos')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);
  
  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {products.map(p => <ProductCard key={p.id} {...p} />)}
    </div>
  );
}
```

### Patrón 3: Manejo de Formularios

```tsx
import { useState } from 'react';

export function ProductForm() {
  const [formData, setFormData] = useState({
    nombre: '',
    precio: 0,
    material: ''
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const response = await fetch('http://localhost:5000/api/productos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (response.ok) {
      alert('Producto creado');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.nombre}
        onChange={e => setFormData({...formData, nombre: e.target.value})}
      />
      <button type="submit">Crear</button>
    </form>
  );
}
```

---

## Características de React 19

### No useMemo/useCallback

El compilador de React optimiza automáticamente:

```tsx
// ❌ ANTIGUO (React 18)
const filtered = useMemo(() => {
  return items.filter(i => i.active);
}, [items]);

// ✅ NUEVO (React 19)
const filtered = items.filter(i => i.active);
// El compilador memoriza automáticamente
```

### Componentes de Servidor (con Astro)

```tsx
// Componente de cliente
"use client";
import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

---

## Hooks Comunes

```tsx
// Estado
const [value, setValue] = useState(initialValue);

// Efectos secundarios
useEffect(() => {
  // Se ejecuta después del renderizado
  return () => {
    // Limpieza
  };
}, [dependencies]);

// Refs
const inputRef = useRef<HTMLInputElement>(null);

// Contexto
const theme = useContext(ThemeContext);
```

---

## Integración con TypeScript

```tsx
// Interfaz de Props
interface ProductCardProps {
  id: number;
  nombre: string;
  precio: number;
  onSelect?: (id: number) => void;
}

// Estado con tipo
const [product, setProduct] = useState<Product | null>(null);

// Manejadores de eventos
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  console.log(e.currentTarget);
};
```

---

## Comandos

```bash
# Sin comandos específicos de React (manejados por Astro/npm)
npm run dev    # Inicia servidor de desarrollo con soporte React
```

---

## Checklist de QA

- [ ] Componentes usan interfaces TypeScript
- [ ] Estados de carga para operaciones asíncronas
- [ ] Manejo de errores para llamadas API
- [ ] No useMemo/useCallback (React 19)
- [ ] Limpieza adecuada en useEffect
- [ ] Keys en renderizado de listas
- [ ] Accesibilidad (ARIA, navegación por teclado)

---

## Recursos

- **Docs React 19**: https://react.dev
- **Referencia de Hooks**: https://react.dev/reference/react
