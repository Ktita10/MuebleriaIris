def test_create_inventario(client, sample_producto):
    # Crear un nuevo producto para este test para evitar conflictos de unique constraint
    # O usar el sample_producto si no tiene inventario todavía en este scope
    # Como los fixtures son por función (default), sample_producto es nuevo y sin inventario (sample_inventario no se llama aquí)
    data = {
        "id_producto": sample_producto.id_producto,
        "cantidad_stock": 100,
        "stock_minimo": 10,
        "ubicacion": "B-2"
    }
    response = client.post("/api/inventario", json=data)
    assert response.status_code == 201
    assert response.json["inventario"]["cantidad"] == 100

def test_ajustar_stock(client, sample_inventario):
    # sample_inventario tiene 50
    data = {"cantidad": 10, "motivo": "Compra"} # Sumar
    response = client.patch(f"/api/inventario/{sample_inventario.id_inventario}/ajustar", json=data)
    assert response.status_code == 200
    assert response.json["inventario"]["cantidad"] == 60

    data_resta = {"cantidad": -5, "motivo": "Venta"}
    response = client.patch(f"/api/inventario/{sample_inventario.id_inventario}/ajustar", json=data_resta)
    assert response.status_code == 200
    assert response.json["inventario"]["cantidad"] == 55

def test_ajuste_stock_negativo_invalido(client, sample_inventario):
    # Stock 50, restar 60 -> error
    data = {"cantidad": -60}
    response = client.patch(f"/api/inventario/{sample_inventario.id_inventario}/ajustar", json=data)
    assert response.status_code == 400

def test_get_inventario_lista(client, sample_inventario):
    """Test obtener lista de inventario"""
    response = client.get("/api/inventario")
    assert response.status_code == 200
    assert len(response.json) >= 1

def test_get_inventario_bajo_stock(client, sample_inventario):
    """Test obtener inventario con bajo stock"""
    # Set stock below minimum
    from app import db
    sample_inventario.cantidad_stock = 5  # Below stock_minimo (10)
    sample_inventario.stock_minimo = 10
    db.session.commit()
    
    response = client.get("/api/inventario?bajo_stock=true")
    assert response.status_code == 200
    # Should include our low stock item
    assert any(item["id"] == sample_inventario.id_inventario for item in response.json)

def test_get_alertas_stock(client, sample_inventario):
    """Test obtener alertas de stock"""
    # Set stock to 0 to trigger alert
    from app import db
    sample_inventario.cantidad_stock = 0
    db.session.commit()
    
    response = client.get("/api/inventario/alertas")
    assert response.status_code == 200
    assert "agotados" in response.json
    assert "bajo_stock" in response.json
    assert "total_alertas" in response.json

def test_get_inventario_by_producto(client, sample_inventario, sample_producto):
    """Test obtener inventario por producto"""
    response = client.get(f"/api/inventario/producto/{sample_producto.id_producto}")
    assert response.status_code == 200
    assert response.json["id_producto"] == sample_producto.id_producto
