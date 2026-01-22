"""
Funciones auxiliares y helpers para la API
- Respuestas estándar, paginación, formateo de datos y utilidades comunes
- Mejora la limpieza del código y la reutilización
"""
from flask import jsonify
from typing import Any, Dict, Tuple
from decimal import Decimal

# --- Respuestas tipo JSON estándar para la API ---
def success_response(mensaje: str, data: Any = None, status_code: int = 200) -> Tuple:
    """
    Crear una respuesta de éxito API, siempre devuelve un JSON: {mensaje, ...data}.
    """
    response = {"mensaje": mensaje}
    if data is not None:
        if isinstance(data, dict):
            response.update(data)
        else:
            response["data"] = data
    return jsonify(response), status_code


def error_response(mensaje: str, detalle: str = None, status_code: int = 400) -> Tuple:
    """
    Crear una respuesta de error API estandarizada, siempre devuelve un JSON: {error, detalle}
    """
    response = {"error": mensaje}
    if detalle:
        response["detalle"] = detalle
    return jsonify(response), status_code

# --- Paginación de consultas SQLAlchemy ---
def paginate_query(query, page: int = 1, per_page: int = 20):
    """
    Pagina resultados de una query SQLAlchemy (para endpoints que devuelven "muchos")
    Devuelve un dict legible para la API y frontend.
    """
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    return {
        "items": [item.to_dict() for item in pagination.items],
        "total": pagination.total,
        "page": page,
        "per_page": per_page,
        "pages": pagination.pages,
        "has_next": pagination.has_next,
        "has_prev": pagination.has_prev
    }

# --- Conversión útil para datos numéricos/monetarios ---
def decimal_to_float(value: Decimal) -> float:
    """
    Convierte un número Decimal de SQLAlchemy a float para su uso en JSON
    """
    return float(value) if value is not None else 0.0


def format_currency(amount: float, currency: str = "ARS") -> str:
    """
    Devuelve una string bonita de dinero para mostrar en el frontend.
    Ejemplo: format_currency(1500.5) -> "$ 1,500.50"
    """
    if currency == "ARS":
        return f"$ {amount:,.2f}"
    return f"{amount:,.2f}"


def calculate_percentage(part: float, total: float) -> float:
    """
    Calcula el porcentaje que representa 'part' sobre 'total'. Muy usado en reportes y métricas.
    """
    if total == 0:
        return 0.0
    return round((part / total) * 100, 2)


######################################
# FLUJO Y RELACIONES DE HELPERS
######################################
'''
Este archivo agrupa funciones utilitarias que resuelven tareas comunes para rutas y lógica del backend:
- Respuestas estándar para API (`success_response`, `error_response`) simplifican las respuestas JSON y evitan repetir código en cada endpoint.
- `paginate_query` implementa paginación automática para evitar cargas pesadas de datos y preparar APIs eficientes.
- Conversores y formateos (`decimal_to_float`, `format_currency`) preparan los datos para ser enviados al frontend de manera legible y segura.
- `calculate_percentage` sirve para estadísticas en reportes y métricas del ERP.

Relaciones y flujo:
- Normalmente importado en rutas (por ejemplo, `routes/catalogo.py`, `routes/admin.py`, etc.) y en servicios de negocio para estructurar las respuestas al cliente web/mobile.
- Depende indirectamente de modelos de datos cuando hace serialización con `.to_dict()`

*Patrón didáctico:*
Tener helpers bien separados es clave para un código limpio, DRY (Don't Repeat Yourself) y fácil de testear/mantener.
'''
# --- Fin de helpers.py ---
