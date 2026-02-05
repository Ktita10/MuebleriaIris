---
name: auth-security
description: 'JWT authentication, route protection, and security best practices. Use when implementing login/logout, protecting routes, validating tokens, managing roles/permissions, or securing APIs. Triggers: "authentication", "jwt", "login", "token", "protected route", "authorization", "security".'
license: MIT
metadata:
  protocols: JWT
  version: "1.0"
---

# Authentication & Security

Patrones de autenticación JWT y seguridad para APIs.

## Cuándo Usar Esta Skill

- Implementar login/logout
- Proteger rutas con autenticación
- Validar tokens JWT
- Manejar roles y permisos
- Asegurar APIs

## JWT: Conceptos Básicos

```
┌─────────────────────────────────────────────────────────────┐
│                         JWT Token                          │
├─────────────────────────────────────────────────────────────┤
│  Header.Payload.Signature                                   │
│                                                             │
│  Header:    {"alg": "HS256", "typ": "JWT"}                 │
│  Payload:   {"user_id": 1, "rol": "admin", "exp": ...}     │
│  Signature: HMACSHA256(header + payload, SECRET_KEY)       │
└─────────────────────────────────────────────────────────────┘
```

## Implementación JWT

```python
# app/security.py
import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from functools import wraps
from flask import request, g, current_app
import hashlib
import secrets

# Configuración
JWT_SECRET = "tu-secret-key-muy-segura"  # Usar variable de entorno
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24


def generar_token(user_id: int, rol: str = "cliente") -> str:
    """Genera un token JWT."""
    payload = {
        "user_id": user_id,
        "rol": rol,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verificar_token(token: str) -> Optional[Dict[str, Any]]:
    """Verifica y decodifica un token JWT."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None  # Token expirado
    except jwt.InvalidTokenError:
        return None  # Token inválido


def hash_password(password: str) -> str:
    """Hash de contraseña con salt."""
    salt = secrets.token_hex(16)
    hash_obj = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode(),
        salt.encode(),
        100000
    )
    return f"{salt}${hash_obj.hex()}"


def verify_password(password: str, hashed: str) -> bool:
    """Verifica contraseña contra hash."""
    try:
        salt, hash_value = hashed.split('$')
        new_hash = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode(),
            salt.encode(),
            100000
        )
        return new_hash.hex() == hash_value
    except ValueError:
        return False
```

## Decoradores de Protección

```python
# app/security.py (continuación)

def token_required(f):
    """Requiere token JWT válido."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = extraer_token()
        
        if not token:
            return {"error": "Token no proporcionado"}, 401
        
        payload = verificar_token(token)
        if not payload:
            return {"error": "Token inválido o expirado"}, 401
        
        # Guardar info del usuario en contexto
        g.current_user_id = payload["user_id"]
        g.current_user_rol = payload.get("rol", "cliente")
        
        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    """Requiere rol de administrador."""
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if g.current_user_rol != "admin":
            return {"error": "Se requiere rol de administrador"}, 403
        return f(*args, **kwargs)
    return decorated


def roles_required(*roles):
    """Requiere uno de los roles especificados."""
    def decorator(f):
        @wraps(f)
        @token_required
        def decorated(*args, **kwargs):
            if g.current_user_rol not in roles:
                return {"error": f"Se requiere rol: {', '.join(roles)}"}, 403
            return f(*args, **kwargs)
        return decorated
    return decorator


def extraer_token() -> Optional[str]:
    """Extrae token del header Authorization."""
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header[7:]
    return None
```

## Rutas de Autenticación

```python
# app/routes/auth.py
from flask import Blueprint, request, jsonify
from app.security import generar_token, hash_password, verify_password
from app.models import Usuario

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/login", methods=["POST"])
def login():
    """Autenticar usuario y retornar token."""
    data = request.get_json()
    
    # Validar input
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    
    if not email or not password:
        return jsonify({"error": "Email y contraseña requeridos"}), 400
    
    # Buscar usuario
    usuario = Usuario.query.filter_by(email=email, activo=True).first()
    
    if not usuario or not verify_password(password, usuario.password_hash):
        # Mensaje genérico para no revelar si el email existe
        return jsonify({"error": "Credenciales inválidas"}), 401
    
    # Generar token
    token = generar_token(usuario.id, usuario.rol)
    
    return jsonify({
        "token": token,
        "user": {
            "id": usuario.id,
            "nombre": usuario.nombre,
            "email": usuario.email,
            "rol": usuario.rol
        }
    })


@auth_bp.route("/register", methods=["POST"])
def register():
    """Registrar nuevo usuario."""
    data = request.get_json()
    
    # Validar input
    errores = validar_registro(data)
    if errores:
        return jsonify({"errors": errores}), 400
    
    # Verificar email único
    if Usuario.query.filter_by(email=data["email"].lower()).first():
        return jsonify({"error": "Email ya registrado"}), 409
    
    # Crear usuario
    usuario = Usuario(
        nombre=data["nombre"],
        email=data["email"].lower(),
        password_hash=hash_password(data["password"]),
        rol="cliente"
    )
    db.session.add(usuario)
    db.session.commit()
    
    # Auto-login: retornar token
    token = generar_token(usuario.id, usuario.rol)
    
    return jsonify({
        "message": "Usuario registrado exitosamente",
        "token": token,
        "user": {
            "id": usuario.id,
            "nombre": usuario.nombre,
            "email": usuario.email,
            "rol": usuario.rol
        }
    }), 201


@auth_bp.route("/me", methods=["GET"])
@token_required
def get_current_user():
    """Obtener información del usuario actual."""
    usuario = Usuario.query.get(g.current_user_id)
    
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404
    
    return jsonify({
        "id": usuario.id,
        "nombre": usuario.nombre,
        "email": usuario.email,
        "rol": usuario.rol
    })


def validar_registro(data: dict) -> dict:
    """Valida datos de registro."""
    errores = {}
    
    if not data.get("nombre"):
        errores["nombre"] = "El nombre es requerido"
    
    email = data.get("email", "")
    if not email or "@" not in email:
        errores["email"] = "Email inválido"
    
    password = data.get("password", "")
    if len(password) < 8:
        errores["password"] = "La contraseña debe tener al menos 8 caracteres"
    
    return errores
```

## Uso en Rutas Protegidas

```python
# app/routes/admin.py
from flask import Blueprint
from app.security import token_required, admin_required, roles_required

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@admin_bp.route("/dashboard")
@admin_required  # Solo admins
def dashboard():
    return {"message": "Panel de administración"}


@admin_bp.route("/productos", methods=["POST"])
@roles_required("admin", "vendedor")  # Admin o vendedor
def crear_producto():
    # g.current_user_id disponible aquí
    return {"message": "Producto creado"}


@admin_bp.route("/perfil")
@token_required  # Cualquier usuario autenticado
def perfil():
    return {"user_id": g.current_user_id, "rol": g.current_user_rol}
```

## Frontend: Manejo de Tokens

```typescript
// lib/auth.ts

const TOKEN_KEY = 'auth_token';

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;
  
  // Verificar si expiró (decodificar payload sin verificar firma)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

// Fetch con token automático
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
  
  const response = await fetch(url, { ...options, headers });
  
  // Si 401, limpiar token y redirigir a login
  if (response.status === 401) {
    removeToken();
    window.location.href = '/login';
  }
  
  return response;
}
```

## Seguridad: Best Practices

### 1. CORS Configuración

```python
# app/__init__.py
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    
    # Configurar CORS restrictivo
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:4321", "https://muebleriairis.com"],
            "methods": ["GET", "POST", "PUT", "DELETE"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })
```

### 2. Rate Limiting

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

@auth_bp.route("/login", methods=["POST"])
@limiter.limit("5 per minute")  # Prevenir brute force
def login():
    ...
```

### 3. Headers de Seguridad

```python
@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    return response
```

### 4. Input Sanitization

```python
import bleach

def sanitize_input(text: str) -> str:
    """Sanitiza input de usuario."""
    return bleach.clean(text, strip=True)

# Uso
nombre = sanitize_input(data.get("nombre", ""))
```

### 5. SQL Injection Prevention

```python
# ✅ BIEN: Usar ORM/parámetros
usuario = Usuario.query.filter_by(email=email).first()

# ✅ BIEN: Parámetros con raw SQL
db.session.execute(
    "SELECT * FROM usuarios WHERE email = :email",
    {"email": email}
)

# ❌ MAL: String concatenation
db.session.execute(f"SELECT * FROM usuarios WHERE email = '{email}'")
```

## Checklist de Seguridad

- [ ] ¿JWT_SECRET en variable de entorno?
- [ ] ¿Contraseñas hasheadas con salt?
- [ ] ¿Tokens con expiración razonable?
- [ ] ¿CORS configurado correctamente?
- [ ] ¿Rate limiting en endpoints sensibles?
- [ ] ¿Input sanitizado?
- [ ] ¿SQL injection prevenido?
- [ ] ¿Headers de seguridad configurados?
- [ ] ¿HTTPS en producción?
- [ ] ¿Mensajes de error genéricos (no revelar info)?
