/**
 * UsuarioFormModal Component
 * Unified modal for creating and editing users
 */
import React, { memo } from 'react';
import { type UsuarioInput, type Rol } from '../../../lib/api';
import Modal from '../../ui/Modal';
import { USER_FORM_FIELDS } from './constants';

// =============================================================================
// Types
// =============================================================================

interface UsuarioFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<boolean>;
  formData: UsuarioInput;
  setFormData: React.Dispatch<React.SetStateAction<UsuarioInput>>;
  formErrors: Record<string, string>;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
  roles: Rol[];
}

// =============================================================================
// Form Field Component (Memoized)
// =============================================================================

interface FormFieldProps {
  label: string;
  type: string;
  value: string | number | boolean;
  onChange: (value: any) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

const FormField = memo(function FormField({
  label,
  type,
  value,
  onChange,
  error,
  placeholder,
  required,
  disabled,
}: FormFieldProps) {
  const inputId = `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

  if (type === 'checkbox') {
    return (
      <div className="flex items-center">
        <input
          type="checkbox"
          id={inputId}
          checked={value as boolean}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor={inputId} className="ml-2 block text-sm text-gray-700">
          {label}
        </label>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value as string | number}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholder={placeholder}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
});

// =============================================================================
// Main Component
// =============================================================================

export const UsuarioFormModal = memo(function UsuarioFormModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  formErrors,
  isSubmitting,
  mode,
  roles,
}: UsuarioFormModalProps) {
  const isEditing = mode === 'edit';
  const title = isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario';
  const submitText = isSubmitting 
    ? (isEditing ? 'Guardando...' : 'Creando...') 
    : (isEditing ? 'Guardar Cambios' : 'Crear Usuario');

  const handleFormSubmit = async (e: React.FormEvent) => {
    const success = await onSubmit(e);
    if (success) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleFormSubmit} className="space-y-4">
        {/* Nombre */}
        <FormField
          label={USER_FORM_FIELDS.nombre_us.label}
          type={USER_FORM_FIELDS.nombre_us.type}
          value={formData.nombre_us}
          onChange={(value) => setFormData({ ...formData, nombre_us: value })}
          error={formErrors.nombre_us}
          placeholder={USER_FORM_FIELDS.nombre_us.placeholder}
          required={USER_FORM_FIELDS.nombre_us.required}
          disabled={isSubmitting}
        />

        {/* Apellido */}
        <FormField
          label={USER_FORM_FIELDS.apellido_us.label}
          type={USER_FORM_FIELDS.apellido_us.type}
          value={formData.apellido_us}
          onChange={(value) => setFormData({ ...formData, apellido_us: value })}
          error={formErrors.apellido_us}
          placeholder={USER_FORM_FIELDS.apellido_us.placeholder}
          required={USER_FORM_FIELDS.apellido_us.required}
          disabled={isSubmitting}
        />

        {/* Email */}
        <FormField
          label={USER_FORM_FIELDS.email_us.label}
          type={USER_FORM_FIELDS.email_us.type}
          value={formData.email_us}
          onChange={(value) => setFormData({ ...formData, email_us: value })}
          error={formErrors.email_us}
          placeholder={USER_FORM_FIELDS.email_us.placeholder}
          required={USER_FORM_FIELDS.email_us.required}
          disabled={isSubmitting}
        />

        {/* Password (only show when creating) */}
        {!isEditing && (
          <FormField
            label={USER_FORM_FIELDS.password.label}
            type={USER_FORM_FIELDS.password.type}
            value={formData.password || ''}
            onChange={(value) => setFormData({ ...formData, password: value })}
            error={formErrors.password}
            placeholder={USER_FORM_FIELDS.password.placeholder}
            required
            disabled={isSubmitting}
          />
        )}

        {/* Rol */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {USER_FORM_FIELDS.id_rol.label} <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.id_rol}
            onChange={(e) => setFormData({ ...formData, id_rol: parseInt(e.target.value) })}
            disabled={isSubmitting}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              formErrors.id_rol ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value={0}>Seleccionar rol...</option>
            {roles.map((rol) => (
              <option key={rol.id} value={rol.id}>
                {rol.nombre}
              </option>
            ))}
          </select>
          {formErrors.id_rol && <p className="mt-1 text-sm text-red-600">{formErrors.id_rol}</p>}
        </div>

        {/* Activo */}
        <FormField
          label={USER_FORM_FIELDS.activo.label}
          type={USER_FORM_FIELDS.activo.type}
          value={formData.activo ?? true}
          onChange={(value) => setFormData({ ...formData, activo: value })}
          disabled={isSubmitting}
        />

        {/* Info note for editing */}
        {isEditing && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Para cambiar la contraseña, use el botón "Cambiar contraseña" en la tabla.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-action btn-action-primary flex-1 justify-center"
          >
            {submitText}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="btn-action btn-action-outline flex-1 justify-center"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
});
