import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { $user, $isAuthenticated } from "../../stores/auth";
import { ordenesApi, type Orden } from "../../lib/api";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { ErrorAlert, SuccessAlert } from "../ui/Alerts";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import Modal from "../ui/Modal";

const STATUS_COLORS: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  procesando: "bg-blue-100 text-blue-800",
  enviado: "bg-indigo-100 text-indigo-800",
  entregado: "bg-green-100 text-green-800",
  completada: "bg-green-100 text-green-800",
  cancelada: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  procesando: "Procesando",
  enviado: "Enviado",
  entregado: "Entregado",
  completada: "Completada",
  cancelada: "Cancelada",
};

export default function ClientOrders() {
  const user = useStore($user);
  const isAuthenticated = useStore($isAuthenticated);
  
  const [orders, setOrders] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [selectedOrder, setSelectedOrder] = useState<Orden | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadOrders();
    } else if (!isAuthenticated) {
        // Handle redirect or wait
        setLoading(false);
    }
  }, [isAuthenticated, user]);

  const loadOrders = async () => {
    if (!user?.cliente_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await ordenesApi.getAll({ cliente_id: user.cliente_id });
      setOrders(data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar tus pedidos. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    
    setCanceling(true);
    try {
      // Usamos el endpoint de delete que cancela la orden y devuelve stock
      await ordenesApi.delete(selectedOrder.id);
      setSuccess("Orden cancelada exitosamente.");
      loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cancelar la orden");
    } finally {
      setCanceling(false);
      setIsCancelDialogOpen(false);
      setSelectedOrder(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Debes iniciar sesión para ver tus pedidos.</p>
        <a href="/login" className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          Iniciar Sesión
        </a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" message="Cargando tus pedidos..." />
      </div>
    );
  }

  if (!user?.cliente_id) {
     if (user?.rol === 'admin' || user?.rol === 'vendedor') {
         return (
             <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-center">
                 <h3 className="text-lg font-semibold text-blue-900 mb-2">Cuenta Administrativa</h3>
                 <p className="text-blue-700 mb-4">
                     Estás conectado como <strong>{user.rol}</strong>. Esta sección es para compras personales.
                     Para gestionar ventas, utiliza el panel de administración.
                 </p>
                 <a href="/admin/ordenes" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                     Ir al Panel de Gestión
                 </a>
             </div>
         )
     }
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No se encontró información de cliente asociada a tu cuenta.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      {success && <SuccessAlert message={success} onClose={() => setSuccess(null)} />}

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No tienes pedidos aún</h3>
          <p className="text-gray-500 mb-6">¿Buscas algo especial para tu hogar?</p>
          <a
            href="/catalogo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md"
          >
            Explorar Catálogo
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Pedido</p>
                      <p className="font-mono font-medium text-gray-900">#{order.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Fecha</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(order.fecha_creacion)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total</p>
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(order.total)}</p>
                    </div>
                  </div>
                  
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${STATUS_COLORS[order.estado] || 'bg-gray-100 text-gray-800'}`}>
                    {STATUS_LABELS[order.estado] || order.estado}
                  </span>
                </div>
              </div>

              {/* Actions & Preview */}
              <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-gray-600">
                    {/* Assuming we might render some items preview here if API returns them in list, but usually fetch details on demand or if provided */}
                    Gestiona tu pedido y ver detalles completos.
                </p>
                
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            setSelectedOrder(order);
                            setIsDetailsOpen(true);
                        }}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                    >
                        Ver Detalles
                    </button>
                    
                    {(order.estado === 'pendiente' || order.estado === 'procesando') && (
                        <button
                            onClick={() => {
                                setSelectedOrder(order);
                                setIsCancelDialogOpen(true);
                            }}
                            className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                        >
                            Cancelar
                        </button>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => {
            setIsDetailsOpen(false);
            setSelectedOrder(null);
        }}
        title={`Detalles del Pedido #${selectedOrder?.id}`}
        size="lg"
      >
        {selectedOrder ? (
           <OrderDetailsFetcher orderId={selectedOrder.id} />
        ) : <LoadingSpinner />}
      </Modal>

      {/* Cancel Confirmation */}
      <ConfirmDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        onConfirm={handleCancelOrder}
        title="Cancelar Pedido"
        message="¿Estás seguro de que deseas cancelar este pedido? Esta acción no se puede deshacer."
        confirmText="Sí, cancelar pedido"
        cancelText="No, mantener pedido"
        variant="danger"
        isLoading={canceling}
      />
    </div>
  );
}

// Helper component to fetch and display details
function OrderDetailsFetcher({ orderId }: { orderId: number }) {
    const [details, setDetails] = useState<any>(null); // Using any for simplicity here, ideally typed
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        ordenesApi.getById(orderId)
            .then(data => {
                setDetails(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [orderId]);

    if (loading) return <LoadingSpinner message="Cargando detalles..." />;
    if (!details) return <p className="text-red-500">Error al cargar detalles.</p>;

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                {details.detalles?.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4 p-4 border border-gray-100 rounded-lg">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                             {/* Placeholder or real image if available in expanded details */}
                             <svg className="w-full h-full text-gray-300 p-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.producto?.nombre || "Producto"}</h4>
                            <p className="text-sm text-gray-500">Cantidad: {item.cantidad}</p>
                            <p className="text-sm font-semibold text-gray-900">
                                {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(item.precio_unitario)} c/u
                            </p>
                        </div>
                        <div className="text-right">
                             <p className="font-bold text-gray-900">
                                {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(item.subtotal || item.cantidad * item.precio_unitario)}
                             </p>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="border-t pt-4 flex justify-between items-center">
                <span className="font-semibold text-gray-700">Total Pagado</span>
                <span className="text-2xl font-bold text-primary-600">
                     {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(details.total)}
                </span>
            </div>
        </div>
    )
}
