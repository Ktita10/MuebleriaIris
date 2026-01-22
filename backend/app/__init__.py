"""
Factoría de aplicación Flask para MuebleriaIris ERP
Arquitectura modular con blueprints por módulo de negocio
"""
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import Config

# Instancia global de SQLAlchemy
db = SQLAlchemy()

def create_app(config_class=Config):
    """
    Crear y configurar la aplicación Flask
    
    Args:
        config_class: Clase de configuración a usar (Config por defecto)
    
    Returns:
        app: Aplicación Flask configurada
    """
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Inicializar extensiones
    db.init_app(app)
    
    # Configurar CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",  # En producción, especificar dominios permitidos
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Registrar blueprints modulares (Arquitectura ERP)
    from .routes.catalogo import catalogo_bp
    from .routes.logistica import logistica_bp
    from .routes.comercial import comercial_bp
    from .routes.admin import admin_bp
    from .routes.pagos import pagos_bp
    
    app.register_blueprint(catalogo_bp)
    app.register_blueprint(logistica_bp)
    app.register_blueprint(comercial_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(pagos_bp)
    
    # Manejadores de errores globales
    register_error_handlers(app)
    
    # Ruta raíz (health check)
    @app.route('/')
    def index():
        return jsonify({
            "nombre": "MuebleriaIris API",
            "version": "1.0.0",
            "modulos": ["catalogo", "logistica", "comercial", "pagos", "admin"],
            "status": "running"
        }), 200
    
    @app.route('/api/health')
    def health():
        """Endpoint de health check"""
        try:
            # Verificar conexión a base de datos
            db.session.execute(db.text('SELECT 1'))
            return jsonify({"status": "healthy", "database": "connected"}), 200
        except Exception as e:
            return jsonify({"status": "unhealthy", "error": str(e)}), 503
    
    return app


def register_error_handlers(app):
    """Registrar manejadores de errores HTTP globales"""
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Recurso no encontrado"}), 404
    
    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({"error": "Método HTTP no permitido"}), 405
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({"error": "Error interno del servidor"}), 500
    
    @app.errorhandler(Exception)
    def handle_exception(error):
        """Manejador genérico de excepciones"""
        app.logger.error(f"Error no manejado: {str(error)}")
        db.session.rollback()
        return jsonify({
            "error": "Error inesperado",
            "detalle": str(error) if app.debug else None
        }), 500
