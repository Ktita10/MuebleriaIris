/**
 * Proveedores Constants
 * Hoisted SVG icons and validation functions
 */
import type { ProveedorInput } from '../../../lib/api';

// =============================================================================
// SVG Icons (Hoisted for performance - react-best-practices: rendering-hoist-jsx)
// =============================================================================

export const ICONS = {
  PlusIcon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  SearchIcon: (
    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  BuildingIcon: (
    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  EditIcon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  TrashIcon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  EmptyIcon: (
    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
} as const;

// =============================================================================
// Form Field Configuration
// =============================================================================

export const PROVEEDOR_FORM_FIELDS = [
  { name: 'nombre_empresa', label: 'Nombre de la Empresa', type: 'text', placeholder: 'Muebles SA', required: true },
  { name: 'contacto_nombre', label: 'Nombre del Contacto', type: 'text', placeholder: 'Juan Pérez', required: true },
  { name: 'telefono', label: 'Teléfono', type: 'tel', placeholder: '+54 11 1234-5678', required: true },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'contacto@empresa.com', required: true },
  { name: 'direccion', label: 'Dirección', type: 'textarea', placeholder: 'Calle 123, Ciudad', required: true, rows: 3 },
] as const;

// =============================================================================
// Validation
// =============================================================================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateProveedorForm(data: ProveedorInput): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.nombre_empresa.trim()) {
    errors.nombre_empresa = 'El nombre de la empresa es requerido';
  }
  if (!data.contacto_nombre.trim()) {
    errors.contacto_nombre = 'El nombre del contacto es requerido';
  }
  if (!data.telefono.trim()) {
    errors.telefono = 'El teléfono es requerido';
  }
  if (!data.email.trim()) {
    errors.email = 'El email es requerido';
  } else if (!EMAIL_REGEX.test(data.email)) {
    errors.email = 'Email inválido';
  }
  if (!data.direccion.trim()) {
    errors.direccion = 'La dirección es requerida';
  }

  return errors;
}

// =============================================================================
// Initial Form Data
// =============================================================================

export const INITIAL_PROVEEDOR_FORM: ProveedorInput = {
  nombre_empresa: '',
  contacto_nombre: '',
  telefono: '',
  email: '',
  direccion: '',
  activo: true,
};
