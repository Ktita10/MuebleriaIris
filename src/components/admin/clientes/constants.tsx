/**
 * Clientes Constants
 * Hoisted SVG icons and validation functions
 */
import type { ClienteInput } from '../../../lib/api';

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
  UserIcon: (
    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
} as const;

// =============================================================================
// Form Field Configuration
// =============================================================================

export const CLIENTE_FORM_FIELDS = [
  { name: 'nombre_cliente', label: 'Nombre', type: 'text', placeholder: 'Juan', required: true },
  { name: 'apellido_cliente', label: 'Apellido', type: 'text', placeholder: 'Pérez', required: true },
  { name: 'dni_cuit', label: 'DNI/CUIT', type: 'text', placeholder: '12345678', required: true },
  { name: 'email_cliente', label: 'Email', type: 'email', placeholder: 'juan@example.com', required: true },
  { name: 'telefono', label: 'Teléfono', type: 'tel', placeholder: '+54 11 1234-5678', required: true },
  { name: 'direccion_cliente', label: 'Dirección', type: 'text', placeholder: 'Calle 123', required: true },
  { name: 'ciudad_cliente', label: 'Ciudad', type: 'text', placeholder: 'Buenos Aires', required: true },
  { name: 'codigo_postal', label: 'Código Postal', type: 'text', placeholder: '1000', required: true },
  { name: 'provincia_cliente', label: 'Provincia', type: 'text', placeholder: 'Buenos Aires', required: true },
] as const;

// =============================================================================
// Validation
// =============================================================================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateClienteForm(data: ClienteInput): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.nombre_cliente.trim()) {
    errors.nombre_cliente = 'Nombre requerido';
  }
  if (!data.apellido_cliente.trim()) {
    errors.apellido_cliente = 'Apellido requerido';
  }
  if (!data.dni_cuit.trim()) {
    errors.dni_cuit = 'DNI/CUIT requerido';
  }
  if (!data.email_cliente.trim()) {
    errors.email_cliente = 'Email requerido';
  } else if (!EMAIL_REGEX.test(data.email_cliente)) {
    errors.email_cliente = 'Email inválido';
  }
  if (!data.telefono.trim()) {
    errors.telefono = 'Teléfono requerido';
  }
  if (!data.direccion_cliente.trim()) {
    errors.direccion_cliente = 'Dirección requerida';
  }
  if (!data.ciudad_cliente.trim()) {
    errors.ciudad_cliente = 'Ciudad requerida';
  }
  if (!data.codigo_postal.trim()) {
    errors.codigo_postal = 'Código postal requerido';
  }
  if (!data.provincia_cliente.trim()) {
    errors.provincia_cliente = 'Provincia requerida';
  }

  return errors;
}

// =============================================================================
// Initial Form Data
// =============================================================================

export const INITIAL_CLIENTE_FORM: ClienteInput = {
  nombre_cliente: '',
  apellido_cliente: '',
  dni_cuit: '',
  email_cliente: '',
  telefono: '',
  direccion_cliente: '',
  ciudad_cliente: '',
  codigo_postal: '',
  provincia_cliente: '',
};
