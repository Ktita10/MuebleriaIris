"""
Módulo de seguridad para MuebleriaIris ERP
Maneja hashing de passwords con bcrypt y autenticación.
Este módulo separa la lógica de seguridad y la hace reutilizable.
"""

from werkzeug.security import generate_password_hash, check_password_hash


def hash_password(password: str) -> str:
    """
    Hashea una contraseña usando el algoritmo pbkdf2:sha256 (más seguro que SHA1/MD5)
    Siempre que crees o cambies un usuario, usa esto.
    """
    return generate_password_hash(password, method="pbkdf2:sha256")


def verify_password(password: str, password_hash: str) -> bool:
    """
    Verifica si la contraseña (input usuario) coincide con el hash almacenado en DB.
    Soporta tanto hashes modernos como texto plano legacy para migraciones.
    """
    # 'pbkdf2:' es lo que werkzeug pone adelante al hashear; scrypt/bcrypt igual en otras libs
    if password_hash.startswith(("pbkdf2:", "scrypt:", "bcrypt:")):
        return check_password_hash(password_hash, password)
    else:
        # Solo para migración, no seguro dejarlo mucho tiempo
        return password_hash == password


def is_password_hashed(password_hash: str) -> bool:
    """
    Devuelve True si el string parece un hash seguro,
    False si es texto plano (antiguo). Útil para scripts de migración.
    """
    return password_hash.startswith(("pbkdf2:", "scrypt:", "bcrypt:"))

######################################
# FLUJO Y RELACIONES - SEGURIDAD
######################################
'''
Este módulo se encarga de toda la lógica de seguridad básica referente a contraseñas en la aplicación.
Su propósito es centralizar el método de hashing, verificación y migración de passwords:

- `hash_password` será usado en el alta/cambio de usuarios (crear o cambiar contraseña), dentro de rutas de Usuarios/Admin.
- `verify_password` será usado durante el login/autenticación, comparando la contraseña ingresada con la almacenada en DB.
- `is_password_hashed` sirve para saber si una contraseña almacenada es segura o debe migrarse a un formato hash seguro (útil en scripts de migración).

*Relaciones y comunicación:*
- Este archivo es importado por rutas y scripts backend para no repetir el hashing/chequeo (por ejemplo, en `routes/admin.py`, `routes/auth.py`, o en migraciones de passwords legacy).
- Depende solo de `werkzeug.security`, que es estándar en los stacks Flask modernos.

*Mejor práctica:*
Siempre migrar todos los passwords a hash seguro, evitando lógica legacy. Cualquier comparación directa de password debe eliminarse lo antes posible.
'''

# --- Fin de security.py ---
