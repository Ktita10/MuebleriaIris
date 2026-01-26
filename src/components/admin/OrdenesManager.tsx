"use client";
import { useState, useEffect } from 'react';
import { useStore } from "@nanostores/react";
import { $user } from "../../stores/auth";
import { 
  ordenesApi, 
  clientesApi, 
  productosApi,
  getImageUrl,
  type Orden, 
  type OrdenDetalle, 
  type Cliente, 
  type Producto 
} from '../../lib/api';
import Modal from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ErrorAlert, SuccessAlert } from '../ui/Alerts';
import { LoadingSpinner } from '../ui/LoadingSpinner';

const ESTADOS = ['pendiente', 'en_proceso', 'completada', 'cancelada'];

const ESTADO_COLORS: { [key: string]: string } = {
  pendiente: 'badge-warning',
  en_proceso: 'badge-primary',
  completada: 'badge-success',
  cancelada: 'badge-danger',
};

const ESTADO_LABELS: { [key: string]: string } = {
  pendiente: 'Pendiente',
  en_proceso: 'En Proceso',
  completada: 'Completada',
  cancelada: 'Cancelada',
};

// --- Create Order Modal Component ---
interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: () => void;
}

function CreateOrderModal({ isOpen, onClose, onOrderCreated }: CreateOrderModalProps) {
  const user = useStore($user);
  const [step, setStep] = useState(1);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  
  const [selectedCliente, setSelectedCliente] = useState<number | null>(null);
  const [cartItems, setCartItems] = useState<{product: Producto, quantity: number}[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      setStep(1);
      setSelectedCliente(null);
      setCartItems([]);
      setError(null);
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      const [clientesData, productosData] = await Promise.all([
        clientesApi.getAll(),
        productosApi.getAll({ activo: true })
      ]);
      setClientes(clientesData);
      setProductos(productosData);
    } catch (err) {
      setError("Error al cargar datos necesarios");
    } finally {
      setLoadingData(false);
    }
  };

  const addToCart = (product: Producto) => {
    const existing = cartItems.find(item => item.product.id === product.id);
    if (existing) {
      // Check stock limit (assuming product.stock is available or validated on backend)
       // For now just increment
       setCartItems(cartItems.map(item => 
         item.product.id === product.id 
           ? { ...item, quantity: item.quantity + 1 } 
           : item
       ));
    } else {
      setCartItems([...cartItems, { product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: number) => {
    setCartItems(cartItems.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, newQty: number) => {
    if (newQty < 1) return;
    setCartItems(cartItems.map(item => 
      item.product.id === productId ? { ...item, quantity: newQty } : item
    ));
  };

  const handleSubmit = async () => {
    if (!selectedCliente || cartItems.length === 0) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const orderData = {
        id_cliente: selectedCliente,
        id_vendedor: user?.id || 1, 
        items: cartItems.map(item => ({
          id_producto: item.product.id,
          cantidad: item.quantity
        }))
      };

      await ordenesApi.create(orderData);
      onOrderCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la orden");
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = cartItems.reduce((sum, item) => sum + (item.product.precio * item.quantity), 0);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva Orden de Venta" size="xl">
      <div className="space-y-6">
        {loadingData ? (
          <LoadingSpinner />
        ) : (
          <>
            {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
            
            {/* Step 1: Select Client */}
            <div className={step === 1 ? 'block' : 'hidden'}>
               <h3 className="text-lg font-medium mb-4">1. Seleccionar Cliente</h3>
               <div className="mb-4">
                 <input 
                   type="text" 
                   placeholder="Buscar cliente..." 
                   className="w-full px-4 py-2 border rounded-lg"
                   onChange={(e) => {
                     // Simple client filtering logic could be added here
                   }}
                 />
               </div>
               <div className="max-h-60 overflow-y-auto border rounded-lg divide-y">
                 {clientes.map(cliente => (
                   <div 
                     key={cliente.id} 
                     className={`p-3 cursor-pointer hover:bg-gray-50 flex justify-between items-center ${selectedCliente === cliente.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                     onClick={() => setSelectedCliente(cliente.id)}
                   >
                     <div>
                       <p className="font-medium">{cliente.nombre_cliente} {cliente.apellido_cliente}</p>
                       <p className="text-sm text-gray-500">{cliente.dni_cuit}</p>
                     </div>
                     {selectedCliente === cliente.id && (
                       <span className="text-blue-600 font-bold">Seleccionado</span>
                     )}
                   </div>
                 ))}
               </div>
               <div className="mt-4 flex justify-end">
                 <button 
                   onClick={() => setStep(2)} 
                   disabled={!selectedCliente}
                   className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   Siguiente: Agregar Productos
                 </button>
               </div>
            </div>

            {/* Step 2: Add Products */}
            <div className={step === 2 ? 'block' : 'hidden'}>
              <h3 className="text-lg font-medium mb-4">2. Agregar Productos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product List */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Catálogo</h4>
                  <div className="max-h-80 overflow-y-auto space-y-2">
                    {productos.map(prod => (
                      <div key={prod.id} className="flex justify-between items-center p-2 hover:bg-gray-50 border rounded">
                        <div className="truncate flex-1 pr-2">
                          <p className="font-medium truncate">{prod.nombre}</p>
                          <p className="text-sm text-gray-500">${prod.precio}</p>
                        </div>
                        <button 
                          onClick={() => addToCart(prod)}
                          className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm"
                        >
                          + Agregar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cart */}
                <div className="border rounded-lg p-4 bg-gray-50">
                   <h4 className="font-medium mb-3">Carrito ({cartItems.length})</h4>
                   {cartItems.length === 0 ? (
                     <p className="text-gray-500 text-sm text-center py-8">No hay productos seleccionados</p>
                   ) : (
                     <div className="space-y-3 max-h-80 overflow-y-auto">
                       {cartItems.map(item => (
                         <div key={item.product.id} className="bg-white p-3 rounded shadow-sm">
                           <div className="flex justify-between mb-2">
                             <span className="font-medium text-sm">{item.product.nombre}</span>
                             <button onClick={() => removeFromCart(item.product.id)} className="text-red-500 hover:text-red-700 text-xs">Eliminar</button>
                           </div>
                           <div className="flex justify-between items-center">
                             <div className="flex items-center gap-2">
                               <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-6 h-6 bg-gray-200 rounded text-center">-</button>
                               <span className="w-8 text-center text-sm">{item.quantity}</span>
                               <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-6 h-6 bg-gray-200 rounded text-center">+</button>
                             </div>
                             <span className="font-bold text-sm">
                               ${(item.product.precio * item.quantity).toLocaleString()}
                             </span>
                           </div>
                         </div>
                       ))}
                     </div>
                   )}
                   
                   <div className="mt-4 pt-4 border-t flex justify-between items-center">
                     <span className="font-bold">Total:</span>
                     <span className="text-xl font-bold text-blue-600">${total.toLocaleString()}</span>
                   </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button 
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Atrás
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting || cartItems.length === 0}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50 hover:bg-green-700 flex items-center gap-2"
                >
                  {isSubmitting && <LoadingSpinner size="sm" color="text-white" />}
                  Confirmar Orden
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}


// --- Main Manager Component ---

export function OrdenesManager() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [filteredOrdenes, setFilteredOrdenes] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [estadoFilter, setEstadoFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [selectedOrden, setSelectedOrden] = useState<Orden | null>(null);
  const [ordenDetalles, setOrdenDetalles] = useState<OrdenDetalle[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newEstado, setNewEstado] = useState<string>('');
  const [loadingDetails, setLoadingDetails] = useState(false);

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
    let result = ordenes;

    // Filter by estado
    if (estadoFilter) {
      result = result.filter(o => o.estado === estadoFilter);
    }

    // Filter by search term (cliente name or orden ID)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        o =>
          `${o.cliente.nombre_cliente} ${o.cliente.apellido_cliente}`.toLowerCase().includes(term) ||
          `${o.vendedor.nombre} ${o.vendedor.apellido}`.toLowerCase().includes(term) ||
          o.id.toString().includes(term)
      );
    }

    setFilteredOrdenes(result);
  }, [searchTerm, estadoFilter, ordenes]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ordenesApi.getAll();
      setOrdenes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  };

  const loadOrdenDetails = async (ordenId: number) => {
    try {
      setLoadingDetails(true);
      const data = await ordenesApi.getById(ordenId);
      setOrdenDetalles(data.detalles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar detalles de la orden');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleUpdateEstado = async () => {
    if (!selectedOrden || !newEstado) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await ordenesApi.updateEstado(selectedOrden.id, newEstado);
      setSuccess(`Estado de la orden actualizado a "${ESTADO_LABELS[newEstado]}"`);
      setIsStatusModalOpen(false);
      setSelectedOrden(null);
      setNewEstado('');
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar estado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelOrden = async () => {
    if (!selectedOrden) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await ordenesApi.delete(selectedOrden.id);
      setSuccess('Orden cancelada exitosamente. El stock ha sido devuelto al inventario.');
      setIsCancelDialogOpen(false);
      setSelectedOrden(null);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cancelar orden');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDetailsModal = async (orden: Orden) => {
    setSelectedOrden(orden);
    setIsDetailsModalOpen(true);
    await loadOrdenDetails(orden.id);
  };

  const openStatusModal = (orden: Orden) => {
    setSelectedOrden(orden);
    setNewEstado(orden.estado);
    setIsStatusModalOpen(true);
  };

  const openCancelDialog = (orden: Orden) => {
    setSelectedOrden(orden);
    setIsCancelDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
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
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Órdenes</h2>
          <p className="text-gray-500">{ordenes.length} órdenes en total</p>
        </div>
        
        {/* Nuevo botón para crear órdenes */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-action btn-action-success"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Orden
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {ordenes.filter(o => o.estado === 'pendiente').length}
              </p>
              <p className="text-sm text-gray-500">Pendientes</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {ordenes.filter(o => o.estado === 'en_proceso').length}
              </p>
              <p className="text-sm text-gray-500">En Proceso</p>
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
                {ordenes.filter(o => o.estado === 'completada').length}
              </p>
              <p className="text-sm text-gray-500">Completadas</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(ordenes.reduce((sum, o) => sum + o.total, 0))}
              </p>
              <p className="text-sm text-gray-500">Total Ventas</p>
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
                placeholder="Buscar por cliente, vendedor o ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={estadoFilter}
            onChange={e => setEstadoFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Todos los estados</option>
            {ESTADOS.map(estado => (
              <option key={estado} value={estado}>{ESTADO_LABELS[estado]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Ordenes Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filteredOrdenes.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay órdenes</h3>
            <p className="mt-1 text-sm text-gray-500">Las órdenes se crean desde el flujo de ventas o utilizando el botón "Nueva Orden".</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 font-medium">ID</th>
                  <th className="px-6 py-4 font-medium">Cliente</th>
                  <th className="px-6 py-4 font-medium">Vendedor</th>
                  <th className="px-6 py-4 font-medium">Fecha</th>
                  <th className="px-6 py-4 font-medium">Total</th>
                  <th className="px-6 py-4 font-medium">Estado</th>
                  <th className="px-6 py-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrdenes.map(orden => (
                  <tr key={orden.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-gray-900">#{orden.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{orden.cliente.nombre_cliente} {orden.cliente.apellido_cliente}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{orden.vendedor.nombre} {orden.vendedor.apellido}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(orden.fecha_creacion)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatCurrency(orden.total)}</td>
                    <td className="px-6 py-4">
                      <span className={ESTADO_COLORS[orden.estado]}>
                        {ESTADO_LABELS[orden.estado]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openDetailsModal(orden)}
                          className="btn-action btn-action-primary p-2"
                          title="Ver detalles"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        {orden.estado !== 'cancelada' && orden.estado !== 'completada' && (
                          <button
                            onClick={() => openStatusModal(orden)}
                            className="btn-action btn-action-warning p-2"
                            title="Cambiar estado"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                        )}
                        {orden.estado !== 'cancelada' && orden.estado !== 'completada' && (
                          <button
                            onClick={() => openCancelDialog(orden)}
                            className="btn-action btn-action-danger p-2"
                            title="Cancelar orden"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedOrden(null);
          setOrdenDetalles([]);
        }}
        title={`Detalles de Orden #${selectedOrden?.id}`}
        size="xl"
      >
        <div className="space-y-6">
          {selectedOrden && (
            <>
              <div className="grid grid-cols-2 gap-6 p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Cliente</p>
                  <p className="text-base font-semibold text-gray-900">{selectedOrden.cliente.nombre_cliente} {selectedOrden.cliente.apellido_cliente}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Vendedor</p>
                  <p className="text-base font-semibold text-gray-900">{selectedOrden.vendedor.nombre} {selectedOrden.vendedor.apellido}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Fecha</p>
                  <p className="text-base font-medium text-gray-900">{formatDate(selectedOrden.fecha_creacion)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Estado</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${ESTADO_COLORS[selectedOrden.estado]}`}>
                    {ESTADO_LABELS[selectedOrden.estado]}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Productos ({ordenDetalles.length})
                </h4>
                {loadingDetails ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : ordenDetalles.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-sm">No hay productos en esta orden</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ordenDetalles.map((detalle, index) => (
                      <div key={index} className="flex gap-5 p-5 bg-white border-2 border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all">
                        {/* Imagen del producto */}
                        <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden shadow-sm">
                          {detalle.producto.imagenes && detalle.producto.imagenes.length > 0 ? (
                            <img 
                              src={getImageUrl(detalle.producto.imagenes.find((img: { imagen_principal: boolean; url: string }) => img.imagen_principal)?.url || detalle.producto.imagenes[0].url)}
                              alt={detalle.producto.nombre}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        
                        {/* Información del producto */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1">
                              <h5 className="font-bold text-gray-900 text-lg mb-2">{detalle.producto.nombre}</h5>
                              {detalle.producto.categoria && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-800">
                                  {detalle.producto.categoria}
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-2xl text-gray-900">{formatCurrency(detalle.cantidad * detalle.precio_unitario)}</p>
                              <p className="text-xs text-gray-500 mt-1">Subtotal</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6 text-sm text-gray-600">
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              <span className="font-semibold text-gray-900">{detalle.cantidad}</span>
                              <span className="text-gray-600">unidades</span>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-gray-600">c/u:</span>
                              <span className="font-semibold text-gray-900">{formatCurrency(detalle.precio_unitario)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t-2 border-gray-200 pt-5 mt-2">
                <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-blue-100 p-5 rounded-xl">
                  <span className="text-xl font-bold text-gray-900">Total de la Orden</span>
                  <span className="text-3xl font-bold text-blue-600">{formatCurrency(selectedOrden.total)}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Status Update Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setSelectedOrden(null);
          setNewEstado('');
        }}
        title="Actualizar Estado de Orden"
      >
        <div className="space-y-4">
          {selectedOrden && (
            <>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Orden:</strong> #{selectedOrden.id} - {selectedOrden.cliente.nombre_cliente} {selectedOrden.cliente.apellido_cliente}
                </p>
                <p className="text-sm text-gray-600">
                  Estado actual: <span className="font-medium">{ESTADO_LABELS[selectedOrden.estado]}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nuevo Estado <span className="text-red-500">*</span>
                </label>
                <select
                  value={newEstado}
                  onChange={e => setNewEstado(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  {ESTADOS.filter(e => e !== 'cancelada').map(estado => (
                    <option key={estado} value={estado}>{ESTADO_LABELS[estado]}</option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> El cambio de estado afectará el seguimiento de la orden.
                </p>
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setIsStatusModalOpen(false);
                    setSelectedOrden(null);
                    setNewEstado('');
                  }}
                  disabled={isSubmitting}
                  className="btn-action btn-action-outline flex-1 justify-center"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateEstado}
                  disabled={isSubmitting || !newEstado}
                  className="btn-action btn-action-primary flex-1 justify-center"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Actualizando...
                    </span>
                  ) : 'Actualizar Estado'}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isCancelDialogOpen}
        onClose={() => {
          setIsCancelDialogOpen(false);
          setSelectedOrden(null);
        }}
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
        onOrderCreated={() => {
          loadData();
          setSuccess("Orden creada exitosamente");
        }}
      />
    </div>
  );
}