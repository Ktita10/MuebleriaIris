/**
 * Hooks Index
 * Central export for all custom hooks
 */

// Generic hooks
export {
  useEntityManager,
  type UseEntityManagerConfig,
  type UseEntityManagerReturn,
  type FormErrors,
} from './useEntityManager';

// Specific hooks
export { useProductos, type UseProductosReturn } from './useProductos';
export { useProductImages, type UseProductImagesReturn } from './useProductImages';
export { useOrdenes, type UseOrdenesReturn, type OrdenStats } from './useOrdenes';
