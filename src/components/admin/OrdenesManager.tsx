/**
 * OrdenesManager Component
 * 
 * Main admin component for managing orders.
 * Refactored to use extracted components and custom hook for better maintainability.
 * 
 * Original: 841 lines
 * After refactor: ~150 lines
 */
import { useState, useCallback } from 'react';
import { type Orden } from '../../lib/api';
import { useOrdenes } from '../../hooks/useOrdenes';
import {
  ESTADOS,
  ESTADO_LABELS,
  ICONS,
  OrdenStatsCards,
  OrdenTable,
  OrdenDetailsModal,
  OrdenStatusModal,
  CreateOrderModal,
  type EstadoOrden,
} from './ordenes';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ErrorAlert, SuccessAlert } from '../ui/Alerts';
import { LoadingSpinner } from '../ui/LoadingSpinner';

// =============================================================================
// Main Component
// =============================================================================

export function OrdenesManager() {
  // ---------------------------------------------------------------------------
  // Custom Hook for all data management
  // ---------------------------------------------------------------------------
  const {
    ordenes,
    filteredOrdenes,
    stats,
    loading,
    error,
    success,
    isSubmitting,
    searchTerm,
    estadoFilter,
    selectedOrden,
    ordenDetalles,
    loadingDetails,
    setSearchTerm,
    setEstadoFilter,
    setError,
    setSuccess,
    loadOrdenDetails,
    updateEstado,
    cancelOrden,
    selectOrden,
    clearSelection,
    refresh,
  } = useOrdenes();

  // ---------------------------------------------------------------------------
  // Modal State
  // ---------------------------------------------------------------------------
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleViewDetails = useCallback(async (orden: Orden) => {
    selectOrden(orden);
    setIsDetailsModalOpen(true);
    await loadOrdenDetails(orden.id);
  }, [selectOrden, loadOrdenDetails]);

  const handleOpenStatusModal = useCallback((orden: Orden) => {
    selectOrden(orden);
    setIsStatusModalOpen(true);
  }, [selectOrden]);

  const handleOpenCancelDialog = useCallback((orden: Orden) => {
    selectOrden(orden);
    setIsCancelDialogOpen(true);
  }, [selectOrden]);

  const handleCloseDetailsModal = useCallback(() => {
    setIsDetailsModalOpen(false);
    clearSelection();
  }, [clearSelection]);

  const handleCloseStatusModal = useCallback(() => {
    setIsStatusModalOpen(false);
    clearSelection();
  }, [clearSelection]);

  const handleCloseCancelDialog = useCallback(() => {
    setIsCancelDialogOpen(false);
    clearSelection();
  }, [clearSelection]);

  const handleCancelOrden = useCallback(async () => {
    const success = await cancelOrden();
    if (success) {
      setIsCancelDialogOpen(false);
    }
  }, [cancelOrden]);

  const handleOrderCreated = useCallback(() => {
    refresh();
    setSuccess("Orden creada exitosamente");
  }, [refresh, setSuccess]);

  // ---------------------------------------------------------------------------
  // Loading State
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div>
      {/* Alerts */}
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      {success && <SuccessAlert message={success} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Órdenes</h2>
          <p className="text-gray-500">{ordenes.length} órdenes en total</p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-action btn-action-success"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            dangerouslySetInnerHTML={{ __html: ICONS.plus }}
          />
          Nueva Orden
        </button>
      </div>

      {/* Stats Cards */}
      <OrdenStatsCards stats={stats} />

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                dangerouslySetInnerHTML={{ __html: ICONS.search }}
              />
              <input
                type="text"
                placeholder="Buscar por cliente, vendedor o ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={estadoFilter}
            onChange={e => setEstadoFilter(e.target.value as EstadoOrden | '')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Todos los estados</option>
            {ESTADOS.map(estado => (
              <option key={estado} value={estado}>{ESTADO_LABELS[estado]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <OrdenTable
        ordenes={filteredOrdenes}
        onViewDetails={handleViewDetails}
        onChangeStatus={handleOpenStatusModal}
        onCancel={handleOpenCancelDialog}
      />

      {/* Details Modal */}
      <OrdenDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        orden={selectedOrden}
        detalles={ordenDetalles}
        loadingDetails={loadingDetails}
      />

      {/* Status Update Modal */}
      <OrdenStatusModal
        isOpen={isStatusModalOpen}
        onClose={handleCloseStatusModal}
        orden={selectedOrden}
        onUpdateStatus={updateEstado}
        isSubmitting={isSubmitting}
      />

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isCancelDialogOpen}
        onClose={handleCloseCancelDialog}
        onConfirm={handleCancelOrden}
        title="Cancelar Orden"
        message={`¿Estás seguro de que deseas cancelar la orden #${selectedOrden?.id}? El stock de los productos será devuelto al inventario. Esta acción no se puede deshacer.`}
        confirmText="Cancelar Orden"
        variant="danger"
        isLoading={isSubmitting}
      />

      {/* Create Order Modal */}
      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onOrderCreated={handleOrderCreated}
      />
    </div>
  );
}
