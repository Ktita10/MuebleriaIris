---
name: muebleria-docs
description: >
  Documentation standards for MuebleriaIris project.
  Trigger: When writing or updating documentation, README files, or API docs.
license: Apache-2.0
metadata:
  author: muebleria-iris
  version: "1.0"
  scope: [root]
  auto_invoke:
    - "Writing documentation"
    - "Updating README files"
    - "Documenting API endpoints"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

# muebleria-docs

## Cuándo usar

Usa esta habilidad cuando:

- Escribas o actualices archivos README
- Documentes endpoints de API
- Crees guías para desarrolladores
- Escribas comentarios de código
- Documentes el esquema de la base de datos

---

## Tipos de Documentación

```
README.md          → Visión general del proyecto, instrucciones de configuración
API.md             → Documentación de endpoints
ARCHITECTURE.md    → Diseño del sistema, stack tecnológico
CONTRIBUTING.md    → Guías de contribución
CHANGELOG.md       → Historial de versiones
```

---

## Patrones Críticos

### Patrón 1: Estructura de README

```markdown
# Nombre del Proyecto

Breve descripción (1-2 oraciones)

## Características

- Característica 1
- Característica 2

## Stack Tecnológico

**Frontend:**
- Astro 5.16.4
- React 19.2.1
- TailwindCSS 4.1.17

**Backend:**
- Flask 3.0+
- PostgreSQL 15+
- SQLAlchemy 2.0+

## Comenzando

### Prerrequisitos

- Node.js 18+
- Python 3.9+
- PostgreSQL 15+

### Instalación

```bash
# Frontend
npm install
npm run dev

# Backend
pip install -r backend/requirements.txt
python backend/run.py
```

## Estructura del Proyecto

```
project/
├── src/            # Frontend
├── backend/        # API
└── agents/         # Agentes IA
```

## Licencia

Apache-2.0
```

### Patrón 2: Documentación de API

```markdown
## Endpoints API

### Productos

#### Obtener Todos los Productos

```http
GET /api/productos
```

**Respuesta (200):**
```json
[
  {
    "id": 1,
    "sku": "SOF001",
    "nombre": "Sofá 3 Cuerpos",
    "precio": 1500,
    "material": "Tela"
  }
]
```

#### Crear Producto

```http
POST /api/productos
Content-Type: application/json
```

**Cuerpo de la Petición:**
```json
{
  "sku": "SOF001",
  "nombre": "Sofá 3 Cuerpos",
  "precio": 1500,
  "material": "Tela",
  "id_categoria": 1
}
```

**Respuesta (201):**
```json
{
  "mensaje": "Producto creado exitosamente",
  "producto": { ... }
}
```

**Errores:**
- `400` - Campos requeridos faltantes
- `409` - SKU ya existe
- `500` - Error del servidor
```

### Patrón 3: Comentarios de Código

```python
# Python docstrings
def create_orden(data):
    """
    Crea una nueva orden de venta y descuenta inventario.
    
    Args:
        data (dict): Datos de la orden con id_cliente e items
        
    Returns:
        tuple: (response_json, status_code)
        
    Raises:
        ValueError: Si el stock es insuficiente
        
    Example:
        >>> create_orden({'id_cliente': 1, 'items': [...]})
        ({'mensaje': 'Éxito', ...}, 201)
    """
    pass
```

```typescript
// TypeScript JSDoc
/**
 * Muestra una tarjeta de producto con imagen, nombre y precio.
 * 
 * @param props - Propiedades de la tarjeta de producto
 * @param props.nombre - Nombre del producto
 * @param props.precio - Precio del producto
 * @returns Un componente de tarjeta de producto estilizado
 * 
 * @example
 * <ProductCard nombre="Sofá" precio={1500} />
 */
export function ProductCard(props: ProductCardProps) {
  // ...
}
```

---

## Mejores Prácticas de Documentación

### SÍ:
- Comenzar con una descripción clara de una oración
- Incluir ejemplos de código para cada patrón
- Mostrar formatos de petición y respuesta
- Documentar casos de error
- Usar tablas para datos estructurados
- Agregar diagramas para flujos complejos

### NO:
- Asumir conocimiento previo
- Usar jerga sin explicación
- Incluir ejemplos desactualizados
- Dejar endpoints sin documentar
- Omitir documentación de manejo de errores

---

## Convenciones Markdown

```markdown
# H1: Título de página (uno por documento)
## H2: Secciones principales
### H3: Subsecciones

**Negrita** para énfasis
*Cursiva* para términos técnicos
`inline code` para comandos/variables
```lenguaje para bloques de código

[Texto enlace](url)
![Texto alt](url-imagen)

> Blockquotes para notas importantes

- Listas desordenadas
1. Listas ordenadas

| Tabla | Cabeceras |
|-------|-----------|
| Dato  | Valores   |
```

---

## Documentación de Esquema de Base de Datos

```markdown
## Esquema de Base de Datos

### Tabla Productos

| Columna | Tipo | Restricciones | Descripción |
|--------|------|---------------|-------------|
| id_producto | INTEGER | PRIMARY KEY | ID Auto-incremental |
| sku | VARCHAR(50) | UNIQUE, NOT NULL | Código de producto |
| nombre | VARCHAR(100) | NOT NULL | Nombre del producto |
| precio | NUMERIC(10,2) | NOT NULL | Precio en moneda |
| id_categoria | INTEGER | FOREIGN KEY | Referencia a categoria.id_categoria |

**Relaciones:**
- Uno-a-Muchos con `imagenes_productos`
- Uno-a-Uno con `inventario`
- Muchos-a-Uno con `categoria`
```

---

## Comandos

```bash
# Generar docs API (si se usan herramientas)
# Ninguna actualmente (documentación manual)

# Vista previa de markdown localmente
npm install -g markdown-preview
markdown-preview README.md
```

---

## Checklist de QA

- [ ] README tiene instrucciones de configuración
- [ ] Todos los endpoints API documentados
- [ ] Ejemplos de código probados y funcionando
- [ ] Respuestas de error documentadas
- [ ] Esquema de base de datos documentado
- [ ] Enlaces no están rotos
- [ ] Formato consistente en todo el documento
- [ ] Imágenes tienen texto alternativo

---

## Recursos

- **Guía Markdown**: https://www.markdownguide.org
- **Documentación API**: Buenas prácticas REST API
