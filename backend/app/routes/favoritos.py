"""
Blueprint de Favoritos - Gestión de productos favoritos de clientes

Endpoints:
- GET /api/favoritos?id_cliente=<int> - Obtener favoritos de un cliente
- POST /api/favoritos - Agregar producto a favoritos
- DELETE /api/favoritos/<id> - Eliminar favorito por ID
- DELETE /api/favoritos - Eliminar favorito por cliente+producto
"""
from flask import Blueprint, request

from .. import db
from ..models import Favorito, Cliente, Producto
from ..utils.helpers import success_response, error_response
from ..utils.validators import validate_required_fields

favoritos_bp = Blueprint("favoritos", __name__, url_prefix="/api")


@favoritos_bp.route("/favoritos", methods=["GET"])
def get_favoritos():
    """
    Obtener lista de productos favoritos de un cliente.
    
    Query params:
        id_cliente (int): ID del cliente (requerido)
    
    Returns:
        200: Lista de favoritos con datos del producto
        400: Si falta id_cliente
    """
    id_cliente = request.args.get("id_cliente", type=int)
    
    if not id_cliente:
        return error_response("El parámetro 'id_cliente' es requerido", status_code=400)
    
    # Verificar que el cliente exista
    cliente = Cliente.query.get(id_cliente)
    if not cliente:
        return error_response("Cliente no encontrado", status_code=404)
    
    favoritos = Favorito.query.filter_by(id_cliente=id_cliente).all()
    return success_response(
        "Favoritos obtenidos exitosamente",
        {"favoritos": [f.to_dict() for f in favoritos]},
        status_code=200
    )


@favoritos_bp.route("/favoritos", methods=["POST"])
def add_favorito():
    """
    Agregar un producto a la lista de favoritos del cliente.
    
    JSON Body:
        id_cliente (int): ID del cliente
        id_producto (int): ID del producto
    
    Returns:
        201: Favorito creado exitosamente
        400: Campos faltantes
        404: Cliente o producto no existe
        409: Producto ya está en favoritos
    """
    data = request.get_json()
    
    # Validar campos requeridos
    is_valid, error_msg = validate_required_fields(data, ["id_cliente", "id_producto"])
    if not is_valid:
        return error_response(error_msg, status_code=400)
    
    id_cliente = data["id_cliente"]
    id_producto = data["id_producto"]
    
    # Verificar que el cliente exista
    cliente = Cliente.query.get(id_cliente)
    if not cliente:
        return error_response("Cliente no encontrado", status_code=404)
    
    # Verificar que el producto exista
    producto = Producto.query.get(id_producto)
    if not producto:
        return error_response("Producto no encontrado", status_code=404)
    
    # Verificar que no exista ya el favorito
    favorito_existente = Favorito.query.filter_by(
        id_cliente=id_cliente, 
        id_producto=id_producto
    ).first()
    
    if favorito_existente:
        return error_response("El producto ya está en favoritos", status_code=409)
    
    try:
        favorito = Favorito(id_cliente=id_cliente, id_producto=id_producto)
        db.session.add(favorito)
        db.session.commit()
        
        return success_response(
            "Producto agregado a favoritos",
            {"favorito": favorito.to_dict()},
            status_code=201
        )
    except Exception as e:
        db.session.rollback()
        return error_response("Error al agregar favorito", str(e), status_code=500)


@favoritos_bp.route("/favoritos/<int:id>", methods=["DELETE"])
def delete_favorito_by_id(id: int):
    """
    Eliminar un favorito por su ID.
    
    Path params:
        id (int): ID del favorito
    
    Returns:
        200: Favorito eliminado exitosamente
        404: Favorito no encontrado
    """
    favorito = Favorito.query.get(id)
    
    if not favorito:
        return error_response("Favorito no encontrado", status_code=404)
    
    try:
        db.session.delete(favorito)
        db.session.commit()
        return success_response("Producto eliminado de favoritos", status_code=200)
    except Exception as e:
        db.session.rollback()
        return error_response("Error al eliminar favorito", str(e), status_code=500)


@favoritos_bp.route("/favoritos", methods=["DELETE"])
def delete_favorito():
    """
    Eliminar un favorito por cliente y producto.
    
    JSON Body:
        id_cliente (int): ID del cliente
        id_producto (int): ID del producto
    
    Returns:
        200: Favorito eliminado exitosamente
        400: Campos faltantes
        404: Favorito no encontrado
    """
    data = request.get_json()
    
    # Validar campos requeridos
    is_valid, error_msg = validate_required_fields(data, ["id_cliente", "id_producto"])
    if not is_valid:
        return error_response(error_msg, status_code=400)
    
    favorito = Favorito.query.filter_by(
        id_cliente=data["id_cliente"],
        id_producto=data["id_producto"]
    ).first()
    
    if not favorito:
        return error_response("El producto no está en favoritos", status_code=404)
    
    try:
        db.session.delete(favorito)
        db.session.commit()
        return success_response("Producto eliminado de favoritos", status_code=200)
    except Exception as e:
        db.session.rollback()
        return error_response("Error al eliminar favorito", str(e), status_code=500)


@favoritos_bp.route("/clientes/<int:id_cliente>/favoritos", methods=["GET"])
def get_cliente_favoritos(id_cliente: int):
    """
    Obtener favoritos de un cliente específico (ruta alternativa RESTful).
    
    Path params:
        id_cliente (int): ID del cliente
    
    Returns:
        200: Lista de favoritos
        404: Cliente no encontrado
    """
    cliente = Cliente.query.get(id_cliente)
    if not cliente:
        return error_response("Cliente no encontrado", status_code=404)
    
    favoritos = Favorito.query.filter_by(id_cliente=id_cliente).all()
    return success_response(
        "Favoritos obtenidos exitosamente",
        {"favoritos": [f.to_dict() for f in favoritos]},
        status_code=200
    )
