"""
Script para poblar la base de datos con datos de prueba
Ejecutar: python backend/seed_data.py
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models import (
    Usuario, Rol, Cliente, Categoria, Producto, 
    Proveedor, Inventario, Orden, DetalleOrden
)
from app.security import hash_password
from datetime import datetime, timedelta
import random

def seed_database():
    app = create_app()
    
    with app.app_context():
        print("🗑️  Limpiando base de datos...")
        # Delete in reverse order of dependencies
        DetalleOrden.query.delete()
        Orden.query.delete()
        Inventario.query.delete()
        Producto.query.delete()
        Categoria.query.delete()
        Cliente.query.delete()
        Proveedor.query.delete()
        Usuario.query.delete()
        Rol.query.delete()
        db.session.commit()
        
        print("👥 Creando roles...")
        roles = {
            'admin': Rol(nombre_rol='Administrador', descripcion='Acceso total al sistema'),
            'vendedor': Rol(nombre_rol='Vendedor', descripcion='Gestión de ventas y clientes'),
            'inventario': Rol(nombre_rol='Inventario', descripcion='Gestión de stock y productos'),
        }
        for rol in roles.values():
            db.session.add(rol)
        db.session.commit()
        print(f"✅ {len(roles)} roles creados")
        
        print("🔐 Creando usuarios...")
        usuarios = [
            Usuario(
                nombre_us='Juan',
                apellido_us='Pérez',
                email_us='admin@muebleria.com',
                password_hash=hash_password('admin123'),
                id_rol=roles['admin'].id_rol,
                activo=True
            ),
            Usuario(
                nombre_us='María',
                apellido_us='González',
                email_us='maria@muebleria.com',
                password_hash=hash_password('vendedor123'),
                id_rol=roles['vendedor'].id_rol,
                activo=True
            ),
            Usuario(
                nombre_us='Carlos',
                apellido_us='Rodríguez',
                email_us='carlos@muebleria.com',
                password_hash=hash_password('vendedor123'),
                id_rol=roles['vendedor'].id_rol,
                activo=True
            ),
            Usuario(
                nombre_us='Ana',
                apellido_us='Martínez',
                email_us='ana@muebleria.com',
                password_hash=hash_password('inventario123'),
                id_rol=roles['inventario'].id_rol,
                activo=True
            ),
        ]
        for usuario in usuarios:
            db.session.add(usuario)
        db.session.commit()
        print(f"✅ {len(usuarios)} usuarios creados")
        
        print("👤 Creando clientes...")
        clientes = [
            Cliente(
                nombre_cliente='Roberto', apellido_cliente='Fernández',
                dni_cuit='20-34567890-1', email_cliente='roberto.fernandez@gmail.com',
                telefono='11-4567-8901', direccion_cliente='Av. Corrientes 1234',
                ciudad_cliente='Buenos Aires', provincia_cliente='Buenos Aires',
                codigo_postal='1043'
            ),
            Cliente(
                nombre_cliente='Laura', apellido_cliente='Sánchez',
                dni_cuit='27-45678901-2', email_cliente='laura.sanchez@hotmail.com',
                telefono='11-5678-9012', direccion_cliente='Calle Falsa 123',
                ciudad_cliente='La Plata', provincia_cliente='Buenos Aires',
                codigo_postal='1900'
            ),
            Cliente(
                nombre_cliente='Diego', apellido_cliente='Torres',
                dni_cuit='20-56789012-3', email_cliente='diego.torres@yahoo.com',
                telefono='341-678-9012', direccion_cliente='San Martín 456',
                ciudad_cliente='Rosario', provincia_cliente='Santa Fe',
                codigo_postal='2000'
            ),
            Cliente(
                nombre_cliente='Sofía', apellido_cliente='Ramírez',
                dni_cuit='27-67890123-4', email_cliente='sofia.ramirez@outlook.com',
                telefono='351-789-0123', direccion_cliente='Belgrano 789',
                ciudad_cliente='Córdoba', provincia_cliente='Córdoba',
                codigo_postal='5000'
            ),
            Cliente(
                nombre_cliente='Martín', apellido_cliente='López',
                dni_cuit='20-78901234-5', email_cliente='martin.lopez@gmail.com',
                telefono='261-890-1234', direccion_cliente='Las Heras 321',
                ciudad_cliente='Mendoza', provincia_cliente='Mendoza',
                codigo_postal='5500'
            ),
        ]
        for cliente in clientes:
            db.session.add(cliente)
        db.session.commit()
        print(f"✅ {len(clientes)} clientes creados")
        
        print("🏷️  Creando categorías...")
        categorias = {
            'sofas': Categoria(nombre='Sofás', descripcion='Sofás y sillones para living'),
            'sillas': Categoria(nombre='Sillas', descripcion='Sillas para comedor y oficina'),
            'mesas': Categoria(nombre='Mesas', descripcion='Mesas de comedor, ratona y escritorio'),
            'camas': Categoria(nombre='Camas', descripcion='Camas y sommiers'),
            'estanterias': Categoria(nombre='Estanterías', descripcion='Bibliotecas y modulares'),
        }
        for cat in categorias.values():
            db.session.add(cat)
        db.session.commit()
        print(f"✅ {len(categorias)} categorías creadas")
        
        print("📦 Creando productos...")
        productos = [
            # Sofás
            Producto(
                sku='SOF-001', nombre='Sofá Moderno 3 Cuerpos',
                descripcion='Sofá moderno de 3 cuerpos con tapizado en tela premium',
                precio=450000, alto_cm=85, ancho_cm=210, profundidad_cm=90,
                material='Tela premium', id_categoria=categorias['sofas'].id_categoria
            ),
            Producto(
                sku='SOF-002', nombre='Sofá Esquinero L',
                descripcion='Sofá esquinero en forma de L con respaldo reclinable',
                precio=680000, alto_cm=90, ancho_cm=280, profundidad_cm=200,
                material='Cuero sintético', id_categoria=categorias['sofas'].id_categoria
            ),
            Producto(
                sku='SOF-003', nombre='Sofá 2 Cuerpos Nórdico',
                descripcion='Sofá de 2 cuerpos estilo nórdico minimalista',
                precio=320000, alto_cm=80, ancho_cm=160, profundidad_cm=85,
                material='Lino natural', id_categoria=categorias['sofas'].id_categoria
            ),
            # Mesas
            Producto(
                sku='MES-001', nombre='Mesa de Comedor Nórdica',
                descripcion='Mesa de comedor extensible para 6-8 personas',
                precio=280000, alto_cm=75, ancho_cm=180, profundidad_cm=90,
                material='Madera de roble', id_categoria=categorias['mesas'].id_categoria
            ),
            Producto(
                sku='MES-002', nombre='Mesa Ratona Circular',
                descripcion='Mesa ratona circular con tapa de vidrio',
                precio=95000, alto_cm=45, ancho_cm=90, profundidad_cm=90,
                material='Madera y vidrio', id_categoria=categorias['mesas'].id_categoria
            ),
            Producto(
                sku='MES-003', nombre='Mesa de Trabajo Home Office',
                descripcion='Mesa de trabajo con cajones laterales',
                precio=185000, alto_cm=75, ancho_cm=140, profundidad_cm=70,
                material='MDF laqueado', id_categoria=categorias['mesas'].id_categoria
            ),
            # Sillas
            Producto(
                sku='SIL-001', nombre='Silla Ergonómica Office',
                descripcion='Silla ergonómica con soporte lumbar ajustable',
                precio=185000, alto_cm=110, ancho_cm=60, profundidad_cm=60,
                material='Malla transpirable', id_categoria=categorias['sillas'].id_categoria
            ),
            Producto(
                sku='SIL-002', nombre='Silla de Comedor Pack x4',
                descripcion='Set de 4 sillas de comedor con respaldo alto',
                precio=240000, alto_cm=95, ancho_cm=45, profundidad_cm=50,
                material='Madera y tela', id_categoria=categorias['sillas'].id_categoria
            ),
            Producto(
                sku='SIL-003', nombre='Silla Gaming Pro',
                descripcion='Silla gamer profesional con reposabrazos 4D',
                precio=320000, alto_cm=130, ancho_cm=70, profundidad_cm=65,
                material='Cuero y metal', id_categoria=categorias['sillas'].id_categoria
            ),
            # Camas
            Producto(
                sku='CAM-001', nombre='Cama Queen con Respaldo',
                descripcion='Cama Queen size con respaldo tapizado',
                precio=520000, alto_cm=110, ancho_cm=160, profundidad_cm=200,
                material='Madera maciza', id_categoria=categorias['camas'].id_categoria
            ),
            Producto(
                sku='CAM-002', nombre='Cama King Size Premium',
                descripcion='Cama King size con base reforzada',
                precio=780000, alto_cm=120, ancho_cm=180, profundidad_cm=200,
                material='Roble americano', id_categoria=categorias['camas'].id_categoria
            ),
            Producto(
                sku='CAM-003', nombre='Cama 1 Plaza Juvenil',
                descripcion='Cama individual con cajones inferiores',
                precio=280000, alto_cm=90, ancho_cm=90, profundidad_cm=190,
                material='Pino laqueado', id_categoria=categorias['camas'].id_categoria
            ),
            # Estanterías
            Producto(
                sku='EST-001', nombre='Biblioteca 5 Estantes',
                descripcion='Biblioteca modular de 5 estantes regulables',
                precio=145000, alto_cm=180, ancho_cm=80, profundidad_cm=30,
                material='MDF melamínico', id_categoria=categorias['estanterias'].id_categoria
            ),
            Producto(
                sku='EST-002', nombre='Estante Flotante Pack x3',
                descripcion='Set de 3 estantes flotantes de pared',
                precio=65000, alto_cm=4, ancho_cm=80, profundidad_cm=25,
                material='Madera natural', id_categoria=categorias['estanterias'].id_categoria
            ),
            Producto(
                sku='EST-003', nombre='Modular TV 180cm',
                descripcion='Mueble modular para TV con cajones y estantes',
                precio=320000, alto_cm=60, ancho_cm=180, profundidad_cm=45,
                material='Roble y metal', id_categoria=categorias['estanterias'].id_categoria
            ),
        ]
        for producto in productos:
            db.session.add(producto)
        db.session.commit()
        print(f"✅ {len(productos)} productos creados")
        
        print("🏭 Creando proveedores...")
        proveedores = [
            Proveedor(
                nombre_empresa='Maderas del Sur S.A.',
                contacto_nombre='Ricardo Gómez',
                telefono='11-4321-5678',
                email='ventas@maderasdelsur.com.ar',
                direccion='Parque Industrial 123, Quilmes',
                activo=True
            ),
            Proveedor(
                nombre_empresa='Textiles Industriales',
                contacto_nombre='Gabriela Vázquez',
                telefono='11-5432-6789',
                email='contacto@textilesind.com.ar',
                direccion='Av. San Martín 456, Avellaneda',
                activo=True
            ),
            Proveedor(
                nombre_empresa='Herrajes y Accesorios Premium',
                contacto_nombre='Osvaldo Ríos',
                telefono='11-6543-7890',
                email='herrajes@premium.com.ar',
                direccion='Ruta 3 Km 45, San Justo',
                activo=True
            ),
        ]
        for proveedor in proveedores:
            db.session.add(proveedor)
        db.session.commit()
        print(f"✅ {len(proveedores)} proveedores creados")
        
        print("📊 Creando inventario...")
        for producto in productos:
            stock_inicial = random.randint(5, 50)
            inventario = Inventario(
                id_producto=producto.id_producto,
                cantidad_stock=stock_inicial,
                stock_minimo=5,
                ubicacion=f'Depósito {random.choice(["A", "B", "C"])}-{random.randint(1, 20)}'
            )
            db.session.add(inventario)
        db.session.commit()
        print(f"✅ {len(productos)} registros de inventario creados")
        
        print("🛒 Creando órdenes de prueba...")
        estados = ['pendiente', 'en_proceso', 'completada', 'completada', 'completada']
        
        for i in range(10):
            # Fecha aleatoria en los últimos 30 días
            dias_atras = random.randint(0, 30)
            fecha = datetime.now() - timedelta(days=dias_atras)
            
            orden = Orden(
                id_cliente=random.choice(clientes).id_cliente,
                id_usuarios=random.choice(usuarios).id_usuarios,
                fecha_creacion=fecha,
                estado=random.choice(estados),
                monto_total=0.0  # Inicializar en 0
            )
            db.session.add(orden)
            db.session.flush()  # Get orden.id
            
            # Agregar 1-4 productos aleatorios
            num_productos = random.randint(1, 4)
            productos_orden = random.sample(productos, num_productos)
            
            monto_orden = 0.0
            for producto in productos_orden:
                cantidad = random.randint(1, 3)
                detalle = DetalleOrden(
                    id_orden=orden.id_orden,
                    id_producto=producto.id_producto,
                    cantidad=cantidad,
                    precio_unitario=producto.precio
                )
                db.session.add(detalle)
                # Acumular el monto total
                monto_orden += float(producto.precio) * cantidad
            
            # Actualizar el monto total de la orden
            orden.monto_total = monto_orden
        
        db.session.commit()
        print(f"✅ 10 órdenes con detalles creadas")
        
        print("\n🎉 ¡Base de datos poblada exitosamente!\n")
        print("=" * 60)
        print("CREDENCIALES DE ACCESO:")
        print("=" * 60)
        print("👤 Administrador:")
        print("   Email: admin@muebleria.com")
        print("   Password: admin123")
        print("\n👤 Vendedor:")
        print("   Email: maria@muebleria.com")
        print("   Password: vendedor123")
        print("\n👤 Inventario:")
        print("   Email: ana@muebleria.com")
        print("   Password: inventario123")
        print("=" * 60)

if __name__ == '__main__':
    seed_database()
