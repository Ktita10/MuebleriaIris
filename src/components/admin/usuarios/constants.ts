/**
 * Usuarios Constants
 * Centralized configuration for user management
 */

// =============================================================================
// SVG Icons (hoisted to avoid re-creation on each render)
// =============================================================================

// Plus icon for new user button
export const PlusIcon = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />`;

// Search icon
export const SearchIcon = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />`;

// Users group icon for empty state
export const UsersIcon = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />`;

// Edit icon
export const EditIcon = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />`;

// Key icon for password change
export const KeyIcon = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />`;

// Trash icon for delete
export const TrashIcon = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />`;

// =============================================================================
// Icon Getter
// =============================================================================

export const ICONS: Record<string, string> = {
  plus: PlusIcon,
  search: SearchIcon,
  users: UsersIcon,
  edit: EditIcon,
  key: KeyIcon,
  trash: TrashIcon,
};

export function getIcon(name: keyof typeof ICONS): string {
  return ICONS[name] || '';
}

// =============================================================================
// Form Field Configuration
// =============================================================================

export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'checkbox';
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  pattern?: RegExp;
  errorMessage?: string;
}

export const USER_FORM_FIELDS: Record<string, FormFieldConfig> = {
  nombre_us: {
    name: 'nombre_us',
    label: 'Nombre',
    type: 'text',
    placeholder: 'Juan',
    required: true,
    errorMessage: 'El nombre es requerido',
  },
  apellido_us: {
    name: 'apellido_us',
    label: 'Apellido',
    type: 'text',
    placeholder: 'Pérez',
    required: true,
    errorMessage: 'El apellido es requerido',
  },
  email_us: {
    name: 'email_us',
    label: 'Email',
    type: 'email',
    placeholder: 'juan@ejemplo.com',
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    errorMessage: 'Email inválido',
  },
  password: {
    name: 'password',
    label: 'Contraseña',
    type: 'password',
    placeholder: 'Mínimo 6 caracteres',
    minLength: 6,
    errorMessage: 'La contraseña debe tener al menos 6 caracteres',
  },
  id_rol: {
    name: 'id_rol',
    label: 'Rol',
    type: 'select',
    required: true,
    errorMessage: 'Debe seleccionar un rol',
  },
  activo: {
    name: 'activo',
    label: 'Usuario activo',
    type: 'checkbox',
  },
};

// =============================================================================
// Validation Rules
// =============================================================================

export const validateUsuarioForm = (
  formData: Record<string, any>,
  isEditing: boolean = false
): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Nombre
  if (!formData.nombre_us?.trim()) {
    errors.nombre_us = 'El nombre es requerido';
  }

  // Apellido
  if (!formData.apellido_us?.trim()) {
    errors.apellido_us = 'El apellido es requerido';
  }

  // Email
  if (!formData.email_us?.trim()) {
    errors.email_us = 'El email es requerido';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_us)) {
    errors.email_us = 'Email inválido';
  }

  // Password (only required when creating)
  if (!isEditing) {
    if (!formData.password?.trim()) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
  }

  // Rol
  if (!formData.id_rol || formData.id_rol === 0) {
    errors.id_rol = 'Debe seleccionar un rol';
  }

  return errors;
};

// =============================================================================
// Password Validation
// =============================================================================

export const validatePassword = (password: string): string | null => {
  if (!password.trim()) {
    return 'La contraseña no puede estar vacía';
  }
  if (password.length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres';
  }
  return null;
};
