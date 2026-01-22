"""
Script para poblar la base de datos con datos de prueba
"""
from app import create_app, db
from app.models import (
    Rol, Usuario, Categoria, Producto, ImagenProducto,
    Proveedor, Inventario, Cliente
)
from datetime import datetime, timezone

def seed_database():
    """Poblar base de datos con datos de prueba"""
    app = create_app()
    
    with app.app_context():
        print("🌱 Poblando base de datos...")
        
        # 1. ROLES
        print("\n📋 Creando roles...")
        roles_data = [
            {"nombre_rol": "Administrador", "descripcion": "Acceso total al sistema"},
            {"nombre_rol": "Vendedor", "descripcion": "Gestión de ventas y clientes"},
            {"nombre_rol": "Supervisor", "descripcion": "Supervisión de operaciones"},
            {"nombre_rol": "Almacén", "descripcion": "Gestión de inventario"}
        ]
        
        roles = {}
        for rol_data in roles_data:
            rol = Rol(**rol_data)
            db.session.add(rol)
            roles[rol_data["nombre_rol"]] = rol
        
        db.session.flush()
        print(f"  ✓ {len(roles)} roles creados")
        
        # 2. USUARIOS
        print("\n👤 Creando usuarios...")
        usuarios_data = [
            {
                "nombre_us": "Juan",
                "apellido_us": "Pérez",
                "email_us": "admin@muebleria.com",
                "password_hash": "admin123",  # TODO: Hash real
                "id_rol": roles["Administrador"].id_rol
            },
            {
                "nombre_us": "María",
                "apellido_us": "González",
                "email_us": "maria@muebleria.com",
                "password_hash": "vendedor123",
                "id_rol": roles["Vendedor"].id_rol
            },
            {
                "nombre_us": "Carlos",
                "apellido_us": "Rodríguez",
                "email_us": "carlos@muebleria.com",
                "password_hash": "vendedor123",
                "id_rol": roles["Vendedor"].id_rol
            }
        ]
        
        for usuario_data in usuarios_data:
            usuario = Usuario(**usuario_data)
            db.session.add(usuario)
        
        db.session.flush()
        print(f"  ✓ {len(usuarios_data)} usuarios creados")
        
        # 3. CATEGORÍAS
        print("\n📦 Creando categorías...")
        categorias_data = [
            {"nombre": "Sofás", "descripcion": "Sofás de 2 y 3 cuerpos, esquineros"},
            {"nombre": "Sillas", "descripcion": "Sillas de comedor, escritorio, bar"},
            {"nombre": "Mesas", "descripcion": "Mesas de comedor, centro, auxiliares"},
            {"nombre": "Camas", "descripcion": "Camas individuales, matrimoniales, queen, king"},
            {"nombre": "Armarios", "descripcion": "Placares, roperos, vestidores"},
            {"nombre": "Bibliotecas", "descripcion": "Estanterías y bibliotecas"}
        ]
        
        categorias = {}
        for cat_data in categorias_data:
            cat = Categoria(**cat_data)
            db.session.add(cat)
            categorias[cat_data["nombre"]] = cat
        
        db.session.flush()
        print(f"  ✓ {len(categorias)} categorías creadas")
        
        # 4. PRODUCTOS
        print("\n🛋️  Creando productos...")
        productos_data = [
            # Sofás
            {
                "sku": "SOF001",
                "nombre": "Sofá 3 Cuerpos Moderno",
                "descripcion": "Sofá tapizado en tela premium, estructura de madera",
                "precio": 89999.99,
                "id_categoria": categorias["Sofás"].id_categoria,
                "profundidad_cm": 90,
                "ancho_cm": 210,
                "alto_cm": 85,
                "material": "Tela premium, madera"
            },
            {
                "sku": "SOF002",
                "nombre": "Sofá 2 Cuerpos Clásico",
                "descripcion": "Sofá estilo clásico, tapizado en cuero sintético",
                "precio": 65999.99,
                "id_categoria": categorias["Sofás"].id_categoria,
                "profundidad_cm": 85,
                "ancho_cm": 160,
                "alto_cm": 80,
                "material": "Cuero sintético, madera"
            },
            # Sillas
            {
                "sku": "SIL001",
                "nombre": "Silla de Comedor Colonial",
                "descripcion": "Silla de madera maciza estilo colonial",
                "precio": 15999.99,
                "id_categoria": categorias["Sillas"].id_categoria,
                "profundidad_cm": 45,
                "ancho_cm": 45,
                "alto_cm": 95,
                "material": "Madera maciza"
            },
            {
                "sku": "SIL002",
                "nombre": "Silla Escandinava",
                "descripcion": "Silla moderna estilo escandinavo con patas de madera",
                "precio": 12999.99,
                "id_categoria": categorias["Sillas"].id_categoria,
                "profundidad_cm": 42,
                "ancho_cm": 42,
                "alto_cm": 82,
                "material": "Plástico, madera"
            },
            # Mesas
            {
                "sku": "MES001",
                "nombre": "Mesa de Comedor 6 Personas",
                "descripcion": "Mesa extensible de madera para 6-8 personas",
                "precio": 54999.99,
                "id_categoria": categorias["Mesas"].id_categoria,
                "profundidad_cm": 90,
                "ancho_cm": 160,
                "alto_cm": 75,
                "material": "Madera maciza"
            },
            {
                "sku": "MES002",
                "nombre": "Mesa Ratona Moderna",
                "descripcion": "Mesa de centro con tapa de vidrio templado",
                "precio": 24999.99,
                "id_categoria": categorias["Mesas"].id_categoria,
                "profundidad_cm": 60,
                "ancho_cm": 100,
                "alto_cm": 40,
                "material": "Vidrio templado, metal"
            },
            # Camas
            {
                "sku": "CAM001",
                "nombre": "Cama Queen con Respaldo",
                "descripcion": "Cama tamaño queen con respaldo tapizado",
                "precio": 75999.99,
                "id_categoria": categorias["Camas"].id_categoria,
                "profundidad_cm": 200,
                "ancho_cm": 160,
                "alto_cm": 120,
                "material": "Madera, tela"
            },
            # Armarios
            {
                "sku": "ARM001",
                "nombre": "Placard 3 Puertas",
                "descripcion": "Ropero de 3 puertas con barral y estantes",
                "precio": 94999.99,
                "id_categoria": categorias["Armarios"].id_categoria,
                "profundidad_cm": 60,
                "ancho_cm": 150,
                "alto_cm": 200,
                "material": "MDF laqueado"
            },
            # Bibliotecas
            {
                "sku": "BIB001",
                "nombre": "Biblioteca 5 Estantes",
                "descripcion": "Biblioteca modular de 5 estantes ajustables",
                "precio": 32999.99,
                "id_categoria": categorias["Bibliotecas"].id_categoria,
                "profundidad_cm": 30,
                "ancho_cm": 80,
                "alto_cm": 180,
                "material": "MDF"
            }
        ]
        
        productos = {}
        for prod_data in productos_data:
            prod = Producto(**prod_data)
            db.session.add(prod)
            productos[prod_data["sku"]] = prod
        
        db.session.flush()
        print(f"  ✓ {len(productos)} productos creados")
        
        # 5. INVENTARIO
        print("\n📊 Creando inventario...")
        for sku, producto in productos.items():
            inventario = Inventario(
                id_producto=producto.id_producto,
                cantidad_stock=15,  # Stock inicial
                stock_minimo=5,
                ubicacion=f"Estante-{producto.id_producto}"
            )
            db.session.add(inventario)
        
        db.session.flush()
        print(f"  ✓ {len(productos)} items de inventario creados")
        
        # 6. PROVEEDORES
        print("\n🏢 Creando proveedores...")
        proveedores_data = [
            {
                "nombre_empresa": "Maderas del Sur S.A.",
                "contacto_nombre": "Roberto Sánchez",
                "telefono": "011 4567-8901",
                "email": "contacto@maderasdelsur.com.ar",
                "direccion": "Av. Industrial 1234, CABA"
            },
            {
                "nombre_empresa": "Tapicería Premium",
                "contacto_nombre": "Laura Martínez",
                "telefono": "011 4567-8902",
                "email": "ventas@tapiceriapremium.com.ar",
                "direccion": "Belgrano 567, CABA"
            },
            {
                "nombre_empresa": "Herrajes y Accesorios",
                "contacto_nombre": "Diego Fernández",
                "telefono": "011 4567-8903",
                "email": "info@herrajespro.com.ar",
                "direccion": "San Martín 890, CABA"
            }
        ]
        
        for prov_data in proveedores_data:
            prov = Proveedor(**prov_data)
            db.session.add(prov)
        
        db.session.flush()
        print(f"  ✓ {len(proveedores_data)} proveedores creados")
        
        # 7. CLIENTES
        print("\n👥 Creando clientes...")
        clientes_data = [
            {
                "nombre_cliente": "Ana",
                "apellido_cliente": "García",
                "dni_cuit": "20-35123456-7",
                "email_cliente": "ana.garcia@email.com",
                "telefono": "11 5555-1234",
                "direccion_cliente": "Av. Corrientes 1500",
                "ciudad_cliente": "CABA",
                "provincia_cliente": "Buenos Aires",
                "codigo_postal": "C1042"
            },
            {
                "nombre_cliente": "Pedro",
                "apellido_cliente": "López",
                "dni_cuit": "20-28456789-3",
                "email_cliente": "pedro.lopez@email.com",
                "telefono": "11 5555-5678",
                "direccion_cliente": "Calle Falsa 123",
                "ciudad_cliente": "Vicente López",
                "provincia_cliente": "Buenos Aires",
                "codigo_postal": "B1638"
            },
            {
                "nombre_cliente": "Lucía",
                "apellido_cliente": "Fernández",
                "dni_cuit": "27-42789012-5",
                "email_cliente": "lucia.fernandez@email.com",
                "telefono": "11 5555-9012",
                "direccion_cliente": "San Martín 456",
                "ciudad_cliente": "San Isidro",
                "provincia_cliente": "Buenos Aires",
                "codigo_postal": "B1642"
            }
        ]
        
        for cliente_data in clientes_data:
            cliente = Cliente(**cliente_data)
            db.session.add(cliente)
        
        db.session.flush()
        print(f"  ✓ {len(clientes_data)} clientes creados")
        
        # COMMIT FINAL
        db.session.commit()
        
        print("\n✅ Base de datos poblada exitosamente")
        print("\n📊 Resumen:")
        print(f"  - Roles: {len(roles)}")
        print(f"  - Usuarios: {len(usuarios_data)}")
        print(f"  - Categorías: {len(categorias)}")
        print(f"  - Productos: {len(productos)}")
        print(f"  - Inventario: {len(productos)}")
        print(f"  - Proveedores: {len(proveedores_data)}")
        print(f"  - Clientes: {len(clientes_data)}")
        
        print("\n🔑 Credenciales de prueba:")
        print("  - Admin: admin@muebleria.com / admin123")
        print("  - Vendedor: maria@muebleria.com / vendedor123")

if __name__ == "__main__":
    seed_database()
