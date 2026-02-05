/**
 * Ordenes Constants
 * Centralized configuration for order states, colors, labels, and icons
 */

// =============================================================================
// Order States
// =============================================================================

export const ESTADOS = ['pendiente', 'en_proceso', 'completada', 'cancelada'] as const;
export type EstadoOrden = (typeof ESTADOS)[number];

// =============================================================================
// State Colors (DaisyUI badge classes)
// =============================================================================

export const ESTADO_COLORS: Record<EstadoOrden, string> = {
  pendiente: 'badge-warning',
  en_proceso: 'badge-primary',
  completada: 'badge-success',
  cancelada: 'badge-danger',
};

// =============================================================================
// State Labels (Spanish)
// =============================================================================

export const ESTADO_LABELS: Record<EstadoOrden, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En Proceso',
  completada: 'Completada',
  cancelada: 'Cancelada',
};

// =============================================================================
// Stats Card Configuration
// =============================================================================

export interface StatCardConfig {
  estado: EstadoOrden | 'total';
  label: string;
  bgColor: string;
  iconColor: string;
  icon: 'clock' | 'lightning' | 'check' | 'currency';
  isTotal?: boolean;
}

export const STAT_CARDS_CONFIG: StatCardConfig[] = [
  {
    estado: 'pendiente',
    label: 'Pendientes',
    bgColor: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    icon: 'clock',
  },
  {
    estado: 'en_proceso',
    label: 'En Proceso',
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
    icon: 'lightning',
  },
  {
    estado: 'completada',
    label: 'Completadas',
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
    icon: 'check',
  },
  {
    estado: 'total',
    label: 'Total Ventas',
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
    icon: 'currency',
    isTotal: true,
  },
];

// =============================================================================
// SVG Icons (hoisted to avoid re-creation on each render)
// =============================================================================

// Clock icon for pending orders
export const ClockIcon = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />`;

// Lightning icon for in-progress orders
export const LightningIcon = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />`;

// Check icon for completed orders
export const CheckIcon = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />`;

// Currency icon for total sales
export const CurrencyIcon = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />`;

// Search icon
export const SearchIcon = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />`;

// Plus icon for new order button
export const PlusIcon = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />`;

// Eye icon for view details
export const EyeIcon = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />`;

// Refresh/update icon for status change
export const RefreshIcon = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />`;

// X icon for cancel
export const XIcon = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />`;

// Clipboard icon for empty state
export const ClipboardIcon = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />`;

// Package/box icon for products
export const PackageIcon = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />`;

// Image placeholder icon
export const ImagePlaceholderIcon = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />`;

// Tag icon for quantity
export const TagIcon = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />`;

// =============================================================================
// Icon Getter
// =============================================================================

export const ICONS: Record<string, string> = {
  clock: ClockIcon,
  lightning: LightningIcon,
  check: CheckIcon,
  currency: CurrencyIcon,
  search: SearchIcon,
  plus: PlusIcon,
  eye: EyeIcon,
  refresh: RefreshIcon,
  x: XIcon,
  clipboard: ClipboardIcon,
  package: PackageIcon,
  imagePlaceholder: ImagePlaceholderIcon,
  tag: TagIcon,
};

export function getIcon(name: keyof typeof ICONS): string {
  return ICONS[name] || '';
}
