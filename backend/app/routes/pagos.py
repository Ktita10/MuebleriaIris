"""
Blueprint de Pagos - Gestión de Pagos con MercadoPago
Módulo ERP: Gestión de pagos y facturación
"""
from flask import Blueprint, jsonify, request
from .. import db
from ..models import Pago, Orden
from datetime import datetime

pagos_bp = Blueprint('pagos', __name__, url_prefix='/api')


# ==============================================================================
#                                  PAGOS
# ==============================================================================

@pagos_bp.route('/pagos', methods=['GET'])
def get_pagos():
    """
    Obtener todos los pagos
    Query params: ?orden_id=1&estado=approved
    """
    try:
        query = Pago.query

        # Filtro por orden
        orden_id = request.args.get('orden_id', type=int)
        if orden_id:
            query = query.filter_by(id_orden=orden_id)

        # Filtro por estado de MercadoPago
        mp_estado = request.args.get('estado')
        if mp_estado:
            query = query.filter_by(mp_estado=mp_estado)

        pagos = query.order_by(Pago.fecha_pago.desc()).all()
        return jsonify([p.to_dict() for p in pagos]), 200
    except Exception as e:
        return jsonify({"error": "Error al obtener pagos", "detalle": str(e)}), 500


@pagos_bp.route('/pagos', methods=['POST'])
def create_pago():
    """
    Crear nuevo pago (registro de pago desde MercadoPago)
    Body: {
        "id_orden": int (requerido),
        "mp_preference_id": str,
        "mp_payment_id": str,
        "mp_estado": str (approved, pending, rejected, etc.),
        "mp_tipo_pago": str (credit_card, debit_card, ticket, etc.),
        "monto_cobrado_mp": float
    }
    """
    data = request.get_json()

    # Validación de campos requeridos
    if not data or "id_orden" not in data:
        return jsonify({"error": "El campo 'id_orden' es requerido"}), 400

    # Verificar que la orden existe
    orden = Orden.query.get(data["id_orden"])
    if not orden:
        return jsonify({"error": "Orden no encontrada"}), 404

    nuevo_pago = Pago(
        id_orden=data["id_orden"],
        mp_preference_id=data.get("mp_preference_id"),
        mp_payment_id=data.get("mp_payment_id"),
        mp_estado=data.get("mp_estado"),
        mp_tipo_pago=data.get("mp_tipo_pago"),
        monto_cobrado_mp=data.get("monto_cobrado_mp")
    )

    try:
        db.session.add(nuevo_pago)
        
        # Si el pago es aprobado, actualizar estado de la orden
        if data.get("mp_estado") == "approved":
            orden.estado = "completada"
        
        db.session.commit()
        return jsonify({
            "mensaje": "Pago registrado exitosamente",
            "pago": nuevo_pago.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al crear pago", "detalle": str(e)}), 500


@pagos_bp.route('/pagos/<int:id>', methods=['GET'])
def get_pago(id):
    """Obtener un pago por ID"""
    pago = Pago.query.get(id)
    if not pago:
        return jsonify({"error": "Pago no encontrado"}), 404
    
    return jsonify(pago.to_dict()), 200


@pagos_bp.route('/pagos/<int:id>', methods=['PUT'])
def update_pago(id):
    """
    Actualizar pago (actualización de estado desde MercadoPago)
    Body: {
        "mp_payment_id": str,
        "mp_estado": str,
        "mp_tipo_pago": str,
        "monto_cobrado_mp": float
    }
    """
    pago = Pago.query.get(id)
    if not pago:
        return jsonify({"error": "Pago no encontrado"}), 404

    data = request.get_json()

    # Actualizar campos
    if "mp_payment_id" in data:
        pago.mp_payment_id = data["mp_payment_id"]
    
    if "mp_estado" in data:
        pago.mp_estado = data["mp_estado"]
        
        # Actualizar estado de la orden según el estado del pago
        if data["mp_estado"] == "approved":
            orden = Orden.query.get(pago.id_orden)
            if orden:
                orden.estado = "completada"
        elif data["mp_estado"] == "rejected":
            orden = Orden.query.get(pago.id_orden)
            if orden and orden.estado == "pendiente":
                orden.estado = "cancelada"
    
    if "mp_tipo_pago" in data:
        pago.mp_tipo_pago = data["mp_tipo_pago"]
    
    if "monto_cobrado_mp" in data:
        pago.monto_cobrado_mp = data["monto_cobrado_mp"]

    try:
        db.session.commit()
        return jsonify({
            "mensaje": "Pago actualizado exitosamente",
            "pago": pago.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al actualizar pago", "detalle": str(e)}), 500


@pagos_bp.route('/pagos/<int:id>', methods=['DELETE'])
def delete_pago(id):
    """Eliminar pago (solo pagos pendientes o rechazados)"""
    pago = Pago.query.get(id)
    if not pago:
        return jsonify({"error": "Pago no encontrado"}), 404

    # Solo permitir eliminar pagos no aprobados
    if pago.mp_estado == "approved":
        return jsonify({"error": "No se puede eliminar un pago aprobado"}), 400

    try:
        db.session.delete(pago)
        db.session.commit()
        return jsonify({"mensaje": "Pago eliminado exitosamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al eliminar pago", "detalle": str(e)}), 500


# ==============================================================================
#                          WEBHOOK DE MERCADOPAGO
# ==============================================================================

@pagos_bp.route('/pagos/webhook/mercadopago', methods=['POST'])
def mercadopago_webhook():
    """
    Webhook para recibir notificaciones de MercadoPago
    
    MercadoPago enviará una notificación POST cuando cambie el estado de un pago.
    Formato esperado:
    {
        "action": "payment.created" | "payment.updated",
        "data": {
            "id": "payment_id"
        }
    }
    """
    try:
        data = request.get_json()
        
        if not data or "data" not in data or "id" not in data["data"]:
            return jsonify({"error": "Formato de webhook inválido"}), 400
        
        mp_payment_id = data["data"]["id"]
        
        # Buscar el pago por mp_payment_id
        pago = Pago.query.filter_by(mp_payment_id=str(mp_payment_id)).first()
        
        if not pago:
            # Si no existe, podría ser un pago nuevo que aún no está registrado
            return jsonify({
                "mensaje": "Pago no encontrado, puede ser una notificación de un pago no registrado",
                "mp_payment_id": mp_payment_id
            }), 200
        
        # TODO: Aquí deberías hacer una llamada a la API de MercadoPago para obtener
        # los detalles actualizados del pago usando el mp_payment_id
        # Por ahora solo registramos que recibimos el webhook
        
        return jsonify({
            "mensaje": "Webhook recibido exitosamente",
            "pago_id": pago.id_pago,
            "mp_payment_id": mp_payment_id
        }), 200
        
    except Exception as e:
        return jsonify({"error": "Error al procesar webhook", "detalle": str(e)}), 500


# ==============================================================================
#                              REPORTES DE PAGOS
# ==============================================================================

@pagos_bp.route('/reportes/pagos-por-estado', methods=['GET'])
def reporte_pagos_por_estado():
    """Reporte de pagos agrupados por estado de MercadoPago"""
    try:
        from sqlalchemy import func
        
        resultados = db.session.query(
            Pago.mp_estado,
            func.count(Pago.id_pago).label('cantidad'),
            func.sum(Pago.monto_cobrado_mp).label('total')
        ).group_by(
            Pago.mp_estado
        ).all()

        pagos_por_estado = [
            {
                "estado": r.mp_estado or "sin_estado",
                "cantidad": r.cantidad,
                "total": float(r.total) if r.total else 0
            }
            for r in resultados
        ]

        return jsonify(pagos_por_estado), 200
    except Exception as e:
        return jsonify({"error": "Error al obtener reporte", "detalle": str(e)}), 500


@pagos_bp.route('/reportes/metodos-pago', methods=['GET'])
def reporte_metodos_pago():
    """Reporte de pagos agrupados por tipo de pago de MercadoPago"""
    try:
        from sqlalchemy import func
        
        resultados = db.session.query(
            Pago.mp_tipo_pago,
            func.count(Pago.id_pago).label('cantidad'),
            func.sum(Pago.monto_cobrado_mp).label('total')
        ).filter(
            Pago.mp_estado == "approved"  # Solo pagos aprobados
        ).group_by(
            Pago.mp_tipo_pago
        ).all()

        metodos_pago = [
            {
                "metodo": r.mp_tipo_pago or "sin_metodo",
                "cantidad": r.cantidad,
                "total": float(r.total) if r.total else 0
            }
            for r in resultados
        ]

        return jsonify(metodos_pago), 200
    except Exception as e:
        return jsonify({"error": "Error al obtener reporte", "detalle": str(e)}), 500
