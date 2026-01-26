"""
Factoría de aplicación Flask para MuebleriaIris ERP
Arquitectura modular con blueprints por módulo de negocio
"""
import json
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config

# Instancia global de SQLAlchemy
db = SQLAlchemy()

# Instancia global de JWT Manager
jwt = JWTManager()

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
    
    # Configurar JWT para usar JSON serializado como subject (soporta dict identity)
    app.config['JWT_JSON_KEY'] = 'sub'
    
    # Inicializar extensiones
    db.init_app(app)
    jwt.init_app(app)
    
    # Callback para serializar identity dict a string JSON para el claim 'sub'
    @jwt.user_identity_loader
    def user_identity_lookup(identity):
        """Serializa el identity (dict) a JSON string para PyJWT 2.x compatibility"""
        if isinstance(identity, dict):
            return json.dumps(identity)
        return str(identity)
    
    # Callback para deserializar el identity de vuelta a dict
    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        """Deserializa el sub claim de JSON string a dict"""
        identity = jwt_data["sub"]
        if isinstance(identity, str):
            try:
                return json.loads(identity)
            except json.JSONDecodeError:
                return identity
        return identity
    
    # Configurar manejadores de errores JWT
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"error": "Token inválido o malformado", "detalle": str(error)}), 422
    
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"error": "Token expirado. Por favor, inicia sesión nuevamente."}), 401
    
    @jwt.unauthorized_loader
    def unauthorized_callback(error):
        return jsonify({"error": "Token de autorización no proporcionado", "detalle": str(error)}), 401
    
    # Configurar CORS (Permisivo para desarrollo)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Registrar blueprints modulares (Arquitectura ERP)
    from .routes.catalogo import catalogo_bp
    from .routes.logistica import logistica_bp
    from .routes.comercial import comercial_bp
    from .routes.admin import admin_bp
    from .routes.pagos import pagos_bp
    from .routes.favoritos import favoritos_bp
    
    app.register_blueprint(catalogo_bp)
    app.register_blueprint(logistica_bp)
    app.register_blueprint(comercial_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(pagos_bp)
    app.register_blueprint(favoritos_bp)
    
    # Manejadores de errores globales
    register_error_handlers(app)
    
    # Ruta raíz (health check)
    @app.route('/')
    def index():
        return jsonify({
            "nombre": "MuebleriaIris API",
            "version": "1.0.0",
            "modulos": ["catalogo", "logistica", "comercial", "pagos", "admin", "favoritos"],
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
