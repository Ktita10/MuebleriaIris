/**
 * ClienteFormModal Component
 * Unified modal for creating and editing clientes
 */
import Modal from '../../ui/Modal';
import type { ClienteInput } from '../../../lib/api';

// =============================================================================
// Types
// =============================================================================

interface ClienteFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  formData: ClienteInput;
  setFormData: React.Dispatch<React.SetStateAction<ClienteInput>>;
  formErrors: Record<string, string>;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => Promise<boolean>;
  onClose: () => void;
}

// =============================================================================
// Main Component
// =============================================================================

export function ClienteFormModal({
  isOpen,
  mode,
  formData,
  setFormData,
  formErrors,
  isSubmitting,
  onSubmit,
  onClose,
}: ClienteFormModalProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(e);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Crear Nuevo Cliente' : 'Editar Cliente'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre y Apellido */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nombre_cliente}
              onChange={(e) => setFormData({ ...formData, nombre_cliente: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                formErrors.nombre_cliente ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Juan"
              disabled={isSubmitting}
            />
            {formErrors.nombre_cliente && (
              <p className="mt-1 text-sm text-red-600">{formErrors.nombre_cliente}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellido <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.apellido_cliente}
              onChange={(e) => setFormData({ ...formData, apellido_cliente: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                formErrors.apellido_cliente ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Pérez"
              disabled={isSubmitting}
            />
            {formErrors.apellido_cliente && (
              <p className="mt-1 text-sm text-red-600">{formErrors.apellido_cliente}</p>
            )}
          </div>
        </div>

        {/* DNI/CUIT y Teléfono */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              DNI/CUIT <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.dni_cuit}
              onChange={(e) => setFormData({ ...formData, dni_cuit: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                formErrors.dni_cuit ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="12345678"
              disabled={isSubmitting}
            />
            {formErrors.dni_cuit && (
              <p className="mt-1 text-sm text-red-600">{formErrors.dni_cuit}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                formErrors.telefono ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="+54 11 1234-5678"
              disabled={isSubmitting}
            />
            {formErrors.telefono && (
              <p className="mt-1 text-sm text-red-600">{formErrors.telefono}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email_cliente}
            onChange={(e) => setFormData({ ...formData, email_cliente: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              formErrors.email_cliente ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="juan@example.com"
            disabled={isSubmitting}
          />
          {formErrors.email_cliente && (
            <p className="mt-1 text-sm text-red-600">{formErrors.email_cliente}</p>
          )}
        </div>

        {/* Dirección */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dirección <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.direccion_cliente}
            onChange={(e) => setFormData({ ...formData, direccion_cliente: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              formErrors.direccion_cliente ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Calle 123"
            disabled={isSubmitting}
          />
          {formErrors.direccion_cliente && (
            <p className="mt-1 text-sm text-red-600">{formErrors.direccion_cliente}</p>
          )}
        </div>

        {/* Ciudad, Provincia y Código Postal */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ciudad <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.ciudad_cliente}
              onChange={(e) => setFormData({ ...formData, ciudad_cliente: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                formErrors.ciudad_cliente ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Buenos Aires"
              disabled={isSubmitting}
            />
            {formErrors.ciudad_cliente && (
              <p className="mt-1 text-sm text-red-600">{formErrors.ciudad_cliente}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provincia <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.provincia_cliente}
              onChange={(e) => setFormData({ ...formData, provincia_cliente: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                formErrors.provincia_cliente ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Buenos Aires"
              disabled={isSubmitting}
            />
            {formErrors.provincia_cliente && (
              <p className="mt-1 text-sm text-red-600">{formErrors.provincia_cliente}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código Postal <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.codigo_postal}
              onChange={(e) => setFormData({ ...formData, codigo_postal: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                formErrors.codigo_postal ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="1000"
              disabled={isSubmitting}
            />
            {formErrors.codigo_postal && (
              <p className="mt-1 text-sm text-red-600">{formErrors.codigo_postal}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-action btn-action-primary flex-1"
          >
            {isSubmitting
              ? mode === 'create'
                ? 'Creando...'
                : 'Guardando...'
              : mode === 'create'
              ? 'Crear Cliente'
              : 'Guardar Cambios'}
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
}
