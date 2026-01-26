"""
Script para crear datos de inventario iniciales
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app, db
from app.models import Producto, Inventario

def seed_inventario():
    """Crear datos de inventario para todos los productos"""
    app = create_app()
    
    with app.app_context():
        print("🔄 Verificando inventario...")
        
        # Obtener todos los productos
        productos = Producto.query.all()
        print(f"📦 Encontrados {len(productos)} productos")
        
        # Verificar cuántos ya tienen inventario
        productos_sin_inventario = []
        for producto in productos:
            inventario = Inventario.query.filter_by(id_producto=producto.id_producto).first()
            if not inventario:
                productos_sin_inventario.append(producto)
        
        if not productos_sin_inventario:
            print("✅ Todos los productos ya tienen inventario")
            return
        
        print(f"➕ Creando inventario para {len(productos_sin_inventario)} productos...")
        
        # Crear inventario para productos sin inventario
        for producto in productos_sin_inventario:
            # Stock aleatorio entre 5 y 50
            import random
            stock_aleatorio = random.randint(5, 50)
            
            inventario = Inventario(
                id_producto=producto.id_producto,
                cantidad_stock=stock_aleatorio,
                stock_minimo=5,
                ubicacion="Depósito Principal"
            )
            db.session.add(inventario)
            print(f"  ✓ {producto.sku} - {producto.nombre}: {stock_aleatorio} unidades")
        
        db.session.commit()
        print("\n✅ Inventario creado exitosamente!")
        
        # Mostrar resumen
        total_inventario = Inventario.query.count()
        print(f"\n📊 Resumen:")
        print(f"  - Total productos con inventario: {total_inventario}")
        print(f"  - Productos activos: {Producto.query.filter_by(activo=True).count()}")

if __name__ == "__main__":
    seed_inventario()
