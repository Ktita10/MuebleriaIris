/**
 * ProveedoresManager Component
 * 
 * Main admin component for managing proveedores (suppliers).
 * Refactored to use extracted components and useEntityManager hook for better maintainability.
 * 
 * Original: 563 lines
 * After refactor: ~180 lines
 */
import { useState, useCallback } from 'react';
import { proveedoresApi, type Proveedor, type ProveedorInput } from '../../lib/api';
import { useEntityManager } from '../../hooks/useEntityManager';
import {
  validateProveedorForm,
  INITIAL_PROVEEDOR_FORM,
  ICONS,
  ProveedorTable,
  ProveedorFormModal,
} from './proveedores';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ErrorAlert, SuccessAlert } from '../ui/Alerts';
import { LoadingSpinner } from '../ui/LoadingSpinner';

// =============================================================================
// Main Component
// =============================================================================

export function ProveedoresManager() {
  // ---------------------------------------------------------------------------
  // useEntityManager for CRUD operations
  // ---------------------------------------------------------------------------
  const manager = useEntityManager<Proveedor, ProveedorInput & Record<string, unknown>>({
    entityName: 'proveedor',
    fetchAll: () => proveedoresApi.getAll(),
    create: (data) => proveedoresApi.create(data),
    update: (id, data) => proveedoresApi.update(id, data),
    remove: async (id) => {
      await proveedoresApi.delete(id);
    },
    getEntityId: (proveedor) => proveedor.id,
    initialFormData: INITIAL_PROVEEDOR_FORM as ProveedorInput & Record<string, unknown>,
    validateForm: validateProveedorForm,
    mapEntityToForm: (proveedor) => ({
      nombre_empresa: proveedor.nombre_empresa,
      contacto_nombre: proveedor.contacto_nombre,
      telefono: proveedor.telefono,
      email: proveedor.email,
      direccion: proveedor.direccion,
      activo: proveedor.activo,
    }),
    filterFn: (proveedor, searchTerm) => {
      const term = searchTerm.toLowerCase();
      return (
        proveedor.nombre_empresa.toLowerCase().includes(term) ||
        proveedor.contacto_nombre.toLowerCase().includes(term) ||
        proveedor.email.toLowerCase().includes(term)
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

  const handleOpenEditModal = useCallback((proveedor: Proveedor) => {
    manager.selectForEdit(proveedor);
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

  const handleOpenDeleteDialog = useCallback((proveedor: Proveedor) => {
    manager.selectForDelete(proveedor);
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
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Proveedores</h2>
          <p className="text-gray-500">{manager.items.length} proveedores en total</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="btn-action btn-action-primary"
        >
          {ICONS.PlusIcon}
          Nuevo Proveedor
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="relative">
          {ICONS.SearchIcon}
          <input
            type="text"
            placeholder="Buscar por empresa, contacto o email..."
            value={manager.searchTerm}
            onChange={(e) => manager.setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Proveedores Table */}
      <ProveedorTable
        proveedores={manager.filteredItems}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteDialog}
      />

      {/* Form Modal (Create/Edit) */}
      <ProveedorFormModal
        isOpen={isFormModalOpen}
        mode={formMode}
        formData={manager.formData as ProveedorInput}
        setFormData={manager.setFormData as React.Dispatch<React.SetStateAction<ProveedorInput>>}
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
        title="Eliminar Proveedor"
        message={`¿Estás seguro de que deseas eliminar al proveedor "${manager.selectedItem?.nombre_empresa}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
        isLoading={manager.isSubmitting}
      />
    </div>
  );
}
