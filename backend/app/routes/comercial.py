"""
Blueprint de Comercial - Clientes, Órdenes, Detalles, Pagos
Módulo ERP: Gestión comercial y ventas
"""
from flask import Blueprint, jsonify, request
from .. import db
from ..models import Cliente, Orden, DetalleOrden, Producto, Inventario
from datetime import datetime, timezone

comercial_bp = Blueprint('comercial', __name__, url_prefix='/api')


# ==============================================================================
#                                  CLIENTES
# ==============================================================================

@comercial_bp.route('/clientes', methods=['GET'])
def get_clientes():
    """Obtener todos los clientes"""
    try:
        clientes = Cliente.query.all()
        return jsonify([c.to_dict() for c in clientes]), 200
    except Exception as e:
        return jsonify({"error": "Error al obtener clientes", "detalle": str(e)}), 500


@comercial_bp.route('/clientes', methods=['POST'])
def create_cliente():
    """
    Crear nuevo cliente
    Body: {
        "nombre_cliente": str (requerido),
        "apellido_cliente": str (requerido),
        "dni_cuit": str (requerido, único),
        "email_cliente": str (requerido, único),
        "telefono": str (requerido),
        "direccion_cliente": str (requerido),
        "ciudad_cliente": str (requerido),
        "provincia_cliente": str (requerido),
        "codigo_postal": str (requerido)
    }
    """
    data = request.get_json()

    # Validación de campos requeridos
    campos_requeridos = ["nombre_cliente", "apellido_cliente", "dni_cuit", "email_cliente", 
                         "telefono", "direccion_cliente", "ciudad_cliente", "provincia_cliente", "codigo_postal"]
    for campo in campos_requeridos:
        if campo not in data:
            return jsonify({"error": f"El campo '{campo}' es requerido"}), 400

    # Verificar email único
    if Cliente.query.filter_by(email_cliente=data["email_cliente"]).first():
        return jsonify({"error": "Ya existe un cliente con ese email"}), 409

    # Verificar DNI/CUIT único
    if Cliente.query.filter_by(dni_cuit=data["dni_cuit"]).first():
        return jsonify({"error": "Ya existe un cliente con ese DNI/CUIT"}), 409

    nuevo_cliente = Cliente(
        nombre_cliente=data["nombre_cliente"].strip(),
        apellido_cliente=data["apellido_cliente"].strip(),
        dni_cuit=data["dni_cuit"].strip(),
        email_cliente=data["email_cliente"].strip(),
        telefono=data["telefono"].strip(),
        direccion_cliente=data["direccion_cliente"].strip(),
        ciudad_cliente=data["ciudad_cliente"].strip(),
        provincia_cliente=data["provincia_cliente"].strip(),
        codigo_postal=data["codigo_postal"].strip()
    )

    try:
        db.session.add(nuevo_cliente)
        db.session.commit()
        return jsonify({
            "mensaje": "Cliente creado exitosamente",
            "cliente": nuevo_cliente.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al crear cliente", "detalle": str(e)}), 500


@comercial_bp.route('/clientes/<int:id>', methods=['GET'])
def get_cliente(id):
    """Obtener un cliente por ID"""
    cliente = Cliente.query.get(id)
    if not cliente:
        return jsonify({"error": "Cliente no encontrado"}), 404
    
    return jsonify(cliente.to_dict()), 200


@comercial_bp.route('/clientes/<int:id>', methods=['PUT'])
def update_cliente(id):
    """Actualizar cliente"""
    cliente = Cliente.query.get(id)
    if not cliente:
        return jsonify({"error": "Cliente no encontrado"}), 404

    data = request.get_json()

    campos_actualizables = ["nombre_cliente", "apellido_cliente", "dni_cuit", "email_cliente", 
                           "telefono", "direccion_cliente", "ciudad_cliente", "provincia_cliente", "codigo_postal"]
    
    for campo in campos_actualizables:
        if campo in data:
            valor = data[campo].strip() if isinstance(data[campo], str) else data[campo]
            setattr(cliente, campo, valor or None)

    try:
        db.session.commit()
        return jsonify({
            "mensaje": "Cliente actualizado exitosamente",
            "cliente": cliente.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al actualizar cliente", "detalle": str(e)}), 500


@comercial_bp.route('/clientes/<int:id>', methods=['DELETE'])
def delete_cliente(id):
    """Eliminar cliente (hard delete - solo si no tiene órdenes)"""
    cliente = Cliente.query.get(id)
    if not cliente:
        return jsonify({"error": "Cliente no encontrado"}), 404

    # Verificar que no tenga órdenes
    if cliente.ordenes and len(cliente.ordenes) > 0:
        return jsonify({
            "error": "No se puede eliminar el cliente porque tiene órdenes asociadas",
            "ordenes_asociadas": len(cliente.ordenes)
        }), 409

    try:
        db.session.delete(cliente)
        db.session.commit()
        return jsonify({"mensaje": "Cliente eliminado exitosamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al eliminar cliente", "detalle": str(e)}), 500


# ==============================================================================
#                                  ÓRDENES
# ==============================================================================

@comercial_bp.route('/ordenes', methods=['GET'])
def get_ordenes():
    """
    Obtener todas las órdenes
    Query params: ?cliente_id=1&estado=pendiente
    """
    try:
        query = Orden.query

        # Filtro por cliente
        cliente_id = request.args.get('cliente_id', type=int)
        if cliente_id:
            query = query.filter_by(id_cliente=cliente_id)

        # Filtro por estado
        estado = request.args.get('estado')
        if estado:
            query = query.filter_by(estado=estado)

        ordenes = query.order_by(Orden.fecha_creacion.desc()).all()
        return jsonify([o.to_dict() for o in ordenes]), 200
    except Exception as e:
        return jsonify({"error": "Error al obtener órdenes", "detalle": str(e)}), 500


@comercial_bp.route('/ordenes', methods=['POST'])
def create_orden():
    """
    Crear nueva orden (con lógica de negocio completa)
    Body: {
        "id_cliente": int (requerido),
        "id_vendedor": int (requerido),
        "items": [
            {
                "id_producto": int,
                "cantidad": int,
                "precio_unitario": float (opcional, usa precio del producto)
            }
        ]
    }
    """
    data = request.get_json()

    # Validación de campos requeridos
    if not data or "id_cliente" not in data or "id_vendedor" not in data or "items" not in data:
        return jsonify({"error": "Campos 'id_cliente', 'id_vendedor' e 'items' son requeridos"}), 400

    if not data["items"] or len(data["items"]) == 0:
        return jsonify({"error": "La orden debe tener al menos un item"}), 400

    try:
        # 1. Crear orden header
        nueva_orden = Orden(
            id_cliente=data["id_cliente"],
            id_usuarios=data["id_vendedor"],
            estado="pendiente",
            monto_total=0  # Se calculará después
        )
        db.session.add(nueva_orden)
        db.session.flush()  # Obtener ID sin hacer commit

        # 2. Procesar items y validar stock
        monto_total = 0
        detalles_creados = []

        for item in data["items"]:
            # Validar campos del item
            if "id_producto" not in item or "cantidad" not in item:
                raise ValueError("Cada item debe tener 'id_producto' y 'cantidad'")

            # Obtener producto
            producto = Producto.query.get(item["id_producto"])
            if not producto:
                raise ValueError(f"Producto {item['id_producto']} no encontrado")

            # Obtener inventario
            inventario = Inventario.query.filter_by(id_producto=producto.id_producto).first()
            if not inventario:
                raise ValueError(f"No hay inventario para el producto {producto.nombre}")

            # Validar stock disponible
            cantidad = item["cantidad"]
            if inventario.cantidad_stock < cantidad:
                raise ValueError(
                    f"Stock insuficiente para {producto.nombre}. "
                    f"Disponible: {inventario.cantidad_stock}, Solicitado: {cantidad}"
                )

            # Calcular precio (usar el del item o el del producto)
            precio_unitario = item.get("precio_unitario", float(producto.precio))
            subtotal = precio_unitario * cantidad

            # Crear detalle de orden
            detalle = DetalleOrden(
                id_orden=nueva_orden.id_orden,
                id_producto=producto.id_producto,
                cantidad=cantidad,
                precio_unitario=precio_unitario
            )
            db.session.add(detalle)
            detalles_creados.append(detalle)

            # Descontar stock
            inventario.cantidad_stock -= cantidad
            monto_total += subtotal

        # 3. Actualizar monto total de la orden
        nueva_orden.monto_total = monto_total

        # 4. Commit de todo (transacción atómica)
        db.session.commit()

        # 5. Preparar respuesta
        return jsonify({
            "mensaje": "Orden creada exitosamente",
            "orden": nueva_orden.to_dict(),
            "items_procesados": len(detalles_creados),
            "monto_total": float(monto_total)
        }), 201

    except ValueError as ve:
        db.session.rollback()
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al crear orden", "detalle": str(e)}), 500


@comercial_bp.route('/ordenes/<int:id>', methods=['GET'])
def get_orden(id):
    """Obtener una orden por ID (con detalles)"""
    orden = Orden.query.get(id)
    if not orden:
        return jsonify({"error": "Orden no encontrada"}), 404
    
    orden_dict = orden.to_dict()
    
    # Agregar detalles de la orden
    detalles = DetalleOrden.query.filter_by(id_orden=id).all()
    orden_dict["detalles"] = [d.to_dict() for d in detalles]
    
    return jsonify(orden_dict), 200


@comercial_bp.route('/ordenes/<int:id>/estado', methods=['PATCH'])
def update_estado_orden(id):
    """
    Actualizar estado de orden
    Body: {"estado": "pendiente" | "en_proceso" | "completada" | "cancelada"}
    """
    orden = Orden.query.get(id)
    if not orden:
        return jsonify({"error": "Orden no encontrada"}), 404

    data = request.get_json()
    if not data or "estado" not in data:
        return jsonify({"error": "El campo 'estado' es requerido"}), 400

    estados_validos = ["pendiente", "en_proceso", "completada", "cancelada"]
    if data["estado"] not in estados_validos:
        return jsonify({"error": f"Estado inválido. Debe ser uno de: {', '.join(estados_validos)}"}), 400

    # Si se cancela la orden, devolver stock
    if data["estado"] == "cancelada" and orden.estado != "cancelada":
        try:
            detalles = DetalleOrden.query.filter_by(id_orden=id).all()
            for detalle in detalles:
                inventario = Inventario.query.filter_by(id_producto=detalle.id_producto).first()
                if inventario:
                    inventario.cantidad_stock += detalle.cantidad
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": "Error al devolver stock", "detalle": str(e)}), 500

    orden.estado = data["estado"]

    try:
        db.session.commit()
        return jsonify({
            "mensaje": "Estado actualizado exitosamente",
            "orden": orden.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al actualizar estado", "detalle": str(e)}), 500


@comercial_bp.route('/ordenes/<int:id>', methods=['DELETE'])
def delete_orden(id):
    """Cancelar orden (y devolver stock)"""
    orden = Orden.query.get(id)
    if not orden:
        return jsonify({"error": "Orden no encontrada"}), 404

    if orden.estado == "completada":
        return jsonify({"error": "No se puede cancelar una orden completada"}), 400

    try:
        # Devolver stock
        detalles = DetalleOrden.query.filter_by(id_orden=id).all()
        for detalle in detalles:
            inventario = Inventario.query.filter_by(id_producto=detalle.id_producto).first()
            if inventario:
                inventario.cantidad_stock += detalle.cantidad

        # Marcar como cancelada
        orden.estado = "cancelada"
        db.session.commit()

        return jsonify({"mensaje": "Orden cancelada y stock devuelto exitosamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al cancelar orden", "detalle": str(e)}), 500


# ==============================================================================
#                              DETALLES DE ORDEN
# ==============================================================================

@comercial_bp.route('/ordenes/<int:orden_id>/detalles', methods=['GET'])
def get_detalles_orden(orden_id):
    """Obtener todos los detalles de una orden"""
    orden = Orden.query.get(orden_id)
    if not orden:
        return jsonify({"error": "Orden no encontrada"}), 404

    detalles = DetalleOrden.query.filter_by(id_orden=orden_id).all()
    return jsonify([d.to_dict() for d in detalles]), 200


# ==============================================================================
#                              REPORTES COMERCIALES
# ==============================================================================

@comercial_bp.route('/reportes/ventas', methods=['GET'])
def reporte_ventas():
    """
    Reporte de ventas
    Query params: ?fecha_inicio=YYYY-MM-DD&fecha_fin=YYYY-MM-DD
    """
    try:
        query = Orden.query.filter(Orden.estado != "cancelada")

        # Filtro por fecha
        fecha_inicio = request.args.get('fecha_inicio')
        fecha_fin = request.args.get('fecha_fin')

        if fecha_inicio:
            fecha_inicio_dt = datetime.fromisoformat(fecha_inicio)
            query = query.filter(Orden.fecha_creacion >= fecha_inicio_dt)

        if fecha_fin:
            fecha_fin_dt = datetime.fromisoformat(fecha_fin)
            query = query.filter(Orden.fecha_creacion <= fecha_fin_dt)

        ordenes = query.all()
        
        total_ventas = sum(float(o.monto_total) for o in ordenes)
        cantidad_ordenes = len(ordenes)
        promedio_venta = total_ventas / cantidad_ordenes if cantidad_ordenes > 0 else 0

        return jsonify({
            "periodo": {
                "fecha_inicio": fecha_inicio,
                "fecha_fin": fecha_fin
            },
            "total_ventas": total_ventas,
            "cantidad_ordenes": cantidad_ordenes,
            "promedio_venta": promedio_venta,
            "ordenes": [o.to_dict() for o in ordenes]
        }), 200
    except Exception as e:
        return jsonify({"error": "Error al generar reporte", "detalle": str(e)}), 500


@comercial_bp.route('/reportes/productos-mas-vendidos', methods=['GET'])
def productos_mas_vendidos():
    """Top 10 productos más vendidos"""
    try:
        from sqlalchemy import func
        
        resultados = db.session.query(
            DetalleOrden.id_producto,
            Producto.nombre,
            func.sum(DetalleOrden.cantidad).label('total_vendido'),
            func.sum(DetalleOrden.cantidad * DetalleOrden.precio_unitario).label('ingresos')
        ).join(
            Producto, DetalleOrden.id_producto == Producto.id_producto
        ).join(
            Orden, DetalleOrden.id_orden == Orden.id_orden
        ).filter(
            Orden.estado != "cancelada"
        ).group_by(
            DetalleOrden.id_producto, Producto.nombre
        ).order_by(
            func.sum(DetalleOrden.cantidad).desc()
        ).limit(10).all()

        productos = [
            {
                "id_producto": r.id_producto,
                "nombre": r.nombre,
                "total_vendido": int(r.total_vendido),
                "ingresos": float(r.ingresos)
            }
            for r in resultados
        ]

        return jsonify(productos), 200
    except Exception as e:
        return jsonify({"error": "Error al obtener reporte", "detalle": str(e)}), 500
