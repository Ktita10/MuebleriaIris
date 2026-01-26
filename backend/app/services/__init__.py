# Services package - Lógica de negocio separada de routes
#
# Este paquete contiene la capa de servicios que encapsula la lógica de negocio,
# separándola de los routes (controladores HTTP).
#
# Beneficios:
# - Código más testeable (servicios pueden testearse sin HTTP)
# - Reutilización de lógica entre diferentes endpoints
# - Routes más limpios y enfocados en HTTP request/response
# - Mejor manejo de errores con excepciones tipadas
#
# Uso:
#   from ..services.producto_service import ProductoService, ProductoServiceError
#
#   try:
#       producto = ProductoService.crear_producto(data)
#       return success_response("Producto creado", {"producto": producto})
#   except ProductoServiceError as e:
#       return error_response(e.message, status_code=e.status_code)

from .producto_service import ProductoService, ProductoServiceError

__all__ = [
    'ProductoService',
    'ProductoServiceError',
]
