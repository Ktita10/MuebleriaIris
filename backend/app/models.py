# ===========================================
# MODELOS DE LA BASE DE DATOS (ORM)
# -------------------------------------------
# Aquí se definen todas las clases principales
# que representan las tablas y relaciones de
# la base de datos de la mueblería.
# 
# Estos modelos encapsulan los roles,
# usuarios, productos, stock, ventas, pagos etc.
# y son usados/interactuados por las rutas Flask.
# ===========================================

# Importa la instancia de la base de datos SQLAlchemy creada en app/__init__.py
from . import db

# Importa datetime para manejar fechas y horas
from datetime import datetime

# ==========================================
# 1. SISTEMA DE USUARIOS Y ROLES
# ==========================================

# Modelo para la tabla 'roles' - Define los roles de acceso (Admin, Vendedor, Cliente, etc)
class Rol(db.Model):
    __tablename__ = "roles"
    id_rol = db.Column(db.Integer, primary_key=True)
    nombre_rol = db.Column(db.String(50), unique=True, nullable=False)
    descripcion = db.Column(db.Text)
    usuarios = db.relationship("Usuario", backref="rol", lazy=True)  # Un rol tiene muchos usuarios
    def to_dict(self):
        return {"id": self.id_rol, "nombre": self.nombre_rol, "descripcion": self.descripcion}


# Modelo para la tabla 'usuarios' - Define los usuarios del sistema (vendedores, administradores, etc)
class Usuario(db.Model):
    __tablename__ = "usuarios"
    id_usuarios = db.Column(db.Integer, primary_key=True)
    nombre_us = db.Column(db.String(50), nullable=False)
    apellido_us = db.Column(db.String(50), nullable=False)
    email_us = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    id_rol = db.Column(db.Integer, db.ForeignKey("roles.id_rol"))  # FK a Rol
    activo = db.Column(db.Boolean, default=True)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_actualizacion = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    ordenes = db.relationship("Orden", backref="vendedor", lazy=True)  # Un vendedor tiene muchas ordenes
    def to_dict(self):
        return {
            "id": self.id_usuarios,
            "nombre": self.nombre_us,
            "apellido": self.apellido_us,
            "email": self.email_us,
            "rol": self.rol.nombre_rol if self.rol else None,
            "activo": self.activo,
        }


# ==========================================
# 2. CATÁLOGO DE PRODUCTOS
# ==========================================

# Modelo para la tabla 'categoria' - Define las categorías de productos
class Categoria(db.Model):
    __tablename__ = "categoria"
    id_categoria = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), unique=True, nullable=False)
    descripcion = db.Column(db.Text)
    activa = db.Column(db.Boolean, default=True)
    productos = db.relationship("Producto", backref="categoria", lazy=True)  # Una categoría tiene muchos productos
    
    def to_dict(self):
        return {
            "id": self.id_categoria,
            "nombre": self.nombre,
            "descripcion": self.descripcion,
            "activo": self.activa
        }


# Modelo para la tabla 'productos' - Define los productos del catálogo
class Producto(db.Model):
    __tablename__ = "productos"
    id_producto = db.Column(db.Integer, primary_key=True)
    sku = db.Column(db.String(50), unique=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text)
    precio = db.Column(db.Numeric(10, 2), nullable=False)
    alto_cm = db.Column(db.Numeric(5, 2))
    ancho_cm = db.Column(db.Numeric(5, 2))
    profundidad_cm = db.Column(db.Numeric(5, 2))
    material = db.Column(db.String(100), nullable=False)
    id_categoria = db.Column(db.Integer, db.ForeignKey("categoria.id_categoria"))  # FK a Categoria
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    imagenes = db.relationship("ImagenProducto", backref="producto", lazy=True, cascade="all, delete-orphan")  # Un producto tiene muchas imágenes
    inventario = db.relationship("Inventario", backref="producto", uselist=False, lazy=True)  # Un producto tiene un inventario (uno a uno)
    detalles_orden = db.relationship("DetalleOrden", backref="producto", lazy=True)  # Un producto puede estar en muchos detalles de orden
    
    def to_dict(self):
        # Obtener la imagen principal
        imagen_principal = None
        if self.imagenes:
            img_principal = next((img for img in self.imagenes if img.imagen_principal), None)
            if img_principal:
                imagen_principal = img_principal.url_imagen
            elif len(self.imagenes) > 0:
                # Si no hay imagen marcada como principal, usar la primera
                imagen_principal = self.imagenes[0].url_imagen
        
        return {
            "id": self.id_producto,
            "sku": self.sku,
            "nombre": self.nombre,
            "descripcion": self.descripcion,
            "precio": float(self.precio),
            "medidas": {
                "alto": float(self.alto_cm) if self.alto_cm else None,
                "ancho": float(self.ancho_cm) if self.ancho_cm else None,
                "profundidad": float(self.profundidad_cm) if self.profundidad_cm else None
            },
            "material": self.material,
            "categoria": self.categoria.nombre if self.categoria else None,
            "id_categoria": self.id_categoria,
            "fecha_creacion": self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            "imagen_principal": imagen_principal,
            "imagenes": [img.to_dict() for img in self.imagenes] if self.imagenes else [],
            "stock": self.inventario.cantidad_stock if self.inventario else 0
        }


# Modelo para la tabla 'imagenes_productos' - Define las imágenes de productos
class ImagenProducto(db.Model):
    __tablename__ = "imagenes_productos"
    id_imagen = db.Column(db.Integer, primary_key=True)
    id_producto = db.Column(db.Integer, db.ForeignKey("productos.id_producto", ondelete="CASCADE"))  # FK a Producto
    url_imagen = db.Column(db.Text, nullable=False)
    imagen_principal = db.Column(db.Boolean, default=False)
    descripcion = db.Column(db.Text)
    
    def to_dict(self):
        return {
            "id": self.id_imagen,
            "url": self.url_imagen,
            "imagen_principal": self.imagen_principal,
            "descripcion": self.descripcion
        }


# ==========================================
# 3. GESTIÓN DE PROVEEDORES
# ==========================================

# Modelo para la tabla 'proovedores' - Define los proveedores de productos
class Proveedor(db.Model):
    __tablename__ = "proovedores"
    id_proovedor = db.Column(db.Integer, primary_key=True)
    nombre_empresa = db.Column(db.String(100))
    contacto_nombre = db.Column(db.String(100))
    telefono = db.Column(db.String(100))
    email = db.Column(db.String(100))
    direccion = db.Column(db.Text)
    activo = db.Column(db.Boolean, default=True)
    
    def to_dict(self):
        return {
            "id": self.id_proovedor,
            "nombre_empresa": self.nombre_empresa,
            "contacto_nombre": self.contacto_nombre,
            "telefono": self.telefono,
            "email": self.email,
            "direccion": self.direccion,
            "activo": self.activo
        }


# ==========================================
# 4. GESTIÓN DE INVENTARIO
# ==========================================

# Modelo para la tabla 'inventario' - Define el stock de productos
class Inventario(db.Model):
    __tablename__ = "inventario"
    id_inventario = db.Column(db.Integer, primary_key=True)
    id_producto = db.Column(db.Integer, db.ForeignKey("productos.id_producto"), unique=True)  # FK a Producto (uno a uno)
    cantidad_stock = db.Column(db.Integer, default=0, nullable=False)
    ubicacion = db.Column(db.String(100))
    stock_minimo = db.Column(db.Integer, default=5)
    utlima_actualizacion = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id_inventario,
            "id_producto": self.id_producto,
            "cantidad": self.cantidad_stock,
            "ubicacion": self.ubicacion,
            "stock_minimo": self.stock_minimo,
            "fecha_actualizacion": self.utlima_actualizacion.isoformat() if self.utlima_actualizacion else None
        }


# ==========================================
# 5. GESTIÓN DE CLIENTES
# ==========================================

# Modelo para la tabla 'clientes' - Define los clientes del sistema
class Cliente(db.Model):
    __tablename__ = "clientes"
    id_cliente = db.Column(db.Integer, primary_key=True)
    nombre_cliente = db.Column(db.String(100), nullable=False)
    apellido_cliente = db.Column(db.String(100), nullable=False)
    dni_cuit = db.Column(db.String(50), unique=True, nullable=False)
    email_cliente = db.Column(db.String(100), unique=True, nullable=False)
    telefono = db.Column(db.String(100), nullable=False)
    direccion_cliente = db.Column(db.Text, nullable=False)
    ciudad_cliente = db.Column(db.String(100), nullable=False)
    codigo_postal = db.Column(db.String(20), nullable=False)
    provincia_cliente = db.Column(db.String(20), nullable=False)
    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow)
    ordenes = db.relationship("Orden", backref="cliente", lazy=True)  # Un cliente tiene muchas órdenes
    
    def to_dict(self):
        return {
            "id": self.id_cliente,
            "nombre": self.nombre_cliente,
            "apellido": self.apellido_cliente,
            "dni_cuit": self.dni_cuit,
            "email": self.email_cliente,
            "telefono": self.telefono,
            "direccion": self.direccion_cliente,
            "ciudad": self.ciudad_cliente,
            "codigo_postal": self.codigo_postal,
            "provincia": self.provincia_cliente,
            "fecha_registro": self.fecha_registro.isoformat() if self.fecha_registro else None
        }


# ==========================================
# 6. GESTIÓN DE ÓRDENES Y VENTAS
# ==========================================

# Modelo para la tabla 'ordenes' - Define las órdenes de compra
class Orden(db.Model):
    __tablename__ = "ordenes"
    id_orden = db.Column(db.Integer, primary_key=True)
    id_cliente = db.Column(db.Integer, db.ForeignKey("clientes.id_cliente"))  # FK a Cliente
    id_usuarios = db.Column(db.Integer, db.ForeignKey("usuarios.id_usuarios"))  # FK a Usuario (vendedor)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    estado = db.Column(db.String(50), default="pendiente")  # pendiente, confirmada, enviada, completada, cancelada
    monto_total = db.Column(db.Numeric(10, 2), default=0.0)
    detalles = db.relationship("DetalleOrden", backref="orden", lazy=True, cascade="all, delete-orphan")  # Una orden tiene muchos detalles
    pagos = db.relationship("Pago", backref="orden", lazy=True, cascade="all, delete-orphan")  # Una orden tiene muchos pagos
    
    def to_dict(self):
        return {
            "id": self.id_orden,
            "cliente": self.cliente.to_dict() if self.cliente else None,
            "vendedor": self.vendedor.to_dict() if self.vendedor else None,
            "fecha_orden": self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            "estado": self.estado,
            "total": float(self.monto_total),
            "detalles": [detalle.to_dict() for detalle in self.detalles] if self.detalles else [],
            "pagos": [pago.to_dict() for pago in self.pagos] if self.pagos else []
        }


# Modelo para la tabla 'detalles_orden' - Define los productos incluidos en cada orden
class DetalleOrden(db.Model):
    __tablename__ = "detalles_orden"
    id_detalle = db.Column(db.Integer, primary_key=True)
    id_orden = db.Column(db.Integer, db.ForeignKey("ordenes.id_orden", ondelete="CASCADE"))  # FK a Orden
    id_producto = db.Column(db.Integer, db.ForeignKey("productos.id_producto"))  # FK a Producto
    cantidad = db.Column(db.Integer, nullable=False)
    precio_unitario = db.Column(db.Numeric(10, 2), nullable=False)
    
    def to_dict(self):
        subtotal = float(self.precio_unitario * self.cantidad) if self.precio_unitario and self.cantidad else 0
        return {
            "id": self.id_detalle,
            "producto": self.producto.to_dict() if self.producto else None,
            "cantidad": self.cantidad,
            "precio_unitario": float(self.precio_unitario),
            "subtotal": subtotal
        }


# ==========================================
# 7. GESTIÓN DE PAGOS
# ==========================================

# Modelo para la tabla 'pagos' - Define los pagos de órdenes
class Pago(db.Model):
    __tablename__ = "pagos"
    id_pago = db.Column(db.Integer, primary_key=True)
    id_orden = db.Column(db.Integer, db.ForeignKey("ordenes.id_orden", ondelete="CASCADE"))  # FK a Orden
    mp_preference_id = db.Column(db.String(150))  # ID de preferencia de MercadoPago
    mp_payment_id = db.Column(db.String(150))  # ID de pago de MercadoPago
    mp_estado = db.Column(db.String(50))  # Estado del pago en MercadoPago (approved, pending, rejected, etc.)
    mp_tipo_pago = db.Column(db.String(50))  # Tipo de pago (credit_card, debit_card, ticket, etc.)
    monto_cobrado_mp = db.Column(db.Numeric(10, 2))  # Monto cobrado por MercadoPago
    fecha_pago = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id_pago,
            "id_orden": self.id_orden,
            "mp_preference_id": self.mp_preference_id,
            "mp_payment_id": self.mp_payment_id,
            "mp_estado": self.mp_estado,
            "mp_tipo_pago": self.mp_tipo_pago,
            "monto_cobrado": float(self.monto_cobrado_mp) if self.monto_cobrado_mp else None,
            "fecha_pago": self.fecha_pago.isoformat() if self.fecha_pago else None
        }


######################################
# FLUJO Y RELACIONES DE MODELOS
######################################
'''
Este archivo (models.py) define todo el "mapa" de la base de datos relacional de la ERP Mueblería.
Las distintas clases se traducen en tablas con relaciones uno-a-muchos y muchos-a-uno.
Aquí un resumen didáctico sobre el flujo, relaciones y comunicación:

- **Usuarios/Roles**: Un usuario pertenece a un Rol. Un rol tiene muchos usuarios. (Relación uno-a-muchos)
- **Categorías/Productos**: Un producto pertenece a una Categoría. Una Categoría puede tener varios productos.
- **Productos/Imágenes**: Cada producto tiene una o varias imágenes (imagenes_productos), con una marcada como principal.
- **Productos/Inventario**: Un producto tiene un registro de inventario único (uno a uno).
- **Clientes/Órdenes**: Un cliente puede haber realizado varias órdenes (ordenes de compra).
- **Usuarios(==Vendedores)/Órdenes**: Un usuario puede ser vendedor de muchas órdenes.
- **Órdenes/DetalleOrden**: Cada orden contiene varios detalles que listan los productos vendidos.
- **Órdenes/Pagos**: Registro de pagos realizados para la orden (posible integración con MercadoPago).

Flujo principal CRM/ERP:
1. Un usuario con un rol (admin/vendedor) gestiona productos del catálogo (categorías, imágenes, inventario).
2. Un cliente realiza una compra creando una orden (associada a vendedor/usuario y cliente), con detalles de productos y pagos.
3. Los modelos importados son utilizados en las rutas Flask (`routes/*.py`) para crear/fetch/update registros, validar lógica y exponer endpoints a la API.
4. El modelo puede ser importado por scripts de migración y seed para la DB (`backend/scripts/`).

Cada método `.to_dict()` permite serializar el modelo a formato JSON para enviarlo por API o consumirlo en el frontend.
'''

# --- Fin de models.py ---