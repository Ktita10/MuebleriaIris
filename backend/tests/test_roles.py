def test_create_rol(client):
    """Test crear rol"""
    data = {
        "nombre_rol": "Nuevo Rol",
        "descripcion": "Descripción del nuevo rol"
    }
    response = client.post("/api/roles", json=data)
    assert response.status_code == 201
    assert response.json["rol"]["nombre"] == "Nuevo Rol"  # to_dict returns "nombre"
    assert response.json["rol"]["descripcion"] == "Descripción del nuevo rol"

def test_get_roles(client, sample_rol):
    """Test obtener lista de roles"""
    response = client.get("/api/roles")
    assert response.status_code == 200
    assert len(response.json) >= 1
    assert any(rol["nombre"] == sample_rol.nombre_rol for rol in response.json)  # to_dict returns "nombre"

def test_get_rol_by_id(client, sample_rol):
    """Test obtener rol por ID"""
    response = client.get(f"/api/roles/{sample_rol.id_rol}")
    assert response.status_code == 200
    assert response.json["nombre"] == sample_rol.nombre_rol  # to_dict returns "nombre"

def test_update_rol(client, sample_rol):
    """Test actualizar rol"""
    data = {
        "nombre_rol": "Rol Actualizado",
        "descripcion": "Nueva descripción"
    }
    response = client.put(f"/api/roles/{sample_rol.id_rol}", json=data)
    assert response.status_code == 200
    assert response.json["rol"]["nombre"] == "Rol Actualizado"  # to_dict returns "nombre"
    assert response.json["rol"]["descripcion"] == "Nueva descripción"

def test_delete_rol(client):
    """Test eliminar rol sin usuarios asociados"""
    # Create a new role without users
    data = {"nombre_rol": "Rol a Eliminar"}
    create_response = client.post("/api/roles", json=data)
    rol_id = create_response.json["rol"]["id"]
    
    # Delete it
    response = client.delete(f"/api/roles/{rol_id}")
    assert response.status_code == 200

def test_delete_rol_con_usuarios(client, sample_rol, sample_usuario):
    """Test intentar eliminar rol con usuarios asociados"""
    # sample_usuario está asociado a sample_rol
    response = client.delete(f"/api/roles/{sample_rol.id_rol}")
    # Should fail because there are users with this role
    assert response.status_code == 409
    assert "error" in response.json
