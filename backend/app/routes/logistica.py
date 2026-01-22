"""
Blueprint de Logística - Inventario, Proveedores, Stock
Módulo ERP: Gestión de logística y almacén
"""
from flask import Blueprint, jsonify, request
from .. import db
from ..models import Inventario, Proveedor, Producto
from datetime import datetime, timezone

logistica_bp = Blueprint('logistica', __name__, url_prefix='/api')


# ==============================================================================
#                                  PROVEEDORES
# ==============================================================================

@logistica_bp.route('/proveedores', methods=['GET'])
def get_proveedores():
    """Obtener todos los proveedores"""
    try:
        proveedores = Proveedor.query.all()
        return jsonify([p.to_dict() for p in proveedores]), 200
    except Exception as e:
        return jsonify({"error": "Error al obtener proveedores", "detalle": str(e)}), 500


@logistica_bp.route('/proveedores', methods=['POST'])
def create_proveedor():
    """
    Crear nuevo proveedor
    Body: {
        "nombre_empresa": str (requerido),
        "contacto_nombre": str,
        "telefono": str,
        "email": str,
        "direccion": str
    }
    """
    data = request.get_json()

    if not data or "nombre_empresa" not in data:
        return jsonify({"error": "El campo 'nombre_empresa' es requerido"}), 400

    if not data["nombre_empresa"].strip():
        return jsonify({"error": "El nombre de la empresa no puede estar vacío"}), 400

    nuevo_proveedor = Proveedor(
        nombre_empresa=data["nombre_empresa"].strip(),
        contacto_nombre=data.get("contacto_nombre", "").strip() or None,
        telefono=data.get("telefono", "").strip() or None,
        email=data.get("email", "").strip() or None,
        direccion=data.get("direccion", "").strip() or None
    )

    try:
        db.session.add(nuevo_proveedor)
        db.session.commit()
        return jsonify({
            "mensaje": "Proveedor creado exitosamente",
            "proveedor": nuevo_proveedor.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al crear proveedor", "detalle": str(e)}), 500


@logistica_bp.route('/proveedores/<int:id>', methods=['GET'])
def get_proveedor(id):
    """Obtener un proveedor por ID"""
    proveedor = Proveedor.query.get(id)
    if not proveedor:
        return jsonify({"error": "Proveedor no encontrado"}), 404
    
    return jsonify(proveedor.to_dict()), 200


@logistica_bp.route('/proveedores/<int:id>', methods=['PUT'])
def update_proveedor(id):
    """Actualizar proveedor"""
    proveedor = Proveedor.query.get(id)
    if not proveedor:
        return jsonify({"error": "Proveedor no encontrado"}), 404

    data = request.get_json()

    campos_actualizables = ["nombre_empresa", "contacto_nombre", "telefono", "email", "direccion"]
    for campo in campos_actualizables:
        if campo in data:
            valor = data[campo].strip() if isinstance(data[campo], str) else data[campo]
            setattr(proveedor, campo, valor or None)

    try:
        db.session.commit()
        return jsonify({
            "mensaje": "Proveedor actualizado exitosamente",
            "proveedor": proveedor.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al actualizar proveedor", "detalle": str(e)}), 500


@logistica_bp.route('/proveedores/<int:id>', methods=['DELETE'])
def delete_proveedor(id):
    """Desactivar proveedor (soft delete)"""
    proveedor = Proveedor.query.get(id)
    if not proveedor:
        return jsonify({"error": "Proveedor no encontrado"}), 404

    try:
        proveedor.activo = False
        db.session.commit()
        return jsonify({"mensaje": "Proveedor desactivado exitosamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al desactivar proveedor", "detalle": str(e)}), 500


# ==============================================================================
#                                  INVENTARIO
# ==============================================================================

@logistica_bp.route('/inventario', methods=['GET'])
def get_inventario():
    """
    Obtener todo el inventario
    Query params: ?bajo_stock=true (stock <= stock_minimo)
    """
    try:
        query = Inventario.query

        # Filtro por productos con bajo stock
        bajo_stock = request.args.get('bajo_stock')
        if bajo_stock and bajo_stock.lower() == 'true':
            query = query.filter(Inventario.cantidad_stock <= Inventario.stock_minimo)

        inventario = query.all()
        return jsonify([i.to_dict() for i in inventario]), 200
    except Exception as e:
        return jsonify({"error": "Error al obtener inventario", "detalle": str(e)}), 500


@logistica_bp.route('/inventario', methods=['POST'])
def create_inventario():
    """
    Crear entrada de inventario para un producto
    Body: {
        "id_producto": int (requerido),
        "cantidad_stock": int (requerido),
        "stock_minimo": int (default: 0),
        "ubicacion": str
    }
    """
    data = request.get_json()

    # Validación de campos requeridos
    if not data or "id_producto" not in data or "cantidad_stock" not in data:
        return jsonify({"error": "Campos 'id_producto' y 'cantidad_stock' son requeridos"}), 400

    # Verificar que el producto existe
    producto = Producto.query.get(data["id_producto"])
    if not producto:
        return jsonify({"error": "Producto no encontrado"}), 404

    # Verificar que no exista ya un inventario para este producto
    inventario_existente = Inventario.query.filter_by(id_producto=data["id_producto"]).first()
    if inventario_existente:
        return jsonify({"error": "Ya existe un inventario para este producto"}), 409

    nuevo_inventario = Inventario(
        id_producto=data["id_producto"],
        cantidad_stock=data["cantidad_stock"],
        stock_minimo=data.get("stock_minimo", 0),
        ubicacion=data.get("ubicacion", "").strip() or None
    )

    try:
        db.session.add(nuevo_inventario)
        db.session.commit()
        return jsonify({
            "mensaje": "Inventario creado exitosamente",
            "inventario": nuevo_inventario.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al crear inventario", "detalle": str(e)}), 500


@logistica_bp.route('/inventario/<int:id>', methods=['GET'])
def get_inventario_item(id):
    """Obtener un item de inventario por ID"""
    inventario = Inventario.query.get(id)
    if not inventario:
        return jsonify({"error": "Inventario no encontrado"}), 404
    
    return jsonify(inventario.to_dict()), 200


@logistica_bp.route('/inventario/producto/<int:producto_id>', methods=['GET'])
def get_inventario_by_producto(producto_id):
    """Obtener inventario de un producto específico"""
    inventario = Inventario.query.filter_by(id_producto=producto_id).first()
    if not inventario:
        return jsonify({"error": "Inventario no encontrado para este producto"}), 404
    
    return jsonify(inventario.to_dict()), 200


@logistica_bp.route('/inventario/<int:id>', methods=['PUT'])
def update_inventario(id):
    """
    Actualizar inventario
    Body: {
        "cantidad_stock": int,
        "stock_minimo": int,
        "ubicacion": str
    }
    """
    inventario = Inventario.query.get(id)
    if not inventario:
        return jsonify({"error": "Inventario no encontrado"}), 404

    data = request.get_json()

    if "cantidad_stock" in data:
        inventario.cantidad_stock = data["cantidad_stock"]
    
    if "stock_minimo" in data:
        inventario.stock_minimo = data["stock_minimo"]
    
    if "ubicacion" in data:
        inventario.ubicacion = data["ubicacion"].strip() or None

    try:
        db.session.commit()
        return jsonify({
            "mensaje": "Inventario actualizado exitosamente",
            "inventario": inventario.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al actualizar inventario", "detalle": str(e)}), 500


@logistica_bp.route('/inventario/<int:id>/ajustar', methods=['PATCH'])
def ajustar_stock(id):
    """
    Ajustar stock (sumar o restar)
    Body: {
        "cantidad": int (puede ser negativo para restar),
        "motivo": str (opcional: "venta", "compra", "ajuste", "devolucion")
    }
    """
    inventario = Inventario.query.get(id)
    if not inventario:
        return jsonify({"error": "Inventario no encontrado"}), 404

    data = request.get_json()
    if not data or "cantidad" not in data:
        return jsonify({"error": "El campo 'cantidad' es requerido"}), 400

    cantidad = data["cantidad"]
    nuevo_stock = inventario.cantidad_stock + cantidad

    if nuevo_stock < 0:
        return jsonify({"error": "Stock no puede ser negativo"}), 400

    inventario.cantidad_stock = nuevo_stock

    try:
        db.session.commit()
        return jsonify({
            "mensaje": "Stock ajustado exitosamente",
            "inventario": inventario.to_dict(),
            "ajuste_aplicado": cantidad,
            "motivo": data.get("motivo", "ajuste")
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al ajustar stock", "detalle": str(e)}), 500


@logistica_bp.route('/inventario/alertas', methods=['GET'])
def get_alertas_stock():
    """Obtener productos con stock bajo o agotado"""
    try:
        # Stock agotado (0)
        agotados = Inventario.query.filter(Inventario.cantidad_stock == 0).all()
        
        # Stock bajo (cantidad <= stock_minimo)
        bajo_stock = Inventario.query.filter(
            Inventario.cantidad_stock > 0,
            Inventario.cantidad_stock <= Inventario.stock_minimo
        ).all()

        return jsonify({
            "agotados": [i.to_dict() for i in agotados],
            "bajo_stock": [i.to_dict() for i in bajo_stock],
            "total_alertas": len(agotados) + len(bajo_stock)
        }), 200
    except Exception as e:
        return jsonify({"error": "Error al obtener alertas", "detalle": str(e)}), 500
