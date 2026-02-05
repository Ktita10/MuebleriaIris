/**
 * OrdenStatusModal Component
 * Modal for updating the status of an order
 */
import React, { memo, useState, useEffect } from 'react';
import { type Orden } from '../../../lib/api';
import { ESTADOS, ESTADO_LABELS, type EstadoOrden } from './constants';
import Modal from '../../ui/Modal';

// =============================================================================
// Types
// =============================================================================

interface OrdenStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  orden: Orden | null;
  onUpdateStatus: (newEstado: string) => Promise<boolean>;
  isSubmitting: boolean;
}

// =============================================================================
// Main Component
// =============================================================================

export const OrdenStatusModal = memo(function OrdenStatusModal({
  isOpen,
  onClose,
  orden,
  onUpdateStatus,
  isSubmitting,
}: OrdenStatusModalProps) {
  const [newEstado, setNewEstado] = useState<string>('');

  // Reset estado when orden changes
  useEffect(() => {
    if (orden) {
      setNewEstado(orden.estado);
    }
  }, [orden]);

  const handleClose = () => {
    setNewEstado('');
    onClose();
  };

  const handleSubmit = async () => {
    const success = await onUpdateStatus(newEstado);
    if (success) {
      handleClose();
    }
  };

  // Filter out 'cancelada' from available states for status updates
  const availableStates = ESTADOS.filter(e => e !== 'cancelada');

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Actualizar Estado de Orden"
    >
      <div className="space-y-4">
        {orden && (
          <>
            {/* Order Info */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Orden:</strong> #{orden.id} - {orden.cliente.nombre_cliente} {orden.cliente.apellido_cliente}
              </p>
              <p className="text-sm text-gray-600">
                Estado actual: <span className="font-medium">{ESTADO_LABELS[orden.estado as EstadoOrden]}</span>
              </p>
            </div>

            {/* State Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nuevo Estado <span className="text-red-500">*</span>
              </label>
              <select
                value={newEstado}
                onChange={e => setNewEstado(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                {availableStates.map(estado => (
                  <option key={estado} value={estado}>
                    {ESTADO_LABELS[estado]}
                  </option>
                ))}
              </select>
            </div>

            {/* Info Note */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> El cambio de estado afectará el seguimiento de la orden.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="btn-action btn-action-outline flex-1 justify-center"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !newEstado}
                className="btn-action btn-action-primary flex-1 justify-center"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Actualizando...
                  </span>
                ) : 'Actualizar Estado'}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
});
