/**
 * ProductosManager Component
 * Full CRUD operations for products with image upload
 * 
 * Refactored to use:
 * - useProductos hook for state management and CRUD operations
 * - useProductImages hook for image management
 * - ProductForm, ProductTable, ImageManager components
 * 
 * Applies react-best-practices skill patterns:
 * - rendering-hoist-jsx: Static SVG icons hoisted
 * - rerender-memo: Memoized components for performance
 * - async-parallel: Parallel data fetching on mount
 */
"use client";

import { useState, useCallback } from 'react';
import { useProductos } from '../../hooks/useProductos';
import { useProductImages } from '../../hooks/useProductImages';
import { ProductForm, ProductTable, ImageManager } from './productos';
import Modal from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ErrorAlert, SuccessAlert } from '../ui/Alerts';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import type { Producto } from '../../lib/api';

// Hoisted static SVG icons (rendering-hoist-jsx)
const PlusIcon = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const SearchIcon = (
  <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export function ProductosManager() {
  // Product state and operations
  const {
    productos,
    categorias,
    filteredProductos,
    loading,
    error,
    success,
    isSubmitting,
    formData,
    formErrors,
    selectedProducto,
    searchTerm,
    selectedCategoria,
    setSearchTerm,
    setSelectedCategoria,
    setFormData,
    setError,
    setSuccess,
    createProducto,
    updateProducto,
    deleteProducto,
    resetForm,
    selectForEdit,
    selectForDelete,
    clearSelection,
    refreshProductos,
  } = useProductos();

  // Image management
  const {
    productImages,
    uploadingImage,
    fileInputRef,
    loadProductImages,
    handleImageUpload,
    deleteImage,
    clearImages,
  } = useProductImages();

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Modal handlers
  const openCreateModal = useCallback(() => {
    resetForm();
    setIsCreateModalOpen(true);
  }, [resetForm]);

  const openEditModal = useCallback(
    (producto: Producto) => {
      selectForEdit(producto);
      setIsEditModalOpen(true);
    },
    [selectForEdit]
  );

  const openDeleteDialog = useCallback(
    (producto: Producto) => {
      selectForDelete(producto);
      setIsDeleteDialogOpen(true);
    },
    [selectForDelete]
  );

  const openImageModal = useCallback(
    async (producto: Producto) => {
      selectForDelete(producto); // Reuse to set selectedProducto
      setIsImageModalOpen(true);
      await loadProductImages(producto.id);
    },
    [selectForDelete, loadProductImages]
  );

  const closeFormModal = useCallback(() => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    clearSelection();
  }, [clearSelection]);

  const closeImageModal = useCallback(() => {
    setIsImageModalOpen(false);
    clearSelection();
    clearImages();
  }, [clearSelection, clearImages]);

  // Form submission handlers
  const handleCreate = useCallback(
    async (e: React.FormEvent) => {
      const success = await createProducto(e);
      if (success) setIsCreateModalOpen(false);
    },
    [createProducto]
  );

  const handleEdit = useCallback(
    async (e: React.FormEvent) => {
      const success = await updateProducto(e);
      if (success) setIsEditModalOpen(false);
    },
    [updateProducto]
  );

  const handleDelete = useCallback(async () => {
    const success = await deleteProducto();
    if (success) setIsDeleteDialogOpen(false);
  }, [deleteProducto]);

  // Image handlers with callbacks
  const handleImageUploadWithCallbacks = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!selectedProducto) return;
      await handleImageUpload(
        e,
        selectedProducto.id,
        () => {
          setSuccess('Imagen subida exitosamente');
          refreshProductos();
        },
        (error) => setError(error)
      );
    },
    [selectedProducto, handleImageUpload, setSuccess, refreshProductos, setError]
  );

  const handleImageDelete = useCallback(
    async (imageId: number) => {
      if (!selectedProducto) return;
      await deleteImage(
        imageId,
        selectedProducto.id,
        () => {
          setSuccess('Imagen eliminada exitosamente');
          refreshProductos();
        },
        (error) => setError(error)
      );
    },
    [selectedProducto, deleteImage, setSuccess, refreshProductos, setError]
  );

  // Form data change handler
  const handleFormChange = useCallback(
    (updates: Partial<typeof formData>) => {
      setFormData((prev) => ({ ...prev, ...updates }));
    },
    [setFormData]
  );

  // Empty message based on filters
  const emptyMessage = searchTerm || selectedCategoria
    ? 'No se encontraron productos'
    : 'No hay productos registrados';

  // Loading state
  if (loading) {
    return <LoadingSpinner size="lg" message="Cargando productos..." />;
  }

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      {success && <SuccessAlert message={success} onClose={() => setSuccess(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="mt-1 text-sm text-gray-600">
            {productos.length} productos en catálogo
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-action btn-action-primary"
          style={{ padding: '0.5rem 1rem' }}
        >
          {PlusIcon}
          Nuevo Producto
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {SearchIcon}
        </div>
        <select
          value={selectedCategoria || ''}
          onChange={(e) => setSelectedCategoria(e.target.value ? Number(e.target.value) : null)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Product Table */}
      <ProductTable
        productos={filteredProductos}
        onEdit={openEditModal}
        onDelete={openDeleteDialog}
        onManageImages={openImageModal}
        emptyMessage={emptyMessage}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={closeFormModal}
        title={isCreateModalOpen ? 'Nuevo Producto' : 'Editar Producto'}
        size="lg"
      >
        <ProductForm
          formData={formData}
          formErrors={formErrors}
          categorias={categorias}
          isSubmitting={isSubmitting}
          isEditMode={isEditModalOpen}
          onSubmit={isCreateModalOpen ? handleCreate : handleEdit}
          onCancel={closeFormModal}
          onChange={handleFormChange}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="¿Desactivar producto?"
        message={
          selectedProducto
            ? `El producto "${selectedProducto.nombre}" será desactivado (no eliminado). ${
                selectedProducto?.stock && selectedProducto.stock > 0
                  ? `\n\n⚠️ Stock actual: ${selectedProducto.stock} unidades.`
                  : ''
              }\n\nEl producto permanecerá en el historial de órdenes pero no estará disponible para nuevas ventas.`
            : ''
        }
        confirmText="Desactivar Producto"
        cancelText="Cancelar"
        variant="warning"
        isLoading={isSubmitting}
      />

      {/* Image Management Modal */}
      <Modal
        isOpen={isImageModalOpen}
        onClose={closeImageModal}
        title={`Imágenes de: ${selectedProducto?.nombre || ''}`}
        size="lg"
      >
        <ImageManager
          images={productImages}
          uploading={uploadingImage}
          fileInputRef={fileInputRef}
          onUpload={handleImageUploadWithCallbacks}
          onDelete={handleImageDelete}
        />
        <div className="flex justify-end pt-4 border-t mt-6">
          <button
            onClick={closeImageModal}
            className="btn-action btn-action-outline"
            style={{ padding: '0.5rem 1rem' }}
          >
            Cerrar
          </button>
        </div>
      </Modal>
    </div>
  );
}
