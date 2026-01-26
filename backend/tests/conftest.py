import pytest
from flask_jwt_extended import create_access_token
from app import create_app, db
from app.models import Categoria, Producto, Cliente, Proveedor, Usuario, Rol, Inventario
from app.security import hash_password
from config import Config

# Crear una configuración específica para testing que herede de Config
class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    WTF_CSRF_ENABLED = False
    JWT_SECRET_KEY = 'test-secret-key'

@pytest.fixture
def app():
    # Pasar la configuración de test directamente a la fábrica
    app = create_app(config_class=TestConfig)

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def sample_rol(app):
    rol = Rol(nombre_rol="AdminTest", descripcion="Rol para testing")
    db.session.add(rol)
    db.session.commit()
    return rol

@pytest.fixture
def sample_usuario(app, sample_rol):
    usuario = Usuario(
        nombre_us="Test",
        apellido_us="User",
        email_us="test@muebleria.com",
        password_hash=hash_password("123456"),
        id_rol=sample_rol.id_rol,
        activo=True
    )
    db.session.add(usuario)
    db.session.commit()
    return usuario

@pytest.fixture
def sample_categoria(app):
    # Usamos un nombre genérico para evitar conflictos si el test intenta crear uno específico
    categoria = Categoria(nombre='Categoría Fixture', descripcion="Desc Test")
    db.session.add(categoria)
    db.session.commit()
    return categoria

@pytest.fixture
def sample_producto(app, sample_categoria):
    producto = Producto(
        sku='TEST-SKU-001',
        nombre='Producto Test',
        precio=1000.00,
        material='Madera',
        id_categoria=sample_categoria.id_categoria,
        activo=True
    )
    db.session.add(producto)
    db.session.commit()
    return producto

@pytest.fixture
def sample_inventario(app, sample_producto):
    inv = Inventario(
        id_producto=sample_producto.id_producto,
        cantidad_stock=50,
        ubicacion="Pasillo A",
        stock_minimo=5
    )
    db.session.add(inv)
    db.session.commit()
    return inv

@pytest.fixture
def sample_cliente(app):
    cliente = Cliente(
        nombre_cliente='Cliente',
        apellido_cliente='Test',
        dni_cuit='11111111',
        email_cliente='cliente@test.com',
        telefono='123456789',
        direccion_cliente='Calle Falsa 123',
        ciudad_cliente='Test City',
        codigo_postal='1000',
        provincia_cliente='Test Prov'
    )
    db.session.add(cliente)
    db.session.commit()
    return cliente

@pytest.fixture
def sample_proveedor(app):
    proveedor = Proveedor(
        nombre_empresa="Proveedor Test SA",
        contacto_nombre="Juan Vendedor",
        telefono="555-5555",
        email="prov@test.com",
        direccion="Fabrica 123",
        activo=True
    )
    db.session.add(proveedor)
    db.session.commit()
    return proveedor
