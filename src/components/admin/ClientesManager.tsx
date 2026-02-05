/**
 * ClientesManager Component
 * 
 * Main admin component for managing clientes (clients).
 * Refactored to use extracted components and useEntityManager hook for better maintainability.
 * 
 * Original: 492 lines
 * After refactor: ~200 lines
 */
import { useState, useCallback } from 'react';
import { clientesApi, type Cliente, type ClienteInput } from '../../lib/api';
import { useEntityManager } from '../../hooks/useEntityManager';
import {
  validateClienteForm,
  INITIAL_CLIENTE_FORM,
  ICONS,
  ClienteTable,
  ClienteFormModal,
} from './clientes';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ErrorAlert, SuccessAlert } from '../ui/Alerts';
import { LoadingSpinner } from '../ui/LoadingSpinner';

// =============================================================================
// Main Component
// =============================================================================

export function ClientesManager() {
  // ---------------------------------------------------------------------------
  // useEntityManager for CRUD operations
  // ---------------------------------------------------------------------------
  const manager = useEntityManager<Cliente, ClienteInput & Record<string, unknown>>({
    entityName: 'cliente',
    fetchAll: () => clientesApi.getAll(),
    create: (data) => clientesApi.create(data),
    update: (id, data) => clientesApi.update(id, data),
    remove: async (id) => {
      await clientesApi.delete(id);
    },
    getEntityId: (cliente) => cliente.id,
    initialFormData: INITIAL_CLIENTE_FORM as ClienteInput & Record<string, unknown>,
    validateForm: validateClienteForm,
    mapEntityToForm: (cliente) => ({
      nombre_cliente: cliente.nombre,
      apellido_cliente: cliente.apellido,
      dni_cuit: cliente.dni_cuit,
      email_cliente: cliente.email,
      telefono: cliente.telefono,
      direccion_cliente: cliente.direccion,
      ciudad_cliente: cliente.ciudad,
      codigo_postal: cliente.codigo_postal,
      provincia_cliente: cliente.provincia,
    }),
    filterFn: (cliente, searchTerm) => {
      const term = searchTerm.toLowerCase();
      const fullName = `${cliente.nombre} ${cliente.apellido}`.toLowerCase();
      return (
        fullName.includes(term) ||
        cliente.email.toLowerCase().includes(term) ||
        cliente.dni_cuit.includes(term)
      );
    },
  });

  // ---------------------------------------------------------------------------
  // Modal State
  // ---------------------------------------------------------------------------
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleOpenCreateModal = useCallback(() => {
    manager.resetForm();
    setFormMode('create');
    setIsFormModalOpen(true);
  }, [manager.resetForm]);

  const handleOpenEditModal = useCallback((cliente: Cliente) => {
    manager.selectForEdit(cliente);
    setFormMode('edit');
    setIsFormModalOpen(true);
  }, [manager.selectForEdit]);

  const handleCloseFormModal = useCallback(() => {
    setIsFormModalOpen(false);
    manager.clearSelection();
  }, [manager.clearSelection]);

  const handleFormSubmit = useCallback(async (e: React.FormEvent): Promise<boolean> => {
    const success = formMode === 'create' 
      ? await manager.handleCreate(e)
      : await manager.handleUpdate(e);
    
    if (success) {
      setIsFormModalOpen(false);
    }
    return success;
  }, [formMode, manager.handleCreate, manager.handleUpdate]);

  const handleOpenDeleteDialog = useCallback((cliente: Cliente) => {
    manager.selectForDelete(cliente);
    setIsDeleteDialogOpen(true);
  }, [manager.selectForDelete]);

  const handleCloseDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    manager.clearSelection();
  }, [manager.clearSelection]);

  const handleDelete = useCallback(async () => {
    const success = await manager.handleDelete();
    if (success) {
      setIsDeleteDialogOpen(false);
    }
  }, [manager.handleDelete]);

  // ---------------------------------------------------------------------------
  // Loading State
  // ---------------------------------------------------------------------------
  if (manager.loading) {
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
      {manager.error && <ErrorAlert message={manager.error} onClose={() => manager.setError(null)} />}
      {manager.success && <SuccessAlert message={manager.success} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h2>
          <p className="text-gray-500">{manager.items.length} clientes en total</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="btn-action btn-action-primary"
        >
          {ICONS.PlusIcon}
          Nuevo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="relative">
          {ICONS.SearchIcon}
          <input
            type="text"
            placeholder="Buscar por nombre, email o DNI..."
            value={manager.searchTerm}
            onChange={(e) => manager.setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Clientes Table */}
      <ClienteTable
        clientes={manager.filteredItems}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteDialog}
      />

      {/* Form Modal (Create/Edit) */}
      <ClienteFormModal
        isOpen={isFormModalOpen}
        mode={formMode}
        formData={manager.formData as ClienteInput}
        setFormData={manager.setFormData as React.Dispatch<React.SetStateAction<ClienteInput>>}
        formErrors={manager.formErrors}
        isSubmitting={manager.isSubmitting}
        onSubmit={handleFormSubmit}
        onClose={handleCloseFormModal}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDelete}
        title="Eliminar Cliente"
        message={`¿Estás seguro de que deseas eliminar al cliente "${manager.selectedItem?.nombre} ${manager.selectedItem?.apellido}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
        isLoading={manager.isSubmitting}
      />
    </div>
  );
}
