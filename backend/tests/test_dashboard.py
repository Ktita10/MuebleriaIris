def test_dashboard_metricas_default(client, sample_cliente, sample_usuario, sample_producto, sample_inventario):
    """Test obtener métricas del dashboard con período por defecto (mes)"""
    # Create some orders to generate metrics
    data = {
        "id_cliente": sample_cliente.id_cliente,
        "id_vendedor": sample_usuario.id_usuarios,
        "items": [{"id_producto": sample_producto.id_producto, "cantidad": 2}]
    }
    client.post("/api/ordenes", json=data)
    
    # Get dashboard metrics
    response = client.get("/api/dashboard/metricas")
    assert response.status_code == 200
    assert "periodo" in response.json
    assert "ventas" in response.json
    assert "productos_bajo_stock" in response.json
    assert "top_productos" in response.json
    assert "ventas_por_categoria" in response.json
    assert "ordenes_por_estado" in response.json
    
    # Check ventas structure
    assert "total" in response.json["ventas"]
    assert "cantidad_ordenes" in response.json["ventas"]
    assert "promedio" in response.json["ventas"]

def test_dashboard_metricas_por_periodo(client, sample_cliente, sample_usuario, sample_producto, sample_inventario):
    """Test obtener métricas del dashboard con diferentes períodos"""
    periodos = ['hoy', 'semana', 'mes', 'anio']
    
    for periodo in periodos:
        response = client.get(f"/api/dashboard/metricas?periodo={periodo}")
        assert response.status_code == 200
        assert response.json["periodo"] == periodo
        assert "fecha_inicio" in response.json
        assert "fecha_fin" in response.json

def test_dashboard_reporte_actividad(client, sample_cliente, sample_usuario, sample_producto, sample_inventario):
    """Test verificar que el dashboard incluye actividad reciente"""
    # Create multiple orders
    for i in range(3):
        data = {
            "id_cliente": sample_cliente.id_cliente,
            "id_vendedor": sample_usuario.id_usuarios,
            "items": [{"id_producto": sample_producto.id_producto, "cantidad": 1}]
        }
        client.post("/api/ordenes", json=data)
    
    # Get metrics
    response = client.get("/api/dashboard/metricas?periodo=hoy")
    assert response.status_code == 200
    
    # Should have orders counted
    assert response.json["ventas"]["cantidad_ordenes"] >= 0
    
    # Should have ordenes_por_estado with at least 'pendiente'
    estados = [item["estado"] for item in response.json["ordenes_por_estado"]]
    assert len(estados) > 0
