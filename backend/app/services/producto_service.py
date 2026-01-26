"""
ProductoService - Servicio de negocio para productos

Encapsula la lógica de negocio relacionada con productos, separándola de los routes.
Esto permite:
- Testear la lógica de negocio de forma aislada
- Reutilizar lógica entre diferentes endpoints
- Mantener routes más limpios y enfocados en HTTP
"""
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.exc import IntegrityError

from .. import db
from ..models import Producto, Categoria, ImagenProducto, Inventario
from ..utils.validators import validate_required_fields, validate_sku, validate_positive_number


class ProductoServiceError(Exception):
    """Excepción base para errores del servicio de productos"""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class ProductoService:
    """
    Servicio para operaciones CRUD y lógica de negocio de productos.
    
    Uso en routes:
        from ..services.producto_service import ProductoService, ProductoServiceError
        
        @catalogo_bp.route('/productos', methods=['POST'])
        def create_producto():
            try:
                producto = ProductoService.crear_producto(request.get_json())
                return success_response("Producto creado", {"producto": producto})
            except ProductoServiceError as e:
                return error_response(e.message, status_code=e.status_code)
    """

    @staticmethod
    def listar_productos(
        categoria_id: Optional[int] = None,
        activo: Optional[bool] = None
    ) -> List[Dict[str, Any]]:
        """
        Obtener lista de productos con filtros opcionales.
        
        Args:
            categoria_id: Filtrar por categoría
            activo: Filtrar por estado activo/inactivo
            
        Returns:
            Lista de diccionarios con datos de productos
        """
        query = Producto.query
        
        if categoria_id is not None:
            query = query.filter_by(id_categoria=categoria_id)
        
        if activo is not None:
            query = query.filter_by(activo=activo)
        
        productos = query.all()
        return [p.to_dict() for p in productos]

    @staticmethod
    def obtener_producto(producto_id: int) -> Dict[str, Any]:
        """
        Obtener un producto por su ID.
        
        Args:
            producto_id: ID del producto
            
        Returns:
            Diccionario con datos del producto
            
        Raises:
            ProductoServiceError: Si el producto no existe
        """
        producto = Producto.query.get(producto_id)
        if not producto:
            raise ProductoServiceError("Producto no encontrado", status_code=404)
        return producto.to_dict()

    @staticmethod
    def crear_producto(data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Crear un nuevo producto.
        
        Args:
            data: Diccionario con datos del producto:
                - sku (str, requerido): Código único del producto
                - nombre (str, requerido): Nombre del producto
                - precio (float, requerido): Precio del producto
                - id_categoria (int, requerido): ID de la categoría
                - material (str, requerido): Material del producto
                - descripcion (str, opcional): Descripción
                - alto_cm, ancho_cm, profundidad_cm (float, opcional): Dimensiones
                
        Returns:
            Diccionario con datos del producto creado
            
        Raises:
            ProductoServiceError: Si hay errores de validación o el SKU ya existe
        """
        # Validar campos requeridos
        campos_requeridos = ["sku", "nombre", "precio", "id_categoria", "material"]
        is_valid, error_msg = validate_required_fields(data, campos_requeridos)
        if not is_valid:
            raise ProductoServiceError(error_msg)
        
        # Validar SKU
        is_valid, error_msg = validate_sku(data["sku"])
        if not is_valid:
            raise ProductoServiceError(error_msg)
        
        # Validar precio positivo
        is_valid, error_msg = validate_positive_number(data["precio"], "precio")
        if not is_valid:
            raise ProductoServiceError(error_msg)
        
        # Verificar que la categoría existe
        categoria = Categoria.query.get(data["id_categoria"])
        if not categoria:
            raise ProductoServiceError("Categoría no encontrada", status_code=404)
        
        # Verificar SKU único
        if Producto.query.filter_by(sku=data["sku"].strip()).first():
            raise ProductoServiceError("El SKU ya existe", status_code=409)
        
        # Crear producto
        nuevo_producto = Producto(
            sku=data["sku"].strip(),
            nombre=data["nombre"].strip(),
            descripcion=data.get("descripcion", "").strip() or None,
            precio=data["precio"],
            id_categoria=data["id_categoria"],
            alto_cm=data.get("alto_cm"),
            ancho_cm=data.get("ancho_cm"),
            profundidad_cm=data.get("profundidad_cm"),
            material=data["material"].strip()
        )
        
        try:
            db.session.add(nuevo_producto)
            db.session.commit()
            return nuevo_producto.to_dict()
        except IntegrityError as e:
            db.session.rollback()
            raise ProductoServiceError(f"Error de integridad: {str(e)}", status_code=409)
        except Exception as e:
            db.session.rollback()
            raise ProductoServiceError(f"Error al crear producto: {str(e)}", status_code=500)

    @staticmethod
    def actualizar_producto(producto_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Actualizar un producto existente.
        
        Args:
            producto_id: ID del producto a actualizar
            data: Diccionario con campos a actualizar
            
        Returns:
            Diccionario con datos del producto actualizado
            
        Raises:
            ProductoServiceError: Si el producto no existe o hay errores de validación
        """
        producto = Producto.query.get(producto_id)
        if not producto:
            raise ProductoServiceError("Producto no encontrado", status_code=404)
        
        # Validar precio si se proporciona
        if "precio" in data:
            is_valid, error_msg = validate_positive_number(data["precio"], "precio")
            if not is_valid:
                raise ProductoServiceError(error_msg)
        
        # Validar categoría si se proporciona
        if "id_categoria" in data:
            categoria = Categoria.query.get(data["id_categoria"])
            if not categoria:
                raise ProductoServiceError("Categoría no encontrada", status_code=404)
        
        # Actualizar campos permitidos
        campos_actualizables = [
            "nombre", "descripcion", "precio", "id_categoria",
            "alto_cm", "ancho_cm", "profundidad_cm", "material"
        ]
        
        for campo in campos_actualizables:
            if campo in data:
                valor = data[campo]
                if isinstance(valor, str):
                    valor = valor.strip()
                setattr(producto, campo, valor)
        
        try:
            db.session.commit()
            return producto.to_dict()
        except Exception as e:
            db.session.rollback()
            raise ProductoServiceError(f"Error al actualizar producto: {str(e)}", status_code=500)

    @staticmethod
    def desactivar_producto(producto_id: int) -> Tuple[Dict[str, Any], int]:
        """
        Desactivar un producto (soft delete).
        No elimina físicamente, solo marca como inactivo.
        
        Args:
            producto_id: ID del producto a desactivar
            
        Returns:
            Tupla con (datos del producto, cantidad de órdenes asociadas)
            
        Raises:
            ProductoServiceError: Si el producto no existe o ya está inactivo
        """
        producto = Producto.query.get(producto_id)
        if not producto:
            raise ProductoServiceError("Producto no encontrado", status_code=404)
        
        if not producto.activo:
            raise ProductoServiceError("El producto ya está desactivado")
        
        try:
            producto.activo = False
            
            # Poner stock en 0 si tiene inventario
            if producto.inventario:
                producto.inventario.cantidad_stock = 0
            
            db.session.commit()
            
            ordenes_asociadas = len(producto.detalles_orden) if producto.detalles_orden else 0
            return producto.to_dict(), ordenes_asociadas
            
        except Exception as e:
            db.session.rollback()
            raise ProductoServiceError(f"Error al desactivar producto: {str(e)}", status_code=500)

    @staticmethod
    def obtener_imagenes(producto_id: int) -> List[Dict[str, Any]]:
        """
        Obtener todas las imágenes de un producto.
        
        Args:
            producto_id: ID del producto
            
        Returns:
            Lista de diccionarios con datos de imágenes
            
        Raises:
            ProductoServiceError: Si el producto no existe
        """
        producto = Producto.query.get(producto_id)
        if not producto:
            raise ProductoServiceError("Producto no encontrado", status_code=404)
        
        imagenes = ImagenProducto.query.filter_by(id_producto=producto_id).all()
        return [img.to_dict() for img in imagenes]

    @staticmethod
    def agregar_imagen(
        producto_id: int,
        url_imagen: str,
        descripcion: Optional[str] = None,
        imagen_principal: bool = False
    ) -> Dict[str, Any]:
        """
        Agregar una imagen a un producto.
        
        Args:
            producto_id: ID del producto
            url_imagen: URL de la imagen
            descripcion: Descripción opcional
            imagen_principal: Si es la imagen principal
            
        Returns:
            Diccionario con datos de la imagen creada
            
        Raises:
            ProductoServiceError: Si el producto no existe
        """
        producto = Producto.query.get(producto_id)
        if not producto:
            raise ProductoServiceError("Producto no encontrado", status_code=404)
        
        # Si se marca como principal, quitar marca de otras
        if imagen_principal:
            ImagenProducto.query.filter_by(
                id_producto=producto_id,
                imagen_principal=True
            ).update({'imagen_principal': False})
        
        nueva_imagen = ImagenProducto(
            id_producto=producto_id,
            url_imagen=url_imagen.strip(),
            descripcion=descripcion.strip() if descripcion else None,
            imagen_principal=imagen_principal
        )
        
        try:
            db.session.add(nueva_imagen)
            db.session.commit()
            return nueva_imagen.to_dict()
        except Exception as e:
            db.session.rollback()
            raise ProductoServiceError(f"Error al agregar imagen: {str(e)}", status_code=500)


# Instancia singleton para uso directo (opcional)
producto_service = ProductoService()
