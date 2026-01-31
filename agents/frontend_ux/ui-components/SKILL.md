---
name: muebleria-ui
description: >
  MuebleriaIris UI patterns: Astro + React + TailwindCSS v4.
  Trigger: When working in src/ on components, layouts, pages, or Astro-specific patterns.
license: Apache-2.0
metadata:
  author: muebleria-iris
  version: "1.0"
  scope: [root]
  auto_invoke:
    - "Creating/modifying UI components"
    - "Working on Astro layouts and pages"
    - "Styling with TailwindCSS v4"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

# muebleria-ui

## Cuándo usar

Usa esta habilidad cuando:

- Crees o modifiques componentes Astro (archivos `.astro`)
- Construyas componentes React para UI interactiva
- Trabajes con estilos TailwindCSS v4
- Estructures layouts y páginas
- Integres frontend con API Flask

---

## Stack Tecnológico (Versiones)

```
Astro 5.16.4 | React 19.2.1 | TailwindCSS 4.1.17
TypeScript (strict mode) | @astrojs/react 4.4.2
```

---

## Patrones Críticos

### Patrón 1: Decisión Astro vs React

```
¿Contenido estático?          → componente .astro
¿Necesita interactividad?     → componente React .tsx
¿Formulario con validación?   → React + react-hook-form
¿Obtención de datos?          → Astro (lado servidor) o React (lado cliente)
```

### Patrón 2: Organización de Componentes

```
src/
├── components/
│   ├── ui/              # Primitivas UI reutilizables
│   ├── data/            # Componentes de visualización de datos
│   ├── desktop/         # Layouts específicos de escritorio
│   ├── mobile/          # Layouts específicos de móvil
│   └── {feature}/       # Componentes específicos de funcionalidad
├── layouts/
│   └── Layout.astro     # Wrapper base de layout
└── pages/
    └── *.astro          # Rutas (enrutamiento basado en archivos)
```

---

## Ejemplos de Código

### Ejemplo 1: Layout Astro

```astro
---
// src/layouts/Layout.astro
import '@/styles/global.css';

interface Props {
  title: string;
}

const { title } = Astro.props;
---

<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>{title} - MuebleriaIris</title>
  </head>
  <body>
    <slot />
  </body>
</html>
```

### Ejemplo 2: Componente React

```tsx
// src/components/ui/ProductCard.tsx
interface ProductCardProps {
  nombre: string;
  precio: number;
  imagen_principal: string;
}

export function ProductCard({ nombre, precio, imagen_principal }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <img src={imagen_principal} alt={nombre} className="w-full h-48 object-cover" />
      <h3 className="text-lg font-semibold mt-2">{nombre}</h3>
      <p className="text-xl text-green-600">${precio}</p>
    </div>
  );
}
```

---

## Comandos

```bash
npm run dev          # localhost:4321
npm run build        # Build de producción
npm run preview      # Preview del build
```

---

## Recursos

- **Referencia API**: Ver `backend/app/routes.py`
