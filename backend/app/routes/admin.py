"""
Blueprint de Administración - Usuarios, Roles, Autenticación
Módulo ERP: Gestión administrativa y de usuarios
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from .. import db
from ..models import Usuario, Rol, Cliente
from ..security import hash_password, verify_password, is_password_hashed
from datetime import datetime, timezone

admin_bp = Blueprint('admin', __name__, url_prefix='/api')


# ==============================================================================
#                                  ROLES
# ==============================================================================

@admin_bp.route('/roles', methods=['GET'])
def get_roles():
    """Obtener todos los roles"""
    try:
        roles = Rol.query.all()
        return jsonify([r.to_dict() for r in roles]), 200
    except Exception as e:
        return jsonify({"error": "Error al obtener roles", "detalle": str(e)}), 500


@admin_bp.route('/roles', methods=['POST'])
def create_rol():
    """
    Crear nuevo rol
    Body: {
        "nombre_rol": str (requerido, único),
        "descripcion": str
    }
    """
    data = request.get_json()

    if not data or "nombre_rol" not in data:
        return jsonify({"error": "El campo 'nombre_rol' es requerido"}), 400

    if not data["nombre_rol"].strip():
        return jsonify({"error": "El nombre del rol no puede estar vacío"}), 400

    # Verificar que no exista
    if Rol.query.filter_by(nombre_rol=data["nombre_rol"]).first():
        return jsonify({"error": "Ya existe un rol con ese nombre"}), 409

    nuevo_rol = Rol(
        nombre_rol=data["nombre_rol"].strip(),
        descripcion=data.get("descripcion", "").strip() or None
    )

    try:
        db.session.add(nuevo_rol)
        db.session.commit()
        return jsonify({
            "mensaje": "Rol creado exitosamente",
            "rol": nuevo_rol.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al crear rol", "detalle": str(e)}), 500


@admin_bp.route('/roles/<int:id>', methods=['GET'])
def get_rol(id):
    """Obtener un rol por ID"""
    rol = Rol.query.get(id)
    if not rol:
        return jsonify({"error": "Rol no encontrado"}), 404
    
    return jsonify(rol.to_dict()), 200


@admin_bp.route('/roles/<int:id>', methods=['PUT'])
def update_rol(id):
    """Actualizar rol"""
    rol = Rol.query.get(id)
    if not rol:
        return jsonify({"error": "Rol no encontrado"}), 404

    data = request.get_json()

    if "nombre_rol" in data:
        if not data["nombre_rol"].strip():
            return jsonify({"error": "El nombre del rol no puede estar vacío"}), 400
        rol.nombre_rol = data["nombre_rol"].strip()

    if "descripcion" in data:
        rol.descripcion = data["descripcion"].strip() or None

    try:
        db.session.commit()
        return jsonify({
            "mensaje": "Rol actualizado exitosamente",
            "rol": rol.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al actualizar rol", "detalle": str(e)}), 500


@admin_bp.route('/roles/<int:id>', methods=['DELETE'])
def delete_rol(id):
    """Eliminar rol (solo si no tiene usuarios asignados)"""
    rol = Rol.query.get(id)
    if not rol:
        return jsonify({"error": "Rol no encontrado"}), 404

    # Verificar que no tenga usuarios asignados
    if rol.usuarios:
        return jsonify({
            "error": "No se puede eliminar el rol porque tiene usuarios asignados",
            "usuarios_asignados": len(rol.usuarios)
        }), 409

    try:
        db.session.delete(rol)
        db.session.commit()
        return jsonify({"mensaje": "Rol eliminado exitosamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al eliminar rol", "detalle": str(e)}), 500


# ==============================================================================
#                                  USUARIOS
# ==============================================================================

@admin_bp.route('/usuarios', methods=['GET'])
def get_usuarios():
    """
    Obtener todos los usuarios
    Query params: ?activo=true&rol_id=1
    """
    try:
        query = Usuario.query

        # Filtro por estado activo
        activo = request.args.get('activo')
        if activo is not None:
            activo_bool = activo.lower() == 'true'
            query = query.filter_by(activo=activo_bool)

        # Filtro por rol
        rol_id = request.args.get('rol_id', type=int)
        if rol_id:
            query = query.filter_by(id_rol=rol_id)

        usuarios = query.all()
        return jsonify([u.to_dict() for u in usuarios]), 200
    except Exception as e:
        return jsonify({"error": "Error al obtener usuarios", "detalle": str(e)}), 500


@admin_bp.route('/usuarios', methods=['POST'])
def create_usuario():
    """
    Crear nuevo usuario
    Body: {
        "nombre_us": str (requerido),
        "apellido_us": str (requerido),
        "email_us": str (requerido, único),
        "password": str (requerido, min 6 caracteres),
        "id_rol": int (requerido)
    }
    """
    data = request.get_json()

    # Validación de campos requeridos
    campos_requeridos = ["nombre_us", "apellido_us", "email_us", "password", "id_rol"]
    for campo in campos_requeridos:
        if campo not in data:
            return jsonify({"error": f"El campo '{campo}' es requerido"}), 400

    # Validar contraseña
    if len(data["password"]) < 6:
        return jsonify({"error": "La contraseña debe tener al menos 6 caracteres"}), 400

    # Verificar email único
    if Usuario.query.filter_by(email_us=data["email_us"]).first():
        return jsonify({"error": "Ya existe un usuario con ese email"}), 409

    # Verificar que el rol existe
    rol = Rol.query.get(data["id_rol"])
    if not rol:
        return jsonify({"error": "Rol no encontrado"}), 404

    # Hash de contraseña con werkzeug (pbkdf2:sha256)
    password_hash = hash_password(data["password"])

    nuevo_usuario = Usuario(
        nombre_us=data["nombre_us"].strip(),
        apellido_us=data["apellido_us"].strip(),
        email_us=data["email_us"].strip(),
        password_hash=password_hash,
        id_rol=data["id_rol"],
        activo=data.get("activo", True)
    )

    try:
        db.session.add(nuevo_usuario)
        db.session.commit()
        return jsonify({
            "mensaje": "Usuario creado exitosamente",
            "usuario": nuevo_usuario.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al crear usuario", "detalle": str(e)}), 500


@admin_bp.route('/usuarios/<int:id>', methods=['GET'])
def get_usuario(id):
    """Obtener un usuario por ID"""
    usuario = Usuario.query.get(id)
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404
    
    return jsonify(usuario.to_dict()), 200


@admin_bp.route('/usuarios/<int:id>', methods=['PUT'])
def update_usuario(id):
    """
    Actualizar usuario
    Body: {
        "nombre_us": str,
        "apellido_us": str,
        "email_us": str,
        "id_rol": int,
        "activo": bool
    }
    """
    usuario = Usuario.query.get(id)
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404

    data = request.get_json()

    # Actualizar campos
    if "nombre_us" in data:
        usuario.nombre_us = data["nombre_us"].strip()
    
    if "apellido_us" in data:
        usuario.apellido_us = data["apellido_us"].strip()
    
    if "email_us" in data:
        # Verificar que el email no esté en uso por otro usuario
        email_existente = Usuario.query.filter_by(email_us=data["email_us"]).first()
        if email_existente and email_existente.id_usuarios != id:
            return jsonify({"error": "El email ya está en uso"}), 409
        usuario.email_us = data["email_us"].strip()
    
    if "id_rol" in data:
        # Verificar que el rol existe
        rol = Rol.query.get(data["id_rol"])
        if not rol:
            return jsonify({"error": "Rol no encontrado"}), 404
        usuario.id_rol = data["id_rol"]
    
    if "activo" in data:
        usuario.activo = data["activo"]

    try:
        db.session.commit()
        return jsonify({
            "mensaje": "Usuario actualizado exitosamente",
            "usuario": usuario.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al actualizar usuario", "detalle": str(e)}), 500


@admin_bp.route('/usuarios/<int:id>/password', methods=['PATCH'])
def change_password(id):
    """
    Cambiar contraseña de usuario
    Body: {
        "password_actual": str,
        "password_nueva": str (min 6 caracteres)
    }
    """
    usuario = Usuario.query.get(id)
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404

    data = request.get_json()
    if not data or "password_nueva" not in data:
        return jsonify({"error": "El campo 'password_nueva' es requerido"}), 400

    # Validar longitud
    if len(data["password_nueva"]) < 6:
        return jsonify({"error": "La contraseña debe tener al menos 6 caracteres"}), 400

    # Si se proporciona password_actual, verificarla
    if "password_actual" in data:
        if not verify_password(data["password_actual"], usuario.password_hash):
            return jsonify({"error": "Contraseña actual incorrecta"}), 401
    
    # Hash de la nueva contraseña
    usuario.password_hash = hash_password(data["password_nueva"])

    try:
        db.session.commit()
        return jsonify({"mensaje": "Contraseña actualizada exitosamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al cambiar contraseña", "detalle": str(e)}), 500


@admin_bp.route('/usuarios/<int:id>', methods=['DELETE'])
def delete_usuario(id):
    """Desactivar usuario (soft delete)"""
    usuario = Usuario.query.get(id)
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404

    try:
        usuario.activo = False
        db.session.commit()
        return jsonify({"mensaje": "Usuario desactivado exitosamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al desactivar usuario", "detalle": str(e)}), 500


# ==============================================================================
#                              AUTENTICACIÓN
# ==============================================================================

@admin_bp.route('/auth/register', methods=['POST'])
def register():
    """
    Registro de usuario cliente
    Crea un Usuario (login) y un Cliente (datos de facturación)
    """
    data = request.get_json()
    
    # Validación básica
    campos_requeridos = ["nombre", "apellido", "email", "password"]
    for campo in campos_requeridos:
        if campo not in data or not data[campo].strip():
            return jsonify({"error": f"El campo '{campo}' es requerido"}), 400
            
    email = data["email"].strip().lower()
    
    # Verificar existencia en ambas tablas
    if Usuario.query.filter_by(email_us=email).first():
        return jsonify({"error": "El email ya está registrado"}), 409
    if Cliente.query.filter_by(email_cliente=email).first():
        return jsonify({"error": "El email ya está registrado como cliente"}), 409
        
    # Obtener rol 'cliente' o crear si no existe
    rol_cliente = Rol.query.filter(Rol.nombre_rol.ilike('%cliente%')).first()
    if not rol_cliente:
        rol_cliente = Rol(nombre_rol="Cliente", descripcion="Cliente registrado")
        db.session.add(rol_cliente)
        db.session.flush()
        
    try:
        # 1. Crear Usuario para login
        nuevo_usuario = Usuario(
            nombre_us=data["nombre"].strip(),
            apellido_us=data["apellido"].strip(),
            email_us=email,
            password_hash=hash_password(data["password"]),
            id_rol=rol_cliente.id_rol,
            activo=True
        )
        db.session.add(nuevo_usuario)
        
        # 2. Crear Cliente para facturación/pedidos
        # Usamos placeholders para campos requeridos no presentes en registro simple
        nuevo_cliente = Cliente(
            nombre_cliente=data["nombre"].strip(),
            apellido_cliente=data["apellido"].strip(),
            email_cliente=email,
            dni_cuit=f"GEN-{int(datetime.now().timestamp())}", # Placeholder único
            telefono="Sin especificar",
            direccion_cliente="Sin especificar",
            ciudad_cliente="Sin especificar",
            provincia_cliente="Sin especificar",
            codigo_postal="0000"
        )
        db.session.add(nuevo_cliente)
        
        db.session.commit()
        
        return jsonify({
            "message": "Registro exitoso",
            "user": {
                "id": nuevo_usuario.id_usuarios,
                "email": nuevo_usuario.email_us,
                "nombre": nuevo_usuario.nombre_us,
                "apellido": nuevo_usuario.apellido_us,
                "rol": "cliente",
                "cliente_id": nuevo_cliente.id_cliente
            },
            "token": create_access_token(identity={
                "id": nuevo_usuario.id_usuarios,
                "email": nuevo_usuario.email_us,
                "rol": "cliente",
                "cliente_id": nuevo_cliente.id_cliente
            })
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Error al registrar usuario", "detalle": str(e)}), 500


@admin_bp.route('/auth/login', methods=['POST'])
def login():
    """
    Login de usuario
    Body: {
        "email": str,
        "password": str
    }
    """
    data = request.get_json()

    if not data or "email" not in data or "password" not in data:
        return jsonify({"error": "Email y contraseña son requeridos"}), 400

    # Buscar usuario
    usuario = Usuario.query.filter_by(email_us=data["email"]).first()
    if not usuario:
        return jsonify({"error": "Credenciales inválidas"}), 401

    # Verificar que está activo
    if not usuario.activo:
        return jsonify({"error": "Usuario inactivo"}), 403

    # Verificar contraseña
    if not verify_password(data["password"], usuario.password_hash):
        return jsonify({"error": "Credenciales inválidas"}), 401

    # Buscar si tiene perfil de cliente asociado (por email)
    cliente = Cliente.query.filter_by(email_cliente=usuario.email_us).first()
    cliente_id = cliente.id_cliente if cliente else None

    # TODO: Generar JWT token real
    usuario_dict = usuario.to_dict()
    rol_nombre = usuario.rol.nombre_rol.lower()
    
    # Normalizar nombre de rol para el frontend
    if "admin" in rol_nombre or "administrador" in rol_nombre:
        rol_frontend = "admin"
    elif "vendedor" in rol_nombre:
        rol_frontend = "vendedor"
    else:
        rol_frontend = "cliente"
    
    user_response = {
        "id": usuario_dict["id"],
        "email": usuario_dict["email"],
        "nombre": usuario_dict["nombre"],
        "apellido": usuario_dict["apellido"],
        "rol": rol_frontend
    }
    
    # Adjuntar cliente_id si existe
    if cliente_id:
        user_response["cliente_id"] = cliente_id
    
    return jsonify({
        "message": "Login exitoso",
        "user": user_response,
        "token": create_access_token(identity={
            "id": usuario.id_usuarios,
            "email": usuario.email_us,
            "rol": rol_frontend,
            "cliente_id": cliente_id
        })
    }), 200


@admin_bp.route('/auth/logout', methods=['POST'])
def logout():
    """
    Logout de usuario
    TODO: Implementar invalidación de JWT
    """
    return jsonify({"mensaje": "Logout exitoso"}), 200


@admin_bp.route('/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """
    Obtener usuario actual autenticado
    Requiere token JWT válido en header Authorization: Bearer <token>
    """
    import json
    current_user_identity = get_jwt_identity()
    
    # El identity ahora es un JSON string, deserializarlo
    if isinstance(current_user_identity, str):
        try:
            current_user = json.loads(current_user_identity)
        except json.JSONDecodeError:
            current_user = {"id": current_user_identity}
    else:
        current_user = current_user_identity
    
    # Buscar datos frescos del usuario
    usuario = Usuario.query.get(current_user['id'])
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404
    
    if not usuario.activo:
        return jsonify({"error": "Usuario inactivo"}), 403
    
    # Obtener cliente_id si existe
    cliente = Cliente.query.filter_by(email_cliente=usuario.email_us).first()
    
    # Normalizar rol para frontend
    rol_nombre = usuario.rol.nombre_rol.lower()
    if "admin" in rol_nombre or "administrador" in rol_nombre:
        rol_frontend = "admin"
    elif "vendedor" in rol_nombre:
        rol_frontend = "vendedor"
    else:
        rol_frontend = "cliente"
    
    return jsonify({
        "id": usuario.id_usuarios,
        "email": usuario.email_us,
        "nombre": usuario.nombre_us,
        "apellido": usuario.apellido_us,
        "rol": rol_frontend,
        "cliente_id": cliente.id_cliente if cliente else None
    }), 200


# ==============================================================================
#                              REPORTES ADMIN
# ==============================================================================

@admin_bp.route('/reportes/usuarios-actividad', methods=['GET'])
def reporte_usuarios_actividad():
    """Reporte de actividad de usuarios (órdenes creadas)"""
    try:
        from sqlalchemy import func
        from ..models import Orden
        
        resultados = db.session.query(
            Usuario.id_usuarios,
            Usuario.nombre_us,
            Usuario.apellido_us,
            Rol.nombre_rol,
            func.count(Orden.id_orden).label('ordenes_creadas')
        ).join(
            Rol, Usuario.id_rol == Rol.id_rol
        ).outerjoin(
            Orden, Usuario.id_usuarios == Orden.id_usuarios
        ).group_by(
            Usuario.id_usuarios, Usuario.nombre_us, Usuario.apellido_us, Rol.nombre_rol
        ).order_by(
            func.count(Orden.id_orden).desc()
        ).all()

        usuarios = [
            {
                "id_usuario": r.id_usuarios,
                "nombre": f"{r.nombre_us} {r.apellido_us}",
                "rol": r.nombre_rol,
                "ordenes_creadas": r.ordenes_creadas
            }
            for r in resultados
        ]

        return jsonify(usuarios), 200
    except Exception as e:
        return jsonify({"error": "Error al obtener reporte", "detalle": str(e)}), 500


@admin_bp.route('/dashboard/metricas', methods=['GET'])
def dashboard_metricas():
    """
    Obtener métricas principales para el dashboard administrativo
    
    Query params:
        - periodo: 'hoy', 'semana', 'mes', 'anio' (default: 'mes')
    
    Returns:
        JSON con métricas agregadas:
        - ventas_totales: Monto total vendido
        - cantidad_ordenes: Número de órdenes
        - promedio_venta: Promedio por orden
        - productos_bajo_stock: Lista de productos con stock crítico
        - top_productos: Top 5 productos más vendidos
        - ventas_por_categoria: Distribución por categoría
        - ordenes_por_estado: Distribución por estado
    """
    try:
        from sqlalchemy import func
        from ..models import Orden, DetalleOrden, Producto, Categoria, Inventario
        from datetime import timedelta
        
        # Obtener período de consulta
        periodo = request.args.get('periodo', 'mes')
        fecha_actual = datetime.now(timezone.utc)
        
        # Calcular fecha de inicio según período
        if periodo == 'hoy':
            fecha_inicio = fecha_actual.replace(hour=0, minute=0, second=0, microsecond=0)
        elif periodo == 'semana':
            fecha_inicio = fecha_actual - timedelta(days=7)
        elif periodo == 'anio':
            fecha_inicio = fecha_actual - timedelta(days=365)
        else:  # 'mes' por defecto
            fecha_inicio = fecha_actual - timedelta(days=30)
        
        # 1. VENTAS TOTALES Y CANTIDAD DE ÓRDENES
        ordenes_periodo = Orden.query.filter(
            Orden.fecha_creacion >= fecha_inicio,
            Orden.estado.in_(['completada', 'en_proceso'])  # Solo órdenes activas
        ).all()
        
        ventas_totales = sum(float(o.monto_total) for o in ordenes_periodo)
        cantidad_ordenes = len(ordenes_periodo)
        promedio_venta = ventas_totales / cantidad_ordenes if cantidad_ordenes > 0 else 0
        
        # 2. PRODUCTOS BAJO STOCK (cantidad_stock <= stock_minimo)
        inventario_critico = db.session.query(
            Inventario.id_producto,
            Producto.nombre,
            Inventario.cantidad_stock,
            Inventario.stock_minimo,
            Categoria.nombre.label('categoria_nombre')
        ).join(
            Producto, Inventario.id_producto == Producto.id_producto
        ).join(
            Categoria, Producto.id_categoria == Categoria.id_categoria
        ).filter(
            Inventario.cantidad_stock <= Inventario.stock_minimo
        ).order_by(
            Inventario.cantidad_stock.asc()
        ).limit(10).all()
        
        productos_bajo_stock = [
            {
                "id_producto": inv.id_producto,
                "nombre": inv.nombre,
                "stock_actual": inv.cantidad_stock,
                "stock_minimo": inv.stock_minimo,
                "categoria": inv.categoria_nombre
            }
            for inv in inventario_critico
        ]
        
        # 3. TOP 5 PRODUCTOS MÁS VENDIDOS (en el período)
        top_productos = db.session.query(
            Producto.id_producto,
            Producto.nombre,
            Categoria.nombre.label('categoria_nombre'),
            func.sum(DetalleOrden.cantidad).label('total_vendido'),
            func.sum(DetalleOrden.cantidad * DetalleOrden.precio_unitario).label('ingresos')
        ).join(
            DetalleOrden, Producto.id_producto == DetalleOrden.id_producto
        ).join(
            Orden, DetalleOrden.id_orden == Orden.id_orden
        ).join(
            Categoria, Producto.id_categoria == Categoria.id_categoria
        ).filter(
            Orden.fecha_creacion >= fecha_inicio,
            Orden.estado.in_(['completada', 'en_proceso'])
        ).group_by(
            Producto.id_producto, Producto.nombre, Categoria.nombre
        ).order_by(
            func.sum(DetalleOrden.cantidad).desc()
        ).limit(5).all()
        
        top_productos_list = [
            {
                "id_producto": p.id_producto,
                "nombre": p.nombre,
                "categoria": p.categoria_nombre,
                "total_vendido": int(p.total_vendido),
                "ingresos": float(p.ingresos)
            }
            for p in top_productos
        ]
        
        # 4. VENTAS POR CATEGORÍA
        ventas_categoria = db.session.query(
            Categoria.nombre.label('categoria'),
            func.sum(DetalleOrden.cantidad * DetalleOrden.precio_unitario).label('total')
        ).join(
            Producto, Categoria.id_categoria == Producto.id_categoria
        ).join(
            DetalleOrden, Producto.id_producto == DetalleOrden.id_producto
        ).join(
            Orden, DetalleOrden.id_orden == Orden.id_orden
        ).filter(
            Orden.fecha_creacion >= fecha_inicio,
            Orden.estado.in_(['completada', 'en_proceso'])
        ).group_by(
            Categoria.nombre
        ).all()
        
        ventas_por_categoria = [
            {
                "categoria": vc.categoria,
                "total": float(vc.total)
            }
            for vc in ventas_categoria
        ]
        
        # 5. ÓRDENES POR ESTADO
        ordenes_estado = db.session.query(
            Orden.estado,
            func.count(Orden.id_orden).label('cantidad')
        ).filter(
            Orden.fecha_creacion >= fecha_inicio
        ).group_by(
            Orden.estado
        ).all()
        
        ordenes_por_estado = [
            {
                "estado": oe.estado,
                "cantidad": oe.cantidad
            }
            for oe in ordenes_estado
        ]
        
        # Construir respuesta
        return jsonify({
            "periodo": periodo,
            "fecha_inicio": fecha_inicio.isoformat(),
            "fecha_fin": fecha_actual.isoformat(),
            "ventas": {
                "total": round(ventas_totales, 2),
                "cantidad_ordenes": cantidad_ordenes,
                "promedio": round(promedio_venta, 2)
            },
            "productos_bajo_stock": productos_bajo_stock,
            "top_productos": top_productos_list,
            "ventas_por_categoria": ventas_por_categoria,
            "ordenes_por_estado": ordenes_por_estado
        }), 200
        
    except Exception as e:
        return jsonify({"error": "Error al obtener métricas del dashboard", "detalle": str(e)}), 500
