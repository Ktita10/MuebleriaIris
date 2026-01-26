def test_create_orden(client, sample_cliente, sample_usuario, sample_producto, sample_inventario):
    # La orden necesita items y stock suficiente
    data = {
        "id_cliente": sample_cliente.id_cliente,
        "id_vendedor": sample_usuario.id_usuarios, # Actualizado a id_vendedor
        "items": [
            {
                "id_producto": sample_producto.id_producto,
                "cantidad": 2
            }
        ]
    }
    response = client.post("/api/ordenes", json=data)
    if response.status_code != 201:
        print(response.json)
    assert response.status_code == 201
    assert response.json["orden"]["total"] > 0

def test_create_orden_insufficient_stock(client, sample_cliente, sample_usuario, sample_producto, sample_inventario):
    data = {
        "id_cliente": sample_cliente.id_cliente,
        "id_vendedor": sample_usuario.id_usuarios,
        "items": [
            {
                "id_producto": sample_producto.id_producto,
                "cantidad": 1000 # Más que el stock (50)
            }
        ]
    }
    response = client.post("/api/ordenes", json=data)
    assert response.status_code == 400
    assert "insuficiente" in response.json["error"].lower()

def test_cancel_orden(client, sample_cliente, sample_usuario, sample_producto, sample_inventario):
    # Crear primero
    data = {
        "id_cliente": sample_cliente.id_cliente,
        "id_vendedor": sample_usuario.id_usuarios,
        "items": [{"id_producto": sample_producto.id_producto, "cantidad": 5}]
    }
    create_res = client.post("/api/ordenes", json=data)
    orden_id = create_res.json["orden"]["id"]
    
    # Cancelar
    cancel_res = client.delete(f"/api/ordenes/{orden_id}")
    assert cancel_res.status_code == 200
    
    # Verificar estado
    get_res = client.get(f"/api/ordenes/{orden_id}")
    assert get_res.json["estado"] == "cancelada"

def test_get_ordenes(client, sample_cliente, sample_usuario, sample_producto, sample_inventario):
    """Test obtener lista de órdenes"""
    # Create an order first
    data = {
        "id_cliente": sample_cliente.id_cliente,
        "id_vendedor": sample_usuario.id_usuarios,
        "items": [{"id_producto": sample_producto.id_producto, "cantidad": 2}]
    }
    client.post("/api/ordenes", json=data)
    
    # Get all orders
    response = client.get("/api/ordenes")
    assert response.status_code == 200
    assert len(response.json) >= 1

def test_get_orden_by_id(client, sample_cliente, sample_usuario, sample_producto, sample_inventario):
    """Test obtener orden por ID"""
    # Create order
    data = {
        "id_cliente": sample_cliente.id_cliente,
        "id_vendedor": sample_usuario.id_usuarios,
        "items": [{"id_producto": sample_producto.id_producto, "cantidad": 3}]
    }
    create_res = client.post("/api/ordenes", json=data)
    orden_id = create_res.json["orden"]["id"]
    
    # Get by ID
    response = client.get(f"/api/ordenes/{orden_id}")
    assert response.status_code == 200
    assert response.json["id"] == orden_id
    assert response.json["estado"] == "pendiente"

def test_update_estado_orden(client, sample_cliente, sample_usuario, sample_producto, sample_inventario):
    """Test actualizar estado de orden"""
    # Create order
    data = {
        "id_cliente": sample_cliente.id_cliente,
        "id_vendedor": sample_usuario.id_usuarios,
        "items": [{"id_producto": sample_producto.id_producto, "cantidad": 1}]
    }
    create_res = client.post("/api/ordenes", json=data)
    orden_id = create_res.json["orden"]["id"]
    
    # Update estado
    update_data = {"estado": "en_proceso"}
    response = client.patch(f"/api/ordenes/{orden_id}/estado", json=update_data)
    assert response.status_code == 200
    assert response.json["orden"]["estado"] == "en_proceso"

def test_update_estado_orden_invalid(client, sample_cliente, sample_usuario, sample_producto, sample_inventario):
    """Test actualizar estado de orden con estado inválido"""
    # Create order
    data = {
        "id_cliente": sample_cliente.id_cliente,
        "id_vendedor": sample_usuario.id_usuarios,
        "items": [{"id_producto": sample_producto.id_producto, "cantidad": 1}]
    }
    create_res = client.post("/api/ordenes", json=data)
    orden_id = create_res.json["orden"]["id"]
    
    # Try invalid estado
    update_data = {"estado": "estado_invalido"}
    response = client.patch(f"/api/ordenes/{orden_id}/estado", json=update_data)
    assert response.status_code == 400
    assert "error" in response.json
