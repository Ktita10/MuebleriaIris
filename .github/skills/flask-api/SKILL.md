---
name: flask-api
description: 'Flask REST API patterns with blueprints, validation, error handling, and SQLAlchemy integration. Use when creating API endpoints, structuring routes, validating requests, handling errors, or integrating with databases. Triggers: "flask route", "api endpoint", "blueprint", "request validation", "json response", "REST API".'
license: MIT
metadata:
  framework: flask
  version: "3.x"
---

# Flask API Patterns

Patrones y mejores prácticas para APIs REST con Flask.

## Cuándo Usar Esta Skill

- Crear endpoints REST
- Estructurar rutas con blueprints
- Validar requests
- Manejar errores consistentemente
- Integrar con SQLAlchemy

## Estructura de Proyecto

```
backend/
├── app/
│   ├── __init__.py          # App factory
│   ├── models.py            # SQLAlchemy models
│   ├── security.py          # JWT, auth
│   ├── routes/
│   │   ├── __init__.py      # Register blueprints
│   │   ├── admin.py         # /api/admin/*
│   │   ├── catalogo.py      # /api/catalogo/*
│   │   ├── comercial.py     # /api/comercial/*
│   │   └── ...
│   ├── services/
│   │   ├── __init__.py
│   │   └── producto_service.py
│   └── utils/
│       ├── validators.py
│       └── helpers.py
├── config.py
└── run.py
```

## App Factory Pattern

```python
# app/__init__.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Inicializar extensiones
    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": app.config['CORS_ORIGINS']}})
    
    # Registrar blueprints
    from app.routes import register_blueprints
    register_blueprints(app)
    
    # Registrar error handlers
    register_error_handlers(app)
    
    return app


def register_error_handlers(app):
    @app.errorhandler(400)
    def bad_request(e):
        return {'error': 'Bad Request', 'message': str(e)}, 400
    
    @app.errorhandler(401)
    def unauthorized(e):
        return {'error': 'Unauthorized', 'message': 'Authentication required'}, 401
    
    @app.errorhandler(404)
    def not_found(e):
        return {'error': 'Not Found', 'message': 'Resource not found'}, 404
    
    @app.errorhandler(500)
    def internal_error(e):
        return {'error': 'Internal Server Error', 'message': 'An unexpected error occurred'}, 500
```

## Blueprint Pattern

```python
# app/routes/catalogo.py
from flask import Blueprint, request, jsonify
from app.models import Producto
from app.services.producto_service import ProductoService
from app.security import token_required

catalogo_bp = Blueprint('catalogo', __name__, url_prefix='/api/catalogo')

@catalogo_bp.route('/productos', methods=['GET'])
def listar_productos():
    """Lista productos con filtros opcionales."""
    # Query params
    categoria_id = request.args.get('categoria', type=int)
    precio_min = request.args.get('precio_min', type=float)
    precio_max = request.args.get('precio_max', type=float)
    orden = request.args.get('orden', default='recientes')
    pagina = request.args.get('pagina', default=1, type=int)
    por_pagina = request.args.get('por_pagina', default=12, type=int)
    
    # Llamar al servicio
    resultado = ProductoService.listar(
        categoria_id=categoria_id,
        precio_min=precio_min,
        precio_max=precio_max,
        orden=orden,
        pagina=pagina,
        por_pagina=por_pagina
    )
    
    return jsonify(resultado)


@catalogo_bp.route('/productos/<int:producto_id>', methods=['GET'])
def obtener_producto(producto_id: int):
    """Obtiene un producto por ID."""
    producto = ProductoService.obtener_por_id(producto_id)
    
    if not producto:
        return jsonify({'error': 'Producto no encontrado'}), 404
    
    return jsonify(producto.to_dict())


@catalogo_bp.route('/productos', methods=['POST'])
@token_required
def crear_producto():
    """Crea un nuevo producto (requiere auth)."""
    data = request.get_json()
    
    # Validar datos
    errores = validar_producto(data)
    if errores:
        return jsonify({'errors': errores}), 400
    
    producto = ProductoService.crear(data)
    
    return jsonify(producto.to_dict()), 201
```

## Respuestas JSON Consistentes

### Éxito

```python
# Lista con paginación
{
    "data": [...],
    "pagination": {
        "page": 1,
        "per_page": 12,
        "total": 150,
        "pages": 13
    }
}

# Objeto único
{
    "id": 1,
    "nombre": "Silla Moderna",
    "precio": 1500.00,
    ...
}

# Creación exitosa (201)
{
    "id": 1,
    "message": "Producto creado exitosamente"
}

# Actualización exitosa (200)
{
    "message": "Producto actualizado exitosamente"
}

# Eliminación exitosa (200)
{
    "message": "Producto eliminado exitosamente"
}
```

### Errores

```python
# Error de validación (400)
{
    "error": "Validation Error",
    "errors": {
        "nombre": "El nombre es requerido",
        "precio": "El precio debe ser mayor a 0"
    }
}

# No autorizado (401)
{
    "error": "Unauthorized",
    "message": "Token inválido o expirado"
}

# No encontrado (404)
{
    "error": "Not Found",
    "message": "Producto no encontrado"
}

# Error del servidor (500)
{
    "error": "Internal Server Error",
    "message": "Ha ocurrido un error inesperado"
}
```

## Validación de Requests

```python
# app/utils/validators.py
from typing import Dict, List, Any, Optional

def validar_producto(data: Dict[str, Any]) -> Dict[str, str]:
    """Valida datos de producto. Retorna dict de errores."""
    errores = {}
    
    # Campos requeridos
    if not data.get('nombre'):
        errores['nombre'] = 'El nombre es requerido'
    elif len(data['nombre']) > 200:
        errores['nombre'] = 'El nombre no puede exceder 200 caracteres'
    
    if data.get('precio') is None:
        errores['precio'] = 'El precio es requerido'
    elif not isinstance(data['precio'], (int, float)) or data['precio'] <= 0:
        errores['precio'] = 'El precio debe ser un número mayor a 0'
    
    if not data.get('categoria_id'):
        errores['categoria_id'] = 'La categoría es requerida'
    
    # Campos opcionales con validación
    if data.get('stock') is not None:
        if not isinstance(data['stock'], int) or data['stock'] < 0:
            errores['stock'] = 'El stock debe ser un entero >= 0'
    
    return errores


def validar_paginacion(pagina: int, por_pagina: int) -> tuple[int, int]:
    """Sanitiza parámetros de paginación."""
    pagina = max(1, pagina)
    por_pagina = min(max(1, por_pagina), 100)  # Máximo 100 por página
    return pagina, por_pagina
```

## Service Layer Pattern

```python
# app/services/producto_service.py
from typing import Dict, Any, Optional, List
from app import db
from app.models import Producto, Categoria

class ProductoService:
    @staticmethod
    def listar(
        categoria_id: Optional[int] = None,
        precio_min: Optional[float] = None,
        precio_max: Optional[float] = None,
        orden: str = 'recientes',
        pagina: int = 1,
        por_pagina: int = 12
    ) -> Dict[str, Any]:
        """Lista productos con filtros y paginación."""
        query = Producto.query.filter_by(eliminado=False)
        
        # Aplicar filtros
        if categoria_id:
            query = query.filter_by(categoria_id=categoria_id)
        if precio_min is not None:
            query = query.filter(Producto.precio >= precio_min)
        if precio_max is not None:
            query = query.filter(Producto.precio <= precio_max)
        
        # Aplicar orden
        ordenes = {
            'recientes': Producto.created_at.desc(),
            'precio_asc': Producto.precio.asc(),
            'precio_desc': Producto.precio.desc(),
            'nombre': Producto.nombre.asc(),
        }
        query = query.order_by(ordenes.get(orden, Producto.created_at.desc()))
        
        # Paginar
        paginacion = query.paginate(page=pagina, per_page=por_pagina, error_out=False)
        
        return {
            'data': [p.to_dict() for p in paginacion.items],
            'pagination': {
                'page': paginacion.page,
                'per_page': paginacion.per_page,
                'total': paginacion.total,
                'pages': paginacion.pages
            }
        }
    
    @staticmethod
    def obtener_por_id(producto_id: int) -> Optional[Producto]:
        """Obtiene producto por ID (no eliminado)."""
        return Producto.query.filter_by(
            id=producto_id, 
            eliminado=False
        ).first()
    
    @staticmethod
    def crear(data: Dict[str, Any]) -> Producto:
        """Crea un nuevo producto."""
        producto = Producto(
            nombre=data['nombre'],
            descripcion=data.get('descripcion', ''),
            precio=data['precio'],
            categoria_id=data['categoria_id'],
            stock=data.get('stock', 0),
            imagen_url=data.get('imagen_url', ''),
        )
        db.session.add(producto)
        db.session.commit()
        return producto
    
    @staticmethod
    def actualizar(producto_id: int, data: Dict[str, Any]) -> Optional[Producto]:
        """Actualiza un producto existente."""
        producto = ProductoService.obtener_por_id(producto_id)
        if not producto:
            return None
        
        # Actualizar solo campos proporcionados
        campos_actualizables = ['nombre', 'descripcion', 'precio', 'categoria_id', 'stock', 'imagen_url']
        for campo in campos_actualizables:
            if campo in data:
                setattr(producto, campo, data[campo])
        
        db.session.commit()
        return producto
    
    @staticmethod
    def eliminar(producto_id: int) -> bool:
        """Soft delete de producto."""
        producto = ProductoService.obtener_por_id(producto_id)
        if not producto:
            return False
        
        producto.eliminado = True
        db.session.commit()
        return True
```

## Decoradores Útiles

```python
# app/utils/decorators.py
from functools import wraps
from flask import request, jsonify, g
from app.security import verificar_token

def token_required(f):
    """Requiere token JWT válido."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'error': 'Token no proporcionado'}), 401
        
        payload = verificar_token(token)
        if not payload:
            return jsonify({'error': 'Token inválido o expirado'}), 401
        
        g.current_user_id = payload['user_id']
        g.current_user_rol = payload.get('rol', 'cliente')
        
        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    """Requiere rol de administrador."""
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if g.current_user_rol != 'admin':
            return jsonify({'error': 'Acceso denegado'}), 403
        return f(*args, **kwargs)
    return decorated


def validate_json(f):
    """Valida que el request tenga JSON válido."""
    @wraps(f)
    def decorated(*args, **kwargs):
        if not request.is_json:
            return jsonify({'error': 'Content-Type debe ser application/json'}), 400
        return f(*args, **kwargs)
    return decorated
```

## Manejo de Errores

```python
# En cualquier ruta
from flask import abort

@catalogo_bp.route('/productos/<int:id>')
def get_producto(id):
    producto = Producto.query.get(id)
    if not producto:
        abort(404)  # Dispara el error handler
    return jsonify(producto.to_dict())
```

```python
# Errores personalizados
class APIError(Exception):
    def __init__(self, message: str, status_code: int = 400, errors: dict = None):
        self.message = message
        self.status_code = status_code
        self.errors = errors or {}

@app.errorhandler(APIError)
def handle_api_error(error):
    response = {'error': error.message}
    if error.errors:
        response['errors'] = error.errors
    return jsonify(response), error.status_code

# Uso
raise APIError('Datos inválidos', 400, {'email': 'Email ya registrado'})
```

## Testing de Endpoints

```python
# tests/test_catalogo.py
import pytest
from app import create_app, db

@pytest.fixture
def client():
    app = create_app('testing')
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.drop_all()

def test_listar_productos(client):
    response = client.get('/api/catalogo/productos')
    assert response.status_code == 200
    data = response.get_json()
    assert 'data' in data
    assert 'pagination' in data

def test_crear_producto_sin_auth(client):
    response = client.post('/api/catalogo/productos', json={
        'nombre': 'Test',
        'precio': 100
    })
    assert response.status_code == 401

def test_crear_producto_con_auth(client, auth_token):
    response = client.post('/api/catalogo/productos', 
        json={'nombre': 'Test', 'precio': 100, 'categoria_id': 1},
        headers={'Authorization': f'Bearer {auth_token}'}
    )
    assert response.status_code == 201
```

## Checklist de Calidad

- [ ] ¿Todos los endpoints retornan JSON?
- [ ] ¿Errores tienen formato consistente?
- [ ] ¿Inputs validados antes de procesar?
- [ ] ¿Rutas protegidas requieren autenticación?
- [ ] ¿Paginación en endpoints que retornan listas?
- [ ] ¿Soft delete en lugar de hard delete?
- [ ] ¿Logging de errores y operaciones importantes?
- [ ] ¿CORS configurado correctamente?
