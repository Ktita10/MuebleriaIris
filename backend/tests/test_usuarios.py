def test_create_usuario(client, sample_rol):
    data = {
        "nombre_us": "User",
        "apellido_us": "Test",
        "email_us": "newuser@test.com",
        "password": "password123", # Password plano
        "id_rol": sample_rol.id_rol
    }
    response = client.post("/api/usuarios", json=data)
    assert response.status_code == 201
    assert response.json["usuario"]["email"] == "newuser@test.com"

def test_login(client, sample_usuario):
    # sample_usuario tiene pass "123456" hasheado
    data = {"email": sample_usuario.email_us, "password": "123456"}
    response = client.post("/api/auth/login", json=data)
    assert response.status_code == 200
    assert "token" in response.json

def test_login_fail(client):
    data = {"email": "wrong@test.com", "password": "wrong"}
    response = client.post("/api/auth/login", json=data)
    assert response.status_code == 401

def test_get_usuarios(client, sample_usuario):
    """Test obtener lista de usuarios"""
    response = client.get("/api/usuarios")
    assert response.status_code == 200
    assert len(response.json) >= 1

def test_get_usuario_by_id(client, sample_usuario):
    """Test obtener usuario por ID"""
    response = client.get(f"/api/usuarios/{sample_usuario.id_usuarios}")
    assert response.status_code == 200
    assert response.json["email"] == sample_usuario.email_us
    assert response.json["nombre"] == sample_usuario.nombre_us

def test_update_usuario(client, sample_usuario):
    """Test actualizar usuario"""
    data = {
        "nombre_us": "Nombre Actualizado",
        "apellido_us": "Apellido Actualizado",
        "activo": False
    }
    response = client.put(f"/api/usuarios/{sample_usuario.id_usuarios}", json=data)
    assert response.status_code == 200
    assert response.json["usuario"]["nombre"] == "Nombre Actualizado"
    assert response.json["usuario"]["apellido"] == "Apellido Actualizado"

def test_delete_usuario(client, sample_usuario):
    """Test desactivar usuario (soft delete)"""
    response = client.delete(f"/api/usuarios/{sample_usuario.id_usuarios}")
    assert response.status_code == 200
    
    # Verify user is deactivated
    response_get = client.get(f"/api/usuarios/{sample_usuario.id_usuarios}")
    assert response_get.status_code == 200
    assert response_get.json["activo"] is False

def test_change_password(client, sample_usuario):
    """Test cambiar contraseña"""
    data = {
        "password_actual": "123456",  # Password from fixture
        "password_nueva": "newpassword123"
    }
    response = client.patch(f"/api/usuarios/{sample_usuario.id_usuarios}/password", json=data)
    assert response.status_code == 200
    
    # Try to login with new password
    login_data = {"email": sample_usuario.email_us, "password": "newpassword123"}
    login_response = client.post("/api/auth/login", json=login_data)
    assert login_response.status_code == 200

def test_create_usuario_duplicate_email(client, sample_usuario, sample_rol):
    """Test crear usuario con email duplicado"""
    data = {
        "nombre_us": "Otro",
        "apellido_us": "Usuario",
        "email_us": sample_usuario.email_us,  # Same email
        "password": "password123",
        "id_rol": sample_rol.id_rol
    }
    response = client.post("/api/usuarios", json=data)
    assert response.status_code == 409
    assert "error" in response.json
