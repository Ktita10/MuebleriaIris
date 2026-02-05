/**
 * CreateOrderModal Component
 * Multi-step modal for creating new orders
 */
import React, { memo, useState, useEffect } from 'react';
import { useStore } from "@nanostores/react";
import { $user } from "../../../stores/auth";
import {
  clientesApi,
  productosApi,
  ordenesApi,
  type Cliente,
  type Producto,
  type OrdenInput,
} from '../../../lib/api';
import Modal from '../../ui/Modal';
import { LoadingSpinner } from '../../ui/LoadingSpinner';

// =============================================================================
// Types
// =============================================================================

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: () => void;
}

interface CartItem {
  product: Producto;
  quantity: number;
}

// =============================================================================
// Subcomponents
// =============================================================================

interface ClienteSelectorProps {
  clientes: Cliente[];
  selectedCliente: number | null;
  onSelect: (id: number) => void;
  onNext: () => void;
}

const ClienteSelector = memo(function ClienteSelector({
  clientes,
  selectedCliente,
  onSelect,
  onNext,
}: ClienteSelectorProps) {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">1. Seleccionar Cliente</h3>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar cliente..."
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>
      <div className="max-h-60 overflow-y-auto border rounded-lg divide-y">
        {clientes.map(cliente => (
          <div
            key={cliente.id}
            className={`p-3 cursor-pointer hover:bg-gray-50 flex justify-between items-center ${selectedCliente === cliente.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
            onClick={() => onSelect(cliente.id)}
          >
            <div>
              <p className="font-medium">{cliente.nombre} {cliente.apellido}</p>
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
          onClick={onNext}
          disabled={!selectedCliente}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente: Agregar Productos
        </button>
      </div>
    </div>
  );
});

interface ProductSelectorProps {
  productos: Producto[];
  cartItems: CartItem[];
  onAddToCart: (product: Producto) => void;
  onRemoveFromCart: (productId: number) => void;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  total: number;
}

const ProductSelector = memo(function ProductSelector({
  productos,
  cartItems,
  onAddToCart,
  onRemoveFromCart,
  onUpdateQuantity,
  onBack,
  onSubmit,
  isSubmitting,
  total,
}: ProductSelectorProps) {
  return (
    <div>
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
                  onClick={() => onAddToCart(prod)}
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
                    <button
                      onClick={() => onRemoveFromCart(item.product.id)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      Eliminar
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 bg-gray-200 rounded text-center"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 bg-gray-200 rounded text-center"
                      >
                        +
                      </button>
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
          onClick={onBack}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          Atrás
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting || cartItems.length === 0}
          className="px-6 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50 hover:bg-green-700 flex items-center gap-2"
        >
          {isSubmitting && <LoadingSpinner size="sm" color="text-white" />}
          Confirmar Orden
        </button>
      </div>
    </div>
  );
});

// =============================================================================
// Main Component
// =============================================================================

export const CreateOrderModal = memo(function CreateOrderModal({
  isOpen,
  onClose,
  onOrderCreated,
}: CreateOrderModalProps) {
  const user = useStore($user);
  const [step, setStep] = useState(1);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const [selectedCliente, setSelectedCliente] = useState<number | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens
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
      const orderData: OrdenInput = {
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
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
            )}

            {step === 1 ? (
              <ClienteSelector
                clientes={clientes}
                selectedCliente={selectedCliente}
                onSelect={setSelectedCliente}
                onNext={() => setStep(2)}
              />
            ) : (
              <ProductSelector
                productos={productos}
                cartItems={cartItems}
                onAddToCart={addToCart}
                onRemoveFromCart={removeFromCart}
                onUpdateQuantity={updateQuantity}
                onBack={() => setStep(1)}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                total={total}
              />
            )}
          </>
        )}
      </div>
    </Modal>
  );
});
