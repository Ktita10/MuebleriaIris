"""
Blueprint de Catálogo - Productos, Categorías, Imágenes
Módulo ERP: Gestión del catálogo de productos
"""
import os
import uuid
from flask import Blueprint, jsonify, request, current_app, send_from_directory
from werkzeug.utils import secure_filename
from .. import db
from ..models import Producto, Categoria, ImagenProducto
from datetime import datetime, timezone

catalogo_bp = Blueprint('catalogo', __name__, url_prefix='/api')


def allowed_file(filename):
    """Check if the file extension is allowed"""
    ALLOWED_EXTENSIONS = current_app.config.get('ALLOWED_EXTENSIONS', {'png', 'jpg', 'jpeg', 'gif', 'webp'})
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# ==============================================================================
#                                  CATEGORÍAS
# ==============================================================================

@catalogo_bp.route('/categorias', methods=['GET'])
def get_categorias():
    """
    Obtener todas las categorías
    Query params: ?incluir_inactivas=true (para ver todas)
    """
    try:
        query = Categoria.query
        
        # Por defecto, solo mostrar categorías activas
        incluir_inactivas = request.args.get('incluir_inactivas', 'false').lower() == 'true'
        if not incluir_inactivas:
            query = query.filter_by(activa=True)
        
        categorias = query.all()
        return jsonify([c.to_dict() for c in categorias]), 200
    except Exception as e:
        return jsonify({"error": "Error al obtener categorías", "detalle": str(e)}), 500


@catalogo_bp.route('/categorias', methods=['POST'])
def create_categoria():
    """
    Crear nueva categoría
    Body: {"nombre": str, "descripcion": str}
    """
    data = request.get_json()

    if not data or "nombre" not in data:
        return jsonify({"error": "El campo 'nombre' es requerido"}), 400

    if not data["nombre"].strip():
        return jsonify({"error": "El nombre no puede estar vacío"}), 400

    categoria_existente = Categoria.query.filter_by(nombre=data["nombre"]).first()
    if categoria_existente:
        return jsonify({"error": "Ya existe una categoría con ese nombre"}), 409

    nueva = Categoria(
        nombre=data["nombre"].strip(),
        descripcion=data.get("descripcion", "").strip() or None,
    )

    try:
        db.session.add(nueva)
        db.session.commit()
        return jsonify({
            "mensaje": "Categoría creada exitosamente",
            "categoria": nueva.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al crear categoría", "detalle": str(e)}), 500


@catalogo_bp.route('/categorias/<int:id>', methods=['GET'])
def get_categoria(id):
    """Obtener una categoría por ID"""
    categoria = Categoria.query.get(id)
    if not categoria:
        return jsonify({"error": "Categoría no encontrada"}), 404
    
    return jsonify(categoria.to_dict()), 200


@catalogo_bp.route('/categorias/<int:id>', methods=['PUT'])
def update_categoria(id):
    """Actualizar categoría"""
    categoria = Categoria.query.get(id)
    if not categoria:
        return jsonify({"error": "Categoría no encontrada"}), 404

    data = request.get_json()
    
    if "nombre" in data:
        if not data["nombre"].strip():
            return jsonify({"error": "El nombre no puede estar vacío"}), 400
        categoria.nombre = data["nombre"].strip()
    
    if "descripcion" in data:
        categoria.descripcion = data["descripcion"].strip() or None

    try:
        db.session.commit()
        return jsonify({
            "mensaje": "Categoría actualizada exitosamente",
            "categoria": categoria.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al actualizar categoría", "detalle": str(e)}), 500


@catalogo_bp.route('/categorias/<int:id>', methods=['DELETE'])
def delete_categoria(id):
    """Desactivar categoría (soft delete)"""
    categoria = Categoria.query.get(id)
    if not categoria:
        return jsonify({"error": "Categoría no encontrada"}), 404

    try:
        categoria.activa = False
        db.session.commit()
        return jsonify({"mensaje": "Categoría desactivada exitosamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al desactivar categoría", "detalle": str(e)}), 500


# ==============================================================================
#                                  PRODUCTOS
# ==============================================================================

@catalogo_bp.route('/productos', methods=['GET'])
def get_productos():
    """
    Obtener todos los productos (con filtros opcionales)
    Query params: ?categoria_id=1&activo=true
    """
    try:
        query = Producto.query

        # Filtro por categoría
        categoria_id = request.args.get('categoria_id', type=int)
        if categoria_id:
            query = query.filter_by(id_categoria=categoria_id)

        # Filtro por estado activo
        activo = request.args.get('activo')
        if activo is not None:
            activo_bool = activo.lower() == 'true'
            query = query.filter_by(activo=activo_bool)

        productos = query.all()
        return jsonify([p.to_dict() for p in productos]), 200
    except Exception as e:
        return jsonify({"error": "Error al obtener productos", "detalle": str(e)}), 500


@catalogo_bp.route('/productos', methods=['POST'])
def create_producto():
    """
    Crear nuevo producto
    Body: {
        "sku": str (requerido, único),
        "nombre": str (requerido),
        "descripcion": str,
        "precio": float (requerido),
        "id_categoria": int (requerido),
        "alto_cm": float,
        "ancho_cm": float,
        "profundidad_cm": float,
        "material": str (requerido)
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No se recibieron datos"}), 400

        # Validación de campos requeridos
        campos_requeridos = ["sku", "nombre", "precio", "id_categoria", "material"]
        for campo in campos_requeridos:
            if campo not in data or data[campo] is None:
                return jsonify({"error": f"El campo '{campo}' es requerido"}), 400

        # Validar tipos de datos
        if not isinstance(data["sku"], str) or not data["sku"].strip():
            return jsonify({"error": "SKU debe ser un texto no vacío"}), 400
        if not isinstance(data["nombre"], str) or not data["nombre"].strip():
            return jsonify({"error": "Nombre debe ser un texto no vacío"}), 400
        if not isinstance(data["material"], str) or not data["material"].strip():
            return jsonify({"error": "Material debe ser un texto no vacío"}), 400
        
        try:
            precio = float(data["precio"])
            if precio <= 0:
                return jsonify({"error": "El precio debe ser mayor a 0"}), 400
        except (TypeError, ValueError):
            return jsonify({"error": "Precio debe ser un número válido"}), 400
        
        try:
            id_categoria = int(data["id_categoria"])
            if id_categoria <= 0:
                return jsonify({"error": "Debe seleccionar una categoría válida"}), 400
        except (TypeError, ValueError):
            return jsonify({"error": "ID de categoría debe ser un número válido"}), 400

        # Verificar SKU único
        if Producto.query.filter_by(sku=data["sku"].strip()).first():
            return jsonify({"error": "El SKU ya existe"}), 409

        # Verificar que la categoría existe y está activa
        categoria = db.session.get(Categoria, id_categoria)
        if not categoria:
            return jsonify({"error": "Categoría no encontrada"}), 404
        if not categoria.activa:
            return jsonify({"error": "La categoría seleccionada no está activa"}), 400

        # Procesar dimensiones opcionales
        alto_cm = None
        ancho_cm = None
        profundidad_cm = None
        
        if data.get("alto_cm") is not None and data.get("alto_cm") != 0:
            try:
                alto_cm = float(data["alto_cm"])
            except (TypeError, ValueError):
                pass
                
        if data.get("ancho_cm") is not None and data.get("ancho_cm") != 0:
            try:
                ancho_cm = float(data["ancho_cm"])
            except (TypeError, ValueError):
                pass
                
        if data.get("profundidad_cm") is not None and data.get("profundidad_cm") != 0:
            try:
                profundidad_cm = float(data["profundidad_cm"])
            except (TypeError, ValueError):
                pass

        nuevo_producto = Producto(
            sku=data["sku"].strip(),
            nombre=data["nombre"].strip(),
            descripcion=data.get("descripcion", "").strip() if data.get("descripcion") else None,
            precio=precio,
            id_categoria=id_categoria,
            alto_cm=alto_cm,
            ancho_cm=ancho_cm,
            profundidad_cm=profundidad_cm,
            material=data["material"].strip()
        )

        db.session.add(nuevo_producto)
        db.session.commit()
        return jsonify({
            "mensaje": "Producto creado exitosamente",
            "producto": nuevo_producto.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"Error al crear producto: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": "Error al crear producto", "detalle": str(e)}), 500


@catalogo_bp.route('/productos/<int:id>', methods=['GET'])
def get_producto(id):
    """Obtener un producto por ID"""
    producto = Producto.query.get(id)
    if not producto:
        return jsonify({"error": "Producto no encontrado"}), 404
    
    return jsonify(producto.to_dict()), 200


@catalogo_bp.route('/productos/<int:id>', methods=['PUT'])
def update_producto(id):
    """Actualizar producto"""
    producto = Producto.query.get(id)
    if not producto:
        return jsonify({"error": "Producto no encontrado"}), 404

    data = request.get_json()

    # Actualizar campos si están presentes
    campos_actualizables = ["nombre", "descripcion", "precio", "id_categoria", 
                           "alto_cm", "ancho_cm", "profundidad_cm", "material"]
    
    for campo in campos_actualizables:
        if campo in data:
            setattr(producto, campo, data[campo])

    try:
        db.session.commit()
        return jsonify({
            "mensaje": "Producto actualizado exitosamente",
            "producto": producto.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al actualizar producto", "detalle": str(e)}), 500


@catalogo_bp.route('/productos/<int:id>', methods=['DELETE'])
def delete_producto(id):
    """Desactivar producto (soft delete) - No elimina físicamente, solo marca como inactivo"""
    producto = Producto.query.get(id)
    if not producto:
        return jsonify({"error": "Producto no encontrado"}), 404

    # Verificar si ya está inactivo
    if not producto.activo:
        return jsonify({"error": "El producto ya está desactivado"}), 400

    try:
        # Soft delete: marcar como inactivo en lugar de eliminar
        producto.activo = False
        producto.fecha_actualizacion = datetime.utcnow()
        
        # Opcional: también desactivar el inventario
        if producto.inventario:
            producto.inventario.cantidad = 0  # Poner stock en 0
        
        db.session.commit()
        
        ordenes_asociadas = len(producto.detalles_orden) if producto.detalles_orden else 0
        return jsonify({
            "mensaje": "Producto desactivado exitosamente",
            "producto": producto.to_dict(),
            "nota": f"Este producto está en {ordenes_asociadas} orden(es) histórica(s)" if ordenes_asociadas > 0 else None
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al desactivar producto", "detalle": str(e)}), 500


# ==============================================================================
#                            PAPELERA (PRODUCTOS ELIMINADOS)
# ==============================================================================

@catalogo_bp.route('/productos/papelera', methods=['GET'])
def get_productos_papelera():
    """
    Obtener todos los productos eliminados (soft-deleted)
    Returns: Lista de productos con activo=False
    """
    try:
        productos = Producto.query.filter_by(activo=False).order_by(Producto.fecha_creacion.desc()).all()
        return jsonify([p.to_dict() for p in productos]), 200
    except Exception as e:
        return jsonify({"error": "Error al obtener productos eliminados", "detalle": str(e)}), 500


@catalogo_bp.route('/productos/<int:id>/restaurar', methods=['POST'])
def restaurar_producto(id):
    """
    Restaurar un producto eliminado (volver a activo=True)
    """
    try:
        producto = db.session.get(Producto, id)
        if not producto:
            return jsonify({"error": "Producto no encontrado"}), 404

        if producto.activo:
            return jsonify({"error": "El producto ya está activo"}), 400

        producto.activo = True
        db.session.commit()
        
        return jsonify({
            "mensaje": "Producto restaurado exitosamente",
            "producto": producto.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al restaurar producto", "detalle": str(e)}), 500


@catalogo_bp.route('/productos/<int:id>/eliminar-permanente', methods=['DELETE'])
def eliminar_producto_permanente(id):
    """
    Eliminar permanentemente un producto (hard delete)
    Solo permitido si el producto ya está en papelera (activo=False)
    y no tiene órdenes asociadas
    """
    try:
        producto = db.session.get(Producto, id)
        if not producto:
            return jsonify({"error": "Producto no encontrado"}), 404

        if producto.activo:
            return jsonify({"error": "El producto debe estar en la papelera para eliminarlo permanentemente. Primero desactívelo."}), 400

        # Verificar si tiene órdenes asociadas
        if producto.detalles_orden and len(producto.detalles_orden) > 0:
            return jsonify({
                "error": "No se puede eliminar permanentemente un producto con órdenes asociadas",
                "ordenes_asociadas": len(producto.detalles_orden)
            }), 409

        # Eliminar permanentemente
        db.session.delete(producto)
        db.session.commit()
        
        return jsonify({
            "mensaje": "Producto eliminado permanentemente"
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al eliminar producto", "detalle": str(e)}), 500


# ==============================================================================
#                            IMÁGENES DE PRODUCTOS
# ==============================================================================

@catalogo_bp.route('/productos/<int:producto_id>/imagenes', methods=['GET'])
def get_imagenes_producto(producto_id):
    """Obtener todas las imágenes de un producto"""
    producto = Producto.query.get(producto_id)
    if not producto:
        return jsonify({"error": "Producto no encontrado"}), 404

    imagenes = ImagenProducto.query.filter_by(id_producto=producto_id).all()
    return jsonify([img.to_dict() for img in imagenes]), 200


@catalogo_bp.route('/productos/<int:producto_id>/imagenes', methods=['POST'])
def add_imagen_producto(producto_id):
    """
    Agregar imagen a un producto
    Body: {"url_imagen": str, "descripcion": str}
    """
    producto = Producto.query.get(producto_id)
    if not producto:
        return jsonify({"error": "Producto no encontrado"}), 404

    data = request.get_json()
    if not data or "url_imagen" not in data:
        return jsonify({"error": "El campo 'url_imagen' es requerido"}), 400

    nueva_imagen = ImagenProducto(
        id_producto=producto_id,
        url_imagen=data["url_imagen"].strip(),
        descripcion=data.get("descripcion", "").strip() or None
    )

    try:
        db.session.add(nueva_imagen)
        db.session.commit()
        return jsonify({
            "mensaje": "Imagen agregada exitosamente",
            "imagen": nueva_imagen.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al agregar imagen", "detalle": str(e)}), 500


@catalogo_bp.route('/imagenes/<int:id>', methods=['DELETE'])
def delete_imagen(id):
    """Eliminar imagen"""
    imagen = ImagenProducto.query.get(id)
    if not imagen:
        return jsonify({"error": "Imagen no encontrada"}), 404

    try:
        # Also delete the file from disk if it's a local file
        if imagen.url_imagen and imagen.url_imagen.startswith('/api/uploads/'):
            filename = imagen.url_imagen.split('/')[-1]
            upload_folder = current_app.config.get('UPLOAD_FOLDER')
            if upload_folder:
                file_path = os.path.join(upload_folder, filename)
                if os.path.exists(file_path):
                    os.remove(file_path)
        
        db.session.delete(imagen)
        db.session.commit()
        return jsonify({"mensaje": "Imagen eliminada exitosamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al eliminar imagen", "detalle": str(e)}), 500


# ==============================================================================
#                              FILE UPLOAD
# ==============================================================================

@catalogo_bp.route('/upload', methods=['POST'])
def upload_file():
    """
    Upload an image file
    Returns the URL to access the uploaded file
    """
    if 'file' not in request.files:
        return jsonify({"error": "No se encontró archivo en la solicitud"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No se seleccionó ningún archivo"}), 400
    
    if not allowed_file(file.filename):
        return jsonify({"error": "Tipo de archivo no permitido. Use: png, jpg, jpeg, gif, webp"}), 400
    
    # Generate unique filename
    original_filename = secure_filename(file.filename)
    extension = original_filename.rsplit('.', 1)[1].lower() if '.' in original_filename else 'jpg'
    unique_filename = f"{uuid.uuid4().hex}.{extension}"
    
    upload_folder = current_app.config.get('UPLOAD_FOLDER')
    if not upload_folder:
        return jsonify({"error": "Carpeta de uploads no configurada"}), 500
    
    # Ensure upload folder exists
    os.makedirs(upload_folder, exist_ok=True)
    
    file_path = os.path.join(upload_folder, unique_filename)
    
    try:
        file.save(file_path)
        # Return the URL path to access the file
        url = f"/api/uploads/{unique_filename}"
        return jsonify({
            "mensaje": "Archivo subido exitosamente",
            "url": url,
            "filename": unique_filename
        }), 201
    except Exception as e:
        return jsonify({"error": "Error al guardar archivo", "detalle": str(e)}), 500


@catalogo_bp.route('/uploads/<filename>', methods=['GET'])
def serve_upload(filename):
    """Serve uploaded files"""
    upload_folder = current_app.config.get('UPLOAD_FOLDER')
    if not upload_folder:
        return jsonify({"error": "Carpeta de uploads no configurada"}), 500
    
    return send_from_directory(upload_folder, filename)


@catalogo_bp.route('/productos/<int:producto_id>/imagen', methods=['POST'])
def upload_producto_imagen(producto_id):
    """
    Upload an image file directly for a product
    Combines file upload with adding to database
    """
    producto = Producto.query.get(producto_id)
    if not producto:
        return jsonify({"error": "Producto no encontrado"}), 404
    
    if 'file' not in request.files:
        return jsonify({"error": "No se encontró archivo en la solicitud"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No se seleccionó ningún archivo"}), 400
    
    if not allowed_file(file.filename):
        return jsonify({"error": "Tipo de archivo no permitido. Use: png, jpg, jpeg, gif, webp"}), 400
    
    # Generate unique filename
    original_filename = secure_filename(file.filename)
    extension = original_filename.rsplit('.', 1)[1].lower() if '.' in original_filename else 'jpg'
    unique_filename = f"producto_{producto_id}_{uuid.uuid4().hex}.{extension}"
    
    upload_folder = current_app.config.get('UPLOAD_FOLDER')
    if not upload_folder:
        return jsonify({"error": "Carpeta de uploads no configurada"}), 500
    
    os.makedirs(upload_folder, exist_ok=True)
    file_path = os.path.join(upload_folder, unique_filename)
    
    try:
        file.save(file_path)
        url = f"/api/uploads/{unique_filename}"
        
        # Check if this should be the main image
        is_principal = request.form.get('principal', 'false').lower() == 'true'
        
        # If setting as principal, unset any existing principal image
        if is_principal:
            ImagenProducto.query.filter_by(
                id_producto=producto_id, 
                imagen_principal=True
            ).update({'imagen_principal': False})
        
        # Create database entry
        nueva_imagen = ImagenProducto(
            id_producto=producto_id,
            url_imagen=url,
            imagen_principal=is_principal,
            descripcion=request.form.get('descripcion', '')
        )
        
        db.session.add(nueva_imagen)
        db.session.commit()
        
        return jsonify({
            "mensaje": "Imagen subida y asociada exitosamente",
            "imagen": nueva_imagen.to_dict(),
            "url": url
        }), 201
    except Exception as e:
        db.session.rollback()
        # Clean up file if database operation failed
        if os.path.exists(file_path):
            os.remove(file_path)
        return jsonify({"error": "Error al guardar imagen", "detalle": str(e)}), 500
