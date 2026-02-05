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

// ============================================================================
// CONFIGURACIÓN BASE
// ============================================================================

/**
 * URL base del servidor backend.
 * Usa variable de entorno PUBLIC_API_BASE o fallback a localhost.
 */
export const API_BASE = import.meta.env.PUBLIC_API_BASE || 'http://localhost:5000';

/**
 * URL base de la API (incluye /api).
 */
export const API_BASE_URL = `${API_BASE}/api`;

/**
 * Construye la URL completa para una imagen del servidor.
 * @param path - Ruta relativa de la imagen (e.g., "/uploads/imagen.jpg")
 * @returns URL completa de la imagen
 */
export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '/placeholder-product.jpg';
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path.startsWith('/') ? path : '/' + path}`;
}

interface ApiError {
  error: string;
  detalle?: string;
}

/**
 * Get auth token from localStorage (client-side only)
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('muebleria-token');
}

/**
 * Handle authentication errors (401/403/422) - auto logout
 */
function handleAuthError(status: number): void {
  if (typeof window === 'undefined') return;
  
  if (status === 401 || status === 403 || status === 422) {
    // Clear auth data
    localStorage.removeItem('muebleria-token');
    localStorage.removeItem('muebleria-user');
    
    // Redirect to login if not already there
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login?expired=true';
    }
  }
}

/**
 * Generic fetch wrapper with error handling and JWT auth
 */
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    // Build headers with auth token if available
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };
    
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle auth errors
    if (response.status === 401 || response.status === 403 || response.status === 422) {
      handleAuthError(response.status);
      const error: ApiError = await response.json().catch(() => ({ error: 'Sesión expirada' }));
      throw new Error(error.error || 'Sesión expirada. Por favor, inicia sesión nuevamente.');
    }

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || error.detalle || 'Error en la petición');
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error); // Log para depuración
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error de conexión con el servidor. Verifica que el backend esté corriendo.');
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
  // API returns these names from to_dict()
  nombre: string;
  apellido: string;
  dni_cuit: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  codigo_postal: string;
  provincia: string;
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
  stock?: number;
  imagenes?: ImagenProducto[];  // Array of product images from backend
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
  // Papelera (Trash) methods
  getPapelera: () => apiFetch<Producto[]>('/productos/papelera'),
  restaurar: (id: number) => apiFetch<{ mensaje: string; producto: Producto }>(`/productos/${id}/restaurar`, { method: 'POST' }),
  eliminarPermanente: (id: number) => apiFetch<{ mensaje: string }>(`/productos/${id}/eliminar-permanente`, { method: 'DELETE' }),
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
  password?: string;
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
  producto: Producto;  // Use full Producto type (backend returns producto.to_dict())
  cantidad: number;
  precio_unitario: number;
}

export interface OrdenInput {
  id_cliente: number;
  id_vendedor: number;  // Backend endpoint expects "id_vendedor" (mapped to id_usuarios in DB)
  items: Array<{  // Backend endpoint expects "items" array
    id_producto: number;
    cantidad: number;
    precio_unitario?: number;  // Optional: uses product price if not provided
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
  id: number;  // id_inventario from backend
  id_producto: number;
  stock: number;  // cantidad from backend (mapped)
  ubicacion: string;
  alerta_stock: boolean;  // computed: stock <= stock_minimo
  stock_minimo?: number;
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
  ajustar: (inventarioId: number, data: InventarioAjuste) =>
    apiFetch<Inventario>(`/inventario/${inventarioId}/ajustar`, {
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
  getMetricas: (periodo: 'hoy' | 'semana' | 'mes' | 'anio' = 'mes') =>
    apiFetch<DashboardMetricas>(`/dashboard/metricas?periodo=${periodo}`),
};

// ============================================================================
// FAVORITOS
// ============================================================================

export interface Favorito {
  id: number;
  id_cliente: number;
  id_producto: number;
  fecha_agregado: string;
  producto: Producto;
}

export interface FavoritoInput {
  id_cliente: number;
  id_producto: number;
}

export const favoritosApi = {
  getByCliente: (idCliente: number) =>
    apiFetch<{ mensaje: string; favoritos: Favorito[] }>(`/favoritos?id_cliente=${idCliente}`),
  
  add: (data: FavoritoInput) =>
    apiFetch<{ mensaje: string; favorito: Favorito }>('/favoritos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  remove: (data: FavoritoInput) =>
    apiFetch<{ mensaje: string }>('/favoritos', {
      method: 'DELETE',
      body: JSON.stringify(data),
    }),
  
  removeById: (id: number) =>
    apiFetch<{ mensaje: string }>(`/favoritos/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================================================
// AUTENTICACIÓN
// ============================================================================

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  codigo_postal?: string;
  provincia?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: number;
    email: string;
    nombre: string;
    apellido: string;
    rol: string;
    cliente_id?: number;
  };
}

export interface AuthMeResponse {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: string;
  cliente_id?: number | null;
}

export const authApi = {
  login: (data: LoginInput) =>
    apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  register: (data: RegisterInput) =>
    apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  logout: () =>
    apiFetch<{ mensaje: string }>('/auth/logout', {
      method: 'POST',
    }),
  
  me: () =>
    apiFetch<AuthMeResponse>('/auth/me'),
};
