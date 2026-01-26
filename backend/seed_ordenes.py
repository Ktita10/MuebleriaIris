"""
Script para crear órdenes de ejemplo
"""
import sys
import os
from datetime import datetime, timedelta, timezone
import random

# Add parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app, db
from app.models import Orden, DetalleOrden, Cliente, Usuario, Producto, Inventario

def seed_ordenes():
    """Crear órdenes de ejemplo"""
    app = create_app()
    
    with app.app_context():
        print("🔄 Creando órdenes de ejemplo...")
        
        # Verificar si ya hay órdenes
        ordenes_existentes = Orden.query.count()
        if ordenes_existentes > 0:
            print(f"ℹ️  Ya existen {ordenes_existentes} órdenes")
            respuesta = input("¿Deseas crear más órdenes de ejemplo? (s/n): ")
            if respuesta.lower() != 's':
                return
        
        # Obtener datos necesarios
        clientes = Cliente.query.all()
        vendedores = Usuario.query.filter_by(activo=True).all()
        productos = Producto.query.filter_by(activo=True).all()
        
        if not clientes or not vendedores or not productos:
            print("❌ Error: Faltan datos básicos (clientes, vendedores o productos)")
            return
        
        print(f"📊 Datos disponibles:")
        print(f"  - Clientes: {len(clientes)}")
        print(f"  - Vendedores: {len(vendedores)}")
        print(f"  - Productos: {len(productos)}")
        
        # Estados posibles
        estados = ['pendiente', 'en_proceso', 'completada']
        
        # Crear 10 órdenes
        ordenes_creadas = 0
        
        for i in range(10):
            try:
                cliente = random.choice(clientes)
                vendedor = random.choice(vendedores)
                
                # Fecha aleatoria en los últimos 30 días
                dias_atras = random.randint(0, 30)
                fecha_orden = datetime.now(timezone.utc) - timedelta(days=dias_atras)
                
                # Crear orden
                nueva_orden = Orden(
                    id_cliente=cliente.id_cliente,
                    id_usuarios=vendedor.id_usuarios,
                    estado=random.choice(estados),
                    monto_total=0,  # Se calculará después
                    fecha_creacion=fecha_orden
                )
                db.session.add(nueva_orden)
                db.session.flush()  # Para obtener el ID
                
                # Agregar entre 1 y 4 productos aleatorios
                num_productos = random.randint(1, 4)
                productos_orden = random.sample(productos, min(num_productos, len(productos)))
                
                monto_total = 0
                
                for producto in productos_orden:
                    # Cantidad aleatoria entre 1 y 3
                    cantidad = random.randint(1, 3)
                    precio_unitario = float(producto.precio)
                    
                    # Verificar stock
                    inventario = Inventario.query.filter_by(id_producto=producto.id_producto).first()
                    if inventario and inventario.cantidad_stock >= cantidad:
                        # Crear detalle
                        detalle = DetalleOrden(
                            id_orden=nueva_orden.id_orden,
                            id_producto=producto.id_producto,
                            cantidad=cantidad,
                            precio_unitario=precio_unitario
                        )
                        db.session.add(detalle)
                        
                        # Descontar stock solo si la orden está completada
                        if nueva_orden.estado == 'completada':
                            inventario.cantidad_stock -= cantidad
                        
                        monto_total += precio_unitario * cantidad
                
                # Actualizar monto total
                nueva_orden.monto_total = monto_total
                
                db.session.commit()
                ordenes_creadas += 1
                print(f"  ✓ Orden #{nueva_orden.id_orden} - Cliente: {cliente.nombre_cliente} {cliente.apellido_cliente} - Total: ${monto_total:,.2f} - Estado: {nueva_orden.estado}")
                
            except Exception as e:
                db.session.rollback()
                print(f"  ✗ Error creando orden {i+1}: {str(e)}")
        
        print(f"\n✅ {ordenes_creadas} órdenes creadas exitosamente!")
        
        # Mostrar resumen
        print(f"\n📊 Resumen final:")
        print(f"  - Total órdenes: {Orden.query.count()}")
        print(f"  - Órdenes pendientes: {Orden.query.filter_by(estado='pendiente').count()}")
        print(f"  - Órdenes en proceso: {Orden.query.filter_by(estado='en_proceso').count()}")
        print(f"  - Órdenes completadas: {Orden.query.filter_by(estado='completada').count()}")
        
        ventas_totales = sum(float(o.monto_total) for o in Orden.query.filter(Orden.estado != 'cancelada').all())
        print(f"  - Ventas totales: ${ventas_totales:,.2f}")

if __name__ == "__main__":
    seed_ordenes()
