#!/usr/bin/env python3
"""
Test Suite Completo - Dashboard Admin y Operaciones CRUD
Verifica el funcionamiento de todos los endpoints del sistema
"""

import requests
import json
import sys
import random
from datetime import datetime
from colorama import init, Fore, Style

# Inicializar colorama para colores en terminal
init(autoreset=True)

# Configuración
API_BASE = "http://localhost:5000/api"
TIMEOUT = 10

# Contadores
tests_passed = 0
tests_failed = 0
tests_total = 0

# Generador de IDs únicos para tests
test_run_id = random.randint(10000, 99999)


def print_header(text):
    """Imprime un header destacado"""
    print(f"\n{Fore.CYAN}{'=' * 80}")
    print(f"{Fore.CYAN}{text.center(80)}")
    print(f"{Fore.CYAN}{'=' * 80}{Style.RESET_ALL}\n")


def print_test(name):
    """Imprime el nombre del test"""
    global tests_total
    tests_total += 1
    print(f"{Fore.YELLOW}[TEST #{tests_total}] {name}...{Style.RESET_ALL}", end=" ")


def print_pass(details=""):
    """Imprime resultado exitoso"""
    global tests_passed
    tests_passed += 1
    print(f"{Fore.GREEN}✓ PASS{Style.RESET_ALL}")
    if details:
        print(f"  {Fore.WHITE}{details}{Style.RESET_ALL}")


def print_fail(error):
    """Imprime resultado fallido"""
    global tests_failed
    tests_failed += 1
    print(f"{Fore.RED}✗ FAIL{Style.RESET_ALL}")
    print(f"  {Fore.RED}Error: {error}{Style.RESET_ALL}")


def test_endpoint(method, endpoint, expected_status=200, data=None, description=""):
    """
    Función genérica para probar endpoints
    
    Args:
        method: GET, POST, PUT, DELETE
        endpoint: Ruta del endpoint (ej: /productos)
        expected_status: Código de estado HTTP esperado
        data: Datos para enviar (para POST/PUT)
        description: Descripción del test
    
    Returns:
        tuple: (success, response_data)
    """
    url = f"{API_BASE}{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url, timeout=TIMEOUT)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=TIMEOUT)
        elif method == "PUT":
            response = requests.put(url, json=data, timeout=TIMEOUT)
        elif method == "PATCH":
            response = requests.patch(url, json=data, timeout=TIMEOUT)
        elif method == "DELETE":
            response = requests.delete(url, timeout=TIMEOUT)
        else:
            raise ValueError(f"Método no soportado: {method}")
        
        if response.status_code == expected_status:
            try:
                return (True, response.json())
            except:
                return (True, None)
        else:
            return (False, f"Status {response.status_code}, esperado {expected_status}")
            
    except requests.exceptions.ConnectionError:
        return (False, "No se pudo conectar al servidor. ¿Está corriendo el backend?")
    except requests.exceptions.Timeout:
        return (False, "Timeout - el servidor tardó demasiado en responder")
    except Exception as e:
        return (False, str(e))


# ==============================================================================
# TESTS DE DASHBOARD Y MÉTRICAS
# ==============================================================================

def test_dashboard():
    """Tests del dashboard y métricas"""
    print_header("DASHBOARD Y MÉTRICAS")
    
    # Test 1: Métricas del mes
    print_test("Dashboard métricas (período: mes)")
    success, data = test_endpoint("GET", "/dashboard/metricas?periodo=mes")
    if success and data:
        ventas = data.get('ventas', {})
        if ventas.get('total', 0) > 0 and ventas.get('cantidad_ordenes', 0) > 0:
            print_pass(f"Total ventas: ${ventas['total']:,.0f}, Órdenes: {ventas['cantidad_ordenes']}")
        else:
            print_fail("Las métricas de ventas están en 0")
    else:
        print_fail(data if not success else "Sin datos")
    
    # Test 2: Métricas del día
    print_test("Dashboard métricas (período: hoy)")
    success, data = test_endpoint("GET", "/dashboard/metricas?periodo=hoy")
    if success and data:
        print_pass("Métricas del día obtenidas")
    else:
        print_fail(data if not success else "Sin datos")
    
    # Test 3: Métricas de la semana
    print_test("Dashboard métricas (período: semana)")
    success, data = test_endpoint("GET", "/dashboard/metricas?periodo=semana")
    if success and data:
        print_pass("Métricas de la semana obtenidas")
    else:
        print_fail(data if not success else "Sin datos")
    
    # Test 4: Top productos
    print_test("Verificar top productos")
    success, data = test_endpoint("GET", "/dashboard/metricas?periodo=mes")
    if success and data:
        top = data.get('top_productos', [])
        if len(top) > 0:
            print_pass(f"{len(top)} productos top identificados")
        else:
            print_fail("No hay productos top")
    else:
        print_fail(data if not success else "Sin datos")
    
    # Test 5: Ventas por categoría
    print_test("Verificar ventas por categoría")
    success, data = test_endpoint("GET", "/dashboard/metricas?periodo=mes")
    if success and data:
        categorias = data.get('ventas_por_categoria', [])
        if len(categorias) > 0:
            print_pass(f"{len(categorias)} categorías con ventas")
        else:
            print_fail("No hay categorías con ventas")
    else:
        print_fail(data if not success else "Sin datos")
    
    # Test 6: Órdenes por estado
    print_test("Verificar órdenes por estado")
    success, data = test_endpoint("GET", "/dashboard/metricas?periodo=mes")
    if success and data:
        estados = data.get('ordenes_por_estado', [])
        if len(estados) > 0:
            print_pass(f"{len(estados)} estados de órdenes")
        else:
            print_fail("No hay estados de órdenes")
    else:
        print_fail(data if not success else "Sin datos")


# ==============================================================================
# TESTS CRUD - PRODUCTOS
# ==============================================================================

def test_productos_crud():
    """Tests CRUD de productos"""
    print_header("PRODUCTOS - CRUD")
    
    # Test 1: Listar productos
    print_test("GET /productos - Listar todos")
    success, data = test_endpoint("GET", "/productos")
    if success and isinstance(data, list) and len(data) > 0:
        print_pass(f"{len(data)} productos encontrados")
        producto_id = data[0]['id']
    else:
        print_fail("No se pudieron obtener productos")
        return
    
    # Test 2: Obtener producto por ID
    print_test(f"GET /productos/{producto_id} - Obtener por ID")
    success, data = test_endpoint("GET", f"/productos/{producto_id}")
    if success and data and data.get('id') == producto_id:
        print_pass(f"Producto: {data.get('nombre')}")
    else:
        print_fail(data if not success else "Producto no encontrado")
    
    # Test 3: Crear producto nuevo
    print_test("POST /productos - Crear nuevo")
    nuevo_producto = {
        "sku": f"TEST-{test_run_id}",  # SKU único por ejecución
        "nombre": "Producto de Prueba",
        "descripcion": "Producto creado por test automatizado",
        "precio": 99999.99,
        "material": "Material de prueba",
        "id_categoria": 11,  # Usar categoría válida (Sofás)
        "alto_cm": 100,
        "ancho_cm": 50,
        "profundidad_cm": 30
    }
    success, data = test_endpoint("POST", "/productos", data=nuevo_producto, expected_status=201)
    if success and data:
        producto_test_id = data.get('producto', {}).get('id') or data.get('id')
        print_pass(f"Producto creado con ID: {producto_test_id}")
    else:
        print_fail(data if not success else "No se pudo crear")
        return
    
    # Test 4: Actualizar producto
    print_test(f"PUT /productos/{producto_test_id} - Actualizar")
    actualizar = {
        "nombre": "Producto Actualizado",
        "precio": 88888.88
    }
    success, data = test_endpoint("PUT", f"/productos/{producto_test_id}", data=actualizar)
    if success and data:
        producto_actualizado = data.get('producto', {}).get('nombre') or data.get('nombre')
        print_pass(f"Producto actualizado: {producto_actualizado}")
    else:
        print_fail(data if not success else "No se pudo actualizar")
    
    # Test 5: Eliminar producto
    print_test(f"DELETE /productos/{producto_test_id} - Eliminar")
    success, data = test_endpoint("DELETE", f"/productos/{producto_test_id}")
    if success:
        print_pass("Producto eliminado correctamente")
    else:
        print_fail(data if not success else "No se pudo eliminar")


# ==============================================================================
# TESTS CRUD - CLIENTES
# ==============================================================================

def test_clientes_crud():
    """Tests CRUD de clientes"""
    print_header("CLIENTES - CRUD")
    
    # Test 1: Listar clientes
    print_test("GET /clientes - Listar todos")
    success, data = test_endpoint("GET", "/clientes")
    if success and isinstance(data, list) and len(data) > 0:
        print_pass(f"{len(data)} clientes encontrados")
        cliente_id = data[0]['id']
    else:
        print_fail("No se pudieron obtener clientes")
        return
    
    # Test 2: Obtener cliente por ID
    print_test(f"GET /clientes/{cliente_id} - Obtener por ID")
    success, data = test_endpoint("GET", f"/clientes/{cliente_id}")
    if success and data and data.get('id') == cliente_id:
        print_pass(f"Cliente: {data.get('nombre')} {data.get('apellido')}")
    else:
        print_fail(data if not success else "Cliente no encontrado")
    
    # Test 3: Crear cliente nuevo
    print_test("POST /clientes - Crear nuevo")
    nuevo_cliente = {
        "nombre_cliente": "Test",
        "apellido_cliente": "Automatizado",
        "dni_cuit": f"99-{test_run_id}-9",  # DNI único por ejecución
        "email_cliente": f"test{test_run_id}@test.com",  # Email único por ejecución
        "telefono": "11-9999-9999",
        "direccion_cliente": "Calle Test 123",
        "ciudad_cliente": "Ciudad Test",
        "codigo_postal": "9999",
        "provincia_cliente": "Buenos Aires"
    }
    success, data = test_endpoint("POST", "/clientes", data=nuevo_cliente, expected_status=201)
    if success and data:
        cliente_test_id = data.get('cliente', {}).get('id') or data.get('id')
        print_pass(f"Cliente creado con ID: {cliente_test_id}")
    else:
        print_fail(data if not success else "No se pudo crear")
        return
    
    # Test 4: Actualizar cliente
    print_test(f"PUT /clientes/{cliente_test_id} - Actualizar")
    actualizar = {
        "telefono": "11-8888-8888",
        "ciudad_cliente": "Ciudad Actualizada"
    }
    success, data = test_endpoint("PUT", f"/clientes/{cliente_test_id}", data=actualizar)
    if success and data:
        cliente_actualizado = data.get('cliente', {}) or data
        print_pass(f"Cliente actualizado: {cliente_actualizado.get('ciudad', 'OK')}")
    else:
        print_fail(data if not success else "No se pudo actualizar")
    
    # Test 5: Eliminar cliente
    print_test(f"DELETE /clientes/{cliente_test_id} - Eliminar")
    success, data = test_endpoint("DELETE", f"/clientes/{cliente_test_id}")
    if success:
        print_pass("Cliente eliminado correctamente")
    else:
        print_fail(data if not success else "No se pudo eliminar")


# ==============================================================================
# TESTS CRUD - ÓRDENES
# ==============================================================================

def test_ordenes_crud():
    """Tests CRUD de órdenes"""
    print_header("ÓRDENES - CRUD")
    
    # Test 1: Listar órdenes
    print_test("GET /ordenes - Listar todas")
    success, data = test_endpoint("GET", "/ordenes")
    if success and isinstance(data, list) and len(data) > 0:
        print_pass(f"{len(data)} órdenes encontradas")
        orden_id = data[0]['id']
    else:
        print_fail("No se pudieron obtener órdenes")
        return
    
    # Test 2: Obtener orden por ID
    print_test(f"GET /ordenes/{orden_id} - Obtener por ID")
    success, data = test_endpoint("GET", f"/ordenes/{orden_id}")
    if success and data and data.get('id') == orden_id:
        detalles = data.get('detalles', [])
        print_pass(f"Orden con {len(detalles)} productos, Total: ${data.get('total', 0):,.0f}")
    else:
        print_fail(data if not success else "Orden no encontrada")
    
    # Test 3: Crear orden nueva
    print_test("POST /ordenes - Crear nueva")
    nueva_orden = {
        "id_cliente": 11,      # Cliente válido del seed
        "id_vendedor": 9,      # Usuario vendedor válido del seed
        "items": [             # Campo correcto: "items" no "productos"
            {"id_producto": 31, "cantidad": 1},  # Producto válido del seed
            {"id_producto": 32, "cantidad": 1}   # Producto válido del seed
        ]
    }
    success, data = test_endpoint("POST", "/ordenes", data=nueva_orden, expected_status=201)
    if success and data:
        orden_test_id = data.get('orden', {}).get('id') or data.get('id')
        monto = data.get('monto_total', 0)
        print_pass(f"Orden creada con ID: {orden_test_id}, Monto: ${monto:,.0f}")
    else:
        print_fail(data if not success else "No se pudo crear")
        return
    
    # Test 4: Actualizar estado de orden
    print_test(f"PATCH /ordenes/{orden_test_id}/estado - Actualizar estado")
    actualizar_estado = {"estado": "en_proceso"}
    success, data = test_endpoint("PATCH", f"/ordenes/{orden_test_id}/estado", data=actualizar_estado)
    if success and data:
        orden_actualizada = data.get('orden', {}) or data
        estado = orden_actualizada.get('estado', 'unknown')
        print_pass(f"Estado actualizado a: {estado}")
    else:
        print_fail(data if not success else "No se pudo actualizar estado")
    
    # Test 5: Eliminar orden
    print_test(f"DELETE /ordenes/{orden_test_id} - Eliminar")
    success, data = test_endpoint("DELETE", f"/ordenes/{orden_test_id}")
    if success:
        print_pass("Orden eliminada correctamente")
    else:
        print_fail(data if not success else "No se pudo eliminar")


# ==============================================================================
# TESTS CRUD - INVENTARIO
# ==============================================================================

def test_inventario():
    """Tests de inventario"""
    print_header("INVENTARIO")
    
    # Test 1: Listar inventario
    print_test("GET /inventario - Listar todo")
    success, data = test_endpoint("GET", "/inventario")
    if success and isinstance(data, list) and len(data) > 0:
        print_pass(f"{len(data)} productos en inventario")
    else:
        print_fail("No se pudo obtener inventario")
    
    # Test 2: Alertas de stock
    print_test("GET /inventario/alertas - Productos bajo stock")
    success, data = test_endpoint("GET", "/inventario/alertas")
    if success and data:
        bajo_stock = data.get('bajo_stock', [])
        sin_stock = data.get('sin_stock', [])
        print_pass(f"Bajo stock: {len(bajo_stock)}, Sin stock: {len(sin_stock)}")
    else:
        print_fail(data if not success else "No se pudieron obtener alertas")


# ==============================================================================
# TESTS CRUD - CATEGORÍAS
# ==============================================================================

def test_categorias_crud():
    """Tests CRUD de categorías"""
    print_header("CATEGORÍAS - CRUD")
    
    # Test 1: Listar categorías
    print_test("GET /categorias - Listar todas")
    success, data = test_endpoint("GET", "/categorias")
    if success and isinstance(data, list) and len(data) > 0:
        print_pass(f"{len(data)} categorías encontradas")
    else:
        print_fail("No se pudieron obtener categorías")


# ==============================================================================
# TESTS CRUD - USUARIOS
# ==============================================================================

def test_usuarios_crud():
    """Tests CRUD de usuarios"""
    print_header("USUARIOS - CRUD")
    
    # Test 1: Listar usuarios
    print_test("GET /usuarios - Listar todos")
    success, data = test_endpoint("GET", "/usuarios")
    if success and isinstance(data, list) and len(data) > 0:
        print_pass(f"{len(data)} usuarios encontrados")
    else:
        print_fail("No se pudieron obtener usuarios")


# ==============================================================================
# TESTS DE AUTENTICACIÓN
# ==============================================================================

def test_autenticacion():
    """Tests de autenticación"""
    print_header("AUTENTICACIÓN")
    
    # Test 1: Login exitoso
    print_test("POST /auth/login - Login correcto")
    credenciales = {
        "email": "admin@muebleria.com",
        "password": "admin123"
    }
    success, data = test_endpoint("POST", "/auth/login", data=credenciales)
    if success and data and data.get('token'):
        print_pass(f"Login exitoso, token: {data.get('token')[:20]}...")
    else:
        print_fail(data if not success else "Login falló")
    
    # Test 2: Login fallido
    print_test("POST /auth/login - Login incorrecto")
    credenciales_malas = {
        "email": "noexiste@test.com",
        "password": "wrongpassword"
    }
    success, data = test_endpoint("POST", "/auth/login", data=credenciales_malas, expected_status=401)
    if success:
        print_pass("Login rechazado correctamente")
    else:
        print_fail("Debería rechazar credenciales incorrectas")


# ==============================================================================
# EJECUCIÓN PRINCIPAL
# ==============================================================================

def main():
    """Ejecutar todos los tests"""
    print_header("TEST SUITE COMPLETO - MUEBLERIA IRIS ERP")
    print(f"{Fore.WHITE}Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Style.RESET_ALL}")
    print(f"{Fore.WHITE}API Base: {API_BASE}{Style.RESET_ALL}")
    
    # Verificar conectividad
    print(f"\n{Fore.YELLOW}Verificando conectividad con el servidor...{Style.RESET_ALL}")
    try:
        response = requests.get(f"{API_BASE.replace('/api', '')}/", timeout=5)
        print(f"{Fore.GREEN}✓ Servidor accesible{Style.RESET_ALL}\n")
    except:
        print(f"{Fore.RED}✗ ERROR: No se puede conectar al servidor en {API_BASE}")
        print(f"{Fore.RED}Asegúrate de que el backend esté corriendo: python3 backend/run.py{Style.RESET_ALL}")
        sys.exit(1)
    
    # Ejecutar suites de tests
    test_dashboard()
    test_productos_crud()
    test_clientes_crud()
    test_ordenes_crud()
    test_inventario()
    test_categorias_crud()
    test_usuarios_crud()
    test_autenticacion()
    
    # Resumen final
    print_header("RESUMEN DE RESULTADOS")
    print(f"Total de tests ejecutados: {tests_total}")
    print(f"{Fore.GREEN}Tests exitosos: {tests_passed} ({tests_passed/tests_total*100:.1f}%){Style.RESET_ALL}")
    print(f"{Fore.RED}Tests fallidos: {tests_failed} ({tests_failed/tests_total*100:.1f}%){Style.RESET_ALL}")
    
    if tests_failed == 0:
        print(f"\n{Fore.GREEN}{'🎉 TODOS LOS TESTS PASARON 🎉'.center(80)}{Style.RESET_ALL}\n")
        sys.exit(0)
    else:
        print(f"\n{Fore.RED}{'⚠️  ALGUNOS TESTS FALLARON ⚠️'.center(80)}{Style.RESET_ALL}\n")
        sys.exit(1)


if __name__ == "__main__":
    main()
