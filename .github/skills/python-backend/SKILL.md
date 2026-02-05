---
name: python-backend
description: 'Python backend best practices: type hints, dataclasses, error handling, logging, and code organization. Use when writing Python code, adding type annotations, creating data models, handling exceptions, or setting up logging. Triggers: "python code", "type hints", "dataclass", "exception handling", "logging", "python patterns".'
license: MIT
metadata:
  language: python
  version: "3.9+"
---

# Python Backend Best Practices

Mejores prácticas para código Python en backend.

## Cuándo Usar Esta Skill

- Escribir código Python
- Añadir type hints
- Crear data models
- Manejar excepciones
- Configurar logging

## Type Hints Obligatorios

### Funciones

```python
# ✅ BIEN: Tipos explícitos
def calcular_descuento(precio: float, porcentaje: float) -> float:
    return precio * (1 - porcentaje / 100)

def buscar_usuario(email: str) -> Optional[Usuario]:
    return Usuario.query.filter_by(email=email).first()

def listar_productos(
    categoria_id: Optional[int] = None,
    pagina: int = 1,
    por_pagina: int = 10
) -> List[Producto]:
    ...

# ❌ MAL: Sin tipos
def calcular_descuento(precio, porcentaje):
    return precio * (1 - porcentaje / 100)
```

### Tipos Comunes

```python
from typing import (
    Optional,    # Puede ser None
    List,        # Lista de algo
    Dict,        # Diccionario
    Tuple,       # Tupla
    Set,         # Conjunto
    Union,       # Uno u otro tipo
    Any,         # Cualquier tipo (evitar)
    Callable,    # Función
    TypeVar,     # Genérico
    Literal,     # Valores específicos
)

# Optional = Union[X, None]
def get_user(id: int) -> Optional[User]:
    ...

# Literal para valores específicos
def set_status(status: Literal['active', 'inactive', 'pending']) -> None:
    ...

# Dict con tipos específicos
def process_config(config: Dict[str, Any]) -> None:
    ...

# Callable
def apply_fn(fn: Callable[[int], int], value: int) -> int:
    return fn(value)
```

### Type Aliases

```python
# Crear aliases para tipos complejos
UserId = int
ProductDict = Dict[str, Any]
PaginatedResult = Tuple[List[Dict], int, int]

def get_products(user_id: UserId) -> PaginatedResult:
    ...
```

## Dataclasses

### Básico

```python
from dataclasses import dataclass, field
from typing import Optional, List
from datetime import datetime

@dataclass
class Producto:
    id: int
    nombre: str
    precio: float
    categoria_id: int
    descripcion: str = ""
    stock: int = 0
    activo: bool = True
    created_at: datetime = field(default_factory=datetime.now)
    tags: List[str] = field(default_factory=list)
```

### Con Validación

```python
from dataclasses import dataclass
from typing import Optional

@dataclass
class CreateProductRequest:
    nombre: str
    precio: float
    categoria_id: int
    descripcion: Optional[str] = None
    stock: int = 0
    
    def __post_init__(self):
        if not self.nombre or len(self.nombre) > 200:
            raise ValueError("Nombre inválido")
        if self.precio <= 0:
            raise ValueError("Precio debe ser mayor a 0")
        if self.stock < 0:
            raise ValueError("Stock no puede ser negativo")
```

### Frozen (Inmutable)

```python
@dataclass(frozen=True)
class Config:
    db_host: str
    db_port: int
    db_name: str
    
    @property
    def connection_string(self) -> str:
        return f"postgresql://{self.db_host}:{self.db_port}/{self.db_name}"
```

## Manejo de Excepciones

### Excepciones Personalizadas

```python
# app/exceptions.py

class AppException(Exception):
    """Base exception para la aplicación."""
    def __init__(self, message: str, code: str = "ERROR"):
        self.message = message
        self.code = code
        super().__init__(self.message)


class ValidationError(AppException):
    """Error de validación de datos."""
    def __init__(self, message: str, errors: Dict[str, str] = None):
        super().__init__(message, "VALIDATION_ERROR")
        self.errors = errors or {}


class NotFoundError(AppException):
    """Recurso no encontrado."""
    def __init__(self, resource: str, identifier: Any):
        super().__init__(f"{resource} con id {identifier} no encontrado", "NOT_FOUND")


class AuthenticationError(AppException):
    """Error de autenticación."""
    def __init__(self, message: str = "Credenciales inválidas"):
        super().__init__(message, "AUTH_ERROR")


class AuthorizationError(AppException):
    """Error de autorización."""
    def __init__(self, message: str = "Acceso denegado"):
        super().__init__(message, "FORBIDDEN")
```

### Uso Correcto

```python
# ✅ BIEN: Capturar excepciones específicas
try:
    producto = ProductoService.obtener(producto_id)
except NotFoundError:
    return {"error": "Producto no encontrado"}, 404
except ValidationError as e:
    return {"error": e.message, "errors": e.errors}, 400
except Exception as e:
    logger.exception("Error inesperado")
    return {"error": "Error interno"}, 500

# ❌ MAL: Capturar todo sin distinción
try:
    producto = ProductoService.obtener(producto_id)
except:
    return {"error": "Error"}, 500
```

### Context Managers

```python
from contextlib import contextmanager

@contextmanager
def transaction():
    """Context manager para transacciones."""
    try:
        yield db.session
        db.session.commit()
    except Exception:
        db.session.rollback()
        raise

# Uso
with transaction() as session:
    session.add(nuevo_producto)
    session.add(log_entrada)
```

## Logging Estructurado

### Configuración

```python
# app/logging_config.py
import logging
import sys
from logging.handlers import RotatingFileHandler

def setup_logging(app_name: str, log_level: str = "INFO"):
    """Configura logging para la aplicación."""
    
    # Formato
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Handler para consola
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    
    # Handler para archivo (con rotación)
    file_handler = RotatingFileHandler(
        f'logs/{app_name}.log',
        maxBytes=10_000_000,  # 10MB
        backupCount=5
    )
    file_handler.setFormatter(formatter)
    
    # Configurar logger raíz
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level))
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)
    
    # Reducir verbosidad de librerías externas
    logging.getLogger('werkzeug').setLevel(logging.WARNING)
    logging.getLogger('sqlalchemy').setLevel(logging.WARNING)
```

### Uso

```python
import logging

logger = logging.getLogger(__name__)

class ProductoService:
    @staticmethod
    def crear(data: dict) -> Producto:
        logger.info(f"Creando producto: {data['nombre']}")
        
        try:
            producto = Producto(**data)
            db.session.add(producto)
            db.session.commit()
            
            logger.info(f"Producto creado con ID: {producto.id}")
            return producto
            
        except Exception as e:
            logger.exception(f"Error creando producto: {e}")
            raise
```

### Niveles de Log

```python
logger.debug("Información detallada para debugging")
logger.info("Operación completada exitosamente")
logger.warning("Algo inesperado pero no crítico")
logger.error("Error que impide completar operación")
logger.exception("Error con stack trace completo")  # Solo en except
logger.critical("Error crítico del sistema")
```

## Patrones de Diseño

### Repository Pattern

```python
# app/repositories/producto_repository.py
from typing import Optional, List
from app.models import Producto

class ProductoRepository:
    @staticmethod
    def find_by_id(id: int) -> Optional[Producto]:
        return Producto.query.filter_by(id=id, eliminado=False).first()
    
    @staticmethod
    def find_all(
        categoria_id: Optional[int] = None,
        activo: bool = True
    ) -> List[Producto]:
        query = Producto.query.filter_by(eliminado=False)
        if categoria_id:
            query = query.filter_by(categoria_id=categoria_id)
        if activo:
            query = query.filter_by(activo=activo)
        return query.all()
    
    @staticmethod
    def save(producto: Producto) -> Producto:
        db.session.add(producto)
        db.session.commit()
        return producto
    
    @staticmethod
    def delete(producto: Producto) -> None:
        producto.eliminado = True
        db.session.commit()
```

### Factory Pattern

```python
# app/factories/notification_factory.py
from abc import ABC, abstractmethod
from typing import Dict, Type

class Notification(ABC):
    @abstractmethod
    def send(self, to: str, message: str) -> bool:
        pass

class EmailNotification(Notification):
    def send(self, to: str, message: str) -> bool:
        # Enviar email
        return True

class SMSNotification(Notification):
    def send(self, to: str, message: str) -> bool:
        # Enviar SMS
        return True

class NotificationFactory:
    _notifiers: Dict[str, Type[Notification]] = {
        'email': EmailNotification,
        'sms': SMSNotification,
    }
    
    @classmethod
    def create(cls, notification_type: str) -> Notification:
        notifier_class = cls._notifiers.get(notification_type)
        if not notifier_class:
            raise ValueError(f"Tipo de notificación desconocido: {notification_type}")
        return notifier_class()
```

## Funciones Puras y Side Effects

```python
# ✅ BIEN: Función pura (sin side effects)
def calcular_total(items: List[dict], descuento: float = 0) -> float:
    subtotal = sum(item['precio'] * item['cantidad'] for item in items)
    return subtotal * (1 - descuento / 100)

# ✅ BIEN: Side effects explícitos y documentados
def procesar_orden(orden_id: int) -> Orden:
    """
    Procesa una orden.
    
    Side effects:
        - Actualiza estado de la orden en DB
        - Envía email de confirmación
        - Decrementa stock de productos
    """
    orden = OrdenRepository.find_by_id(orden_id)
    # ...
```

## Docstrings

```python
def crear_pedido(
    cliente_id: int,
    productos: List[Dict[str, int]],
    direccion_envio: str,
    metodo_pago: str
) -> Pedido:
    """
    Crea un nuevo pedido para un cliente.
    
    Args:
        cliente_id: ID del cliente que realiza el pedido
        productos: Lista de productos con formato [{'producto_id': int, 'cantidad': int}]
        direccion_envio: Dirección de entrega completa
        metodo_pago: Método de pago ('tarjeta', 'efectivo', 'transferencia')
    
    Returns:
        Pedido creado con su ID asignado
    
    Raises:
        ValidationError: Si los datos son inválidos
        NotFoundError: Si el cliente o algún producto no existe
        InsufficientStockError: Si no hay stock suficiente
    
    Example:
        >>> pedido = crear_pedido(
        ...     cliente_id=1,
        ...     productos=[{'producto_id': 10, 'cantidad': 2}],
        ...     direccion_envio="Calle 123",
        ...     metodo_pago="tarjeta"
        ... )
        >>> print(pedido.id)
        42
    """
    pass
```

## Checklist de Calidad

- [ ] ¿Todas las funciones tienen type hints?
- [ ] ¿Se usan dataclasses para DTOs?
- [ ] ¿Excepciones específicas (no genéricas)?
- [ ] ¿Logging en puntos críticos?
- [ ] ¿Docstrings en funciones públicas?
- [ ] ¿Funciones pequeñas (< 50 líneas)?
- [ ] ¿Side effects documentados?
- [ ] ¿Código formateado con Black?
