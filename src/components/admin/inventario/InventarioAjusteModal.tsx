/**
 * InventarioAjusteModal Component
 * Modal for adjusting inventory stock (add/remove)
 */
import React from 'react';
import Modal from '../../ui/Modal';
import { getImageUrl, type InventarioAjuste, type Inventario, type Producto } from '../../../lib/api';
import { ICONS } from './constants';

// ============================================================================
// TYPES
// ============================================================================

interface InventarioExtendido extends Inventario {
  producto?: Producto;
}

interface InventarioAjusteModalProps {
  isOpen: boolean;
  ajusteType: 'add' | 'remove';
  selectedInventario: InventarioExtendido | null;
  formData: InventarioAjuste;
  setFormData: React.Dispatch<React.SetStateAction<InventarioAjuste>>;
  formErrors: Record<string, string>;
  isSubmitting: boolean;
  onSubmit: () => void;
  onClose: () => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const InventarioAjusteModal: React.FC<InventarioAjusteModalProps> = ({
  isOpen,
  ajusteType,
  selectedInventario,
  formData,
  setFormData,
  formErrors,
  isSubmitting,
  onSubmit,
  onClose,
}) => {
  if (!selectedInventario) return null;

  const newStock =
    ajusteType === 'add'
      ? selectedInventario.stock + formData.cantidad
      : selectedInventario.stock - formData.cantidad;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${ajusteType === 'add' ? 'Agregar' : 'Remover'} Stock`}
    >
      <div className="space-y-4">
        {/* Product Info */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            {selectedInventario.producto?.imagen_principal ? (
              <img
                src={getImageUrl(selectedInventario.producto.imagen_principal)}
                alt={selectedInventario.producto.nombre}
                className="w-16 h-16 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900">{selectedInventario.producto?.nombre}</p>
              <p className="text-sm text-gray-600">SKU: {selectedInventario.producto?.sku}</p>
            </div>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-300">
            <span className="text-sm text-gray-600">Stock actual:</span>
            <span className="text-lg font-bold text-gray-900">
              {selectedInventario.stock} unidades
            </span>
          </div>
        </div>

        {/* Cantidad Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cantidad {ajusteType === 'add' ? 'a agregar' : 'a remover'}{' '}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            max={ajusteType === 'remove' ? selectedInventario.stock : undefined}
            value={formData.cantidad === 0 ? '' : formData.cantidad}
            onChange={(e) =>
              setFormData({ ...formData, cantidad: parseInt(e.target.value) || 0 })
            }
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              formErrors.cantidad ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0"
          />
          {formErrors.cantidad && (
            <p className="mt-1 text-sm text-red-600">{formErrors.cantidad}</p>
          )}
          {ajusteType === 'remove' && (
            <p className="mt-1 text-xs text-gray-500">
              Máximo: {selectedInventario.stock} unidades
            </p>
          )}
        </div>

        {/* Razón Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Razón del ajuste <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.razon}
            onChange={(e) => setFormData({ ...formData, razon: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              formErrors.razon ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={
              ajusteType === 'add'
                ? 'Ej: Reposición de stock, nueva compra'
                : 'Ej: Producto dañado, ajuste por inventario'
            }
            rows={3}
          />
          {formErrors.razon && <p className="mt-1 text-sm text-red-600">{formErrors.razon}</p>}
        </div>

        {/* New Stock Preview */}
        {formData.cantidad > 0 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Nuevo stock:</strong> {newStock} unidades
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className={`btn-action ${
              ajusteType === 'add' ? 'btn-action-success' : 'btn-action-danger'
            } flex-1 justify-center`}
          >
            {isSubmitting
              ? 'Procesando...'
              : `${ajusteType === 'add' ? 'Agregar' : 'Remover'} Stock`}
          </button>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="btn-action btn-action-outline flex-1 justify-center"
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
};
