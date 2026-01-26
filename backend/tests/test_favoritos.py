def test_add_favorito(client, sample_cliente, sample_producto):
    data = {"id_cliente": sample_cliente.id_cliente, "id_producto": sample_producto.id_producto}
    response = client.post("/api/favoritos", json=data)
    assert response.status_code == 201
    assert response.json["mensaje"] == "Producto agregado a favoritos"
    assert response.json["favorito"]["id_cliente"] == sample_cliente.id_cliente
    assert response.json["favorito"]["id_producto"] == sample_producto.id_producto

def test_get_favoritos(client, sample_cliente, sample_producto):
    # Primero agregar favorito
    client.post("/api/favoritos", json={"id_cliente": sample_cliente.id_cliente, "id_producto": sample_producto.id_producto})
    # Obtener favoritos
    response = client.get(f"/api/favoritos?id_cliente={sample_cliente.id_cliente}")
    assert response.status_code == 200
    # FIX: Acceder a la clave "favoritos" del diccionario de respuesta
    assert isinstance(response.json["favoritos"], list)
    assert any(f["id_producto"] == sample_producto.id_producto for f in response.json["favoritos"])

def test_remove_favorito(client, sample_cliente, sample_producto):
    # Agregar favorito
    client.post("/api/favoritos", json={"id_cliente": sample_cliente.id_cliente, "id_producto": sample_producto.id_producto})
    # Eliminar favorito
    response = client.delete("/api/favoritos", json={"id_cliente": sample_cliente.id_cliente, "id_producto": sample_producto.id_producto})
    assert response.status_code == 200
    assert response.json["mensaje"] == "Producto eliminado de favoritos"
    # Verificar que ya no está
    response2 = client.get(f"/api/favoritos?id_cliente={sample_cliente.id_cliente}")
    # FIX: Acceder a la clave "favoritos"
    assert all(f["id_producto"] != sample_producto.id_producto for f in response2.json["favoritos"])

def test_add_favorito_duplicate(client, sample_cliente, sample_producto):
    client.post("/api/favoritos", json={"id_cliente": sample_cliente.id_cliente, "id_producto": sample_producto.id_producto})
    response = client.post("/api/favoritos", json={"id_cliente": sample_cliente.id_cliente, "id_producto": sample_producto.id_producto})
    assert response.status_code == 409
    assert "ya está en favoritos" in response.json["error"]

def test_remove_favorito_not_found(client, sample_cliente, sample_producto):
    response = client.delete("/api/favoritos", json={"id_cliente": sample_cliente.id_cliente, "id_producto": sample_producto.id_producto})
    assert response.status_code == 404
    assert "no está en favoritos" in response.json["error"]