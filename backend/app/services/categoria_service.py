"""
CategoriaService - Servicio de negocio para categorías

Encapsula la lógica de negocio relacionada con categorías, separándola de los routes.
Sigue el mismo patrón que ProductoService para consistencia.
"""
from __future__ import annotations
from typing import Any

from .. import db
from ..models import Categoria
from ..utils.validators import validate_required_fields


class CategoriaServiceError(Exception):
    """Excepción base para errores del servicio de categorías"""
    
    def __init__(self, message: str, status_code: int = 400) -> None:
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class CategoriaService:
    """
    Servicio para operaciones CRUD y lógica de negocio de categorías.
    
    Uso en routes:
        from ..services.categoria_service import CategoriaService, CategoriaServiceError
        
        @catalogo_bp.route('/categorias', methods=['POST'])
        def create_categoria():
            try:
                categoria = CategoriaService.crear_categoria(request.get_json())
                return success_response("Categoría creada", {"categoria": categoria}, 201)
            except CategoriaServiceError as e:
                return error_response(e.message, status_code=e.status_code)
    """

    @staticmethod
    def listar_categorias(incluir_inactivas: bool = False) -> list[dict[str, Any]]:
        """
        Obtener lista de categorías.
        
        Args:
            incluir_inactivas: Si True, incluye categorías inactivas
            
        Returns:
            Lista de diccionarios con datos de categorías
        """
        query = Categoria.query
        
        if not incluir_inactivas:
            query = query.filter_by(activa=True)
        
        categorias = query.all()
        return [c.to_dict() for c in categorias]

    @staticmethod
    def obtener_categoria(categoria_id: int) -> dict[str, Any]:
        """
        Obtener una categoría por su ID.
        
        Args:
            categoria_id: ID de la categoría
            
        Returns:
            Diccionario con datos de la categoría
            
        Raises:
            CategoriaServiceError: Si la categoría no existe
        """
        categoria = db.session.get(Categoria, categoria_id)
        if not categoria:
            raise CategoriaServiceError("Categoría no encontrada", status_code=404)
        return categoria.to_dict()

    @staticmethod
    def crear_categoria(data: dict[str, Any]) -> dict[str, Any]:
        """
        Crear una nueva categoría.
        
        Args:
            data: Diccionario con datos de la categoría:
                - nombre (str, requerido): Nombre de la categoría
                - descripcion (str, opcional): Descripción
                
        Returns:
            Diccionario con datos de la categoría creada
            
        Raises:
            CategoriaServiceError: Si hay errores de validación o el nombre ya existe
        """
        # Validar campos requeridos
        is_valid, error_msg = validate_required_fields(data, ["nombre"])
        if not is_valid:
            raise CategoriaServiceError(error_msg)
        
        # Validar que el nombre no esté vacío
        nombre = data["nombre"].strip() if isinstance(data["nombre"], str) else ""
        if not nombre:
            raise CategoriaServiceError("El nombre no puede estar vacío")
        
        # Verificar nombre único
        if Categoria.query.filter_by(nombre=nombre).first():
            raise CategoriaServiceError("Ya existe una categoría con ese nombre", status_code=409)
        
        # Crear categoría
        nueva_categoria = Categoria(
            nombre=nombre,
            descripcion=data.get("descripcion", "").strip() or None if data.get("descripcion") else None,
        )
        
        try:
            db.session.add(nueva_categoria)
            db.session.commit()
            return nueva_categoria.to_dict()
        except Exception as e:
            db.session.rollback()
            raise CategoriaServiceError(f"Error al crear categoría: {str(e)}", status_code=500)

    @staticmethod
    def actualizar_categoria(categoria_id: int, data: dict[str, Any]) -> dict[str, Any]:
        """
        Actualizar una categoría existente.
        
        Args:
            categoria_id: ID de la categoría a actualizar
            data: Diccionario con campos a actualizar
            
        Returns:
            Diccionario con datos de la categoría actualizada
            
        Raises:
            CategoriaServiceError: Si la categoría no existe o hay errores de validación
        """
        categoria = db.session.get(Categoria, categoria_id)
        if not categoria:
            raise CategoriaServiceError("Categoría no encontrada", status_code=404)
        
        # Validar nombre si se proporciona
        if "nombre" in data:
            nombre = data["nombre"].strip() if isinstance(data["nombre"], str) else ""
            if not nombre:
                raise CategoriaServiceError("El nombre no puede estar vacío")
            categoria.nombre = nombre
        
        # Actualizar descripción si se proporciona
        if "descripcion" in data:
            descripcion = data["descripcion"].strip() if isinstance(data["descripcion"], str) else None
            categoria.descripcion = descripcion or None
        
        try:
            db.session.commit()
            return categoria.to_dict()
        except Exception as e:
            db.session.rollback()
            raise CategoriaServiceError(f"Error al actualizar categoría: {str(e)}", status_code=500)

    @staticmethod
    def desactivar_categoria(categoria_id: int) -> dict[str, Any]:
        """
        Desactivar una categoría (soft delete).
        
        Args:
            categoria_id: ID de la categoría a desactivar
            
        Returns:
            Diccionario con datos de la categoría desactivada
            
        Raises:
            CategoriaServiceError: Si la categoría no existe
        """
        categoria = db.session.get(Categoria, categoria_id)
        if not categoria:
            raise CategoriaServiceError("Categoría no encontrada", status_code=404)
        
        try:
            categoria.activa = False
            db.session.commit()
            return categoria.to_dict()
        except Exception as e:
            db.session.rollback()
            raise CategoriaServiceError(f"Error al desactivar categoría: {str(e)}", status_code=500)


# Instancia singleton para uso directo (opcional)
categoria_service = CategoriaService()
