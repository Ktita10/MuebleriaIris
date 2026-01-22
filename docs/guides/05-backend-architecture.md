# MuebleriaIris - Backend API

Sistema ERP backend construido con Flask + SQLAlchemy + PostgreSQL.

## 🏗️ Arquitectura

```
backend/
├── app/
│   ├── __init__.py          # Factory de Flask
│   ├── models.py            # Modelos SQLAlchemy
│   ├── routes/              # Blueprints modulares
│   │   ├── catalogo.py      # Productos y Categorías
│   │   ├── logistica.py     # Inventario y Proveedores
│   │   ├── comercial.py     # Clientes y Órdenes
│   │   └── admin.py         # Usuarios y Roles
│   ├── services/            # Lógica de negocio
│   └── utils/               # Validadores y helpers
├── config.py                # Configuración
├── run.py                   # Entrypoint
├── init_db.py              # Inicializar DB
└── seed_db.py              # Datos de prueba
```

## 📦 Módulos ERP

### 1. Catálogo (`/api`)
- `GET/POST /categorias` - Gestión de categorías
- `GET/POST /productos` - Gestión de productos
- `POST /productos/{id}/imagenes` - Agregar imágenes

### 2. Logística (`/api`)
- `GET/POST /proveedores` - Gestión de proveedores
- `GET/POST /inventario` - Control de inventario
- `PATCH /inventario/{id}/ajustar` - Ajustar stock
- `GET /inventario/alertas` - Stock bajo

### 3. Comercial (`/api`)
- `GET/POST /clientes` - Gestión de clientes
- `GET/POST /ordenes` - Gestión de órdenes
- `PATCH /ordenes/{id}/estado` - Actualizar estado
- `GET /reportes/ventas` - Reporte de ventas
- `GET /reportes/productos-mas-vendidos` - Top productos

### 4. Administración (`/api`)
- `GET/POST /roles` - Gestión de roles
- `GET/POST /usuarios` - Gestión de usuarios
- `POST /auth/login` - Autenticación
- `GET /reportes/usuarios-actividad` - Actividad de usuarios

## 🚀 Quick Start

### 1. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 2. Configurar base de datos

Crear archivo `.env`:

```env
DB_USER=postgres
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=muebleria_erp
SECRET_KEY=tu_clave_secreta_segura
```

### 3. Inicializar base de datos

```bash
# Crear tablas
python init_db.py

# Poblar con datos de prueba
python seed_db.py
```

### 4. Ejecutar servidor

```bash
python run.py
```

API disponible en: `http://localhost:5000`

## 🧪 Testing

```bash
pytest backend/tests/
```

## 📝 Credenciales de Prueba

- **Admin**: `admin@muebleria.com` / `admin123`
- **Vendedor**: `maria@muebleria.com` / `vendedor123`

## 🔧 Desarrollo

### Agregar un nuevo endpoint

1. Crear función en el blueprint correspondiente (`routes/`)
2. Usar validadores de `utils/validators.py`
3. Retornar con `success_response()` o `error_response()`
4. Agregar tests en `tests/`

### Ejemplo:

```python
from ..utils import validate_required_fields, success_response, error_response

@catalogo_bp.route('/productos', methods=['POST'])
def create_producto():
    data = request.get_json()
    
    # Validar
    is_valid, error = validate_required_fields(data, ['sku', 'nombre', 'precio'])
    if not is_valid:
        return error_response(error)
    
    # Crear
    nuevo = Producto(**data)
    db.session.add(nuevo)
    db.session.commit()
    
    return success_response("Producto creado", {"producto": nuevo.to_dict()}, 201)
```

## 📊 Base de Datos

### Tablas Principales

- `roles` - Roles de usuario
- `usuarios` - Usuarios del sistema
- `categoria` - Categorías de productos
- `productos` - Catálogo de productos
- `imagen_producto` - Imágenes de productos
- `proveedor` - Proveedores
- `inventario` - Control de stock
- `cliente` - Clientes
- `orden` - Órdenes de venta
- `detalle_orden` - Items de órdenes

### Relaciones

```
Usuario 1--N Orden (vendedor)
Cliente 1--N Orden
Orden 1--N DetalleOrden
Producto 1--N DetalleOrden
Producto 1--1 Inventario
Producto N--1 Categoria
Producto 1--N ImagenProducto
```

## 🔐 Seguridad

- [ ] TODO: Implementar hash de passwords con `bcrypt`
- [ ] TODO: Implementar JWT con `Flask-JWT-Extended`
- [ ] TODO: Agregar rate limiting
- [ ] TODO: Validar permisos por rol (RBAC)

## 📚 Dependencias Principales

- **Flask 3.1.2** - Framework web
- **SQLAlchemy 2.0.36** - ORM
- **PostgreSQL** - Base de datos
- **Flask-CORS** - CORS support
- **Flask-JWT-Extended** - Autenticación JWT
- **pytest** - Testing

## 🐛 Troubleshooting

### Error de conexión a PostgreSQL

```bash
# Verificar que PostgreSQL esté corriendo
sudo service postgresql status

# Verificar credenciales en .env
cat .env
```

### Tablas no se crean

```bash
# Eliminar y recrear
python init_db.py
```

## 📖 Documentación

Ver `GUIA-SUBAGENTES.md` para patrones de desarrollo completos.

## 🤝 Contribuir

1. Seguir patrones de `agents/muebleria-api/SKILL.md`
2. Agregar validación de entrada
3. Manejar errores con try/except
4. Escribir tests para nuevas features
5. Actualizar esta documentación
