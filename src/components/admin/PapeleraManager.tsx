/**
 * PapeleraManager Component
 * Manages soft-deleted products (trash) with restore/permanent delete options
 */
"use client";

import { useState, useEffect } from 'react';
import { productosApi, getImageUrl, type Producto } from '../../lib/api';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ErrorAlert, SuccessAlert } from '../ui/Alerts';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export function PapeleraManager() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadProductos();
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
      const data = await productosApi.getPapelera();
      setProductos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos eliminados');
    } finally {
      setLoading(false);
    }
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

  const openRestoreDialog = (producto: Producto) => {
    setSelectedProducto(producto);
    setIsRestoreDialogOpen(true);
  };

  const openDeleteDialog = (producto: Producto) => {
    setSelectedProducto(producto);
    setIsDeleteDialogOpen(true);
  };

  if (loading) {
    return <LoadingSpinner size="lg" message="Cargando papelera..." />;
  }

  return (
    <div className="space-y-6">
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      {success && <SuccessAlert message={success} onClose={() => setSuccess(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Papelera</h1>
          <p className="mt-1 text-sm text-gray-600">
            {productos.length} producto{productos.length !== 1 ? 's' : ''} eliminado{productos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <a
          href="/admin/productos"
          className="btn-action btn-action-outline"
          style={{ padding: '0.5rem 1rem' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Volver a Productos
        </a>
      </div>

      {/* Info Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 className="font-medium text-yellow-800">Productos desactivados</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Los productos aqui fueron desactivados pero no eliminados permanentemente.
              Puede restaurarlos para que vuelvan a estar disponibles en el catalogo.
              Los productos con ordenes asociadas no pueden eliminarse permanentemente.
            </p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {productos.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">La papelera esta vacia</h3>
          <p className="text-gray-500 mb-6">
            Los productos eliminados apareceran aqui para que puedas restaurarlos si es necesario.
          </p>
          <a href="/admin/productos" className="btn-action btn-action-primary" style={{ padding: '0.5rem 1rem' }}>
            Ir a Productos
          </a>
        </div>
      ) : (
        /* Table */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {productos.map((producto) => (
                <tr key={producto.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {producto.imagen_principal ? (
                        <img 
                          src={getImageUrl(producto.imagen_principal)} 
                          alt={producto.nombre} 
                          className="w-12 h-12 rounded object-cover bg-gray-100"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{producto.nombre}</div>
                        <div className="text-xs text-gray-500">{producto.material}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">{producto.sku}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{producto.categoria || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">${producto.precio.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{producto.stock ?? 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openRestoreDialog(producto)}
                        className="btn-action btn-action-success"
                        title="Restaurar producto"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Restaurar
                      </button>
                      <button
                        onClick={() => openDeleteDialog(producto)}
                        className="btn-action btn-action-danger"
                        title="Eliminar permanentemente"
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
        </div>
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
