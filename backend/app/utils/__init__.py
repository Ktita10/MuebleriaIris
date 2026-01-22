# ==================================
# Paquete utils para helpers y validadores del backend
# Al importar 'from app.utils import ...' puedes usar todas las utilidades sin importar cada sub-módulo.
# Este patrón ayuda a mantener el código limpio y centralizar utilidades para las rutas y servicios.
# ==================================
from .validators import (
    validate_required_fields,
    validate_email,
    validate_phone,
    validate_positive_number,
    validate_sku,
    sanitize_string,
    validate_estado_orden,
    validate_metodo_pago
)
from .helpers import (
    success_response,
    error_response,
    paginate_query,
    decimal_to_float,
    format_currency,
    calculate_percentage
)

__all__ = [
    'validate_required_fields',
    'validate_email',
    'validate_phone',
    'validate_positive_number',
    'validate_sku',
    'sanitize_string',
    'validate_estado_orden',
    'validate_metodo_pago',
    'success_response',
    'error_response',
    'paginate_query',
    'decimal_to_float',
    'format_currency',
    'calculate_percentage'
]

######################################
# FLUJO Y USO DE __init__.py UTILS
######################################
'''
Permite importar todas las funciones útiles de helpers y validators desde un solo punto. Ejemplo práctico:
    from app.utils import success_response, validate_email
Así evitas escribir:
    from app.utils.helpers import success_response
    from app.utils.validators import validate_email

Esto mejora la mantenibilidad y escalabilidad en cualquier Flask API profesional.
'''
# --- Fin de utils/__init__.py ---
