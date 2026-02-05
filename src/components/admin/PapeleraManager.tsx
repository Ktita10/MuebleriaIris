/**
 * PapeleraManager Component
 * Manages soft-deleted products (trash) with restore/permanent delete options
 */
"use client";

import { useState, useEffect } from 'react';
import { productosApi, type Producto } from '../../lib/api';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ErrorAlert, SuccessAlert } from '../ui/Alerts';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { PapeleraTable, ICONS } from './papelera';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PapeleraManager() {
  // State
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dialog state
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadProductos();
  }, []);

  // Auto-hide success messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const loadProductos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productosApi.getPapelera();
      setProductos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos eliminados');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // ACTION HANDLERS
  // ============================================================================

  const openRestoreDialog = (producto: Producto) => {
    setSelectedProducto(producto);
    setIsRestoreDialogOpen(true);
  };

  const openDeleteDialog = (producto: Producto) => {
    setSelectedProducto(producto);
    setIsDeleteDialogOpen(true);
  };

  const handleRestore = async () => {
    if (!selectedProducto) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await productosApi.restaurar(selectedProducto.id);
      setSuccess(`Producto "${selectedProducto.nombre}" restaurado exitosamente`);
      setIsRestoreDialogOpen(false);
      setSelectedProducto(null);
      loadProductos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al restaurar producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (!selectedProducto) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await productosApi.eliminarPermanente(selectedProducto.id);
      setSuccess(`Producto "${selectedProducto.nombre}" eliminado permanentemente`);
      setIsDeleteDialogOpen(false);
      setSelectedProducto(null);
      loadProductos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return <LoadingSpinner size="lg" message="Cargando papelera..." />;
  }

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      {success && <SuccessAlert message={success} onClose={() => setSuccess(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Papelera</h1>
          <p className="mt-1 text-sm text-gray-600">
            {productos.length} producto{productos.length !== 1 ? 's' : ''} eliminado
            {productos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <a
          href="/admin/productos"
          className="btn-action btn-action-outline"
          style={{ padding: '0.5rem 1rem' }}
        >
          {ICONS.BackIcon}
          Volver a Productos
        </a>
      </div>

      {/* Info Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex gap-3">
          {ICONS.WarningIcon}
          <div>
            <h3 className="font-medium text-yellow-800">Productos desactivados</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Los productos aqui fueron desactivados pero no eliminados permanentemente. Puede
              restaurarlos para que vuelvan a estar disponibles en el catalogo. Los productos con
              ordenes asociadas no pueden eliminarse permanentemente.
            </p>
          </div>
        </div>
      </div>

      {/* Empty State / Table */}
      {productos.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          {ICONS.TrashIcon}
          <h3 className="text-lg font-medium text-gray-900 mb-2">La papelera esta vacia</h3>
          <p className="text-gray-500 mb-6">
            Los productos eliminados apareceran aqui para que puedas restaurarlos si es necesario.
          </p>
          <a
            href="/admin/productos"
            className="btn-action btn-action-primary"
            style={{ padding: '0.5rem 1rem' }}
          >
            Ir a Productos
          </a>
        </div>
      ) : (
        <PapeleraTable
          productos={productos}
          onRestore={openRestoreDialog}
          onDelete={openDeleteDialog}
        />
      )}

      {/* Restore Confirmation */}
      <ConfirmDialog
        isOpen={isRestoreDialogOpen}
        onClose={() => setIsRestoreDialogOpen(false)}
        onConfirm={handleRestore}
        title="Restaurar producto?"
        message={`El producto "${selectedProducto?.nombre}" volvera a estar disponible en el catalogo y podra venderse nuevamente.`}
        confirmText="Restaurar"
        cancelText="Cancelar"
        variant="info"
        isLoading={isSubmitting}
      />

      {/* Permanent Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handlePermanentDelete}
        title="Eliminar permanentemente?"
        message={`ATENCION: Esta accion NO se puede deshacer. El producto "${selectedProducto?.nombre}" y todas sus imagenes seran eliminados permanentemente de la base de datos.`}
        confirmText="Eliminar Permanentemente"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
