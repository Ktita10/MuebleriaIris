/**
 * ProductosManager Component
 * Full CRUD operations for products with image upload
 */
"use client";

import { useState, useEffect, useRef } from 'react';
import { productosApi, categoriasApi, getImageUrl, type Producto, type ProductoInput, type Categoria, type ImagenProducto } from '../../lib/api';
import Modal from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ErrorAlert, SuccessAlert } from '../ui/Alerts';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export function ProductosManager() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [productImages, setProductImages] = useState<ImagenProducto[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<ProductoInput>({
    sku: '',
    nombre: '',
    descripcion: '',
    precio: 0,
    alto_cm: 0,
    ancho_cm: 0,
    profundidad_cm: 0,
    material: '',
    id_categoria: 0,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([loadProductos(), loadCategorias()]);
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const loadProductos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productosApi.getAll();
      setProductos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const loadCategorias = async () => {
    try {
      const data = await categoriasApi.getAll();
      setCategorias(data);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.sku.trim()) errors.sku = 'SKU requerido';
    if (!formData.nombre.trim()) errors.nombre = 'Nombre requerido';
    if (!formData.precio || formData.precio <= 0) errors.precio = 'Precio debe ser mayor a 0';
    if (!formData.material.trim()) errors.material = 'Material requerido';
    if (!formData.id_categoria || formData.id_categoria <= 0) errors.id_categoria = 'Categoría requerida';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      await productosApi.create(formData);
      setSuccess('Producto creado exitosamente');
      setIsCreateModalOpen(false);
      resetForm();
      loadProductos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProducto || !validateForm()) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      await productosApi.update(selectedProducto.id, formData);
      setSuccess('Producto actualizado exitosamente');
      setIsEditModalOpen(false);
      setSelectedProducto(null);
      resetForm();
      loadProductos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProducto) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      await productosApi.delete(selectedProducto.id);
      setSuccess('Producto eliminado exitosamente');
      setIsDeleteDialogOpen(false);
      setSelectedProducto(null);
      loadProductos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      sku: '',
      nombre: '',
      descripcion: '',
      precio: 0,
      alto_cm: 0,
      ancho_cm: 0,
      profundidad_cm: 0,
      material: '',
      id_categoria: 0,
    });
    setFormErrors({});
  };

  const openEditModal = (producto: Producto) => {
    setSelectedProducto(producto);
    const categoria = categorias.find(c => c.nombre === producto.categoria);
    setFormData({
      sku: producto.sku,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      alto_cm: producto.medidas.alto,
      ancho_cm: producto.medidas.ancho,
      profundidad_cm: producto.medidas.profundidad,
      material: producto.material,
      id_categoria: categoria?.id || 0,
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const openDeleteDialog = (producto: Producto) => {
    setSelectedProducto(producto);
    setIsDeleteDialogOpen(true);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const openImageModal = async (producto: Producto) => {
    setSelectedProducto(producto);
    setIsImageModalOpen(true);
    await loadProductImages(producto.id);
  };

  const loadProductImages = async (productoId: number) => {
    try {
      const images = await productosApi.getImages(productoId);
      setProductImages(images);
    } catch (err) {
      console.error('Error loading images:', err);
      setProductImages([]);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedProducto || !e.target.files?.length) return;
    
    const file = e.target.files[0];
    
    // Validar tipo de archivo
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Tipo de archivo no válido. Solo se permiten: PNG, JPG, JPEG, GIF, WEBP');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    
    // Validar tamaño (16MB = 16 * 1024 * 1024 bytes)
    const maxSize = 16 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('El archivo es demasiado grande. Tamaño máximo: 16MB');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    
    const isPrincipal = productImages.length === 0; // First image is principal
    
    try {
      setUploadingImage(true);
      setError(null);
      await productosApi.uploadImage(selectedProducto.id, file, isPrincipal);
      setSuccess('Imagen subida exitosamente');
      await loadProductImages(selectedProducto.id);
      loadProductos(); // Refresh products to update imagen_principal
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir imagen');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!selectedProducto) return;
    
    try {
      await productosApi.deleteImage(imageId);
      setSuccess('Imagen eliminada exitosamente');
      await loadProductImages(selectedProducto.id);
      loadProductos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar imagen');
    }
  };

  const filteredProductos = productos.filter(producto => {
    const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         producto.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = !selectedCategoria || categorias.find(c => c.id === selectedCategoria)?.nombre === producto.categoria;
    return matchesSearch && matchesCategoria;
  });

  if (loading) {
    return <LoadingSpinner size="lg" message="Cargando productos..." />;
  }

  return (
    <div className="space-y-6">
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
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
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
          <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select
          value={selectedCategoria || ''}
          onChange={(e) => setSelectedCategoria(e.target.value ? Number(e.target.value) : null)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas las categorías</option>
          {categorias.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProductos.map((producto) => (
              <tr key={producto.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {producto.imagen_principal ? (
                      <img 
                        src={getImageUrl(producto.imagen_principal)} 
                        alt={producto.nombre} 
                        className="w-12 h-12 rounded object-cover bg-gray-100"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-12 h-12 bg-gray-200 rounded flex items-center justify-center ${producto.imagen_principal ? 'hidden fallback-icon' : ''}`}>
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{producto.nombre}</div>
                      <div className="text-xs text-gray-500">{producto.medidas.alto}x{producto.medidas.ancho}x{producto.medidas.profundidad} cm</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">{producto.sku}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{producto.categoria}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{producto.material}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">${producto.precio.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openImageModal(producto)}
                      className="btn-action btn-action-success"
                      title="Gestionar imágenes"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Imágenes
                    </button>
                    <button
                      onClick={() => openEditModal(producto)}
                      className="btn-action btn-action-primary"
                      title="Editar producto"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </button>
                    <button
                      onClick={() => openDeleteDialog(producto)}
                      className="btn-action btn-action-danger"
                      title="Desactivar producto"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProductos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm || selectedCategoria ? 'No se encontraron productos' : 'No hay productos registrados'}
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isCreateModalOpen ? 'Nuevo Producto' : 'Editar Producto'}
        size="lg"
      >
        <form onSubmit={isCreateModalOpen ? handleCreate : handleEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  formErrors.sku ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="SOF001"
                disabled={isSubmitting}
              />
              {formErrors.sku && <p className="mt-1 text-sm text-red-600">{formErrors.sku}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.id_categoria}
                onChange={(e) => setFormData({ ...formData, id_categoria: Number(e.target.value) })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  formErrors.id_categoria ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              >
                <option value={0}>Seleccionar categoría</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
              {formErrors.id_categoria && <p className="mt-1 text-sm text-red-600">{formErrors.id_categoria}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                formErrors.nombre ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Sofá 3 cuerpos"
              disabled={isSubmitting}
            />
            {formErrors.nombre && <p className="mt-1 text-sm text-red-600">{formErrors.nombre}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Descripción detallada del producto"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: Number(e.target.value) })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  formErrors.precio ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
                disabled={isSubmitting}
              />
              {formErrors.precio && <p className="mt-1 text-sm text-red-600">{formErrors.precio}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Material <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  formErrors.material ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Madera, Metal, Tela..."
                disabled={isSubmitting}
              />
              {formErrors.material && <p className="mt-1 text-sm text-red-600">{formErrors.material}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dimensiones (cm)
            </label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <input
                  type="number"
                  step="0.01"
                  value={formData.alto_cm}
                  onChange={(e) => setFormData({ ...formData, alto_cm: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Alto"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <input
                  type="number"
                  step="0.01"
                  value={formData.ancho_cm}
                  onChange={(e) => setFormData({ ...formData, ancho_cm: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ancho"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <input
                  type="number"
                  step="0.01"
                  value={formData.profundidad_cm}
                  onChange={(e) => setFormData({ ...formData, profundidad_cm: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Profundidad"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
              }}
              disabled={isSubmitting}
              className="btn-action btn-action-outline"
              style={{ padding: '0.5rem 1rem' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-action btn-action-primary"
              style={{ padding: '0.5rem 1rem' }}
            >
              {isSubmitting ? 'Guardando...' : isCreateModalOpen ? 'Crear Producto' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
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
        onClose={() => {
          setIsImageModalOpen(false);
          setSelectedProducto(null);
          setProductImages([]);
        }}
        title={`Imágenes de: ${selectedProducto?.nombre || ''}`}
        size="lg"
      >
        <div className="space-y-6">
          {/* Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
              disabled={uploadingImage}
            />
            <label
              htmlFor="image-upload"
              className={`cursor-pointer flex flex-col items-center gap-2 ${uploadingImage ? 'opacity-50' : ''}`}
            >
              {uploadingImage ? (
                <LoadingSpinner size="md" message="Subiendo imagen..." />
              ) : (
                <>
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">
                    Haz clic para subir una imagen
                  </span>
                  <span className="text-xs text-gray-500">
                    PNG, JPG, GIF, WEBP hasta 16MB
                  </span>
                </>
              )}
            </label>
          </div>

          {/* Images Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {productImages.map((img) => (
              <div key={img.id} className="relative group">
                <img
                  src={getImageUrl(img.url)}
                  alt={img.descripcion || 'Imagen del producto'}
                  className="w-full h-32 object-cover rounded-lg"
                />
                {img.imagen_principal && (
                  <span className="badge-primary absolute top-2 left-2">
                    Principal
                  </span>
                )}
                <button
                  onClick={() => handleDeleteImage(img.id)}
                  className="btn-icon btn-icon-danger absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Eliminar imagen"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {productImages.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              No hay imágenes para este producto. Sube la primera imagen.
            </p>
          )}

          {/* Close Button */}
          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={() => {
                setIsImageModalOpen(false);
                setSelectedProducto(null);
                setProductImages([]);
              }}
              className="btn-action btn-action-outline"
              style={{ padding: '0.5rem 1rem' }}
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
