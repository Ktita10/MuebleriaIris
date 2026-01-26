"""
Tests para autenticación JWT y endpoints de auth
"""
import pytest
from flask_jwt_extended import decode_token
from app.models import Usuario, Rol, Cliente
from app import db
from datetime import timedelta


def test_register_success(client, app):
    """Test /auth/register crea usuario y cliente exitosamente"""
    data = {
        "nombre": "Nuevo",
        "apellido": "Usuario",
        "email": "nuevo@test.com",
        "password": "password123"
    }
    
    response = client.post("/api/auth/register", json=data)
    
    assert response.status_code == 201
    assert "token" in response.json
    assert response.json["user"]["email"] == "nuevo@test.com"
    assert response.json["user"]["rol"] == "cliente"
    assert "cliente_id" in response.json["user"]
    
    # Verificar que el usuario se creó en BD
    with app.app_context():
        usuario = Usuario.query.filter_by(email_us="nuevo@test.com").first()
        assert usuario is not None
        assert usuario.activo is True
        
        # Verificar que el cliente asociado se creó
        cliente = Cliente.query.filter_by(email_cliente="nuevo@test.com").first()
        assert cliente is not None


def test_register_duplicate_email(client, sample_usuario):
    """Test /auth/register con email duplicado retorna 409"""
    data = {
        "nombre": "Otro",
        "apellido": "Usuario",
        "email": sample_usuario.email_us,
        "password": "password123"
    }
    
    response = client.post("/api/auth/register", json=data)
    
    assert response.status_code == 409
    assert "ya está registrado" in response.json["error"].lower()


def test_register_missing_field(client):
    """Test /auth/register con campo faltante retorna 400"""
    data = {
        "nombre": "Test",
        "email": "test@test.com"
        # Falta password y apellido
    }
    
    response = client.post("/api/auth/register", json=data)
    
    assert response.status_code == 400
    assert "requerido" in response.json["error"].lower()


def test_login_success(client, sample_usuario):
    """Test /auth/login con credenciales válidas retorna JWT"""
    data = {
        "email": sample_usuario.email_us,
        "password": "123456"  # Password del fixture
    }
    
    response = client.post("/api/auth/login", json=data)
    
    assert response.status_code == 200
    assert "token" in response.json
    assert "user" in response.json
    assert response.json["user"]["email"] == sample_usuario.email_us
    
    # Verificar que el token es un JWT válido
    token = response.json["token"]
    assert token.count('.') == 2  # JWT tiene 3 partes


def test_login_invalid_password(client, sample_usuario):
    """Test /auth/login con contraseña incorrecta retorna 401"""
    data = {
        "email": sample_usuario.email_us,
        "password": "wrongpassword"
    }
    
    response = client.post("/api/auth/login", json=data)
    
    assert response.status_code == 401
    assert "credenciales" in response.json["error"].lower()


def test_login_nonexistent_user(client):
    """Test /auth/login con usuario inexistente retorna 401"""
    data = {
        "email": "noexiste@test.com",
        "password": "password"
    }
    
    response = client.post("/api/auth/login", json=data)
    
    assert response.status_code == 401
    assert "credenciales" in response.json["error"].lower()


def test_login_inactive_user(client, app, sample_rol):
    """Test /auth/login con usuario inactivo retorna 403"""
    # Crear usuario inactivo
    from app.security import hash_password
    
    with app.app_context():
        usuario = Usuario(
            nombre_us="Inactivo",
            apellido_us="Usuario",
            email_us="inactivo@test.com",
            password_hash=hash_password("password"),
            id_rol=sample_rol.id_rol,
            activo=False
        )
        db.session.add(usuario)
        db.session.commit()
    
    data = {
        "email": "inactivo@test.com",
        "password": "password"
    }
    
    response = client.post("/api/auth/login", json=data)
    
    assert response.status_code == 403
    assert "inactivo" in response.json["error"].lower()


def test_auth_me_valid_token(client, sample_usuario):
    """Test /auth/me con token JWT válido retorna usuario"""
    # Primero hacer login para obtener token
    login_data = {
        "email": sample_usuario.email_us,
        "password": "123456"
    }
    login_response = client.post("/api/auth/login", json=login_data)
    token = login_response.json["token"]
    
    # Luego llamar /auth/me con el token
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    assert response.json["email"] == sample_usuario.email_us
    assert response.json["id"] == sample_usuario.id_usuarios
    assert "rol" in response.json


def test_auth_me_no_token(client):
    """Test /auth/me sin token retorna 401"""
    response = client.get("/api/auth/me")
    
    assert response.status_code == 401
    assert "error" in response.json


def test_auth_me_invalid_token(client):
    """Test /auth/me con token inválido retorna 422"""
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": "Bearer invalid-token-abc123"}
    )
    
    assert response.status_code == 422
    assert "error" in response.json


def test_logout(client):
    """Test /auth/logout retorna 200"""
    response = client.post("/api/auth/logout")
    
    assert response.status_code == 200
    assert "mensaje" in response.json or "message" in response.json


def test_login_returns_cliente_id(client, app, sample_usuario):
    """Test /auth/login incluye cliente_id si existe"""
    # Crear cliente asociado al usuario
    with app.app_context():
        cliente = Cliente(
            nombre_cliente=sample_usuario.nombre_us,
            apellido_cliente=sample_usuario.apellido_us,
            email_cliente=sample_usuario.email_us,
            dni_cuit="12345678",
            telefono="123456789",
            direccion_cliente="Test 123",
            ciudad_cliente="Test City",
            codigo_postal="1000",
            provincia_cliente="Test"
        )
        db.session.add(cliente)
        db.session.commit()
        cliente_id = cliente.id_cliente
    
    # Login
    data = {
        "email": sample_usuario.email_us,
        "password": "123456"
    }
    
    response = client.post("/api/auth/login", json=data)
    
    assert response.status_code == 200
    assert response.json["user"]["cliente_id"] == cliente_id


def test_jwt_token_contains_user_info(client, sample_usuario, app):
    """Test que el JWT contiene la información del usuario en el payload"""
    import json
    
    # Login
    data = {
        "email": sample_usuario.email_us,
        "password": "123456"
    }
    
    response = client.post("/api/auth/login", json=data)
    token = response.json["token"]
    
    # Decodificar token (sin verificar para propósitos de testing)
    with app.app_context():
        decoded = decode_token(token)
        
        assert "sub" in decoded  # 'sub' (subject) es el identity
        
        # El sub ahora es un JSON string, deserializarlo
        identity_str = decoded["sub"]
        if isinstance(identity_str, str):
            identity = json.loads(identity_str)
        else:
            identity = identity_str
        
        assert identity["id"] == sample_usuario.id_usuarios
        assert identity["email"] == sample_usuario.email_us
        assert "rol" in identity
