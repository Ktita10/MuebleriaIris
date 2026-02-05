/**
 * CategoriaFormModal Component
 * Unified modal for creating and editing categorías
 */
import Modal from '../../ui/Modal';
import type { CategoriaInput } from '../../../lib/api';

// =============================================================================
// Types
// =============================================================================

interface CategoriaFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  formData: CategoriaInput;
  setFormData: React.Dispatch<React.SetStateAction<CategoriaInput>>;
  formErrors: Record<string, string>;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => Promise<boolean>;
  onClose: () => void;
}

// =============================================================================
// Main Component
// =============================================================================

export function CategoriaFormModal({
  isOpen,
  mode,
  formData,
  setFormData,
  formErrors,
  isSubmitting,
  onSubmit,
  onClose,
}: CategoriaFormModalProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(e);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Nueva Categoría' : 'Editar Categoría'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              formErrors.nombre ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ej: Sillas"
            maxLength={100}
            disabled={isSubmitting}
          />
          {formErrors.nombre && (
            <p className="mt-1 text-sm text-red-600">{formErrors.nombre}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {formData.nombre.length}/100 caracteres
          </p>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              formErrors.descripcion ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Descripción de la categoría"
            rows={4}
            maxLength={500}
            disabled={isSubmitting}
          />
          {formErrors.descripcion && (
            <p className="mt-1 text-sm text-red-600">{formErrors.descripcion}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {formData.descripcion.length}/500 caracteres
          </p>
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
              ? 'Crear Categoría'
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
