/**
 * Categorías Constants
 * Hoisted SVG icons and validation functions
 */
import type { CategoriaInput } from '../../../lib/api';

// =============================================================================
// SVG Icons (Hoisted for performance - react-best-practices: rendering-hoist-jsx)
// =============================================================================

export const ICONS = {
  PlusIcon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  CategoryIcon: (
    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  EditIcon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  TrashIcon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  EmptyIcon: (
    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  ),
} as const;

// =============================================================================
// Form Field Configuration
// =============================================================================

export const CATEGORIA_FORM_FIELDS = [
  { name: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Ej: Sillas', required: true, maxLength: 100 },
  { name: 'descripcion', label: 'Descripción', type: 'textarea', placeholder: 'Descripción de la categoría', required: false, maxLength: 500, rows: 4 },
] as const;

// =============================================================================
// Validation
// =============================================================================

export function validateCategoriaForm(data: CategoriaInput): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.nombre.trim()) {
    errors.nombre = 'El nombre es requerido';
  } else if (data.nombre.length > 100) {
    errors.nombre = 'El nombre no puede exceder 100 caracteres';
  }

  if (data.descripcion && data.descripcion.length > 500) {
    errors.descripcion = 'La descripción no puede exceder 500 caracteres';
  }

  return errors;
}

// =============================================================================
// Initial Form Data
// =============================================================================

export const INITIAL_CATEGORIA_FORM: CategoriaInput = {
  nombre: '',
  descripcion: '',
};
