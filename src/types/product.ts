/**
 * Product-related type definitions
 * Centralized types for API responses and component props
 */

/**
 * Raw product data from API response
 */
export interface ProductoAPI {
  id: number;
  nombre: string;
  precio: number;
  descripcion?: string;
  categoria?: string;
  material?: string;
  stock?: number;
  sku?: string;
  imagen_principal?: string;
  imagenes?: ProductoImagenAPI[];
  medidas?: {
    alto?: number;
    ancho?: number;
    profundidad?: number;
  };
}

/**
 * Product image from API
 */
export interface ProductoImagenAPI {
  id?: number;
  url: string;
  orden?: number;
}

/**
 * Product dimensions
 */
export interface ProductoDimensiones {
  alto: number;
  ancho: number;
  profundidad: number;
}

/**
 * Transformed product for frontend components
 */
export interface ProductoDetalle {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string;
  categoria: string;
  material: string;
  dimensiones: ProductoDimensiones;
  colores: string[];
  imagenes: (string | null)[];
  stock: number;
  sku: string;
  imagen_principal?: string;
}

/**
 * Related product (simplified version for cards)
 */
export interface ProductoRelacionado {
  id: number;
  nombre: string;
  precio: number;
  categoria?: string;
  imagen_principal?: string;
}
