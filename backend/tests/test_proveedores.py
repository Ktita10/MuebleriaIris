def test_create_proveedor(client):
    data = {
        "nombre_empresa": "Prov Nuevo",
        "telefono": "123",
        "email": "prov@nuevo.com",
        "direccion": "Dir"
    }
    response = client.post("/api/proveedores", json=data)
    assert response.status_code == 201
    assert response.json["proveedor"]["nombre_empresa"] == "Prov Nuevo"

def test_get_proveedores(client, sample_proveedor):
    response = client.get("/api/proveedores")
    assert response.status_code == 200
    assert len(response.json) >= 1

def test_delete_proveedor(client, sample_proveedor):
    response = client.delete(f"/api/proveedores/{sample_proveedor.id_proovedor}")
    assert response.status_code == 200
    # Soft delete check
    res_get = client.get(f"/api/proveedores/{sample_proveedor.id_proovedor}")
    assert res_get.json["activo"] is False

def test_get_proveedor_by_id(client, sample_proveedor):
    """Test obtener proveedor por ID"""
    response = client.get(f"/api/proveedores/{sample_proveedor.id_proovedor}")
    assert response.status_code == 200
    assert response.json["nombre_empresa"] == sample_proveedor.nombre_empresa

def test_update_proveedor(client, sample_proveedor):
    """Test actualizar proveedor"""
    data = {
        "nombre_empresa": "Empresa Actualizada",
        "telefono": "999888777",
        "email": "nuevo@email.com"
    }
    response = client.put(f"/api/proveedores/{sample_proveedor.id_proovedor}", json=data)
    assert response.status_code == 200
    assert response.json["proveedor"]["nombre_empresa"] == "Empresa Actualizada"
    assert response.json["proveedor"]["telefono"] == "999888777"
