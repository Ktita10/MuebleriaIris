#!/usr/bin/env python3
"""Check orden values in database"""

from app.models import Orden
from app import create_app, db

app = create_app()

with app.app_context():
    ordenes = Orden.query.all()
    print(f"Total órdenes: {len(ordenes)}\n")
    
    for orden in ordenes[:5]:
        print(f"Orden #{orden.id_orden}:")
        print(f"  - Estado: {orden.estado}")
        print(f"  - Monto total: {orden.monto_total}")
        print(f"  - Fecha: {orden.fecha_creacion}")
        print(f"  - Detalles: {len(orden.detalles)}")
        
        # Calcular total desde detalles
        total_calculado = sum(
            float(d.cantidad * d.precio_unitario) 
            for d in orden.detalles
        )
        print(f"  - Total calculado desde detalles: ${total_calculado:,.2f}")
        print()
