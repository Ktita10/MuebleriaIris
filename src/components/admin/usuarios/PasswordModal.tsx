/**
 * PasswordModal Component
 * Modal for changing user password
 */
import React, { memo, useState, useEffect } from 'react';
import { type Usuario } from '../../../lib/api';
import { validatePassword } from './constants';
import Modal from '../../ui/Modal';

// =============================================================================
// Types
// =============================================================================

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuario: Usuario | null;
  onChangePassword: (newPassword: string) => Promise<boolean>;
  isSubmitting: boolean;
}

// =============================================================================
// Main Component
// =============================================================================

export const PasswordModal = memo(function PasswordModal({
  isOpen,
  onClose,
  usuario,
  onChangePassword,
  isSubmitting,
}: PasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setNewPassword('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password
    const validationError = validatePassword(newPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    const success = await onChangePassword(newPassword);
    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cambiar Contraseña"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* User Info */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Usuario:</strong> {usuario?.nombre} {usuario?.apellido}
          </p>
          <p className="text-sm text-gray-600">{usuario?.email}</p>
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nueva Contraseña <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setError(null); // Clear error on input change
            }}
            disabled={isSubmitting}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Mínimo 6 caracteres"
            autoFocus
          />
          {error ? (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          ) : (
            <p className="mt-1 text-xs text-gray-500">
              La contraseña debe tener al menos 6 caracteres
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !newPassword.trim()}
            className="btn-action btn-action-warning flex-1 justify-center"
          >
            {isSubmitting ? 'Cambiando...' : 'Cambiar Contraseña'}
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
