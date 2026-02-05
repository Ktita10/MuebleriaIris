"""
Blueprint de Catálogo - Productos, Categorías, Imágenes
Módulo ERP: Gestión del catálogo de productos

Refactorizado para usar:
- Services layer (ProductoService, CategoriaService)
- Respuestas HTTP estandarizadas
- Type hints completos
"""
from __future__ import annotations
import os
import uuid
from typing import TYPE_CHECKING

from flask import Blueprint, request, current_app, send_from_directory
from werkzeug.utils import secure_filename

from .. import db
from ..models import Producto, ImagenProducto
from ..services import ProductoService, ProductoServiceError, CategoriaService, CategoriaServiceError
from ..utils.responses import success_response, error_response, list_response

if TYPE_CHECKING:
    from flask import Response

catalogo_bp = Blueprint('catalogo', __name__, url_prefix='/api')


# ==============================================================================
#                              HELPER FUNCTIONS
# ==============================================================================

def get_allowed_extensions() -> set[str]:
    """Get allowed file extensions from config."""
    return current_app.config.get('ALLOWED_EXTENSIONS', {'png', 'jpg', 'jpeg', 'gif', 'webp'})


def allowed_file(filename: str | None) -> bool:
    """Check if the file extension is allowed."""
    if not filename:
        return False
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in get_allowed_extensions()


def get_upload_folder() -> str | None:
    """Get upload folder from config."""
    return current_app.config.get('UPLOAD_FOLDER')


def generate_unique_filename(original_filename: str, prefix: str = "") -> str:
    """Generate a unique filename preserving the extension."""
    if not original_filename:
        return f"{prefix}{uuid.uuid4().hex}.jpg"
    
    safe_filename = secure_filename(original_filename)
    extension = safe_filename.rsplit('.', 1)[1].lower() if '.' in safe_filename else 'jpg'
    
    if prefix:
        return f"{prefix}{uuid.uuid4().hex}.{extension}"
    return f"{uuid.uuid4().hex}.{extension}"


# ==============================================================================
#                                  CATEGORÍAS
# ==============================================================================

@catalogo_bp.route('/categorias', methods=['GET'])
def get_categorias() -> tuple[Response, int]:
    """
    Obtener todas las categorías.
    
    Query params:
        incluir_inactivas (bool): Si true, incluye categorías inactivas
    """
    try:
        incluir_inactivas = request.args.get('incluir_inactivas', 'false').lower() == 'true'
        categorias = CategoriaService.listar_categorias(incluir_inactivas=incluir_inactivas)
        return list_response(categorias)
    except Exception as e:
        return error_response("Error al obtener categorías", str(e), 500)


@catalogo_bp.route('/categorias', methods=['POST'])
def create_categoria() -> tuple[Response, int]:
    """
    Crear nueva categoría.
    
    Body: {"nombre": str, "descripcion": str}
    """
    try:
        data = request.get_json()
        if not data:
            return error_response("No se recibieron datos")
        
        categoria = CategoriaService.crear_categoria(data)
        return success_response("Categoría creada exitosamente", {"categoria": categoria}, 201)
    except CategoriaServiceError as e:
        return error_response(e.message, status_code=e.status_code)
    except Exception as e:
        return error_response("Error al crear categoría", str(e), 500)


@catalogo_bp.route('/categorias/<int:id>', methods=['GET'])
def get_categoria(id: int) -> tuple[Response, int]:
    """Obtener una categoría por ID."""
    try:
        categoria = CategoriaService.obtener_categoria(id)
        return list_response([categoria])[0], 200  # Return single item
    except CategoriaServiceError as e:
        return error_response(e.message, status_code=e.status_code)
    except Exception as e:
        return error_response("Error al obtener categoría", str(e), 500)


@catalogo_bp.route('/categorias/<int:id>', methods=['PUT'])
def update_categoria(id: int) -> tuple[Response, int]:
    """Actualizar categoría."""
    try:
        data = request.get_json()
        if not data:
            return error_response("No se recibieron datos")
        
        categoria = CategoriaService.actualizar_categoria(id, data)
        return success_response("Categoría actualizada exitosamente", {"categoria": categoria})
    except CategoriaServiceError as e:
        return error_response(e.message, status_code=e.status_code)
    except Exception as e:
        return error_response("Error al actualizar categoría", str(e), 500)


@catalogo_bp.route('/categorias/<int:id>', methods=['DELETE'])
def delete_categoria(id: int) -> tuple[Response, int]:
    """Desactivar categoría (soft delete)."""
    try:
        CategoriaService.desactivar_categoria(id)
        return success_response("Categoría desactivada exitosamente")
    except CategoriaServiceError as e:
        return error_response(e.message, status_code=e.status_code)
    except Exception as e:
        return error_response("Error al desactivar categoría", str(e), 500)


# ==============================================================================
#                                  PRODUCTOS
# ==============================================================================

@catalogo_bp.route('/productos', methods=['GET'])
def get_productos() -> tuple[Response, int]:
    """
    Obtener todos los productos (con filtros opcionales).
    
    Query params:
        categoria_id (int): Filtrar por categoría
        activo (bool): Filtrar por estado activo
    """
    try:
        categoria_id = request.args.get('categoria_id', type=int)
        activo_param = request.args.get('activo')
        activo = activo_param.lower() == 'true' if activo_param is not None else None
        
        productos = ProductoService.listar_productos(
            categoria_id=categoria_id,
            activo=activo
        )
        return list_response(productos)
    except Exception as e:
        return error_response("Error al obtener productos", str(e), 500)


@catalogo_bp.route('/productos', methods=['POST'])
def create_producto() -> tuple[Response, int]:
    """
    Crear nuevo producto.
    
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
            return error_response("No se recibieron datos")
        
        producto = ProductoService.crear_producto(data)
        return success_response("Producto creado exitosamente", {"producto": producto}, 201)
    except ProductoServiceError as e:
        return error_response(e.message, status_code=e.status_code)
    except Exception as e:
        return error_response("Error al crear producto", str(e), 500)


@catalogo_bp.route('/productos/<int:id>', methods=['GET'])
def get_producto(id: int) -> tuple[Response, int]:
    """Obtener un producto por ID."""
    try:
        producto = ProductoService.obtener_producto(id)
        return list_response([producto])[0], 200
    except ProductoServiceError as e:
        return error_response(e.message, status_code=e.status_code)
    except Exception as e:
        return error_response("Error al obtener producto", str(e), 500)


@catalogo_bp.route('/productos/<int:id>', methods=['PUT'])
def update_producto(id: int) -> tuple[Response, int]:
    """Actualizar producto."""
    try:
        data = request.get_json()
        if not data:
            return error_response("No se recibieron datos")
        
        producto = ProductoService.actualizar_producto(id, data)
        return success_response("Producto actualizado exitosamente", {"producto": producto})
    except ProductoServiceError as e:
        return error_response(e.message, status_code=e.status_code)
    except Exception as e:
        return error_response("Error al actualizar producto", str(e), 500)


@catalogo_bp.route('/productos/<int:id>', methods=['DELETE'])
def delete_producto(id: int) -> tuple[Response, int]:
    """Desactivar producto (soft delete)."""
    try:
        producto, ordenes_asociadas = ProductoService.desactivar_producto(id)
        response_data = {"producto": producto}
        if ordenes_asociadas > 0:
            response_data["nota"] = f"Este producto está en {ordenes_asociadas} orden(es) histórica(s)"
        return success_response("Producto desactivado exitosamente", response_data)
    except ProductoServiceError as e:
        return error_response(e.message, status_code=e.status_code)
    except Exception as e:
        return error_response("Error al desactivar producto", str(e), 500)


# ==============================================================================
#                            PAPELERA (PRODUCTOS ELIMINADOS)
# ==============================================================================

@catalogo_bp.route('/productos/papelera', methods=['GET'])
def get_productos_papelera() -> tuple[Response, int]:
    """Obtener todos los productos eliminados (soft-deleted)."""
    try:
        productos = Producto.query.filter_by(activo=False).order_by(
            Producto.fecha_creacion.desc()
        ).all()
        return list_response([p.to_dict() for p in productos])
    except Exception as e:
        return error_response("Error al obtener productos eliminados", str(e), 500)


@catalogo_bp.route('/productos/<int:id>/restaurar', methods=['POST'])
def restaurar_producto(id: int) -> tuple[Response, int]:
    """Restaurar un producto eliminado (volver a activo=True)."""
    try:
        producto = db.session.get(Producto, id)
        if not producto:
            return error_response("Producto no encontrado", status_code=404)
        
        if producto.activo:
            return error_response("El producto ya está activo")
        
        producto.activo = True
        db.session.commit()
        
        return success_response("Producto restaurado exitosamente", {"producto": producto.to_dict()})
    except Exception as e:
        db.session.rollback()
        return error_response("Error al restaurar producto", str(e), 500)


@catalogo_bp.route('/productos/<int:id>/eliminar-permanente', methods=['DELETE'])
def eliminar_producto_permanente(id: int) -> tuple[Response, int]:
    """
    Eliminar permanentemente un producto (hard delete).
    Solo permitido si está en papelera y no tiene órdenes asociadas.
    """
    try:
        producto = db.session.get(Producto, id)
        if not producto:
            return error_response("Producto no encontrado", status_code=404)
        
        if producto.activo:
            return error_response(
                "El producto debe estar en la papelera para eliminarlo permanentemente. "
                "Primero desactívelo."
            )
        
        # Verificar órdenes asociadas
        detalles = list(producto.detalles_orden) if producto.detalles_orden else []
        if detalles:
            return error_response(
                "No se puede eliminar permanentemente un producto con órdenes asociadas",
                details=f"Órdenes asociadas: {len(detalles)}",
                status_code=409
            )
        
        db.session.delete(producto)
        db.session.commit()
        
        return success_response("Producto eliminado permanentemente")
    except Exception as e:
        db.session.rollback()
        return error_response("Error al eliminar producto", str(e), 500)


# ==============================================================================
#                            IMÁGENES DE PRODUCTOS
# ==============================================================================

@catalogo_bp.route('/productos/<int:producto_id>/imagenes', methods=['GET'])
def get_imagenes_producto(producto_id: int) -> tuple[Response, int]:
    """Obtener todas las imágenes de un producto."""
    try:
        imagenes = ProductoService.obtener_imagenes(producto_id)
        return list_response(imagenes)
    except ProductoServiceError as e:
        return error_response(e.message, status_code=e.status_code)
    except Exception as e:
        return error_response("Error al obtener imágenes", str(e), 500)


@catalogo_bp.route('/productos/<int:producto_id>/imagenes', methods=['POST'])
def add_imagen_producto(producto_id: int) -> tuple[Response, int]:
    """
    Agregar imagen a un producto.
    
    Body: {"url_imagen": str, "descripcion": str}
    """
    try:
        data = request.get_json()
        if not data or "url_imagen" not in data:
            return error_response("El campo 'url_imagen' es requerido")
        
        imagen = ProductoService.agregar_imagen(
            producto_id=producto_id,
            url_imagen=data["url_imagen"],
            descripcion=data.get("descripcion"),
            imagen_principal=data.get("imagen_principal", False)
        )
        return success_response("Imagen agregada exitosamente", {"imagen": imagen}, 201)
    except ProductoServiceError as e:
        return error_response(e.message, status_code=e.status_code)
    except Exception as e:
        return error_response("Error al agregar imagen", str(e), 500)


@catalogo_bp.route('/imagenes/<int:id>', methods=['DELETE'])
def delete_imagen(id: int) -> tuple[Response, int]:
    """Eliminar imagen."""
    try:
        imagen = db.session.get(ImagenProducto, id)
        if not imagen:
            return error_response("Imagen no encontrada", status_code=404)
        
        # Eliminar archivo físico si es local
        if imagen.url_imagen and imagen.url_imagen.startswith('/api/uploads/'):
            filename = imagen.url_imagen.split('/')[-1]
            upload_folder = get_upload_folder()
            if upload_folder:
                file_path = os.path.join(upload_folder, filename)
                if os.path.exists(file_path):
                    os.remove(file_path)
        
        db.session.delete(imagen)
        db.session.commit()
        return success_response("Imagen eliminada exitosamente")
    except Exception as e:
        db.session.rollback()
        return error_response("Error al eliminar imagen", str(e), 500)


# ==============================================================================
#                              FILE UPLOAD
# ==============================================================================

@catalogo_bp.route('/upload', methods=['POST'])
def upload_file() -> tuple[Response, int]:
    """
    Upload an image file.
    Returns the URL to access the uploaded file.
    """
    if 'file' not in request.files:
        return error_response("No se encontró archivo en la solicitud")
    
    file = request.files['file']
    
    if not file.filename:
        return error_response("No se seleccionó ningún archivo")
    
    if not allowed_file(file.filename):
        return error_response(
            "Tipo de archivo no permitido. Use: png, jpg, jpeg, gif, webp"
        )
    
    upload_folder = get_upload_folder()
    if not upload_folder:
        return error_response("Carpeta de uploads no configurada", status_code=500)
    
    # Generate unique filename and save
    unique_filename = generate_unique_filename(file.filename)
    os.makedirs(upload_folder, exist_ok=True)
    file_path = os.path.join(upload_folder, unique_filename)
    
    try:
        file.save(file_path)
        url = f"/api/uploads/{unique_filename}"
        return success_response(
            "Archivo subido exitosamente",
            {"url": url, "filename": unique_filename},
            201
        )
    except Exception as e:
        return error_response("Error al guardar archivo", str(e), 500)


@catalogo_bp.route('/uploads/<filename>', methods=['GET'])
def serve_upload(filename: str) -> Response | tuple[Response, int]:
    """Serve uploaded files."""
    upload_folder = get_upload_folder()
    if not upload_folder:
        return error_response("Carpeta de uploads no configurada", status_code=500)
    
    return send_from_directory(upload_folder, filename)


@catalogo_bp.route('/productos/<int:producto_id>/imagen', methods=['POST'])
def upload_producto_imagen(producto_id: int) -> tuple[Response, int]:
    """
    Upload an image file directly for a product.
    Combines file upload with adding to database.
    """
    # Verify product exists
    producto = db.session.get(Producto, producto_id)
    if not producto:
        return error_response("Producto no encontrado", status_code=404)
    
    if 'file' not in request.files:
        return error_response("No se encontró archivo en la solicitud")
    
    file = request.files['file']
    
    if not file.filename:
        return error_response("No se seleccionó ningún archivo")
    
    if not allowed_file(file.filename):
        return error_response(
            "Tipo de archivo no permitido. Use: png, jpg, jpeg, gif, webp"
        )
    
    upload_folder = get_upload_folder()
    if not upload_folder:
        return error_response("Carpeta de uploads no configurada", status_code=500)
    
    # Generate unique filename with product prefix
    unique_filename = generate_unique_filename(file.filename, f"producto_{producto_id}_")
    os.makedirs(upload_folder, exist_ok=True)
    file_path = os.path.join(upload_folder, unique_filename)
    
    try:
        file.save(file_path)
        url = f"/api/uploads/{unique_filename}"
        
        # Check if this should be the main image
        is_principal = request.form.get('principal', 'false').lower() == 'true'
        
        # Add image using service
        imagen = ProductoService.agregar_imagen(
            producto_id=producto_id,
            url_imagen=url,
            descripcion=request.form.get('descripcion', ''),
            imagen_principal=is_principal
        )
        
        return success_response(
            "Imagen subida y asociada exitosamente",
            {"imagen": imagen, "url": url},
            201
        )
    except ProductoServiceError as e:
        # Clean up file if database operation failed
        if os.path.exists(file_path):
            os.remove(file_path)
        return error_response(e.message, status_code=e.status_code)
    except Exception as e:
        # Clean up file if save failed
        if os.path.exists(file_path):
            os.remove(file_path)
        db.session.rollback()
        return error_response("Error al guardar imagen", str(e), 500)
