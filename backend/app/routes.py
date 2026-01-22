# Importa Blueprint para crear un grupo de rutas modulares
from flask import Blueprint, jsonify, request

# Importa la instancia de la base de datos SQLAlchemy
from . import db

# Importa todos los modelos de la base de datos para acceder a las tablas
from .models import (
    Producto,
    Categoria,
    ImagenProducto,
    Proveedor,
    Inventario,
    Cliente,
    Orden,
    DetalleOrden,
    Usuario,
    # Rol,  # CORREGIDO: Eliminado porque no se usa en este archivo
)

# MEJORA: Importa timezone para usar datetime con zona horaria (reemplaza datetime.utcnow deprecated)
from datetime import datetime, timezone

# Crea un Blueprint llamado 'main' que agrupa todas las rutas de la API
main = Blueprint("main", __name__)

# ==============================================================================
#                               CATÁLOGO (PRODUCTOS Y CATEGORÍAS)
# ==============================================================================


# --- CATEGORÍAS ---
# Endpoint GET para obtener todas las categorías de productos
@main.route("/api/categorias", methods=["GET"])
def get_categorias():
    """
    MEJORA: Docstring agregado para mejor documentación
    Retorna todas las categorías disponibles en el sistema.
    """
    try:
        # MEJORA: Manejo de errores agregado para robustez
        categorias = Categoria.query.all()
        return jsonify([c.to_dict() for c in categorias]), 200
    except Exception as e:
        # MEJORA: Log del error para debugging (considera usar logging)
        return jsonify({"error": "Error al obtener categorías", "detalle": str(e)}), 500


# Endpoint POST para crear una nueva categoría
@main.route("/api/categorias", methods=["POST"])
def create_categoria():
    """
    MEJORA: Docstring agregado
    Crea una nueva categoría de productos.
    Espera JSON: {"nombre": str, "descripcion": str (opcional)}
    """
    # MEJORA: Validación de datos de entrada agregada
    data = request.get_json()

    # CORRECCIÓN: Validar que se envíen los campos requeridos
    if not data or "nombre" not in data:
        return jsonify({"error": "El campo 'nombre' es requerido"}), 400

    # MEJORA: Validar que el nombre no esté vacío
    if not data["nombre"].strip():
        return jsonify({"error": "El nombre no puede estar vacío"}), 400

    # MEJORA: Verificar que no exista una categoría con el mismo nombre
    categoria_existente = Categoria.query.filter_by(nombre=data["nombre"]).first()
    if categoria_existente:
        return jsonify({"error": "Ya existe una categoría con ese nombre"}), 409

    nueva = Categoria(
        nombre=data["nombre"].strip(),  # MEJORA: Eliminar espacios en blanco
        descripcion=data.get("descripcion", "").strip()
        or None,  # MEJORA: Convertir string vacío a None
    )

    try:
        db.session.add(nueva)
        db.session.commit()
        return jsonify(
            {"mensaje": "Categoría creada exitosamente", "categoria": nueva.to_dict()}
        ), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al crear categoría", "detalle": str(e)}), 500


# --- PRODUCTOS ---
# Endpoint GET para obtener todos los productos del catálogo
@main.route("/api/productos", methods=["GET"])
def get_productos():
    """
    MEJORA: Docstring agregado
    Retorna todos los productos disponibles.
    MEJORA FUTURA: Agregar paginación para mejor rendimiento con muchos productos
    """
    try:
        # MEJORA: Agregar parámetros opcionales de filtrado
        categoria_id = request.args.get("categoria_id", type=int)

        query = Producto.query

        # MEJORA: Filtrar por categoría si se proporciona
        if categoria_id:
            query = query.filter_by(id_categoria=categoria_id)

        productos = query.all()
        return jsonify([p.to_dict() for p in productos]), 200
    except Exception as e:
        return jsonify({"error": "Error al obtener productos", "detalle": str(e)}), 500


# Endpoint GET para obtener los detalles de un producto específico por su ID
@main.route("/api/productos/<int:id>", methods=["GET"])
def get_producto_detalle(id):
    """
    MEJORA: Docstring agregado
    Retorna los detalles completos de un producto específico.
    """
    try:
        producto = Producto.query.get_or_404(id)
        return jsonify(producto.to_dict()), 200
    except Exception as e:
        return jsonify({"error": "Producto no encontrado", "detalle": str(e)}), 404


# Endpoint POST para crear un nuevo producto
@main.route("/api/productos", methods=["POST"])
def create_producto():
    """
    MEJORA: Docstring agregado
    Crea un nuevo producto en el catálogo.
    Campos requeridos: sku, nombre, precio, material, id_categoria
    """
    data = request.get_json()

    # MEJORA: Validación exhaustiva de campos requeridos
    campos_requeridos = ["sku", "nombre", "precio", "material", "id_categoria"]
    for campo in campos_requeridos:
        if campo not in data or not data[campo]:
            return jsonify({"error": f"El campo '{campo}' es requerido"}), 400

    # MEJORA: Validar que el precio sea positivo
    try:
        precio = float(data["precio"])
        if precio <= 0:
            return jsonify({"error": "El precio debe ser mayor a 0"}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "El precio debe ser un número válido"}), 400

    # MEJORA: Verificar que el SKU no exista
    producto_existente = Producto.query.filter_by(sku=data["sku"]).first()
    if producto_existente:
        return jsonify({"error": "Ya existe un producto con ese SKU"}), 409

    # MEJORA: Verificar que la categoría exista
    categoria = Categoria.query.get(data["id_categoria"])
    if not categoria:
        return jsonify({"error": "La categoría especificada no existe"}), 404

    nuevo = Producto(
        sku=data["sku"].strip(),
        nombre=data["nombre"].strip(),
        descripcion=data.get("descripcion", "").strip() or None,
        precio=precio,
        alto_cm=data.get("alto_cm"),
        ancho_cm=data.get("ancho_cm"),
        profundidad_cm=data.get("profundidad_cm"),
        material=data["material"].strip(),
        id_categoria=data["id_categoria"],
    )

    try:
        db.session.add(nuevo)
        db.session.commit()
        return jsonify(
            {"mensaje": "Producto creado exitosamente", "producto": nuevo.to_dict()}
        ), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al crear producto", "detalle": str(e)}), 500


# Endpoint PUT para actualizar un producto existente
@main.route("/api/productos/<int:id>", methods=["PUT"])
def update_producto(id):
    """
    MEJORA: Docstring agregado
    Actualiza los datos de un producto existente.
    """
    producto = Producto.query.get_or_404(id)
    data = request.get_json()

    # MEJORA: Validar que se envíe al menos un campo para actualizar
    if not data:
        return jsonify({"error": "No se proporcionaron datos para actualizar"}), 400

    # MEJORA: Validación de precio si se actualiza
    if "precio" in data:
        try:
            precio = float(data["precio"])
            if precio <= 0:
                return jsonify({"error": "El precio debe ser mayor a 0"}), 400
            data["precio"] = precio
        except (ValueError, TypeError):
            return jsonify({"error": "El precio debe ser un número válido"}), 400

    # Lista de campos que pueden ser actualizados
    campos = [
        "nombre",
        "descripcion",
        "precio",
        "material",
        "alto_cm",
        "ancho_cm",
        "profundidad_cm",
    ]

    # MEJORA: Variable para rastrear si se realizaron cambios
    cambios_realizados = False

    for campo in campos:
        if campo in data:
            # MEJORA: Validar que los strings no estén vacíos
            if isinstance(data[campo], str):
                valor = data[campo].strip()
                if not valor and campo in ["nombre", "material"]:  # Campos obligatorios
                    return jsonify(
                        {"error": f"El campo '{campo}' no puede estar vacío"}
                    ), 400
                setattr(producto, campo, valor or None)
            else:
                setattr(producto, campo, data[campo])
            cambios_realizados = True

    # MEJORA: Informar si no se realizaron cambios
    if not cambios_realizados:
        return jsonify(
            {"mensaje": "No se realizaron cambios", "producto": producto.to_dict()}
        ), 200

    try:
        db.session.commit()
        return jsonify(
            {
                "mensaje": "Producto actualizado exitosamente",
                "producto": producto.to_dict(),
            }
        ), 200
    except Exception as e:
        db.session.rollback()
        return jsonify(
            {"error": "Error al actualizar producto", "detalle": str(e)}
        ), 500


# Endpoint DELETE para eliminar un producto
@main.route("/api/productos/<int:id>", methods=["DELETE"])
def delete_producto(id):
    """
    MEJORA: Docstring agregado
    Elimina un producto del catálogo.
    NOTA: Considera implementar eliminación lógica en lugar de física.
    """
    producto = Producto.query.get_or_404(id)

    # MEJORA: Verificar si el producto tiene inventario o está en órdenes
    inventario = Inventario.query.filter_by(id_producto=id).first()
    if inventario and inventario.cantidad_stock > 0:
        return jsonify(
            {
                "error": "No se puede eliminar un producto con stock disponible",
                "sugerencia": "Primero reduzca el stock a 0",
            }
        ), 409

    # MEJORA: Verificar si el producto está en órdenes pendientes
    detalles_pendientes = (
        DetalleOrden.query.join(Orden)
        .filter(
            DetalleOrden.id_producto == id,
            Orden.estado.in_(["pendiente", "procesando"]),
        )
        .first()
    )

    if detalles_pendientes:
        return jsonify(
            {"error": "No se puede eliminar un producto con órdenes pendientes"}
        ), 409

    try:
        # MEJORA: Eliminar registros relacionados primero
        if inventario:
            db.session.delete(inventario)

        # Eliminar imágenes asociadas
        ImagenProducto.query.filter_by(id_producto=id).delete()

        db.session.delete(producto)
        db.session.commit()
        return jsonify({"mensaje": "Producto eliminado exitosamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al eliminar producto", "detalle": str(e)}), 500


# --- IMÁGENES DE PRODUCTOS ---
# Endpoint POST para agregar imágenes a un producto existente
@main.route("/api/productos/<int:id>/imagenes", methods=["POST"])
def add_imagen_producto(id):
    """
    MEJORA: Docstring agregado
    Agrega una imagen a un producto existente.
    """
    # MEJORA: Verificar que el producto exista antes de agregar imagen
    producto = Producto.query.get_or_404(id)

    data = request.get_json()

    # MEJORA: Validar que se proporcione la URL de la imagen
    if not data or "url_imagen" not in data or not data["url_imagen"].strip():
        return jsonify({"error": "El campo 'url_imagen' es requerido"}), 400

    # MEJORA: Si es imagen principal, desmarcar las demás
    if data.get("imagen_principal", False):
        ImagenProducto.query.filter_by(id_producto=id, imagen_principal=True).update(
            {"imagen_principal": False}
        )

    nueva_img = ImagenProducto(
        id_producto=id,
        url_imagen=data["url_imagen"].strip(),
        imagen_principal=data.get("imagen_principal", False),
    )

    try:
        db.session.add(nueva_img)
        db.session.commit()
        return jsonify(
            {"mensaje": "Imagen agregada exitosamente", "imagen": nueva_img.to_dict()}
        ), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al agregar imagen", "detalle": str(e)}), 500


# ==============================================================================
#                               LOGÍSTICA (INVENTARIO Y PROVEEDORES)
# ==============================================================================


# --- PROVEEDORES ---
# Endpoint GET para obtener todos los proveedores registrados
@main.route("/api/proveedores", methods=["GET"])
def get_proveedores():
    """
    MEJORA: Docstring agregado
    Retorna todos los proveedores registrados en el sistema.
    """
    try:
        proveedores = Proveedor.query.all()
        return jsonify([p.to_dict() for p in proveedores]), 200
    except Exception as e:
        return jsonify(
            {"error": "Error al obtener proveedores", "detalle": str(e)}
        ), 500


# Endpoint POST para crear un nuevo proveedor
@main.route("/api/proveedores", methods=["POST"])
def create_proveedor():
    """
    MEJORA: Docstring agregado
    Crea un nuevo proveedor en el sistema.
    Campo requerido: nombre_empresa
    """
    data = request.get_json()

    # MEJORA: Validar campo requerido
    if not data or "nombre_empresa" not in data or not data["nombre_empresa"].strip():
        return jsonify({"error": "El campo 'nombre_empresa' es requerido"}), 400

    # MEJORA: Verificar que no exista un proveedor con el mismo nombre
    proveedor_existente = Proveedor.query.filter_by(
        nombre_empresa=data["nombre_empresa"]
    ).first()
    if proveedor_existente:
        return jsonify({"error": "Ya existe un proveedor con ese nombre"}), 409

    nuevo = Proveedor(
        nombre_empresa=data["nombre_empresa"].strip(),
        contacto_nombre=data.get("contacto_nombre", "").strip() or None,
        telefono=data.get("telefono", "").strip() or None,
        email=data.get("email", "").strip() or None,
        direccion=data.get("direccion", "").strip() or None,
    )

    try:
        db.session.add(nuevo)
        db.session.commit()
        return jsonify(
            {"mensaje": "Proveedor creado exitosamente", "proveedor": nuevo.to_dict()}
        ), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al crear proveedor", "detalle": str(e)}), 500


# --- INVENTARIO (STOCK) ---
# Endpoint GET para obtener todos los registros de inventario
@main.route("/api/inventario", methods=["GET"])
def get_inventario():
    """
    MEJORA: Docstring agregado
    Retorna todo el inventario con datos del producto asociado.
    MEJORA: Incluye alertas de stock bajo
    """
    try:
        # MEJORA: Usar join para optimizar consulta
        items = (
            db.session.query(Inventario, Producto)
            .join(Producto, Inventario.id_producto == Producto.id_producto)
            .all()
        )

        resultado = []
        for inventario, producto in items:
            item_dict = inventario.to_dict()
            item_dict["nombre_producto"] = producto.nombre
            item_dict["sku"] = producto.sku
            # MEJORA: Agregar alerta de stock bajo
            item_dict["stock_bajo"] = (
                inventario.cantidad_stock <= inventario.stock_minimo
            )
            resultado.append(item_dict)

        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({"error": "Error al obtener inventario", "detalle": str(e)}), 500


# Endpoint POST para crear o actualizar stock de un producto
@main.route("/api/inventario", methods=["POST"])
def update_stock():
    """
    MEJORA: Docstring agregado
    Crea o actualiza el stock de un producto.
    Campos requeridos: id_producto, cantidad_stock
    """
    data = request.get_json()

    # MEJORA: Validar datos de entrada
    if not data or "id_producto" not in data or "cantidad_stock" not in data:
        return jsonify(
            {"error": "Los campos 'id_producto' y 'cantidad_stock' son requeridos"}
        ), 400

    id_producto = data["id_producto"]

    # MEJORA: Validar que el producto exista
    producto = Producto.query.get(id_producto)
    if not producto:
        return jsonify({"error": "El producto especificado no existe"}), 404

    # MEJORA: Validar que la cantidad sea un número válido y no negativo
    try:
        cantidad_stock = int(data["cantidad_stock"])
        if cantidad_stock < 0:
            return jsonify({"error": "La cantidad de stock no puede ser negativa"}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "La cantidad de stock debe ser un número entero"}), 400

    # Busca si ya existe inventario para ese producto
    item = Inventario.query.filter_by(id_producto=id_producto).first()

    try:
        if item:
            # Si existe, actualizamos la cantidad
            item.cantidad_stock = cantidad_stock
            item.ubicacion = data.get("ubicacion", item.ubicacion)
            # CORRECCIÓN: Usar timezone.utc en lugar de utcnow() deprecated
            item.utlima_actualizacion = datetime.now(timezone.utc)
            mensaje = "Stock actualizado exitosamente"
        else:
            # Si no existe, creamos el registro de inventario
            item = Inventario(
                id_producto=id_producto,
                cantidad_stock=cantidad_stock,
                ubicacion=data.get("ubicacion", "Depósito General"),
                stock_minimo=data.get("stock_minimo", 5),
            )
            db.session.add(item)
            mensaje = "Inventario inicializado exitosamente"

        db.session.commit()

        # MEJORA: Incluir alerta si el stock está bajo
        stock_dict = item.to_dict()
        stock_dict["alerta"] = item.cantidad_stock <= item.stock_minimo

        return jsonify({"mensaje": mensaje, "stock": stock_dict}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify(
            {"error": "Error al actualizar inventario", "detalle": str(e)}
        ), 500


# ==============================================================================
#                               COMERCIAL (CLIENTES Y VENTAS)
# ==============================================================================


# --- CLIENTES ---
# Endpoint GET para obtener todos los clientes registrados
@main.route("/api/clientes", methods=["GET"])
def get_clientes():
    """
    MEJORA: Docstring agregado
    Retorna todos los clientes registrados en el sistema.
    """
    try:
        clientes = Cliente.query.all()
        return jsonify([c.to_dict() for c in clientes]), 200
    except Exception as e:
        return jsonify({"error": "Error al obtener clientes", "detalle": str(e)}), 500


# Endpoint POST para crear un nuevo cliente
@main.route("/api/clientes", methods=["POST"])
def create_cliente():
    """
    MEJORA: Docstring agregado
    Registra un nuevo cliente en el sistema.
    Campos requeridos: nombre, apellido, dni_cuit, email, telefono, direccion, ciudad, codigo_postal, provincia
    """
    data = request.get_json()

    # MEJORA: Validar campos requeridos
    campos_requeridos = [
        "nombre",
        "apellido",
        "dni_cuit",
        "email",
        "telefono",
        "direccion",
        "ciudad",
        "codigo_postal",
        "provincia",
    ]

    for campo in campos_requeridos:
        if campo not in data or not str(data[campo]).strip():
            return jsonify({"error": f"El campo '{campo}' es requerido"}), 400

    # MEJORA: Verificar que no exista un cliente con el mismo DNI/CUIT
    cliente_existente = Cliente.query.filter_by(dni_cuit=data["dni_cuit"]).first()
    if cliente_existente:
        return jsonify({"error": "Ya existe un cliente con ese DNI/CUIT"}), 409

    # MEJORA: Verificar que no exista un cliente con el mismo email
    email_existente = Cliente.query.filter_by(email_cliente=data["email"]).first()
    if email_existente:
        return jsonify({"error": "Ya existe un cliente con ese email"}), 409

    nuevo = Cliente(
        nombre_cliente=data["nombre"].strip(),
        apellido_cliente=data["apellido"].strip(),
        dni_cuit=data["dni_cuit"].strip(),
        email_cliente=data["email"].strip().lower(),  # MEJORA: Email en minúsculas
        telefono=data["telefono"].strip(),
        direccion_cliente=data["direccion"].strip(),
        ciudad_cliente=data["ciudad"].strip(),
        codigo_postal=data["codigo_postal"].strip(),
        provincia_cliente=data["provincia"].strip(),
    )

    try:
        db.session.add(nuevo)
        db.session.commit()
        return jsonify(
            {"mensaje": "Cliente registrado exitosamente", "cliente": nuevo.to_dict()}
        ), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al registrar cliente", "detalle": str(e)}), 500


# --- ÓRDENES (VENTAS) - ¡LÓGICA IMPORTANTE! ---
# Endpoint POST para crear una nueva orden de venta
@main.route("/api/ordenes", methods=["POST"])
def create_orden():
    """
    MEJORA: Docstring agregado
    Crea una nueva orden de venta.
    Formato esperado:
    {
        "id_cliente": int,
        "id_usuario": int (opcional),
        "items": [{"id_producto": int, "cantidad": int}]
    }
    """
    data = request.get_json()

    # MEJORA: Validar datos de entrada
    if not data or "id_cliente" not in data or "items" not in data:
        return jsonify({"error": "Se requieren los campos 'id_cliente' e 'items'"}), 400

    if not isinstance(data["items"], list) or len(data["items"]) == 0:
        return jsonify({"error": "La orden debe contener al menos un producto"}), 400

    # MEJORA: Verificar que el cliente exista
    cliente = Cliente.query.get(data["id_cliente"])
    if not cliente:
        return jsonify({"error": "El cliente especificado no existe"}), 404

    # MEJORA: Verificar que el usuario exista (si se proporciona)
    if "id_usuario" in data and data["id_usuario"]:
        usuario = Usuario.query.get(data["id_usuario"])
        if not usuario:
            return jsonify({"error": "El usuario especificado no existe"}), 404

    try:
        # 1. Crear la cabecera de la orden (sin monto total aún)
        nueva_orden = Orden(
            id_cliente=data["id_cliente"],
            id_usuarios=data.get("id_usuario"),
            estado="pendiente",
            monto_total=0,
        )
        db.session.add(nueva_orden)
        # flush() genera el ID de la orden sin confirmar la transacción aún
        db.session.flush()

        # Variable para acumular el total de la orden
        total_calculado = 0
        # MEJORA: Lista para almacenar productos procesados
        productos_procesados = []

        # 2. Procesar los items del carrito
        for item in data["items"]:
            # MEJORA: Validar estructura del item
            if "id_producto" not in item or "cantidad" not in item:
                raise ValueError("Cada item debe tener 'id_producto' y 'cantidad'")

            # MEJORA: Validar que la cantidad sea positiva
            try:
                cantidad = int(item["cantidad"])
                if cantidad <= 0:
                    raise ValueError(f"La cantidad debe ser mayor a 0")
            except (ValueError, TypeError) as e:
                raise ValueError(
                    f"Cantidad inválida para producto {item.get('id_producto')}: {str(e)}"
                )

            # Busca el producto por su ID
            producto = Producto.query.get(item["id_producto"])
            if not producto:
                raise ValueError(f"Producto ID {item['id_producto']} no encontrado")

            # MEJORA: Verificar stock disponible
            inventario = Inventario.query.filter_by(
                id_producto=producto.id_producto
            ).first()
            if inventario and inventario.cantidad_stock < cantidad:
                raise ValueError(
                    f"Stock insuficiente para {producto.nombre}. "
                    f"Disponible: {inventario.cantidad_stock}, Solicitado: {cantidad}"
                )

            # Obtiene el precio actual del producto
            precio_actual = float(producto.precio)
            # Calcula el subtotal multiplicando precio por cantidad
            subtotal = precio_actual * cantidad
            total_calculado += subtotal

            # Crear un detalle de la orden para este producto
            nuevo_detalle = DetalleOrden(
                id_orden=nueva_orden.id_orden,
                id_producto=producto.id_producto,
                cantidad=cantidad,
                precio_unitario=producto.precio,
            )
            db.session.add(nuevo_detalle)

            # MEJORA: Descontar stock inmediatamente
            if inventario:
                inventario.cantidad_stock -= cantidad
                inventario.utlima_actualizacion = datetime.now(timezone.utc)

            # MEJORA: Registrar producto procesado para respuesta
            productos_procesados.append(
                {
                    "nombre": producto.nombre,
                    "cantidad": cantidad,
                    "precio_unitario": float(precio_actual),
                    "subtotal": float(subtotal),
                }
            )

        # 3. Actualizar el total de la orden
        nueva_orden.monto_total = total_calculado
        db.session.commit()

        # MEJORA: Respuesta más detallada
        return jsonify(
            {
                "mensaje": "Orden creada exitosamente",
                "id_orden": nueva_orden.id_orden,
                "cliente": cliente.nombre_cliente + " " + cliente.apellido_cliente,
                "total": float(total_calculado),
                "productos": productos_procesados,
                "estado": nueva_orden.estado,
            }
        ), 201

    except ValueError as ve:
        # MEJORA: Manejo específico de errores de validación
        db.session.rollback()
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al crear orden", "detalle": str(e)}), 500


# Endpoint GET para obtener todas las órdenes
@main.route("/api/ordenes", methods=["GET"])
def get_ordenes():
    """
    MEJORA: Docstring agregado
    Retorna todas las órdenes ordenadas por fecha (más recientes primero).
    MEJORA: Permite filtrar por estado
    """
    try:
        # MEJORA: Filtro opcional por estado
        estado = request.args.get("estado")

        query = Orden.query
        if estado:
            query = query.filter_by(estado=estado)

        ordenes = query.order_by(Orden.fecha_creacion.desc()).all()
        return jsonify([o.to_dict() for o in ordenes]), 200
    except Exception as e:
        return jsonify({"error": "Error al obtener órdenes", "detalle": str(e)}), 500


# Endpoint GET para obtener los detalles de una orden específica
@main.route("/api/ordenes/<int:id>", methods=["GET"])
def get_orden_detalle(id):
    """
    MEJORA: Docstring agregado
    Retorna los detalles completos de una orden específica, incluyendo los productos.
    """
    try:
        orden = Orden.query.get_or_404(id)

        # MEJORA: Incluir información enriquecida de los productos
        detalles_enriquecidos = []
        for detalle in orden.detalles:
            detalle_dict = detalle.to_dict()
            producto = Producto.query.get(detalle.id_producto)
            if producto:
                detalle_dict["nombre_producto"] = producto.nombre
                detalle_dict["sku"] = producto.sku
            detalles_enriquecidos.append(detalle_dict)

        respuesta = orden.to_dict()
        respuesta["items"] = detalles_enriquecidos

        # MEJORA: Incluir información del cliente
        if orden.cliente:
            respuesta["cliente_info"] = {
                "nombre": f"{orden.cliente.nombre_cliente} {orden.cliente.apellido_cliente}",
                "email": orden.cliente.email_cliente,
                "telefono": orden.cliente.telefono,
            }

        return jsonify(respuesta), 200
    except Exception as e:
        return jsonify({"error": "Orden no encontrada", "detalle": str(e)}), 404


# MEJORA: Endpoint adicional para actualizar el estado de una orden
@main.route("/api/ordenes/<int:id>/estado", methods=["PATCH"])
def update_orden_estado(id):
    """
    NUEVO ENDPOINT: Actualiza el estado de una orden.
    Estados válidos: pendiente, procesando, enviado, entregado, cancelado
    """
    orden = Orden.query.get_or_404(id)
    data = request.get_json()

    if not data or "estado" not in data:
        return jsonify({"error": "El campo 'estado' es requerido"}), 400

    # Validar estados permitidos
    estados_validos = ["pendiente", "procesando", "enviado", "entregado", "cancelado"]
    nuevo_estado = data["estado"].lower()

    if nuevo_estado not in estados_validos:
        return jsonify(
            {"error": f"Estado inválido. Estados válidos: {', '.join(estados_validos)}"}
        ), 400

    # MEJORA: Si se cancela la orden, devolver stock
    if nuevo_estado == "cancelado" and orden.estado != "cancelado":
        for detalle in orden.detalles:
            inventario = Inventario.query.filter_by(
                id_producto=detalle.id_producto
            ).first()
            if inventario:
                inventario.cantidad_stock += detalle.cantidad
                inventario.utlima_actualizacion = datetime.now(timezone.utc)

    try:
        orden.estado = nuevo_estado
        db.session.commit()
        return jsonify(
            {
                "mensaje": f"Estado actualizado a '{nuevo_estado}'",
                "orden": orden.to_dict(),
            }
        ), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al actualizar estado", "detalle": str(e)}), 500


# ==============================================================================
#                               ADMINISTRACIÓN (USUARIOS)
# ==============================================================================


# Endpoint GET para obtener todos los usuarios del sistema
@main.route("/api/usuarios", methods=["GET"])
def get_usuarios():
    """
    MEJORA: Docstring agregado
    Retorna todos los usuarios del sistema.
    NOTA: En producción, proteger este endpoint con autenticación/autorización
    """
    try:
        usuarios = Usuario.query.all()
        # MEJORA: No retornar contraseñas (asegúrate de que to_dict() no las incluya)
        return jsonify([u.to_dict() for u in usuarios]), 200
    except Exception as e:
        return jsonify({"error": "Error al obtener usuarios", "detalle": str(e)}), 500
