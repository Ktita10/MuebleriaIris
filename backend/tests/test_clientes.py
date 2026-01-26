def test_create_cliente(client):
    data = {
        "nombre_cliente": "Nuevo",
        "apellido_cliente": "Cliente",
        "dni_cuit": "22222222",
        "email_cliente": "nuevo@test.com",
        "telefono": "987654321",
        "direccion_cliente": "Calle Nueva",
        "ciudad_cliente": "Ciudad",
        "provincia_cliente": "Provincia",
        "codigo_postal": "2000"
    }
    response = client.post("/api/clientes", json=data)
    assert response.status_code == 201
    assert response.json["cliente"]["email"] == "nuevo@test.com"

def test_get_clientes(client, sample_cliente):
    response = client.get("/api/clientes")
    assert response.status_code == 200
    assert len(response.json) >= 1

def test_delete_cliente(client, sample_cliente):
    response = client.delete(f"/api/clientes/{sample_cliente.id_cliente}")
    assert response.status_code == 200

def test_get_cliente_by_id(client, sample_cliente):
    """Test obtener cliente por ID"""
    response = client.get(f"/api/clientes/{sample_cliente.id_cliente}")
    assert response.status_code == 200
    assert response.json["email"] == sample_cliente.email_cliente
    assert response.json["nombre"] == sample_cliente.nombre_cliente

def test_update_cliente(client, sample_cliente):
    """Test actualizar cliente"""
    data = {
        "nombre_cliente": "Nombre Actualizado",
        "telefono": "111222333",
        "ciudad_cliente": "Nueva Ciudad"
    }
    response = client.put(f"/api/clientes/{sample_cliente.id_cliente}", json=data)
    assert response.status_code == 200
    assert response.json["cliente"]["nombre"] == "Nombre Actualizado"
    assert response.json["cliente"]["telefono"] == "111222333"

def test_create_cliente_duplicate_email(client, sample_cliente):
    """Test crear cliente con email duplicado"""
    data = {
        "nombre_cliente": "Otro",
        "apellido_cliente": "Cliente",
        "dni_cuit": "99999999",  # Different DNI
        "email_cliente": sample_cliente.email_cliente,  # Same email
        "telefono": "987654321",
        "direccion_cliente": "Calle Nueva",
        "ciudad_cliente": "Ciudad",
        "provincia_cliente": "Provincia",
        "codigo_postal": "2000"
    }
    response = client.post("/api/clientes", json=data)
    assert response.status_code == 409
    assert "error" in response.json

def test_create_cliente_duplicate_dni(client, sample_cliente):
    """Test crear cliente con DNI duplicado"""
    data = {
        "nombre_cliente": "Otro",
        "apellido_cliente": "Cliente",
        "dni_cuit": sample_cliente.dni_cuit,  # Same DNI
        "email_cliente": "otromail@test.com",  # Different email
        "telefono": "987654321",
        "direccion_cliente": "Calle Nueva",
        "ciudad_cliente": "Ciudad",
        "provincia_cliente": "Provincia",
        "codigo_postal": "2000"
    }
    response = client.post("/api/clientes", json=data)
    assert response.status_code == 409
    assert "error" in response.json
