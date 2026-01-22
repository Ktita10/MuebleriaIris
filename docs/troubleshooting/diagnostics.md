# Diagnóstico de Problemas - MuebleriaIris

## Estado Actual (21 Ene 2026 12:47)

### ✅ PROBLEMAS RESUELTOS

#### 1. Error API Órdenes
- **Problema**: `/api/ordenes` fallaba con `fecha_orden` no existe
- **Solución**: Cambiado a `fecha_creacion` en `comercial.py`
- **Estado**: ✅ RESUELTO

#### 2. Carga de Imágenes
- **Problema**: No existía funcionalidad para subir imágenes
- **Solución Implementada**:
  - ✅ Backend: Endpoints de upload en `/api/upload` y `/api/productos/<id>/imagen`
  - ✅ Frontend: Modal de imágenes en `ProductosManager.tsx`
  - ✅ Base de datos: Columna `descripcion` agregada a `imagenes_productos`
  - ✅ Almacenamiento: Directorio `backend/uploads/` creado
- **Pruebas**:
  ```bash
  curl -X POST -F "file=@test.png" http://localhost:5000/api/upload
  # ✅ Funciona correctamente
  
  curl http://localhost:5000/api/productos/10/imagenes
  # ✅ Devuelve imágenes correctamente
  ```
- **Estado**: ✅ RESUELTO

#### 3. Página productos.astro
- **Problema Reportado**: "La página nuevo producto no existe"
- **Realidad**: La página SÍ existe en `src/pages/admin/productos.astro`
- **Estado**: ✅ NO ERA UN PROBLEMA

---

### ⚠️ PROBLEMAS PENDIENTES

#### 1. Botones Invisibles (VERIFICAR)

**Cambios Realizados**:
- ✅ Reemplazadas todas las clases `bg-primary-*` por `bg-blue-*`
- ✅ Archivos modificados:
  - `src/components/admin/OrdenesManager.tsx`
  - `src/components/admin/ProveedoresManager.tsx`
  - `src/components/admin/UsuariosManager.tsx`
  - `src/components/admin/DashboardMetrics.tsx`

**Verificación Necesaria**:
```bash
# 1. Iniciar servidores
cd backend && source venv/bin/activate && python3 run.py &
cd .. && npm run dev &

# 2. Abrir en navegador
http://localhost:4321/admin/productos
http://localhost:4321/admin/proveedores
http://localhost:4321/admin/usuarios

# 3. Verificar que los botones son VISIBLES y AZULES
```

**Clases Actuales**:
```tsx
// Botones principales
className="bg-blue-600 text-white hover:bg-blue-700"

// Botones de acción
className="text-blue-600 hover:text-blue-900"  // Editar
className="text-red-600 hover:text-red-900"    // Eliminar
className="text-green-600 hover:text-green-900" // Imágenes
```

---

## Cómo Probar Todo

### Backend (Flask)
```bash
cd /home/matias-fuentes/Escritorio/Proyectos/Muebleria/MuebleriaIris/backend
source venv/bin/activate
python3 run.py

# Debería mostrar:
# 🚀 Servidor: http://0.0.0.0:5000
# ✅ Módulos: categorias, productos, proveedores, etc.
```

### Frontend (Astro + React)
```bash
cd /home/matias-fuentes/Escritorio/Proyectos/Muebleria/MuebleriaIris
npm run dev

# Debería mostrar:
# 🚀 Server running at http://localhost:4321
```

### Probar CRUD Completo

#### Productos con Imágenes
1. Ir a: http://localhost:4321/admin/productos
2. Click en "Nuevo Producto"
3. Llenar formulario y guardar
4. Click en botón "Imágenes" (verde)
5. Subir una imagen PNG/JPG
6. Verificar que aparece en la cuadrícula
7. Verificar que se puede eliminar

#### Otros Módulos
- **Categorías**: http://localhost:4321/admin/categorias
- **Clientes**: http://localhost:4321/admin/clientes
- **Proveedores**: http://localhost:4321/admin/proveedores
- **Usuarios**: http://localhost:4321/admin/usuarios
- **Órdenes**: http://localhost:4321/admin/ordenes
- **Inventario**: http://localhost:4321/admin/inventario

---

## Archivos Importantes

### Backend
- `backend/app/routes/catalogo.py` - Upload de imágenes ✅
- `backend/app/models.py` - ImagenProducto.to_dict() ✅
- `backend/config.py` - UPLOAD_FOLDER configurado ✅
- `backend/uploads/` - Archivos subidos ✅

### Frontend
- `src/lib/api.ts` - uploadImage(), getImages(), deleteImage() ✅
- `src/components/admin/ProductosManager.tsx` - Modal de imágenes ✅
- `src/components/admin/OrdenesManager.tsx` - Botones corregidos ✅
- `src/components/admin/ProveedoresManager.tsx` - Botones corregidos ✅
- `src/components/admin/UsuariosManager.tsx` - Botones corregidos ✅

---

## Comandos Útiles

### Ver logs del backend
```bash
tail -f /tmp/flask.log
```

### Ver logs del frontend
```bash
tail -f /tmp/astro.log
```

### Verificar procesos
```bash
ps aux | grep "python3 run.py"
ps aux | grep "npm run dev"
```

### Matar procesos
```bash
pkill -f "python3 run.py"
pkill -f "npm run dev"
```

---

## Notas

### TailwindCSS v4
- Los colores `primary-*` están definidos en `src/styles/global.css`
- Sin embargo, los colores estándar (`blue-600`, `red-600`, etc.) funcionan mejor
- Por eso todos los botones fueron cambiados a colores estándar

### PostgreSQL
- Host: localhost
- Puerto: 5433 (no 5432 por defecto)
- Usuario: postgres
- Password: 12345
- Base de datos: muebleria_erp

### Migraciones Aplicadas
```sql
ALTER TABLE imagenes_productos ADD COLUMN IF NOT EXISTS descripcion TEXT;
```

---

## Checklist de Verificación

- [ ] Backend corre en puerto 5000
- [ ] Frontend corre en puerto 4321
- [ ] Botones son visibles en todos los módulos admin
- [ ] Upload de imágenes funciona
- [ ] Modal de imágenes se abre correctamente
- [ ] Imágenes se muestran en la cuadrícula
- [ ] Se pueden eliminar imágenes
- [ ] CRUD de categorías funciona
- [ ] CRUD de productos funciona
- [ ] CRUD de clientes funciona
- [ ] CRUD de usuarios funciona
- [ ] CRUD de proveedores funciona
- [ ] Gestión de órdenes funciona
- [ ] Ajustes de inventario funcionan
