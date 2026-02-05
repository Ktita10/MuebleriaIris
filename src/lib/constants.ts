/**
 * Shared constants for the application
 * Centralized to avoid duplication and improve maintainability
 */

/**
 * Argentine provinces for address forms
 */
export const PROVINCES = [
  "Buenos Aires",
  "CABA",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
] as const;

export type Province = (typeof PROVINCES)[number];

/**
 * Product category slugs mapped to display names
 */
export const CATEGORY_MAP: Record<string, string> = {
  sofas: "Sofás",
  sillas: "Sillas",
  mesas: "Mesas",
  camas: "Camas",
  estanterias: "Estanterías",
} as const;

/**
 * Order status labels and colors
 */
export const ORDER_STATUS = {
  pendiente: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  procesando: { label: "Procesando", color: "bg-blue-100 text-blue-800" },
  enviado: { label: "Enviado", color: "bg-indigo-100 text-indigo-800" },
  entregado: { label: "Entregado", color: "bg-green-100 text-green-800" },
  completada: { label: "Completada", color: "bg-green-100 text-green-800" },
  cancelada: { label: "Cancelada", color: "bg-red-100 text-red-800" },
} as const;

export type OrderStatus = keyof typeof ORDER_STATUS;

/**
 * User roles
 */
export const USER_ROLES = {
  admin: { label: "Administrador", level: 3 },
  vendedor: { label: "Vendedor", level: 2 },
  cliente: { label: "Cliente", level: 1 },
} as const;

export type UserRole = keyof typeof USER_ROLES;

/**
 * Payment method options
 */
export const PAYMENT_METHODS = {
  card: { label: "Tarjeta", description: "Crédito o Débito" },
  transfer: { label: "Transferencia", description: "Bancaria" },
  mercadopago: { label: "MercadoPago", description: "Todas las opciones" },
  efectivo: { label: "Efectivo", description: "Pago en efectivo" },
} as const;

export type PaymentMethod = keyof typeof PAYMENT_METHODS;

/**
 * Items per page for pagination
 */
export const ITEMS_PER_PAGE = 20;

/**
 * Default image placeholder
 */
export const DEFAULT_PRODUCT_IMAGE = "/images/placeholder-product.png";
