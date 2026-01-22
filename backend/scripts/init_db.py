"""
Script para inicializar la base de datos
Crea todas las tablas definidas en los modelos
"""
from app import create_app, db
from app.models import (
    Rol, Usuario, Categoria, Producto, ImagenProducto,
    Proveedor, Inventario, Cliente, Orden, DetalleOrden
)

def init_database():
    """Crear todas las tablas en la base de datos"""
    app = create_app()
    
    with app.app_context():
        print("🗄️  Eliminando tablas existentes...")
        db.drop_all()
        
        print("📦 Creando tablas...")
        db.create_all()
        
        print("✅ Base de datos inicializada correctamente")
        print("\nTablas creadas:")
        print("  - roles")
        print("  - usuarios")
        print("  - categoria")
        print("  - productos")
        print("  - imagen_producto")
        print("  - proveedor")
        print("  - inventario")
        print("  - cliente")
        print("  - orden")
        print("  - detalle_orden")

if __name__ == "__main__":
    init_database()
