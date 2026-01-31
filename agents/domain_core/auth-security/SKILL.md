---
name: muebleria-security
description: >
  Authentication, authorization, and security patterns for MuebleriaIris ERP.
  Trigger: When implementing authentication, JWT, sessions, RBAC, or security features.
license: Apache-2.0
metadata:
  author: muebleria-iris
  version: "1.0"
  scope: [root]
  auto_invoke:
    - "Implementing authentication"
    - "Working with JWT tokens"
    - "Setting up authorization/RBAC"
    - "Securing API endpoints"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

# muebleria-security

## Cuándo usar

Usa esta habilidad cuando:

- Implementes autenticación de usuario (login/logout)
- Trabajes con tokens JWT
- Configures control de acceso basado en roles (RBAC)
- Asegures endpoints de API
- Hashees contraseñas
- Gestiones sesiones de usuario

---

## Stack Tecnológico

```
Backend: Flask + Flask-JWT-Extended + bcrypt
Frontend: JWT storage + Axios interceptors
Base de datos: Tabla Users + Tabla Roles (ya existente)
```

---

## Patrones Críticos

### Patrón 1: Hashing de Contraseñas (Backend)

```python
# backend/app/auth.py
from werkzeug.security import generate_password_hash, check_password_hash

def hash_password(password: str) -> str:
    """Hashear contraseña con bcrypt"""
    return generate_password_hash(password, method='pbkrypt2:sha256')

def verify_password(password: str, password_hash: str) -> bool:
    """Verificar contraseña contra hash"""
    return check_password_hash(password_hash, password)

# NUNCA guardar contraseñas en texto plano
# SIEMPRE hashear antes de guardar en base de datos
```

### Patrón 2: Autenticación JWT

```python
# backend/app/__init__.py
from flask_jwt_extended import JWTManager

jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
    
    jwt.init_app(app)
    return app

# backend/app/routes.py
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

@main.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    # Buscar usuario
    user = Usuario.query.filter_by(email_us=email).first()
    
    if not user or not verify_password(password, user.password_hash):
        return jsonify({'error': 'Credenciales inválidas'}), 401
    
    # Crear token JWT
    access_token = create_access_token(identity=user.id_usuarios)
    
    return jsonify({
        'token': access_token,
        'user': user.to_dict()
    }), 200

@main.route('/api/productos', methods=['POST'])
@jwt_required()  # Endpoint protegido
def create_producto():
    current_user_id = get_jwt_identity()
    # ... resto de la lógica
```

### Patrón 3: Control de Acceso Basado en Roles (RBAC)

```python
# backend/app/decorators.py
from functools import wraps
from flask_jwt_extended import get_jwt_identity
from flask import jsonify

def role_required(required_role: str):
    def decorator(f):
        @wraps(f)
        @jwt_required()
        def wrapper(*args, **kwargs):
            user_id = get_jwt_identity()
            user = Usuario.query.get(user_id)
            
            if not user or user.rol.nombre_rol != required_role:
                return jsonify({'error': 'Acceso denegado'}), 403
            
            return f(*args, **kwargs)
        return wrapper
    return decorator

# Uso
@main.route('/api/admin/usuarios', methods=['GET'])
@role_required('Admin')
def get_usuarios():
    # Solo el rol Admin puede acceder
    pass
```

---

## Autenticación Frontend

### Patrón 4: Almacenamiento JWT

```typescript
// src/lib/auth.ts
const TOKEN_KEY = 'muebleria_token';

export const authService = {
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  
  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },
  
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
};
```

### Patrón 5: Llamadas API Protegidas

```typescript
// src/lib/api.ts
import { authService } from './auth';

export async function apiCall(url: string, options: RequestInit = {}) {
  const token = authService.getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };
  
  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401) {
    // Token expirado o inválido
    authService.removeToken();
    window.location.href = '/login';
  }
  
  return response;
}

// Uso
const productos = await apiCall('http://localhost:5000/api/productos')
  .then(r => r.json());
```

---

## Ejemplo de Componente Login

```tsx
// src/components/ui/LoginForm.tsx
"use client";
import { useState } from 'react';
import { authService } from '@/lib/auth';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Error de autenticación');
        return;
      }
      
      const { token, user } = await response.json();
      authService.setToken(token);
      
      // Redirigir a dashboard
      window.location.href = '/dashboard';
      
    } catch (err) {
      setError('Error de conexión');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6">
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        required
        className="w-full p-2 border rounded mb-4"
      />
      
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Contraseña"
        required
        className="w-full p-2 border rounded mb-4"
      />
      
      <button
        type="submit"
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
      >
        Iniciar Sesión
      </button>
    </form>
  );
}
```

---

## Mejores Prácticas de Seguridad

### SIEMPRE:
- Hashear contraseñas con bcrypt/pbkrypt2
- Usar HTTPS en producción
- Configurar tiempos de expiración JWT
- Validar JWT en cada endpoint protegido
- Sanitizar entradas de usuario
- Usar variables de entorno para secretos
- Implementar limitación de tasa (rate limiting) para intentos de login
- Usar cookies seguras y httpOnly para tokens (alternativa a localStorage)

### NUNCA:
- Guardar contraseñas en texto plano
- Exponer la clave secreta JWT
- Confiar solo en la validación del lado del cliente
- Guardar datos sensibles en el payload del JWT
- Usar GET para endpoints de autenticación
- Loguear contraseñas o tokens
- Hardcodear credenciales

---

## Variables de Entorno

```bash
# backend/.env
JWT_SECRET_KEY=tu-clave-super-secreta-cambia-esto
JWT_ACCESS_TOKEN_EXPIRES=3600  # 1 hora en segundos
SECRET_KEY=flask-secret-key-cambia-esto
```

---

## Ejemplo de Registro de Usuario

```python
@main.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validar campos requeridos
    required = ['nombre', 'apellido', 'email', 'password', 'id_rol']
    for field in required:
        if field not in data:
            return jsonify({'error': f'Campo {field} requerido'}), 400
    
    # Verificar si el email ya existe
    if Usuario.query.filter_by(email_us=data['email']).first():
        return jsonify({'error': 'Email ya registrado'}), 409
    
    # Validar fortaleza de contraseña
    if len(data['password']) < 8:
        return jsonify({'error': 'Contraseña debe tener mínimo 8 caracteres'}), 400
    
    # Crear usuario
    nuevo = Usuario(
        nombre_us=data['nombre'],
        apellido_us=data['apellido'],
        email_us=data['email'],
        password_hash=hash_password(data['password']),
        id_rol=data['id_rol']
    )
    
    try:
        db.session.add(nuevo)
        db.session.commit()
        
        # Auto-login
        token = create_access_token(identity=nuevo.id_usuarios)
        
        return jsonify({
            'mensaje': 'Usuario registrado exitosamente',
            'token': token,
            'user': nuevo.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
```

---

## Ruta Protegida (Frontend)

```astro
---
// src/pages/admin/index.astro
import Layout from '@/layouts/Layout.astro';

// Verificar autenticación lado servidor
const token = Astro.cookies.get('token')?.value;

if (!token) {
  return Astro.redirect('/login');
}

// Opcionalmente verificar token con backend
---

<Layout title="Admin Dashboard">
  <h1>Panel de Administración</h1>
  <!-- Contenido Admin -->
</Layout>
```

---

## Comandos

```bash
# Instalar dependencias
pip install flask-jwt-extended bcrypt

# Generar clave secreta
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## Checklist de QA

- [ ] Contraseñas hasheadas (nunca texto plano)
- [ ] Secreto JWT en variables de entorno
- [ ] Endpoints protegidos usan @jwt_required()
- [ ] RBAC implementado para rutas de admin
- [ ] Tokens expiran después de un tiempo razonable
- [ ] Intentos de login limitados por tasa
- [ ] Entradas de usuario validadas y sanitizadas
- [ ] HTTPS usado en producción

---

## Recursos

- **Flask-JWT-Extended**: https://flask-jwt-extended.readthedocs.io
- **Seguridad OWASP**: https://owasp.org/www-project-top-ten/
