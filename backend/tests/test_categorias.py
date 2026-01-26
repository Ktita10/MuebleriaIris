def test_create_categoria(client):
    data = {"nombre": "Sofás", "descripcion": "Sofás cómodos"}
    response = client.post("/api/categorias", json=data)
    assert response.status_code == 201
    assert response.json["categoria"]["nombre"] == "Sofás"

def test_get_categorias(client, sample_categoria):
    response = client.get("/api/categorias")
    assert response.status_code == 200
    assert len(response.json) >= 1
    assert response.json[0]["nombre"] == sample_categoria.nombre

def test_update_categoria(client, sample_categoria):
    data = {"nombre": "Categoría Editada"}
    response = client.put(f"/api/categorias/{sample_categoria.id_categoria}", json=data)
    assert response.status_code == 200
    assert response.json["categoria"]["nombre"] == "Categoría Editada"

def test_delete_categoria(client, sample_categoria):
    # Soft delete
    response = client.delete(f"/api/categorias/{sample_categoria.id_categoria}")
    assert response.status_code == 200
    
    # Verificar que sigue existiendo pero inactiva (según lógica de tu endpoint)
    # Tu endpoint actual marca activa=False
    # Pero el modelo dice "activa", el endpoint hace "categoria.activa = False"
    # Vamos a verificar accediendo
    res_get = client.get(f"/api/categorias/{sample_categoria.id_categoria}")
    assert res_get.json["activo"] is False  # to_dict devuelve "activo"

def test_get_categoria_by_id(client, sample_categoria):
    """Test obtener categoría por ID"""
    response = client.get(f"/api/categorias/{sample_categoria.id_categoria}")
    assert response.status_code == 200
    assert response.json["nombre"] == sample_categoria.nombre
    assert response.json["id"] == sample_categoria.id_categoria

def test_update_categoria_not_found(client):
    """Test actualizar categoría inexistente"""
    data = {"nombre": "No Existe"}
    response = client.put("/api/categorias/99999", json=data)
    assert response.status_code == 404
    assert "error" in response.json

def test_create_categoria_duplicate(client, sample_categoria):
    """Test crear categoría con nombre duplicado"""
    data = {
        "nombre": sample_categoria.nombre,  # Same name as existing
        "descripcion": "Duplicado"
    }
    response = client.post("/api/categorias", json=data)
    assert response.status_code == 409
    assert "error" in response.json
