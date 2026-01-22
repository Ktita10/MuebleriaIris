#!/usr/bin/env python3
"""
Script de Seeds para MuebleriaIris ERP
Inserta datos de prueba en la base de datos
Ejecutar: ./venv/bin/python seeds.py
"""

from app import create_app, db
from app.models import (
    Rol, Usuario, Categoria, Producto, ImagenProducto,
    Proveedor, Inventario, Cliente, Orden, DetalleOrden
)
from werkzeug.security import generate_password_hash
from datetime import datetime, timezone
import random

def clear_data():
    """Limpiar datos existentes (en orden por dependencias)"""
    print("🗑️  Limpiando datos existentes...")
    DetalleOrden.query.delete()
    Orden.query.delete()
    Cliente.query.delete()
    Inventario.query.delete()
    ImagenProducto.query.delete()
    Producto.query.delete()
    Categoria.query.delete()
    Proveedor.query.delete()
    Usuario.query.delete()
    Rol.query.delete()
    db.session.commit()
    print("✅ Datos limpiados")

def seed_roles():
    """Insertar roles"""
    print("👥 Insertando roles...")
    roles = [
        Rol(nombre_rol="Admin", descripcion="Acceso total al sistema"),
        Rol(nombre_rol="Vendedor", descripcion="Gestión de ventas y clientes"),
    ]
    db.session.add_all(roles)
    db.session.commit()
    print(f"✅ {len(roles)} roles insertados")
    return roles

def seed_usuarios(roles):
    """Insertar usuarios"""
    print("👤 Insertando usuarios...")
    usuarios = [
        Usuario(
            nombre_us="Administrador",
            apellido_us="Sistema",
            email_us="admin@muebleria.com",
            password_hash=generate_password_hash("Admin123!"),
            id_rol=roles[0].id_rol,
            activo=True
        ),
        Usuario(
            nombre_us="Juan",
            apellido_us="Vendedor",
            email_us="vendedor@muebleria.com",
            password_hash=generate_password_hash("Vendedor123!"),
            id_rol=roles[1].id_rol,
            activo=True
        ),
    ]
    db.session.add_all(usuarios)
    db.session.commit()
    print(f"✅ {len(usuarios)} usuarios insertados")
    return usuarios

def seed_categorias():
    """Insertar categorías"""
    print("📁 Insertando categorías...")
    categorias = [
        Categoria(nombre="Sofás", descripcion="Sofás y sillones para living", activa=True),
        Categoria(nombre="Sillas", descripcion="Sillas de comedor y oficina", activa=True),
        Categoria(nombre="Mesas", descripcion="Mesas de comedor, centro y auxiliares", activa=True),
        Categoria(nombre="Camas", descripcion="Camas y sommiers", activa=True),
        Categoria(nombre="Estanterías", descripcion="Bibliotecas y estantes", activa=True),
    ]
    db.session.add_all(categorias)
    db.session.commit()
    print(f"✅ {len(categorias)} categorías insertadas")
    return categorias

def seed_productos(categorias):
    """Insertar productos"""
    print("🛋️  Insertando productos...")
    
    # Mapeo de categorías por nombre
    cat_map = {c.nombre: c.id_categoria for c in categorias}
    
    productos_data = [
        # Sofás
        {"sku": "SOF001", "nombre": "Sofá 3 Cuerpos Nordic", "descripcion": "Sofá moderno de 3 cuerpos con patas de madera y tapizado premium en tela antimanchas.", "precio": 89000, "material": "Tapizado", "alto_cm": 85, "ancho_cm": 200, "profundidad_cm": 90, "categoria": "Sofás"},
        {"sku": "SOF002", "nombre": "Sillón Individual Relax", "descripcion": "Sillón individual con respaldo reclinable y apoyabrazos acolchados.", "precio": 45000, "material": "Tapizado", "alto_cm": 90, "ancho_cm": 80, "profundidad_cm": 85, "categoria": "Sofás"},
        {"sku": "SOF003", "nombre": "Sofá Esquinero L", "descripcion": "Sofá esquinero en L con chaise longue, ideal para espacios amplios.", "precio": 145000, "material": "Tapizado", "alto_cm": 85, "ancho_cm": 280, "profundidad_cm": 200, "categoria": "Sofás"},
        
        # Sillas
        {"sku": "SIL001", "nombre": "Silla Comedor Eames", "descripcion": "Silla estilo Eames con asiento de polipropileno y patas de madera de haya.", "precio": 25000, "material": "Plástico/Madera", "alto_cm": 82, "ancho_cm": 46, "profundidad_cm": 52, "categoria": "Sillas"},
        {"sku": "SIL002", "nombre": "Silla Oficina Ergonómica", "descripcion": "Silla de oficina con soporte lumbar, apoyabrazos ajustables y ruedas.", "precio": 65000, "material": "Mesh/Metal", "alto_cm": 110, "ancho_cm": 60, "profundidad_cm": 60, "categoria": "Sillas"},
        {"sku": "SIL003", "nombre": "Banqueta Alta Industrial", "descripcion": "Banqueta alta estilo industrial con asiento de madera y estructura metálica.", "precio": 18000, "material": "Metal/Madera", "alto_cm": 75, "ancho_cm": 40, "profundidad_cm": 40, "categoria": "Sillas"},
        
        # Mesas
        {"sku": "MES001", "nombre": "Mesa Comedor Extensible", "descripcion": "Mesa de comedor extensible de 160 a 220cm, ideal para 6-8 personas.", "precio": 120000, "material": "Madera", "alto_cm": 76, "ancho_cm": 160, "profundidad_cm": 90, "categoria": "Mesas"},
        {"sku": "MES002", "nombre": "Mesa Centro Vidrio", "descripcion": "Mesa de centro con tapa de vidrio templado y estructura metálica.", "precio": 35000, "material": "Vidrio/Metal", "alto_cm": 45, "ancho_cm": 100, "profundidad_cm": 60, "categoria": "Mesas"},
        {"sku": "MES003", "nombre": "Escritorio Home Office", "descripcion": "Escritorio minimalista para home office con cajón lateral.", "precio": 55000, "material": "MDF/Metal", "alto_cm": 75, "ancho_cm": 120, "profundidad_cm": 60, "categoria": "Mesas"},
        
        # Camas
        {"sku": "CAM001", "nombre": "Cama Queen con Respaldo", "descripcion": "Cama queen size con respaldo tapizado y estructura de madera maciza.", "precio": 95000, "material": "Madera", "alto_cm": 100, "ancho_cm": 160, "profundidad_cm": 200, "categoria": "Camas"},
        {"sku": "CAM002", "nombre": "Cama 1 Plaza Juvenil", "descripcion": "Cama de 1 plaza ideal para habitaciones juveniles, con diseño moderno.", "precio": 45000, "material": "MDF", "alto_cm": 90, "ancho_cm": 100, "profundidad_cm": 190, "categoria": "Camas"},
        {"sku": "CAM003", "nombre": "Sommier King Pillow Top", "descripcion": "Sommier king size con colchón pillow top de alta densidad.", "precio": 180000, "material": "Tapizado", "alto_cm": 35, "ancho_cm": 180, "profundidad_cm": 200, "categoria": "Camas"},
        
        # Estanterías
        {"sku": "EST001", "nombre": "Biblioteca 5 Estantes", "descripcion": "Biblioteca de 5 estantes en madera, ideal para living u oficina.", "precio": 42000, "material": "Madera", "alto_cm": 180, "ancho_cm": 80, "profundidad_cm": 30, "categoria": "Estanterías"},
        {"sku": "EST002", "nombre": "Estante Flotante Set x3", "descripcion": "Set de 3 estantes flotantes de diferentes tamaños, fácil instalación.", "precio": 15000, "material": "MDF", "alto_cm": 3, "ancho_cm": 60, "profundidad_cm": 20, "categoria": "Estanterías"},
        {"sku": "EST003", "nombre": "Rack TV Moderno", "descripcion": "Mueble para TV de hasta 65 pulgadas con espacio para consolas y decoración.", "precio": 55000, "material": "MDF/Metal", "alto_cm": 50, "ancho_cm": 180, "profundidad_cm": 40, "categoria": "Estanterías"},
    ]
    
    productos = []
    for p in productos_data:
        producto = Producto(
            sku=p["sku"],
            nombre=p["nombre"],
            descripcion=p["descripcion"],
            precio=p["precio"],
            material=p["material"],
            alto_cm=p["alto_cm"],
            ancho_cm=p["ancho_cm"],
            profundidad_cm=p["profundidad_cm"],
            id_categoria=cat_map[p["categoria"]]
        )
        productos.append(producto)
    
    db.session.add_all(productos)
    db.session.commit()
    print(f"✅ {len(productos)} productos insertados")
    return productos

def seed_imagenes(productos):
    """Insertar imágenes placeholder para productos"""
    print("🖼️  Insertando imágenes de productos...")
    
    imagenes = []
    for producto in productos:
        # Imagen principal usando placeholder
        imagen = ImagenProducto(
            id_producto=producto.id_producto,
            url_imagen=f"https://placehold.co/600x400/e2e8f0/475569?text={producto.sku}",
            imagen_principal=True
        )
        imagenes.append(imagen)
    
    db.session.add_all(imagenes)
    db.session.commit()
    print(f"✅ {len(imagenes)} imágenes insertadas")

def seed_inventario(productos):
    """Insertar inventario para productos"""
    print("📦 Insertando inventario...")
    
    inventarios = []
    for producto in productos:
        inventario = Inventario(
            id_producto=producto.id_producto,
            cantidad_stock=random.randint(10, 50),
            ubicacion="Depósito Principal",
            stock_minimo=5
        )
        inventarios.append(inventario)
    
    db.session.add_all(inventarios)
    db.session.commit()
    print(f"✅ {len(inventarios)} registros de inventario insertados")

def seed_proveedores():
    """Insertar proveedores"""
    print("🏭 Insertando proveedores...")
    
    proveedores = [
        Proveedor(
            nombre_empresa="Muebles del Sur SA",
            contacto_nombre="Carlos Gómez",
            email="ventas@mueblesdelsur.com",
            telefono="011-4555-1234",
            direccion="Av. Industrial 1234, Buenos Aires",
            activo=True
        ),
        Proveedor(
            nombre_empresa="Tapicería Premium",
            contacto_nombre="María López",
            email="contacto@tapiceriapremium.com",
            telefono="011-4666-5678",
            direccion="Calle Textil 567, Buenos Aires",
            activo=True
        ),
        Proveedor(
            nombre_empresa="Maderas Nativas SRL",
            contacto_nombre="Juan Pérez",
            email="info@maderasnativas.com",
            telefono="011-4777-9012",
            direccion="Ruta 8 Km 45, Pilar",
            activo=True
        ),
    ]
    
    db.session.add_all(proveedores)
    db.session.commit()
    print(f"✅ {len(proveedores)} proveedores insertados")

def seed_clientes():
    """Insertar clientes"""
    print("👥 Insertando clientes...")
    
    clientes = [
        Cliente(
            nombre_cliente="Ana",
            apellido_cliente="Martínez",
            dni_cuit="30123456",
            email_cliente="ana.martinez@email.com",
            telefono="11-5555-1111",
            direccion_cliente="Av. Corrientes 1234",
            ciudad_cliente="CABA",
            codigo_postal="1043",
            provincia_cliente="Buenos Aires"
        ),
        Cliente(
            nombre_cliente="Roberto",
            apellido_cliente="García",
            dni_cuit="25987654",
            email_cliente="roberto.g@email.com",
            telefono="11-5555-2222",
            direccion_cliente="Calle San Martín 567",
            ciudad_cliente="La Plata",
            codigo_postal="1900",
            provincia_cliente="Buenos Aires"
        ),
        Cliente(
            nombre_cliente="Laura",
            apellido_cliente="Fernández",
            dni_cuit="28456789",
            email_cliente="laura.f@email.com",
            telefono="351-555-3333",
            direccion_cliente="Bv. San Juan 890",
            ciudad_cliente="Córdoba",
            codigo_postal="5000",
            provincia_cliente="Córdoba"
        ),
        Cliente(
            nombre_cliente="Diego",
            apellido_cliente="Rodríguez",
            dni_cuit="32654321",
            email_cliente="diego.r@email.com",
            telefono="341-555-4444",
            direccion_cliente="Pellegrini 1122",
            ciudad_cliente="Rosario",
            codigo_postal="2000",
            provincia_cliente="Santa Fe"
        ),
        Cliente(
            nombre_cliente="Carla",
            apellido_cliente="López",
            dni_cuit="29111222",
            email_cliente="carla.l@email.com",
            telefono="261-555-5555",
            direccion_cliente="Las Heras 456",
            ciudad_cliente="Mendoza",
            codigo_postal="5500",
            provincia_cliente="Mendoza"
        ),
    ]
    
    db.session.add_all(clientes)
    db.session.commit()
    print(f"✅ {len(clientes)} clientes insertados")
    return clientes

def seed_ordenes(clientes, productos, usuarios):
    """Insertar órdenes con detalles"""
    print("🛒 Insertando órdenes...")
    
    # Orden 1 - Pendiente (Ana: SOF001 + MES002)
    orden1 = Orden(
        id_cliente=clientes[0].id_cliente,
        id_usuarios=usuarios[1].id_usuarios,  # Vendedor
        estado="pendiente",
        monto_total=124000
    )
    db.session.add(orden1)
    db.session.flush()
    
    detalle1_1 = DetalleOrden(
        id_orden=orden1.id_orden,
        id_producto=productos[0].id_producto,  # SOF001
        cantidad=1,
        precio_unitario=89000
    )
    detalle1_2 = DetalleOrden(
        id_orden=orden1.id_orden,
        id_producto=productos[7].id_producto,  # MES002
        cantidad=1,
        precio_unitario=35000
    )
    db.session.add_all([detalle1_1, detalle1_2])
    
    # Orden 2 - Procesando (Roberto: SIL001 x4 + MES001)
    orden2 = Orden(
        id_cliente=clientes[1].id_cliente,
        id_usuarios=usuarios[1].id_usuarios,
        estado="procesando",
        monto_total=220000
    )
    db.session.add(orden2)
    db.session.flush()
    
    detalle2_1 = DetalleOrden(
        id_orden=orden2.id_orden,
        id_producto=productos[3].id_producto,  # SIL001
        cantidad=4,
        precio_unitario=25000
    )
    detalle2_2 = DetalleOrden(
        id_orden=orden2.id_orden,
        id_producto=productos[6].id_producto,  # MES001
        cantidad=1,
        precio_unitario=120000
    )
    db.session.add_all([detalle2_1, detalle2_2])
    
    # Orden 3 - Entregada (Laura: CAM001 + EST001 x2)
    orden3 = Orden(
        id_cliente=clientes[2].id_cliente,
        id_usuarios=usuarios[1].id_usuarios,
        estado="entregado",
        monto_total=179000
    )
    db.session.add(orden3)
    db.session.flush()
    
    detalle3_1 = DetalleOrden(
        id_orden=orden3.id_orden,
        id_producto=productos[9].id_producto,  # CAM001
        cantidad=1,
        precio_unitario=95000
    )
    detalle3_2 = DetalleOrden(
        id_orden=orden3.id_orden,
        id_producto=productos[12].id_producto,  # EST001
        cantidad=2,
        precio_unitario=42000
    )
    db.session.add_all([detalle3_1, detalle3_2])
    
    db.session.commit()
    print("✅ 3 órdenes con detalles insertadas")

def run_seeds():
    """Ejecutar todos los seeds"""
    print("\n" + "="*50)
    print("🌱 INICIANDO SEEDS DE MUEBLERIAIRIS")
    print("="*50 + "\n")
    
    app = create_app()
    
    with app.app_context():
        try:
            # Limpiar datos existentes
            clear_data()
            
            # Insertar datos en orden
            roles = seed_roles()
            usuarios = seed_usuarios(roles)
            categorias = seed_categorias()
            productos = seed_productos(categorias)
            seed_imagenes(productos)
            seed_inventario(productos)
            seed_proveedores()
            clientes = seed_clientes()
            seed_ordenes(clientes, productos, usuarios)
            
            print("\n" + "="*50)
            print("✅ SEEDS COMPLETADOS EXITOSAMENTE")
            print("="*50)
            print("\n📊 Resumen:")
            print(f"   - 2 Roles")
            print(f"   - 2 Usuarios (admin@muebleria.com / Admin123!)")
            print(f"   - 5 Categorías")
            print(f"   - 15 Productos")
            print(f"   - 15 Imágenes")
            print(f"   - 15 Registros de inventario")
            print(f"   - 3 Proveedores")
            print(f"   - 5 Clientes")
            print(f"   - 3 Órdenes con detalles")
            print("\n")
            
        except Exception as e:
            db.session.rollback()
            print(f"\n❌ ERROR: {str(e)}")
            raise e

if __name__ == "__main__":
    run_seeds()
