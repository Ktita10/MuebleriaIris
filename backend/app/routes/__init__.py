# Routes package - Blueprints por módulo ERP
from .catalogo import catalogo_bp
from .logistica import logistica_bp
from .comercial import comercial_bp
from .admin import admin_bp

__all__ = ['catalogo_bp', 'logistica_bp', 'comercial_bp', 'admin_bp']
