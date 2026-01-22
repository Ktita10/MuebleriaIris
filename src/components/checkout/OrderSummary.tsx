import { useStore } from "@nanostores/react";
import { $cartItems, $cartTotal } from "../../stores/cart";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(price);
}

interface OrderSummaryProps {
  shippingCost?: number;
}

export default function OrderSummary({ shippingCost = 0 }: OrderSummaryProps) {
  const items = useStore($cartItems);
  const subtotal = useStore($cartTotal);
  const total = subtotal + shippingCost;

  if (items.length === 0) {
    return (
      <div className="bg-gray-50 rounded-2xl p-6 text-center">
        <svg
          className="w-12 h-12 mx-auto text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <p className="text-gray-500">Tu carrito esta vacio</p>
        <a
          href="/catalogo"
          className="inline-block mt-4 text-primary-600 hover:text-primary-700 font-medium"
        >
          Ir al catalogo
        </a>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen del Pedido</h2>

      {/* Items */}
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div
            key={`${item.id}-${item.color}`}
            className="flex gap-4"
          >
            {/* Image */}
            <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
              {item.imagen ? (
                <img
                  src={item.imagen}
                  alt={item.nombre}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 text-sm truncate">
                {item.nombre}
              </h4>
              {item.color && (
                <p className="text-xs text-gray-500">Color: {item.color}</p>
              )}
              <p className="text-xs text-gray-500">Cantidad: {item.cantidad}</p>
            </div>

            {/* Price */}
            <div className="text-right">
              <p className="font-semibold text-gray-900">
                {formatPrice(item.precio * item.cantidad)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 pt-4 space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">{formatPrice(subtotal)}</span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Envio</span>
          <span className="text-gray-900">
            {shippingCost > 0 ? formatPrice(shippingCost) : "Gratis"}
          </span>
        </div>

        {/* Total */}
        <div className="border-t border-gray-200 pt-3 flex justify-between">
          <span className="text-lg font-bold text-gray-900">Total</span>
          <span className="text-lg font-bold text-primary-600">
            {formatPrice(total)}
          </span>
        </div>
      </div>

      {/* Security badges */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg
            className="w-5 h-5 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <span>Compra 100% segura</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
          <svg
            className="w-5 h-5 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
          <span>Pago con tarjeta o transferencia</span>
        </div>
      </div>
    </div>
  );
}
