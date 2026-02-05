---
name: sqlalchemy-database
description: 'SQLAlchemy patterns for models, relationships, queries, and migrations. Use when defining database models, writing queries, creating relationships, optimizing performance, or managing migrations with Alembic. Triggers: "database model", "sqlalchemy", "query", "migration", "relationship", "foreign key".'
license: MIT
metadata:
  orm: sqlalchemy
  version: "2.x"
---

# SQLAlchemy Database Patterns

Patrones y mejores prácticas para SQLAlchemy y bases de datos.

## Cuándo Usar Esta Skill

- Definir modelos de base de datos
- Escribir queries eficientes
- Crear relaciones entre tablas
- Optimizar rendimiento
- Manejar migraciones con Alembic

## Definición de Modelos

### Modelo Base

```python
# app/models.py
from datetime import datetime
from typing import Optional
from app import db

class BaseModel(db.Model):
    """Clase base con campos comunes."""
    __abstract__ = True
    
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    eliminado = db.Column(db.Boolean, default=False, nullable=False)
    
    def to_dict(self) -> dict:
        """Convierte el modelo a diccionario."""
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
        }
```

### Modelo Completo

```python
class Producto(BaseModel):
    __tablename__ = 'productos'
    
    # Campos básicos
    nombre = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.Text, default='')
    precio = db.Column(db.Numeric(10, 2), nullable=False)
    stock = db.Column(db.Integer, default=0, nullable=False)
    activo = db.Column(db.Boolean, default=True, nullable=False)
    imagen_url = db.Column(db.String(500), default='')
    
    # Foreign keys
    categoria_id = db.Column(db.Integer, db.ForeignKey('categorias.id'), nullable=False)
    proveedor_id = db.Column(db.Integer, db.ForeignKey('proveedores.id'), nullable=True)
    
    # Relationships
    categoria = db.relationship('Categoria', back_populates='productos')
    proveedor = db.relationship('Proveedor', back_populates='productos')
    imagenes = db.relationship('ProductoImagen', back_populates='producto', cascade='all, delete-orphan')
    
    # Índices
    __table_args__ = (
        db.Index('ix_productos_categoria', 'categoria_id'),
        db.Index('ix_productos_precio', 'precio'),
        db.Index('ix_productos_activo_eliminado', 'activo', 'eliminado'),
    )
    
    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'precio': float(self.precio),
            'stock': self.stock,
            'activo': self.activo,
            'imagen_url': self.imagen_url,
            'categoria_id': self.categoria_id,
            'categoria': self.categoria.nombre if self.categoria else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
    
    def __repr__(self) -> str:
        return f'<Producto {self.id}: {self.nombre}>'
```

## Relaciones

### One-to-Many

```python
class Categoria(BaseModel):
    __tablename__ = 'categorias'
    
    nombre = db.Column(db.String(100), nullable=False, unique=True)
    descripcion = db.Column(db.Text, default='')
    
    # Un categoria tiene muchos productos
    productos = db.relationship('Producto', back_populates='categoria', lazy='dynamic')


class Producto(BaseModel):
    __tablename__ = 'productos'
    
    # Muchos productos pertenecen a una categoría
    categoria_id = db.Column(db.Integer, db.ForeignKey('categorias.id'), nullable=False)
    categoria = db.relationship('Categoria', back_populates='productos')
```

### Many-to-Many

```python
# Tabla de asociación
producto_tags = db.Table('producto_tags',
    db.Column('producto_id', db.Integer, db.ForeignKey('productos.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tags.id'), primary_key=True)
)

class Producto(BaseModel):
    __tablename__ = 'productos'
    
    tags = db.relationship('Tag', secondary=producto_tags, back_populates='productos')


class Tag(BaseModel):
    __tablename__ = 'tags'
    
    nombre = db.Column(db.String(50), nullable=False, unique=True)
    productos = db.relationship('Producto', secondary=producto_tags, back_populates='tags')
```

### Many-to-Many con datos extra

```python
# Cuando necesitas campos adicionales en la relación
class OrdenProducto(BaseModel):
    __tablename__ = 'orden_productos'
    
    orden_id = db.Column(db.Integer, db.ForeignKey('ordenes.id'), nullable=False)
    producto_id = db.Column(db.Integer, db.ForeignKey('productos.id'), nullable=False)
    cantidad = db.Column(db.Integer, nullable=False)
    precio_unitario = db.Column(db.Numeric(10, 2), nullable=False)
    
    # Relaciones
    orden = db.relationship('Orden', back_populates='items')
    producto = db.relationship('Producto')
    
    @property
    def subtotal(self) -> float:
        return float(self.cantidad * self.precio_unitario)


class Orden(BaseModel):
    __tablename__ = 'ordenes'
    
    items = db.relationship('OrdenProducto', back_populates='orden', cascade='all, delete-orphan')
    
    @property
    def total(self) -> float:
        return sum(item.subtotal for item in self.items)
```

## Queries Eficientes

### Básicas

```python
# Obtener por ID
producto = Producto.query.get(1)

# Filtrar
productos_activos = Producto.query.filter_by(activo=True, eliminado=False).all()

# Filtros complejos
from sqlalchemy import and_, or_

productos = Producto.query.filter(
    and_(
        Producto.precio >= 100,
        Producto.precio <= 500,
        Producto.stock > 0
    )
).all()

# Ordenar
productos = Producto.query.order_by(Producto.precio.desc()).all()

# Limitar
productos = Producto.query.limit(10).all()

# Primero o None
producto = Producto.query.filter_by(nombre='Silla').first()

# Primero o 404
producto = Producto.query.filter_by(id=1).first_or_404()
```

### Paginación

```python
def listar_productos(pagina: int = 1, por_pagina: int = 12) -> dict:
    paginacion = Producto.query.filter_by(
        eliminado=False
    ).paginate(
        page=pagina, 
        per_page=por_pagina, 
        error_out=False
    )
    
    return {
        'data': [p.to_dict() for p in paginacion.items],
        'pagination': {
            'page': paginacion.page,
            'per_page': paginacion.per_page,
            'total': paginacion.total,
            'pages': paginacion.pages,
            'has_next': paginacion.has_next,
            'has_prev': paginacion.has_prev
        }
    }
```

### Eager Loading (Evitar N+1)

```python
# ❌ MAL: N+1 queries
productos = Producto.query.all()
for p in productos:
    print(p.categoria.nombre)  # Query por cada producto

# ✅ BIEN: Eager loading con joinedload
from sqlalchemy.orm import joinedload

productos = Producto.query.options(
    joinedload(Producto.categoria)
).all()
for p in productos:
    print(p.categoria.nombre)  # Sin queries adicionales

# Múltiples relaciones
productos = Producto.query.options(
    joinedload(Producto.categoria),
    joinedload(Producto.proveedor),
    joinedload(Producto.imagenes)
).all()
```

### Subqueries y Aggregations

```python
from sqlalchemy import func

# Contar
total = Producto.query.filter_by(activo=True).count()

# Suma
total_stock = db.session.query(func.sum(Producto.stock)).scalar()

# Agrupar
ventas_por_categoria = db.session.query(
    Categoria.nombre,
    func.count(Producto.id).label('cantidad'),
    func.avg(Producto.precio).label('precio_promedio')
).join(Producto).group_by(Categoria.id).all()

# Subquery
from sqlalchemy import select

subq = select(func.count(Producto.id)).where(
    Producto.categoria_id == Categoria.id
).correlate(Categoria).scalar_subquery()

categorias_con_count = db.session.query(
    Categoria,
    subq.label('producto_count')
).all()
```

### Búsqueda de Texto

```python
# LIKE
productos = Producto.query.filter(
    Producto.nombre.ilike(f'%{busqueda}%')
).all()

# Múltiples campos
from sqlalchemy import or_

productos = Producto.query.filter(
    or_(
        Producto.nombre.ilike(f'%{busqueda}%'),
        Producto.descripcion.ilike(f'%{busqueda}%')
    )
).all()
```

## Transacciones

```python
# Transacción automática (commit al final)
def crear_orden(cliente_id: int, items: list) -> Orden:
    try:
        orden = Orden(cliente_id=cliente_id, estado='pendiente')
        db.session.add(orden)
        
        for item in items:
            producto = Producto.query.get(item['producto_id'])
            if producto.stock < item['cantidad']:
                raise ValueError(f'Stock insuficiente para {producto.nombre}')
            
            # Decrementar stock
            producto.stock -= item['cantidad']
            
            # Crear item de orden
            orden_item = OrdenProducto(
                orden=orden,
                producto=producto,
                cantidad=item['cantidad'],
                precio_unitario=producto.precio
            )
            db.session.add(orden_item)
        
        db.session.commit()
        return orden
        
    except Exception:
        db.session.rollback()
        raise
```

## Migraciones con Alembic

### Configuración

```python
# alembic/env.py
from app import create_app, db
from app.models import *  # Importar todos los modelos

app = create_app()
target_metadata = db.metadata
```

### Comandos Comunes

```bash
# Crear migración
flask db migrate -m "add productos table"

# Aplicar migraciones
flask db upgrade

# Revertir última migración
flask db downgrade

# Ver historial
flask db history

# Ver estado actual
flask db current
```

### Migración Manual

```python
# alembic/versions/xxx_add_imagen_url.py
def upgrade():
    op.add_column('productos', 
        sa.Column('imagen_url', sa.String(500), default='')
    )

def downgrade():
    op.drop_column('productos', 'imagen_url')
```

## Soft Delete Pattern

```python
class SoftDeleteMixin:
    """Mixin para soft delete."""
    eliminado = db.Column(db.Boolean, default=False, nullable=False)
    eliminado_at = db.Column(db.DateTime, nullable=True)
    
    def soft_delete(self):
        self.eliminado = True
        self.eliminado_at = datetime.utcnow()
        db.session.commit()
    
    def restore(self):
        self.eliminado = False
        self.eliminado_at = None
        db.session.commit()
    
    @classmethod
    def query_active(cls):
        """Query solo items no eliminados."""
        return cls.query.filter_by(eliminado=False)
```

## Índices y Performance

```python
class Producto(BaseModel):
    __tablename__ = 'productos'
    
    nombre = db.Column(db.String(200), nullable=False, index=True)
    precio = db.Column(db.Numeric(10, 2), nullable=False)
    categoria_id = db.Column(db.Integer, db.ForeignKey('categorias.id'))
    
    # Índices compuestos para queries comunes
    __table_args__ = (
        # Para filtrar por categoría y precio
        db.Index('ix_prod_cat_precio', 'categoria_id', 'precio'),
        
        # Para listar productos activos
        db.Index('ix_prod_activo', 'activo', 'eliminado'),
        
        # Índice único
        db.UniqueConstraint('sku', name='uq_producto_sku'),
    )
```

## Checklist de Calidad

- [ ] ¿Modelos tienen `to_dict()` para serialización?
- [ ] ¿Foreign keys con índices?
- [ ] ¿Relaciones con `back_populates`?
- [ ] ¿Eager loading para evitar N+1?
- [ ] ¿Paginación en queries de listas?
- [ ] ¿Soft delete implementado?
- [ ] ¿Transacciones con rollback en errores?
- [ ] ¿Migraciones versionadas con Alembic?
- [ ] ¿Índices en campos de búsqueda frecuente?

## Anti-Patrones

### ❌ Queries en loops

```python
# MAL
for orden in ordenes:
    cliente = Cliente.query.get(orden.cliente_id)

# BIEN
ordenes = Orden.query.options(joinedload(Orden.cliente)).all()
```

### ❌ Cargar todo en memoria

```python
# MAL
todos = Producto.query.all()
activos = [p for p in todos if p.activo]

# BIEN
activos = Producto.query.filter_by(activo=True).all()
```

### ❌ No usar transacciones

```python
# MAL
producto1.stock -= 1
db.session.commit()
producto2.stock += 1
db.session.commit()  # Si falla, inconsistencia

# BIEN
try:
    producto1.stock -= 1
    producto2.stock += 1
    db.session.commit()
except:
    db.session.rollback()
    raise
```
