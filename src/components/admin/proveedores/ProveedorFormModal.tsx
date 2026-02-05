/**
 * ProveedorFormModal Component
 * Unified modal for creating and editing providers
 */
import React, { memo } from 'react';
import { type ProveedorInput } from '../../../lib/api';
import Modal from '../../ui/Modal';
import { PROVEEDOR_FORM_FIELDS } from './constants';

// =============================================================================
// Types
// =============================================================================

interface ProveedorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<boolean>;
  formData: ProveedorInput;
  setFormData: React.Dispatch<React.SetStateAction<ProveedorInput>>;
  formErrors: Record<string, string>;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
}

// =============================================================================
// Form Field Component (Memoized)
// =============================================================================

interface FormFieldProps {
  label: string;
  type: string;
  value: string | boolean;
  onChange: (value: string | boolean) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
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
  rows,
}: FormFieldProps) {
  const inputClasses = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
    error ? 'border-red-500' : 'border-gray-300'
  }`;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          className={inputClasses}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
        />
      ) : (
        <input
          type={type}
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          className={inputClasses}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
});

// =============================================================================
// Main Component
// =============================================================================

export const ProveedorFormModal = memo(function ProveedorFormModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  formErrors,
  isSubmitting,
  mode,
}: ProveedorFormModalProps) {
  const title = mode === 'create' ? 'Crear Nuevo Proveedor' : 'Editar Proveedor';
  const submitText = mode === 'create' ? 'Crear Proveedor' : 'Guardar Cambios';
  const loadingText = mode === 'create' ? 'Creando...' : 'Guardando...';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSubmit(e);
    if (success) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {PROVEEDOR_FORM_FIELDS.map((field) => (
          <FormField
            key={field.name}
            label={field.label}
            type={field.type}
            value={formData[field.name as keyof ProveedorInput] as string}
            onChange={(value) => setFormData((prev) => ({ ...prev, [field.name]: value }))}
            error={formErrors[field.name]}
            placeholder={field.placeholder}
            required={field.required}
            disabled={isSubmitting}
            rows={'rows' in field ? field.rows : undefined}
          />
        ))}

        <div className="flex items-center">
          <input
            type="checkbox"
            id={`activo-${mode}`}
            checked={formData.activo}
            onChange={(e) => setFormData((prev) => ({ ...prev, activo: e.target.checked }))}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            disabled={isSubmitting}
          />
          <label htmlFor={`activo-${mode}`} className="ml-2 block text-sm text-gray-700">
            Proveedor activo
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-action btn-action-primary flex-1"
          >
            {isSubmitting ? loadingText : submitText}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="btn-action btn-action-outline flex-1"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
});
