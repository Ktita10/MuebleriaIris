"use client";
import { useState, useEffect } from 'react';
import { inventarioApi, productosApi, getImageUrl, type Inventario, type InventarioAjuste, type Producto } from '../../lib/api';
import Modal from '../ui/Modal';
import { ErrorAlert, SuccessAlert } from '../ui/Alerts';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface InventarioExtendido extends Inventario {
  producto?: Producto;
}

interface FormErrors {
  cantidad?: string;
  razon?: string;
}

export function InventarioManager() {
  const [inventario, setInventario] = useState<InventarioExtendido[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filteredInventario, setFilteredInventario] = useState<InventarioExtendido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [alertFilter, setAlertFilter] = useState<string>('');

  const [isAjusteModalOpen, setIsAjusteModalOpen] = useState(false);
  const [selectedInventario, setSelectedInventario] = useState<InventarioExtendido | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ajusteType, setAjusteType] = useState<'add' | 'remove'>('add');

  const [formData, setFormData] = useState<InventarioAjuste>({
    cantidad: 0,
    razon: '',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    let result = inventario;

    // Filter by alert status
    if (alertFilter === 'bajo_stock') {
      result = result.filter(i => i.alerta_stock && i.stock > 0);
    } else if (alertFilter === 'sin_stock') {
      result = result.filter(i => i.stock === 0);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(i => {
        const producto = i.producto;
        return (
          producto?.nombre.toLowerCase().includes(term) ||
          producto?.sku.toLowerCase().includes(term) ||
          i.ubicacion.toLowerCase().includes(term)
        );
      });
    }

    setFilteredInventario(result);
  }, [searchTerm, alertFilter, inventario]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [inventarioData, productosData] = await Promise.all([
        inventarioApi.getAll(),
        productosApi.getAll(),
      ]);
      
      // Merge inventario with producto data
      const inventarioExtendido = inventarioData.map(inv => ({
        ...inv,
        producto: productosData.find(p => p.id === inv.id_producto),
      }));

      setInventario(inventarioExtendido);
      setProductos(productosData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar inventario');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.cantidad || formData.cantidad <= 0) {
      errors.cantidad = 'La cantidad debe ser mayor a 0';
    }
    if (!formData.razon.trim()) {
      errors.razon = 'La razón es requerida';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAjustar = async () => {
    if (!selectedInventario || !validateForm()) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // If removing stock, make the amount negative
      const cantidad = ajusteType === 'remove' ? -formData.cantidad : formData.cantidad;

      // Use inventario.id (id_inventario) not id_producto
      await inventarioApi.ajustar(selectedInventario.id, {
        cantidad,
        razon: formData.razon,
      });

      setSuccess(`Stock ${ajusteType === 'add' ? 'agregado' : 'removido'} exitosamente`);
      setIsAjusteModalOpen(false);
      resetForm();
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al ajustar stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAjusteModal = (inventario: InventarioExtendido, type: 'add' | 'remove') => {
    setSelectedInventario(inventario);
    setAjusteType(type);
    resetForm();
    setIsAjusteModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      cantidad: 0,
      razon: '',
    });
    setFormErrors({});
  };

  const getStockStatus = (inv: InventarioExtendido) => {
    if (inv.stock === 0) {
      return { label: 'Sin Stock', color: 'badge-danger' };
    }
    if (inv.alerta_stock) {
      return { label: 'Stock Bajo', color: 'badge-warning' };
    }
    return { label: 'Normal', color: 'badge-success' };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      {/* Alerts */}
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      {success && <SuccessAlert message={success} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Inventario</h2>
          <p className="text-gray-500">{inventario.length} productos en inventario</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{inventario.length}</p>
              <p className="text-sm text-gray-500">Total Productos</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {inventario.filter(i => i.alerta_stock && i.stock > 0).length}
              </p>
              <p className="text-sm text-gray-500">Stock Bajo</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {inventario.filter(i => i.stock === 0).length}
              </p>
              <p className="text-sm text-gray-500">Sin Stock</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {inventario.reduce((sum, i) => sum + i.stock, 0)}
              </p>
              <p className="text-sm text-gray-500">Total Unidades</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por producto, SKU o ubicación..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={alertFilter}
            onChange={e => setAlertFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Todos los estados</option>
            <option value="bajo_stock">Stock Bajo</option>
            <option value="sin_stock">Sin Stock</option>
          </select>
        </div>
      </div>

      {/* Inventario Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filteredInventario.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos en inventario</h3>
            <p className="mt-1 text-sm text-gray-500">Los productos se agregan automáticamente al ser creados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 font-medium">Producto</th>
                  <th className="px-6 py-4 font-medium">Ubicación</th>
                  <th className="px-6 py-4 font-medium">Stock</th>
                  <th className="px-6 py-4 font-medium">Estado</th>
                  <th className="px-6 py-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventario.map(inv => {
                  const status = getStockStatus(inv);
                  return (
                    <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {inv.producto?.imagen_principal ? (
                            <img
                              src={getImageUrl(inv.producto.imagen_principal)}
                              alt={inv.producto.nombre}
                              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 truncate">{inv.producto?.nombre || 'Producto desconocido'}</div>
                            <div className="text-xs text-gray-500">SKU: {inv.producto?.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{inv.ubicacion}</td>
                      <td className="px-6 py-4">
                        <span className="text-2xl font-bold text-gray-900">{inv.stock}</span>
                        <span className="text-sm text-gray-500 ml-1">unidades</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={status.color}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openAjusteModal(inv, 'add')}
                            className="btn-action btn-action-success p-2"
                            title="Agregar stock"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openAjusteModal(inv, 'remove')}
                            className="btn-action btn-action-danger p-2"
                            title="Remover stock"
                            disabled={inv.stock === 0}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ajuste Modal */}
      <Modal
        isOpen={isAjusteModalOpen}
        onClose={() => {
          setIsAjusteModalOpen(false);
          resetForm();
          setSelectedInventario(null);
        }}
        title={`${ajusteType === 'add' ? 'Agregar' : 'Remover'} Stock`}
      >
        <div className="space-y-4">
          {selectedInventario && (
            <>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  {selectedInventario.producto?.imagen_principal ? (
                    <img
                      src={getImageUrl(selectedInventario.producto.imagen_principal)}
                      alt={selectedInventario.producto.nombre}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900">{selectedInventario.producto?.nombre}</p>
                    <p className="text-sm text-gray-600">SKU: {selectedInventario.producto?.sku}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                  <span className="text-sm text-gray-600">Stock actual:</span>
                  <span className="text-lg font-bold text-gray-900">{selectedInventario.stock} unidades</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad {ajusteType === 'add' ? 'a agregar' : 'a remover'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={ajusteType === 'remove' ? selectedInventario.stock : undefined}
                  value={formData.cantidad === 0 ? '' : formData.cantidad}
                  onChange={e => setFormData({ ...formData, cantidad: parseInt(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formErrors.cantidad ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="0"
                />
                {formErrors.cantidad && <p className="mt-1 text-sm text-red-600">{formErrors.cantidad}</p>}
                {ajusteType === 'remove' && (
                  <p className="mt-1 text-xs text-gray-500">Máximo: {selectedInventario.stock} unidades</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Razón del ajuste <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.razon}
                  onChange={e => setFormData({ ...formData, razon: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formErrors.razon ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder={ajusteType === 'add' ? 'Ej: Reposición de stock, nueva compra' : 'Ej: Producto dañado, ajuste por inventario'}
                  rows={3}
                />
                {formErrors.razon && <p className="mt-1 text-sm text-red-600">{formErrors.razon}</p>}
              </div>

              {formData.cantidad > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Nuevo stock:</strong> {ajusteType === 'add' ? selectedInventario.stock + formData.cantidad : selectedInventario.stock - formData.cantidad} unidades
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAjustar}
                  disabled={isSubmitting}
                  className={`btn-action ${
                    ajusteType === 'add' 
                      ? 'btn-action-success' 
                      : 'btn-action-danger'
                  } flex-1 justify-center`}
                >
                  {isSubmitting ? 'Procesando...' : `${ajusteType === 'add' ? 'Agregar' : 'Remover'} Stock`}
                </button>
                <button
                  onClick={() => {
                    setIsAjusteModalOpen(false);
                    resetForm();
                    setSelectedInventario(null);
                  }}
                  disabled={isSubmitting}
                  className="btn-action btn-action-outline flex-1 justify-center"
                >
                  Cancelar
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
