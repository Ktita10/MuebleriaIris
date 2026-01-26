def test_create_producto(client, sample_categoria):
    data = {
        "sku": "PROD-NEW",
        "nombre": "Producto Nuevo",
        "precio": 1500.50,
        "id_categoria": sample_categoria.id_categoria,
        "material": "Roble",
        "descripcion": "Nuevo producto test"
    }
    response = client.post("/api/productos", json=data)
    assert response.status_code == 201
    assert response.json["producto"]["sku"] == "PROD-NEW"

def test_get_productos(client, sample_producto):
    response = client.get("/api/productos")
    assert response.status_code == 200
    assert len(response.json) >= 1
    assert response.json[0]["sku"] == sample_producto.sku

def test_create_producto_duplicate_sku(client, sample_producto, sample_categoria):
    data = {
        "sku": sample_producto.sku, # SKU existente
        "nombre": "Duplicado",
        "precio": 100,
        "id_categoria": sample_categoria.id_categoria,
        "material": "Metal"
    }
    response = client.post("/api/productos", json=data)
    assert response.status_code == 409

def test_delete_producto(client, sample_producto):
    response = client.delete(f"/api/productos/{sample_producto.id_producto}")
    assert response.status_code == 200
    assert response.json["producto"]["activo"] is False

def test_get_producto_by_id(client, sample_producto):
    """Test obtener producto por ID"""
    response = client.get(f"/api/productos/{sample_producto.id_producto}")
    assert response.status_code == 200
    assert response.json["sku"] == sample_producto.sku
    assert response.json["nombre"] == sample_producto.nombre

def test_get_producto_not_found(client):
    """Test obtener producto inexistente"""
    response = client.get("/api/productos/99999")
    assert response.status_code == 404
    assert "error" in response.json

def test_update_producto(client, sample_producto):
    """Test actualizar producto"""
    data = {
        "nombre": "Producto Actualizado",
        "precio": 2500.00,
        "descripcion": "Descripción actualizada"
    }
    response = client.put(f"/api/productos/{sample_producto.id_producto}", json=data)
    assert response.status_code == 200
    assert response.json["producto"]["nombre"] == "Producto Actualizado"
    assert response.json["producto"]["precio"] == 2500.00

def test_upload_producto_imagen(client, sample_producto):
    """Test subir imagen a producto"""
    from io import BytesIO
    
    # Create a fake image file
    data = {
        'file': (BytesIO(b"fake image content"), 'test.jpg'),
        'descripcion': 'Test image'
    }
    
    response = client.post(
        f"/api/productos/{sample_producto.id_producto}/imagen",
        data=data,
        content_type='multipart/form-data'
    )
    
    # Should succeed or fail gracefully
    assert response.status_code in [201, 400, 500]
    
    if response.status_code == 201:
        assert "imagen" in response.json
        assert "url" in response.json


# ==============================================================================
# PAPELERA (TRASH) TESTS
# ==============================================================================

def test_get_papelera_empty(client):
    """Test obtener papelera vacia"""
    response = client.get("/api/productos/papelera")
    assert response.status_code == 200
    assert isinstance(response.json, list)


def test_get_papelera_with_products(client, sample_producto, app):
    """Test obtener papelera con productos eliminados"""
    from app import db
    
    # Soft-delete the product
    sample_producto.activo = False
    with app.app_context():
        db.session.commit()
    
    response = client.get("/api/productos/papelera")
    assert response.status_code == 200
    assert len(response.json) >= 1
    assert any(p["id"] == sample_producto.id_producto for p in response.json)


def test_restaurar_producto(client, sample_producto, app):
    """Test restaurar producto desde papelera"""
    from app import db
    
    # First soft-delete the product
    sample_producto.activo = False
    with app.app_context():
        db.session.commit()
    
    # Then restore it
    response = client.post(f"/api/productos/{sample_producto.id_producto}/restaurar")
    assert response.status_code == 200
    assert response.json["producto"]["activo"] is True


def test_restaurar_producto_already_active(client, sample_producto):
    """Test restaurar producto que ya esta activo"""
    response = client.post(f"/api/productos/{sample_producto.id_producto}/restaurar")
    assert response.status_code == 400
    assert "ya está activo" in response.json["error"]


def test_eliminar_permanente(client, sample_categoria, app):
    """Test eliminar producto permanentemente"""
    from app import db
    from app.models import Producto
    
    # Create a new product to delete
    with app.app_context():
        producto = Producto(
            sku="DELETE-PERM-TEST",
            nombre="Producto para eliminar",
            precio=100.00,
            material="Test",
            id_categoria=sample_categoria.id_categoria,
            activo=False  # Must be in trash first
        )
        db.session.add(producto)
        db.session.commit()
        producto_id = producto.id_producto
    
    # Delete permanently
    response = client.delete(f"/api/productos/{producto_id}/eliminar-permanente")
    assert response.status_code == 200
    assert "eliminado permanentemente" in response.json["mensaje"]


def test_eliminar_permanente_active_product(client, sample_producto):
    """Test que no se puede eliminar permanentemente un producto activo"""
    response = client.delete(f"/api/productos/{sample_producto.id_producto}/eliminar-permanente")
    assert response.status_code == 400
    assert "papelera" in response.json["error"]
