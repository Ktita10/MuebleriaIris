"""
Validadores de datos reutilizables para la API

En este archivo se agrupan funciones para validar datos de entrada (requests, formularios)
y mantener la lógica bien separada y reutilizable en todo el backend.
"""
import re
from typing import Dict, List, Any, Tuple

# --- Validar campos requeridos ---
def validate_required_fields(data: Dict[str, Any], required_fields: List[str]) -> Tuple[bool, str]:
    """
    Verifica que todos los campos obligatorios estén en 'data'.
    Permite devolver errores claros en los endpoints para facilitar debug y feedback al frontend.
    """
    if not data:
        return False, "No se enviaron datos"
    missing = [field for field in required_fields if field not in data]
    if missing:
        return False, f"Campos requeridos faltantes: {', '.join(missing)}"
    return True, ""

# --- Validaciones de formato genéricas ---
def validate_email(email: str) -> bool:
    """
    Valida el formato del email usando regex. Previene que entren mails mal escritos/logins rotos.
    """
    if not email:
        return False
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_phone(phone: str) -> bool:
    """
    Valida teléfonos argentinos en todos los formatos típicos (permite omisión opcional).
    Muy útil para alta/edición de clientes/proveedores.
    """
    if not phone:
        return True  # Campo opcional
    cleaned = phone.replace(' ', '').replace('-', '').replace('+', '')
    return cleaned.isdigit() and 8 <= len(cleaned) <= 15

# --- Números positivos, para stock/precios/cantidades ---
def validate_positive_number(value: Any, field_name: str = "valor") -> Tuple[bool, str]:
    """
    Garantiza que el valor sea numérico positivo. Previene errores de stock, ventas y precios negativos.
    """
    try:
        num = float(value)
        if num < 0:
            return False, f"{field_name} no puede ser negativo"
        return True, ""
    except (TypeError, ValueError):
        return False, f"{field_name} debe ser un número válido"

# --- Validación de SKU (identificador único de producto) ---
def validate_sku(sku: str) -> Tuple[bool, str]:
    """
    Sku = código único de producto (puede ser mostrado al cliente o usado internamente en integraciones)
    Debe ser corto, sin espacios, solo letras/números más guión/guión bajo.
    """
    if not sku or not sku.strip():
        return False, "SKU no puede estar vacío"
    sku = sku.strip()
    if len(sku) < 3 or len(sku) > 50:
        return False, "SKU debe tener entre 3 y 50 caracteres"
    pattern = r'^[A-Za-z0-9_-]+$'
    if not re.match(pattern, sku):
        return False, "SKU solo puede contener letras, números, guiones y guiones bajos"
    return True, ""

# --- String sanitization (limpieza general para backend) ---
def sanitize_string(text: str, max_length: int = None) -> str:
    """
    Elimina espacios y (opcionalmente) corta a longitud máxima. Útil para proteger DB/formularios contra entradas sucias/largas.
    """
    if not text:
        return ""
    cleaned = text.strip()
    if max_length and len(cleaned) > max_length:
        cleaned = cleaned[:max_length]
    return cleaned

# --- Validaciones "semánticas" de ERP (estados/métodos de pago) ---
def validate_estado_orden(estado: str) -> Tuple[bool, str]:
    """
    Solo permite estados definidos en el sistema. Garantiza integridad en state machine de órdenes.
    """
    estados_validos = ["pendiente", "en_proceso", "completada", "cancelada"]
    if estado not in estados_validos:
        return False, f"Estado inválido. Debe ser uno de: {', '.join(estados_validos)}"
    return True, ""

def validate_metodo_pago(metodo: str) -> Tuple[bool, str]:
    """
    Sólo acepta métodos definidos, previene errores/abusos en integración con MercadoPago, bancos, etc.
    """
    metodos_validos = ["efectivo", "tarjeta_debito", "tarjeta_credito", "transferencia", "mercadopago"]
    if metodo not in metodos_validos:
        return False, f"Método de pago inválido. Debe ser uno de: {', '.join(metodos_validos)}"
    return True, ""


######################################
# FLUJO Y RELACIONES DE VALIDATORS
######################################
'''
- Este módulo es el corazón de la "validación server-side": se usa en las rutas y servicios antes de crear/modificar recursos en la DB.
- Previene bugs, datos sucios y posibles exploits; siempre es más seguro validar en backend incluso si el frontend valida.
- Ejemplo de uso: un endpoint de registro validará con `validate_email`, un endpoint para crear producto usará `validate_sku` y `validate_positive_number` para precio/cantidad.
- Importado en rutas, servicios, y scripts que procesan datos externos (seeds, migraciones).

*Tip didáctico:*
Centraliza tu validación para DRY (Don't Repeat Yourself), robustez y poder mantener el negocio evolucionando sin romper APIs.
'''

# --- Fin de validators.py ---
