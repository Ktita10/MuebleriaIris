import pytest
from app import create_app, db
from sqlalchemy import text
import os

def test_real_db_connection():
    """
    Verifica la conexión con la base de datos PostgreSQL real configurada en .env.
    Este test se salta si no se pueden cargar las variables de entorno o fallar la conexión.
    """
    # Intentar cargar configuración real
    try:
        app = create_app()
        # Forzamos la URI real si existe en el entorno, si no el create_app ya la cargó
        
        with app.app_context():
            # Ejecutar una consulta simple
            result = db.session.execute(text("SELECT 1")).scalar()
            assert result == 1
            print("\n✅ Conexión a PostgreSQL exitosa")
    except Exception as e:
        pytest.fail(f"❌ Falló la conexión a la base de datos real: {str(e)}")
