/**
 * Inventario Constants
 * Hoisted SVG icons and validation functions (react-best-practices: rendering-hoist-jsx)
 */
import type { InventarioAjuste } from '../../../lib/api';

// ============================================================================
// SVG ICONS (hoisted for performance)
// ============================================================================

export const ICONS = {
  PlusIcon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  MinusIcon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
  ),
  SearchIcon: (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  PackageIcon: (
    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  WarningIcon: (
    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  CloseIcon: (
    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  CheckIcon: (
    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  EmptyIcon: (
    <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  PlaceholderIcon: (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
} as const;

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

export function validateAjusteForm(
  data: InventarioAjuste,
  ajusteType: 'add' | 'remove',
  currentStock: number
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.cantidad || data.cantidad <= 0) {
    errors.cantidad = 'La cantidad debe ser mayor a 0';
  }

  if (ajusteType === 'remove' && data.cantidad > currentStock) {
    errors.cantidad = `No puedes remover más de ${currentStock} unidades`;
  }

  if (!data.razon.trim()) {
    errors.razon = 'La razón es requerida';
  }

  return errors;
}

// ============================================================================
// INITIAL FORM DATA
// ============================================================================

export const INITIAL_AJUSTE_FORM: InventarioAjuste = {
  cantidad: 0,
  razon: '',
};

// ============================================================================
// STOCK STATUS HELPERS
// ============================================================================

export function getStockStatus(stock: number, alertaStock: boolean) {
  if (stock === 0) {
    return { label: 'Sin Stock', color: 'badge-danger' };
  }
  if (alertaStock) {
    return { label: 'Stock Bajo', color: 'badge-warning' };
  }
  return { label: 'Normal', color: 'badge-success' };
}

// ============================================================================
// FILTER OPTIONS
// ============================================================================

export const ALERT_FILTER_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'bajo_stock', label: 'Stock Bajo' },
  { value: 'sin_stock', label: 'Sin Stock' },
] as const;
