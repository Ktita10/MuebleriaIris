"""
Entrypoint de la aplicación Flask
MuebleriaIris ERP - Backend API
"""
import sys
import os
from app import create_app

# Crear instancia de la aplicación
app = create_app()

if __name__ == "__main__":
    # Configuración de desarrollo
    DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    HOST = os.environ.get('FLASK_HOST', '0.0.0.0')
    PORT = int(os.environ.get('FLASK_PORT', 5000))
    
    print("=" * 60)
    print("🏭 MuebleriaIris ERP - Backend API")
    print("=" * 60)
    print(f"📡 Servidor: http://{HOST}:{PORT}")
    print(f"🐛 Debug: {DEBUG}")
    print(f"📊 Base de datos: {app.config['SQLALCHEMY_DATABASE_URI'].split('@')[1] if '@' in app.config['SQLALCHEMY_DATABASE_URI'] else 'No configurada'}")
    print("=" * 60)
    print("\n🚀 Iniciando servidor...")
    print("\nEndpoints disponibles:")
    print("  - GET  / (Health check)")
    print("  - GET  /api/health")
    print("\n📦 Módulos activos:")
    print("  - /api/categorias (Catálogo)")
    print("  - /api/productos (Catálogo)")
    print("  - /api/proveedores (Logística)")
    print("  - /api/inventario (Logística)")
    print("  - /api/clientes (Comercial)")
    print("  - /api/ordenes (Comercial)")
    print("  - /api/pagos (Pagos/MercadoPago)")
    print("  - /api/roles (Administración)")
    print("  - /api/usuarios (Administración)")
    print("\n" + "=" * 60 + "\n")
    
    try:
        app.run(debug=DEBUG, host=HOST, port=PORT)
    except KeyboardInterrupt:
        print("\n\n👋 Servidor detenido por el usuario")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error al iniciar servidor: {str(e)}")
        sys.exit(1)
