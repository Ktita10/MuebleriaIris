/**
 * CategoriasManager Component
 * 
 * Main admin component for managing categorías (categories).
 * Refactored to use extracted components and useEntityManager hook for better maintainability.
 * 
 * Original: 391 lines
 * After refactor: ~150 lines
 */
import { useState, useCallback } from 'react';
import { categoriasApi, type Categoria, type CategoriaInput } from '../../lib/api';
import { useEntityManager } from '../../hooks/useEntityManager';
import {
  validateCategoriaForm,
  INITIAL_CATEGORIA_FORM,
  ICONS,
  CategoriaGrid,
  CategoriaFormModal,
} from './categorias';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ErrorAlert, SuccessAlert } from '../ui/Alerts';
import { LoadingSpinner } from '../ui/LoadingSpinner';

// =============================================================================
// Main Component
// =============================================================================

export function CategoriasManager() {
  // ---------------------------------------------------------------------------
  // useEntityManager for CRUD operations
  // ---------------------------------------------------------------------------
  const manager = useEntityManager<Categoria, CategoriaInput & Record<string, unknown>>({
    entityName: 'categoría',
    fetchAll: () => categoriasApi.getAll(),
    create: (data) => categoriasApi.create(data),
    update: (id, data) => categoriasApi.update(id, data),
    remove: async (id) => {
      await categoriasApi.delete(id);
    },
    getEntityId: (categoria) => categoria.id,
    initialFormData: INITIAL_CATEGORIA_FORM as CategoriaInput & Record<string, unknown>,
    validateForm: validateCategoriaForm,
    mapEntityToForm: (categoria) => ({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
    }),
    filterFn: (categoria, searchTerm) => {
      const term = searchTerm.toLowerCase();
      return !!(
        categoria.nombre.toLowerCase().includes(term) ||
        (categoria.descripcion && categoria.descripcion.toLowerCase().includes(term))
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

  const handleOpenEditModal = useCallback((categoria: Categoria) => {
    manager.selectForEdit(categoria);
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

  const handleOpenDeleteDialog = useCallback((categoria: Categoria) => {
    manager.selectForDelete(categoria);
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
    <div className="space-y-6">
      {/* Alerts */}
      {manager.error && <ErrorAlert message={manager.error} onClose={() => manager.setError(null)} />}
      {manager.success && <SuccessAlert message={manager.success} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="mt-1 text-sm text-gray-600">
            {manager.items.length} categorías en total
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="btn-action btn-action-primary"
        >
          {ICONS.PlusIcon}
          Nueva Categoría
        </button>
      </div>

      {/* Categories Grid */}
      <CategoriaGrid
        categorias={manager.filteredItems}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteDialog}
      />

      {/* Form Modal (Create/Edit) */}
      <CategoriaFormModal
        isOpen={isFormModalOpen}
        mode={formMode}
        formData={manager.formData as CategoriaInput}
        setFormData={manager.setFormData as React.Dispatch<React.SetStateAction<CategoriaInput>>}
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
        title="Eliminar Categoría"
        message={`¿Estás seguro de que deseas eliminar la categoría "${manager.selectedItem?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
        isLoading={manager.isSubmitting}
      />
    </div>
  );
}
