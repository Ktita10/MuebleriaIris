---
name: muebleria-db
description: >
  PostgreSQL database schema for MuebleriaIris ERP system.
  Trigger: When working with database migrations, schema design, or SQL operations.
license: Apache-2.0
metadata:
  author: muebleria-iris
  version: "1.0"
  scope: [root]
  auto_invoke:
    - "Modifying database schema"
    - "Creating migrations"
    - "Writing SQL queries"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

# muebleria-db

## Cuándo usar

Utiliza esta skill cuando:

- Diseñes o modifiques el esquema de la base de datos
- Crees migraciones de base de datos
- Escribas consultas SQL directas
- Optimices el rendimiento de la base de datos
- Configures PostgreSQL

---

## Esquema de Base de Datos (8 Tablas)

### Catálogo
- `categoria` - Categorías de productos
- `productos` - Productos de mobiliario
- `imagenes_productos` - Imágenes de productos

### Logística
- `proovedores` - Proveedores
- `inventario` - Gestión de stock

### Comercial
- `clientes` - Clientes
- `ordenes` - Órdenes de venta
- `detalles_orden` - Detalles de orden
- `pagos` - Pagos MercadoPago

### Administración
- `roles` - Roles de usuario (Admin, Vendedor)
- `usuarios` - Usuarios del sistema

---

## Patrones Críticos

### Patrón 1: Llaves Foráneas

```sql
ALTER TABLE productos 
ADD CONSTRAINT fk_categoria 
FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria);

ALTER TABLE inventario 
ADD CONSTRAINT fk_producto 
FOREIGN KEY (id_producto) REFERENCES productos(id_producto);
```

### Patrón 2: Índices para Rendimiento

```sql
CREATE INDEX idx_productos_categoria ON productos(id_categoria);
CREATE INDEX idx_ordenes_cliente ON ordenes(id_cliente);
CREATE INDEX idx_ordenes_fecha ON ordenes(fecha_creacion DESC);
CREATE INDEX idx_productos_sku ON productos(sku);
```

### Patrón 3: Restricciones CHECK

```sql
ALTER TABLE productos 
ADD CONSTRAINT check_precio_positive CHECK (precio > 0);

ALTER TABLE inventario 
ADD CONSTRAINT check_stock_non_negative CHECK (cantidad_stock >= 0);
```

---

## Decisiones de Diseño de Esquema

### Convención de IDs
- Llaves primarias: `id_{tabla_singular}` (ejemplo: `id_producto`)
- Enteros autoincrementales
- Nunca exponer en la API (usar SKU o UUID para referencias externas)

### Relaciones
```
categoria 1 ----< * productos
productos 1 ----< * imagenes_productos
productos 1 ---- 1 inventario
productos 1 ----< * detalles_orden
clientes 1 ----< * ordenes
ordenes 1 ----< * detalles_orden
ordenes 1 ----< * pagos
usuarios * ----< 1 roles
```

---

## Ejemplos de Migraciones

### Agregar Columna

```sql
-- Agregar nuevo campo a productos
ALTER TABLE productos ADD COLUMN peso_kg NUMERIC(5,2);
```

### Modificar Columna

```sql
-- Cambiar longitud de string
ALTER TABLE productos ALTER COLUMN material TYPE VARCHAR(150);
```

### Eliminar Columna (Seguro)

```sql
-- Verificar dependencias primero
SELECT * FROM information_schema.table_constraints 
WHERE constraint_schema = 'public' AND table_name = 'productos';

-- Luego eliminar
ALTER TABLE productos DROP COLUMN campo_obsoleto;
```

---

## Comandos

```bash
# Conectar a la base de datos
psql -U muebleria_user -d muebleria_erp

# Respaldar base de datos
pg_dump -U muebleria_user muebleria_erp > backup.sql

# Restaurar base de datos
psql -U muebleria_user muebleria_erp < backup.sql

# Crear base de datos
createdb -U postgres muebleria_erp

# Eliminar base de datos
dropdb -U postgres muebleria_erp
```

---

## Consultas Útiles

### Alertas de Stock

```sql
SELECT p.nombre, i.cantidad_stock, i.stock_minimo
FROM inventario i
JOIN productos p ON i.id_producto = p.id_producto
WHERE i.cantidad_stock <= i.stock_minimo;
```

### Productos Más Vendidos

```sql
SELECT p.nombre, SUM(d.cantidad) as total_vendido
FROM detalles_orden d
JOIN productos p ON d.id_producto = p.id_producto
GROUP BY p.id_producto, p.nombre
ORDER BY total_vendido DESC
LIMIT 10;
```

### Órdenes por Estado

```sql
SELECT estado, COUNT(*) as cantidad, SUM(monto_total) as total
FROM ordenes
GROUP BY estado;
```

---

## Checklist de QA

- [ ] Todas las llaves foráneas tienen índices
- [ ] Restricciones CHECK para reglas de negocio
- [ ] Timestamps usan `timezone.utc`
- [ ] Estrategia de respaldo implementada
- [ ] No hay datos sensibles en texto plano
- [ ] Eliminaciones en cascada configuradas correctamente

---

## Recursos

- **Referencia de Modelos**: `backend/app/models.py`
- **Config**: `backend/config.py`