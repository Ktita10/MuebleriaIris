# Guía Completa del Sistema de Subagentes de MuebleriaIris

## �� Tabla de Contenidos

1. [Introducción](#introducción)
2. [¿Qué son los Agent Skills?](#qué-son-los-agent-skills)
3. [Arquitectura del Sistema](#arquitectura-del-sistema)
4. [Subagentes Disponibles](#subagentes-disponibles)
5. [Cómo Funcionan los Subagentes](#cómo-funcionan-los-subagentes)
6. [Flujo de Trabajo](#flujo-de-trabajo)
7. [Configuración Inicial](#configuración-inicial)
8. [Orquestación de Subagentes](#orquestación-de-subagentes)
9. [Creación de Nuevos Skills](#creación-de-nuevos-skills)
10. [Mejores Prácticas](#mejores-prácticas)

---

## Introducción

MuebleriaIris utiliza un sistema avanzado de **Agent Skills** (Habilidades de Agente) basado en el estándar abierto de [agentskills.io](https://agentskills.io). Este sistema permite que múltiples IAs especializadas trabajen en conjunto, cada una experta en un área específica del proyecto.

### ¿Por qué usar Subagentes?

**Problemas que resuelve:**
- ❌ Las IAs genéricas no conocen convenciones específicas del proyecto
- ❌ Cometen errores al no seguir patrones establecidos
- ❌ No tienen contexto sobre la arquitectura del sistema
- ❌ Reinventan soluciones ya establecidas

**Soluciones:**
- ✅ Cada subagente es experto en su dominio
- ✅ Conocen patrones y convenciones específicas
- ✅ Mantienen consistencia en el código
- ✅ Reducen errores y tiempo de desarrollo

---

## ¿Qué son los Agent Skills?

### Definición

**Agent Skills** es un formato estándar abierto para extender las capacidades de asistentes de IA con conocimiento especializado. Originalmente desarrollado por Anthropic y adoptado por múltiples productos de IA.

### Características Clave

```yaml
# Cada skill es una carpeta con:
agents/{nombre-skill}/
├── SKILL.md              # Instrucciones y patrones
├── assets/               # Templates, schemas, recursos
└── references/           # Enlaces a documentación local
```

### Componentes de un SKILL.md

```markdown
---
name: nombre-del-skill
description: Descripción breve + Trigger (cuándo activar)
license: Apache-2.0
metadata:
  author: autor
  version: "1.0"
  scope: [root]           # Dónde aplicar
  auto_invoke:            # Cuándo invocar automáticamente
    - "Acción 1"
    - "Acción 2"
allowed-tools: Read, Edit, Write, Bash, etc.
---

## Contenido estructurado
- Patrones críticos
- Ejemplos de código
- Comandos
- Checklist de calidad
```

---

## Arquitectura del Sistema

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────┐
│            Usuario / Desarrollador                  │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│         Orquestador de IA (GitHub Copilot)          │
│           Lee AGENTS.md + Auto-invoke               │
└────────────────┬────────────────────────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
    ▼            ▼            ▼
┌─────────┐  ┌─────────┐  ┌─────────┐
│Frontend │  │Backend  │  │Database │
│  Skills │  │ Skills  │  │ Skills  │
└─────────┘  └─────────┘  └─────────┘
    │            │            │
    ▼            ▼            ▼
muebleria-ui  muebleria-api  muebleria-db
muebleria-react  muebleria-python
muebleria-mobile  muebleria-test-api
```

### Flujo de Activación

```
1. Usuario hace pregunta/tarea
   ↓
2. Orquestador analiza el contexto
   ↓
3. Consulta AGENTS.md (Auto-invoke section)
   ↓
4. Carga skills relevantes automáticamente
   ↓
5. Skill proporciona patrones y reglas
   ↓
6. IA ejecuta con conocimiento especializado
   ↓
7. Resultado consistente con proyecto
```

---

## Subagentes Disponibles

### 1. **muebleria-ui** - Frontend Astro + React

**Responsabilidad:** Desarrollo de interfaz de usuario

**Tecnologías:**
- Astro 5.16.4
- React 19.2.1
- TailwindCSS 4.1.17
- TypeScript (strict mode)

**Cuándo se activa:**
- Crear/modificar componentes en `src/`
- Trabajar con layouts y páginas Astro
- Estilizar con TailwindCSS

**Patrones clave:**
```astro
---
// Componente Astro (server-side)
const data = await fetch('/api/productos');
---
<div>{data.map(...)}</div>
```

```tsx
// Componente React (client-side)
"use client";
export function Interactive() {
  const [state, setState] = useState();
  return <button onClick={...}>Click</button>;
}
```

---

### 2. **muebleria-api** - Backend Flask

**Responsabilidad:** API REST y lógica de negocio

**Tecnologías:**
- Flask 3.0+
- SQLAlchemy 2.0+
- PostgreSQL 15+
- Flask-CORS

**Cuándo se activa:**
- Crear/modificar endpoints en `backend/app/routes.py`
- Definir modelos en `backend/app/models.py`
- Implementar lógica de negocio (órdenes, inventario)

**Patrones clave:**
```python
@main.route('/api/productos', methods=['POST'])
def create_producto():
    data = request.get_json()
    
    # Validación
    if 'nombre' not in data:
        return jsonify({'error': 'Campo requerido'}), 400
    
    # Crear + commit
    nuevo = Producto(**data)
    db.session.add(nuevo)
    db.session.commit()
    
    return jsonify({'mensaje': 'Éxito'}), 201
```

---

### 3. **muebleria-db** - Base de Datos

**Responsabilidad:** Diseño de schema y consultas SQL

**Tecnologías:**
- PostgreSQL 15+
- SQLAlchemy ORM
- Migraciones

**Cuándo se activa:**
- Modificar schema de base de datos
- Escribir consultas SQL
- Crear migraciones

**Patrones clave:**
```sql
-- Foreign keys
ALTER TABLE productos 
ADD CONSTRAINT fk_categoria 
FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria);

-- Indexes for performance
CREATE INDEX idx_productos_categoria ON productos(id_categoria);
```

---

### 4. **muebleria-python** - Desarrollo Python

**Responsabilidad:** Estándares de código Python

**Tecnologías:**
- Python 3.9+
- Virtual environments (venv)
- pip, requirements.txt

**Cuándo se activa:**
- Escribir código Python
- Gestionar dependencias
- Configurar entornos virtuales

**Patrones clave:**
```python
# Imports ordenados
from datetime import datetime
from flask import Flask
from . import db

# Error handling
try:
    db.session.commit()
except Exception as e:
    db.session.rollback()
    return jsonify({'error': str(e)}), 500
```

---

### 5. **muebleria-react** - Componentes React

**Responsabilidad:** Componentes interactivos React

**Tecnologías:**
- React 19.2.1
- React Hooks
- TypeScript

**Cuándo se activa:**
- Crear componentes React
- Usar hooks (useState, useEffect)
- Manejar formularios

**Patrones clave:**
```tsx
import { useState, useEffect } from 'react';

export function ProductList() {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    fetch('/api/productos')
      .then(res => res.json())
      .then(setProducts);
  }, []);
  
  return <div>{products.map(...)}</div>;
}
```

---

### 6. **muebleria-test-ui** - Testing Frontend

**Responsabilidad:** Tests de componentes UI

**Tecnologías:**
- React Testing Library
- Playwright (E2E)
- Jest

**Cuándo se activa:**
- Escribir tests de componentes
- Tests E2E con Playwright

**Patrones clave:**
```typescript
// Unit test
test('renders product name', () => {
  render(<ProductCard nombre="Sofá" />);
  expect(screen.getByText('Sofá')).toBeInTheDocument();
});

// E2E test
test('user can add to cart', async ({ page }) => {
  await page.goto('/productos');
  await page.click('[data-testid="add-to-cart"]');
  await expect(page.locator('.cart-count')).toHaveText('1');
});
```

---

### 7. **muebleria-test-api** - Testing Backend

**Responsabilidad:** Tests de API y modelos

**Tecnologías:**
- pytest
- pytest-flask
- SQLite in-memory

**Cuándo se activa:**
- Escribir tests de endpoints
- Tests de modelos SQLAlchemy

**Patrones clave:**
```python
def test_create_producto(client):
    data = {'sku': 'SOF001', 'nombre': 'Sofá', 'precio': 1500}
    response = client.post('/api/productos', json=data)
    
    assert response.status_code == 201
    assert response.json['producto']['sku'] == 'SOF001'
```

---

### 8. **muebleria-docs** - Documentación

**Responsabilidad:** Estándares de documentación

**Cuándo se activa:**
- Escribir README
- Documentar API
- Crear guías

**Patrones clave:**
```markdown
## API Endpoint

\`\`\`http
POST /api/productos
Content-Type: application/json
\`\`\`

**Request:**
\`\`\`json
{"nombre": "Sofá", "precio": 1500}
\`\`\`

**Response (201):**
\`\`\`json
{"mensaje": "Producto creado", "producto": {...}}
\`\`\`
```

---

### 9. **muebleria-mobile** - Diseño Responsivo

**Responsabilidad:** UI móvil y responsive

**Tecnologías:**
- TailwindCSS breakpoints
- Mobile-first design

**Cuándo se activa:**
- Crear layouts móviles
- Diseño responsivo

**Patrones clave:**
```tsx
<div className="
  w-full p-4              /* Mobile */
  sm:w-1/2 sm:p-6         /* Small screens */
  lg:w-1/3 lg:p-8         /* Large screens */
">
  Content
</div>
```

---

### 10. **pull-request** - Workflow Git

**Responsabilidad:** Convenciones de Git y PRs

**Cuándo se activa:**
- Crear pull requests
- Escribir commits
- Revisión de código

**Patrones clave:**
```bash
# Branch naming
feature/add-product-filter
fix/stock-validation

# Commit format
feat(products): add image upload
fix(orders): prevent negative stock

# PR template
## Description
## Changes Made
## Testing
```

---

### 11. **skills-creator** - Crear Skills

**Responsabilidad:** Crear nuevos subagentes

**Cuándo se activa:**
- Crear nuevo skill
- Documentar patrones repetibles

**Estructura:**
```markdown
---
name: nuevo-skill
description: Descripción + Trigger
metadata:
  scope: [root]
  auto_invoke: ["Acción"]
---

## When to Use
## Critical Patterns
## Code Examples
## Commands
```

---

### 12. **skills-sync** - Sincronización

**Responsabilidad:** Sincronizar metadata con AGENTS.md

**Cuándo se activa:**
- Después de crear/modificar skill
- Regenerar tablas Auto-invoke

**Comando:**
```bash
./agents/skill-sync/assets/sync.sh
```

---

## Cómo Funcionan los Subagentes

### Mecanismo de Activación

#### 1. **Activación Automática (Auto-invoke)**

El archivo `AGENTS.md` contiene una tabla de "Auto-invoke Skills":

```markdown
### Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action | Skill |
|--------|-------|
| Creating/modifying UI components | `muebleria-ui` |
| Working with database models | `muebleria-api` |
| Writing documentation | `muebleria-docs` |
```

Cuando el usuario pide "Crear un componente de producto", la IA:
1. Lee AGENTS.md
2. Ve "Creating/modifying UI components → muebleria-ui"
3. Carga automáticamente `agents/muebleria-ui/SKILL.md`
4. Aplica los patrones definidos

#### 2. **Activación Manual**

El usuario puede invocar skills explícitamente:

```
Read agents/muebleria-api/SKILL.md
```

#### 3. **Trigger en Metadata**

Cada skill tiene un `Trigger` en su descripción:

```yaml
description: >
  MuebleriaIris API patterns.
  Trigger: When working in backend/ on routes, models, or database operations.
```

La IA identifica el contexto y carga el skill apropiado.

---

## Flujo de Trabajo

### Escenario 1: Crear Endpoint de API

```
1. Usuario: "Necesito un endpoint para crear productos"
   ↓
2. IA analiza: trabajo en backend/ → skill muebleria-api
   ↓
3. Carga: agents/muebleria-api/SKILL.md
   ↓
4. IA lee patrones:
   - Validación de campos requeridos
   - Manejo de errores con try/except
   - Response format: jsonify({'mensaje': ..., 'producto': ...}), 201
   ↓
5. IA genera código siguiendo patrones
   ↓
6. Resultado: Endpoint consistente con proyecto
```

### Escenario 2: Crear Componente React

```
1. Usuario: "Crea un card de producto con imagen y precio"
   ↓
2. IA detecta: componente UI → skills muebleria-ui + muebleria-react
   ↓
3. Carga ambos skills
   ↓
4. IA combina patrones:
   - Estructura de componente React 19 (sin useMemo)
   - Props con TypeScript interfaces
   - TailwindCSS para estilos
   - Organización en src/components/ui/
   ↓
5. Genera: ProductCard.tsx con estilos y tipos
```

### Escenario 3: Escribir Tests

```
1. Usuario: "Necesito tests para el endpoint de productos"
   ↓
2. IA detecta: testing backend → skill muebleria-test-api
   ↓
3. Carga: agents/muebleria-test-api/SKILL.md
   ↓
4. IA aplica:
   - Fixtures con pytest
   - Mock database (SQLite in-memory)
   - Patrón Arrange-Act-Assert
   ↓
5. Genera: test_productos.py con casos de éxito y error
```

---

## Configuración Inicial

### Paso 1: Ejecutar Setup Script

```bash
cd /home/matias-fuentes/Escritorio/Proyectos/Muebleria/MuebleriaIris
./agents/setup.sh
```

**¿Qué hace?**
- Crea symlinks para cada herramienta de IA:
  - `.claude/agents/` → Claude Code / OpenCode
  - `.codex/agents/` → Codex (OpenAI)
  - `.gemini/agents/` → Gemini CLI
  - `.github/copilot-instructions.md` → GitHub Copilot
- Copia `AGENTS.md` a formatos específicos (`CLAUDE.md`, `GEMINI.md`)

### Paso 2: Reiniciar IA

Reinicia tu asistente de IA para cargar los skills.

### Paso 3: Verificar

```bash
# Verificar que los symlinks se crearon
ls -la .claude/agents/  # Debe apuntar a agents/
ls -la .codex/agents/

# Contar skills disponibles
find agents/ -name "SKILL.md" | wc -l
# Debe mostrar: 12
```

---

## Orquestación de Subagentes

### Jerarquía de Skills

```
Root (AGENTS.md)
├── Generic Skills (tecnologías)
│   ├── Python general
│   ├── React general
│   └── TypeScript general
│
└── Project-Specific Skills
    ├── muebleria-ui (Frontend)
    ├── muebleria-api (Backend)
    ├── muebleria-db (Database)
    ├── muebleria-test-* (Testing)
    └── Meta-skills
        ├── skills-creator
        └── skills-sync
```

### Scope y Auto-invoke

**Scope**: Define dónde aplica el skill

```yaml
metadata:
  scope: [root]     # Aplica a todo el proyecto
  # scope: [ui]     # Solo para UI
  # scope: [api]    # Solo para API
```

**Auto-invoke**: Define cuándo activar automáticamente

```yaml
metadata:
  auto_invoke:
    - "Creating/modifying UI components"
    - "Working on Astro layouts"
```

### Sincronización con skill-sync

Después de crear/modificar un skill:

```bash
./agents/skill-sync/assets/sync.sh
```

Esto actualiza automáticamente las tablas de Auto-invoke en `AGENTS.md`.

---

## Creación de Nuevos Skills

### Paso 1: Decidir si es Necesario

Crear skill cuando:
- ✅ Patrón se usa repetidamente
- ✅ Convenciones específicas del proyecto
- ✅ Workflows complejos que necesitan guía
- ✅ Decision trees para elegir enfoque

**NO** crear skill cuando:
- ❌ Documentación ya existe (usar referencias)
- ❌ Patrón es trivial o autoexplicativo
- ❌ Es una tarea única (one-off)

### Paso 2: Usar Template

```bash
cp agents/skills-creator/assets/SKILL-TEMPLATE.md agents/nuevo-skill/SKILL.md
```

### Paso 3: Completar Metadata

```markdown
---
name: nuevo-skill
description: >
  Descripción clara (1-2 líneas).
  Trigger: Cuándo la IA debe cargar este skill.
license: Apache-2.0
metadata:
  author: muebleria-iris
  version: "1.0"
  scope: [root]
  auto_invoke:
    - "Acción que trigger el skill"
allowed-tools: Read, Edit, Write, Bash
---
```

### Paso 4: Escribir Contenido

**Estructura recomendada:**

```markdown
## When to Use
- Condición 1
- Condición 2

## Critical Patterns
### Pattern 1: Nombre
```code example```

## Decision Tree
```
Pregunta? → Acción A
Pregunta? → Acción B
```

## Code Examples
### Example 1: Descripción
```code minimal y enfocado```

## Commands
```bash
comando1  # descripción
```

## QA Checklist
- [ ] Item de revisión

## Resources
- Link a docs locales
```

### Paso 5: Sincronizar

```bash
./agents/skill-sync/assets/sync.sh
```

### Paso 6: Registrar en AGENTS.md

Si no se agregó automáticamente:

```markdown
| `nuevo-skill` | Descripción | [SKILL.md](agents/nuevo-skill/SKILL.md) |
```

---

## Mejores Prácticas

### 1. **Mantén Skills Concisos**

- ✅ Máximo 500 líneas
- ✅ Solo lo que la IA no sabe
- ✅ Ejemplos mínimos y enfocados
- ❌ No duplicar documentación existente

### 2. **Prioriza Reglas Críticas**

```markdown
## Critical Patterns

### ALWAYS:
- Validar campos requeridos
- Usar try/except para DB operations
- Retornar JSON con status code

### NEVER:
- Exponer stack traces al cliente
- Hardcodear credenciales
- Omitir validación
```

### 3. **Usa Decision Trees**

```markdown
## Decision Tree

```
Component needs state?     → React .tsx
Component is static?       → Astro .astro
Shared across features?    → components/ui/
Feature-specific?          → components/{feature}/
```
```

### 4. **Referencias en lugar de Duplicación**

```markdown
## Resources
- **Detailed Guide**: See [docs/api-guide.md](docs/api-guide.md)
- **Model Reference**: See `backend/app/models.py`
```

### 5. **Ejemplos Reales del Proyecto**

```python
# ✅ GOOD: Ejemplo real del proyecto
from app.models import Producto
producto = Producto(sku='SOF001', nombre='Sofá')

# ❌ BAD: Ejemplo genérico
from models import Product
product = Product(id=1, name='Item')
```

### 6. **Checklist Accionable**

```markdown
## QA Checklist Before Commit
- [ ] TypeScript types defined
- [ ] Error handling present
- [ ] Tests pass (npm test)
- [ ] No console errors
```

### 7. **Mantén Versiones Actualizadas**

```markdown
## Tech Stack (Versions)
```
Astro 5.16.4 | React 19.2.1 | TailwindCSS 4.1.17
```

Actualizar cuando cambien dependencias.

---

## Troubleshooting

### Problema: Skill no se invoca automáticamente

**Solución:**
1. Verificar que existe en AGENTS.md Auto-invoke table
2. Correr `./agents/skill-sync/assets/sync.sh`
3. Reiniciar IA
4. Invocar manualmente: `Read agents/{nombre}/SKILL.md`

### Problema: Conflictos entre Skills

**Solución:**
- Skills específicos (muebleria-*) sobrescriben genéricos
- Usar `scope` para limitar aplicación
- Documentar en AGENTS.md el orden de precedencia

### Problema: IA ignora patterns

**Solución:**
- Asegurar que AGENTS.md tiene "ALWAYS invoke" (no solo "use")
- Colocar reglas críticas al inicio del skill
- Usar lenguaje imperativo: "ALWAYS", "NEVER", "MUST"

---

## Conclusión

El sistema de Agent Skills de MuebleriaIris permite:

✅ **Consistencia**: Código sigue mismos patrones
✅ **Velocidad**: IA conoce convenciones sin explicar
✅ **Calidad**: Reduce errores con guías específicas
✅ **Escalabilidad**: Fácil agregar nuevos skills
✅ **Documentación viva**: Skills son docs ejecutables

### Próximos Pasos

1. Familiarízate con skills existentes
2. Invoca skills manualmente para entender su contenido
3. Crea skills nuevos cuando identifiques patrones repetibles
4. Mantén skills actualizados con cambios del proyecto

### Recursos Adicionales

- **Agent Skills Standard**: https://agentskills.io
- **Prowler Skills (referencia)**: https://github.com/prowler-cloud/prowler/tree/master/skills
- **Documentación del Proyecto**: README.md, backend/app/models.py, backend/app/routes.py

---

**Autor**: Sistema de IA de MuebleriaIris
**Versión**: 1.0
**Fecha**: 2026-01-20
