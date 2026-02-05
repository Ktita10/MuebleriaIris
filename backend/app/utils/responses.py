"""
HTTP Response Helpers

Utilidades para crear respuestas HTTP consistentes en toda la API.
Sigue el patrón flask-api skill: respuestas uniformes, códigos de estado correctos.
"""
from __future__ import annotations
from typing import Any
from flask import jsonify, Response


def success_response(
    message: str,
    data: dict[str, Any] | None = None,
    status_code: int = 200
) -> tuple[Response, int]:
    """
    Crear respuesta exitosa con formato consistente.
    
    Args:
        message: Mensaje de éxito
        data: Datos adicionales a incluir en la respuesta
        status_code: Código HTTP (default 200)
        
    Returns:
        Tupla (response, status_code) para Flask
        
    Example:
        return success_response("Producto creado", {"producto": producto}, 201)
    """
    response = {"mensaje": message}
    if data:
        response.update(data)
    return jsonify(response), status_code


def error_response(
    message: str,
    details: str | None = None,
    status_code: int = 400
) -> tuple[Response, int]:
    """
    Crear respuesta de error con formato consistente.
    
    Args:
        message: Mensaje de error principal
        details: Detalles adicionales del error (para debugging)
        status_code: Código HTTP (default 400)
        
    Returns:
        Tupla (response, status_code) para Flask
        
    Example:
        return error_response("Producto no encontrado", status_code=404)
    """
    response: dict[str, Any] = {"error": message}
    if details:
        response["detalle"] = details
    return jsonify(response), status_code


def list_response(items: list[dict[str, Any]], status_code: int = 200) -> tuple[Response, int]:
    """
    Crear respuesta con lista de items.
    
    Args:
        items: Lista de diccionarios a retornar
        status_code: Código HTTP (default 200)
        
    Returns:
        Tupla (response, status_code) para Flask
        
    Example:
        return list_response([p.to_dict() for p in productos])
    """
    return jsonify(items), status_code
