/**
 * api.ts – Capa centralizada de servicio de API
 * 
 * - Define un wrapper central para llamadas a la API del backend (Flask).
 * - Contiene tipados TypeScript para datos principales (Producto, Usuario, Orden, etc.).
 * - Divide las funciones en módulos por recurso (productosApi, usuariosApi, etc).
 * - Controla el manejo de errores, headers y parámetros.
 * 
 * Objetivo: Centralizar y tipar el acceso a los endpoints desde el frontend React/Astro, favoreciendo la mantenibilidad.
 */

const API_BASE_URL = 'http://localhost:5000/api';

interface ApiError {
  error: string;
  detalle?: string;
}

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || error.detalle || 'Error en la petición');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error de conexión con el servidor');
  }
}

// ============================================================================
// CATEGORÍAS
// ============================================================================

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface CategoriaInput {
  nombre: string;
  descripcion: string;
}

export const categoriasApi = {
  getAll: () => apiFetch<Categoria[]>('/categorias'),
  getById: (id: number) => apiFetch<Categoria>(`/categorias/${id}`),
  create: (data: CategoriaInput) =>
    apiFetch<Categoria>('/categorias', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: CategoriaInput) =>
    apiFetch<Categoria>(`/categorias/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiFetch<{ mensaje: string }>(`/categorias/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================================================
// CLIENTES
// ============================================================================

export interface Cliente {
  id: number;
  nombre_cliente: string;
  apellido_cliente: string;
  dni_cuit: string;
  email_cliente: string;
  telefono: string;
  direccion_cliente: string;
  ciudad_cliente: string;
  codigo_postal: string;
  provincia_cliente: string;
  fecha_registro: string;
}

export interface ClienteInput {
  nombre_cliente: string;
  apellido_cliente: string;
  dni_cuit: string;
  email_cliente: string;
  telefono: string;
  direccion_cliente: string;
  ciudad_cliente: string;
  codigo_postal: string;
  provincia_cliente: string;
}

export const clientesApi = {
  getAll: () => apiFetch<Cliente[]>('/clientes'),
  getById: (id: number) => apiFetch<Cliente>(`/clientes/${id}`),
  create: (data: ClienteInput) =>
    apiFetch<Cliente>('/clientes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: ClienteInput) =>
    apiFetch<Cliente>(`/clientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiFetch<{ mensaje: string }>(`/clientes/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================================================
// PRODUCTOS
// ============================================================================

export interface Producto {
  id: number;
  sku: string;
  nombre: string;
  descripcion: string;
  precio: number;
  medidas: {
    alto: number;
    ancho: number;
    profundidad: number;
  };
  material: string;
  categoria: string;
  imagen_principal: string | null;
}

export interface ProductoInput {
  sku: string;
  nombre: string;
  descripcion: string;
  precio: number;
  alto_cm?: number;
  ancho_cm?: number;
  profundidad_cm?: number;
  material: string;
  id_categoria: number;
}

export interface ImagenProducto {
  id: number;
  url: string;
  descripcion?: string;
  imagen_principal: boolean;
}

export const productosApi = {
  getAll: (params?: { categoria_id?: number; activo?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.categoria_id) query.append('categoria_id', params.categoria_id.toString());
    if (params?.activo !== undefined) query.append('activo', params.activo.toString());
    const queryString = query.toString();
    return apiFetch<Producto[]>(`/productos${queryString ? '?' + queryString : ''}`);
  },
  getById: (id: number) => apiFetch<Producto>(`/productos/${id}`),
  create: (data: ProductoInput) =>
    apiFetch<Producto>('/productos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: ProductoInput) =>
    apiFetch<Producto>(`/productos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiFetch<{ mensaje: string }>(`/productos/${id}`, {
      method: 'DELETE',
    }),
  // Image upload methods
  uploadImage: async (productoId: number, file: File, principal: boolean = false): Promise<ImagenProducto> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('principal', principal.toString());
    
    const response = await fetch(`${API_BASE_URL}/productos/${productoId}/imagen`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al subir imagen');
    }
    
    return response.json();
  },
  getImages: (productoId: number) => apiFetch<ImagenProducto[]>(`/productos/${productoId}/imagenes`),
  deleteImage: (imageId: number) => apiFetch<{ mensaje: string }>(`/imagenes/${imageId}`, { method: 'DELETE' }),
};

// ============================================================================
// USUARIOS
// ============================================================================

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  activo: boolean;
}

export interface UsuarioInput {
  nombre_us: string;
  apellido_us: string;
  email_us: string;
  password_hash: string;
  id_rol: number;
  activo?: boolean;
}

export const usuariosApi = {
  getAll: (params?: { activo?: boolean; rol_id?: number }) => {
    const query = new URLSearchParams();
    if (params?.activo !== undefined) query.append('activo', params.activo.toString());
    if (params?.rol_id) query.append('rol_id', params.rol_id.toString());
    const queryString = query.toString();
    return apiFetch<Usuario[]>(`/usuarios${queryString ? '?' + queryString : ''}`);
  },
  getById: (id: number) => apiFetch<Usuario>(`/usuarios/${id}`),
  create: (data: UsuarioInput) =>
    apiFetch<Usuario>('/usuarios', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<UsuarioInput>) =>
    apiFetch<Usuario>(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiFetch<{ mensaje: string }>(`/usuarios/${id}`, {
      method: 'DELETE',
    }),
  changePassword: (id: number, password: string) =>
    apiFetch<{ mensaje: string }>(`/usuarios/${id}/password`, {
      method: 'PATCH',
      body: JSON.stringify({ password }),
    }),
};

// ============================================================================
// ROLES
// ============================================================================

export interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
}

export const rolesApi = {
  getAll: () => apiFetch<Rol[]>('/roles'),
  getById: (id: number) => apiFetch<Rol>(`/roles/${id}`),
};

// ============================================================================
// PROVEEDORES
// ============================================================================

export interface Proveedor {
  id: number;
  nombre_empresa: string;
  contacto_nombre: string;
  telefono: string;
  email: string;
  direccion: string;
  activo: boolean;
}

export interface ProveedorInput {
  nombre_empresa: string;
  contacto_nombre: string;
  telefono: string;
  email: string;
  direccion: string;
  activo?: boolean;
}

export const proveedoresApi = {
  getAll: () => apiFetch<Proveedor[]>('/proveedores'),
  getById: (id: number) => apiFetch<Proveedor>(`/proveedores/${id}`),
  create: (data: ProveedorInput) =>
    apiFetch<Proveedor>('/proveedores', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: ProveedorInput) =>
    apiFetch<Proveedor>(`/proveedores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    apiFetch<{ mensaje: string }>(`/proveedores/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================================================
// ÓRDENES
// ============================================================================

export interface Orden {
  id: number;
  cliente: {
    id: number;
    nombre_cliente: string;
    apellido_cliente: string;
    email_cliente: string;
  };
  vendedor: {
    id: number;
    nombre: string;
    apellido: string;
  };
  estado: string;
  total: number;
  fecha_creacion: string;
  detalles?: OrdenDetalle[];
}

export interface OrdenDetalle {
  id: number;
  id_producto: number;
  producto: {
    id: number;
    nombre: string;
    sku: string;
    precio: number;
  };
  cantidad: number;
  precio_unitario: number;
}

export interface OrdenInput {
  id_cliente: number;
  id_usuarios: number;
  productos: Array<{
    id_producto: number;
    cantidad: number;
  }>;
}

export const ordenesApi = {
  getAll: (params?: { cliente_id?: number; estado?: string }) => {
    const query = new URLSearchParams();
    if (params?.cliente_id) query.append('cliente_id', params.cliente_id.toString());
    if (params?.estado) query.append('estado', params.estado);
    const queryString = query.toString();
    return apiFetch<Orden[]>(`/ordenes${queryString ? '?' + queryString : ''}`);
  },
  getById: (id: number) => apiFetch<Orden & { detalles: OrdenDetalle[] }>(`/ordenes/${id}`),
  create: (data: OrdenInput) =>
    apiFetch<Orden>('/ordenes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateEstado: (id: number, estado: string) =>
    apiFetch<Orden>(`/ordenes/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    }),
  delete: (id: number) =>
    apiFetch<{ mensaje: string }>(`/ordenes/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================================================
// INVENTARIO
// ============================================================================

export interface Inventario {
  id_producto: number;
  stock: number;
  ubicacion: string;
  alerta_stock: boolean;
}

export interface InventarioAjuste {
  cantidad: number;
  razon: string;
}

export const inventarioApi = {
  getAll: (params?: { bajo_stock?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.bajo_stock) query.append('bajo_stock', 'true');
    const queryString = query.toString();
    return apiFetch<Inventario[]>(`/inventario${queryString ? '?' + queryString : ''}`);
  },
  getByProducto: (productoId: number) =>
    apiFetch<Inventario>(`/inventario/producto/${productoId}`),
  ajustar: (id: number, data: InventarioAjuste) =>
    apiFetch<Inventario>(`/inventario/${id}/ajustar`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  getAlertas: () =>
    apiFetch<{ bajo_stock: Inventario[]; sin_stock: Inventario[] }>('/inventario/alertas'),
};

// ============================================================================
// DASHBOARD
// ============================================================================

export interface DashboardMetricas {
  ventas_totales: number;
  cantidad_ordenes: number;
  promedio_venta: number;
  productos_bajo_stock: Array<{
    id_producto: number;
    sku: string;
    nombre: string;
    stock_actual: number;
    stock_minimo: number;
    categoria: string;
  }>;
  top_productos: Array<{
    id_producto: number;
    sku: string;
    nombre: string;
    categoria: string;
    total_vendido: number;
    ingresos: number;
  }>;
  ventas_por_categoria: Array<{
    categoria: string;
    total: number;
  }>;
  ordenes_por_estado: Array<{
    estado: string;
    cantidad: number;
  }>;
}

export const dashboardApi = {

/**
==================================================
Flujo de trabajo y comunicación:

- Todos los módulos React/Astro que necesitan datos llaman funciones de este archivo (por ejemplo, al mostrar productos, registrar usuarios, etc.).
- Se comunica vía HTTP con el backend Flask en /api. Si hay error, lanza excepciones capturadas por los componentes llamadores.
- Las funciones buscan emular el acceso a recursos REST (getAll, getById, create, etc.) y cada entidad de negocio tiene aquí su namespace de API.
- Es el único punto de entrada/salida para datos en el frontend (fuera de pruebas/mock).
==================================================
*/

  getMetricas: (periodo: 'hoy' | 'semana' | 'mes' | 'anio' = 'mes') =>
    apiFetch<DashboardMetricas>(`/dashboard/metricas?periodo=${periodo}`),
};
