/**
 * CartDrawer Component
 * Shopping cart sidebar/drawer with items management
 * 
 * Refactored applying react-best-practices:
 * - rendering-hoist-jsx: Static SVG icons hoisted outside components
 * - rerender-memo: CartItem memoized for performance
 * - Component extraction: EmptyCartState, CartItem, CartFooter
 */
import { memo, useMemo } from "react";
import { useStore } from "@nanostores/react";
import {
  $cartItems,
  $cartTotal,
  $isCartOpen,
  closeCart,
  removeFromCart,
  updateQuantity,
  clearCart,
} from "../../stores/cart";
import Button from "../ui/Button";
import { formatPrice } from "../../lib/formatters";

// =============================================================================
// Hoisted Static SVG Icons (rendering-hoist-jsx)
// =============================================================================

const CloseIcon = (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const EmptyCartIcon = (
  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1}
      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

const ImagePlaceholderIcon = (
  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1}
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const MinusIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
  </svg>
);

const PlusIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const TrashIcon = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

// =============================================================================
// Type Definitions
// =============================================================================

interface CartItemType {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen?: string | null;
  color?: string;
}

// =============================================================================
// Subcomponents
// =============================================================================

/**
 * Empty cart state display
 */
function EmptyCartState() {
  return (
    <div className="text-center py-12">
      {EmptyCartIcon}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Tu carrito está vacío
      </h3>
      <p className="text-gray-500 mb-6">
        Agrega productos para comenzar tu compra
      </p>
      <Button onClick={closeCart} variant="outline">
        Explorar productos
      </Button>
    </div>
  );
}

/**
 * Individual cart item - memoized for performance (rerender-memo)
 */
const CartItem = memo(function CartItem({ item }: { item: CartItemType }) {
  const itemKey = `${item.id}-${item.color || 'default'}`;

  return (
    <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
      {/* Image */}
      <div className="w-20 h-20 bg-gray-200 rounded-lg shrink-0 flex items-center justify-center">
        {item.imagen ? (
          <img
            src={item.imagen}
            alt={item.nombre}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          ImagePlaceholderIcon
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate">{item.nombre}</h4>
        {item.color ? (
          <p className="text-sm text-gray-500">Color: {item.color}</p>
        ) : null}
        <p className="text-orange-500 font-semibold mt-1">
          {formatPrice(item.precio)}
        </p>

        {/* Quantity controls */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => updateQuantity(item.id, item.cantidad - 1, item.color)}
            className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Reducir cantidad"
          >
            {MinusIcon}
          </button>
          <span className="w-8 text-center font-medium">{item.cantidad}</span>
          <button
            onClick={() => updateQuantity(item.id, item.cantidad + 1, item.color)}
            className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Aumentar cantidad"
          >
            {PlusIcon}
          </button>
          <button
            onClick={() => removeFromCart(item.id, item.color)}
            className="ml-auto p-2 text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Eliminar producto"
          >
            {TrashIcon}
          </button>
        </div>
      </div>
    </div>
  );
});

/**
 * Cart footer with total and checkout buttons
 */
function CartFooter({ total }: { total: number }) {
  return (
    <div className="border-t border-gray-200 p-6 space-y-4">
      {/* Subtotal */}
      <div className="flex justify-between text-lg">
        <span className="text-gray-600">Subtotal</span>
        <span className="font-bold text-gray-900">{formatPrice(total)}</span>
      </div>
      <p className="text-sm text-gray-500">
        Envío e impuestos calculados en el checkout
      </p>

      {/* Checkout buttons */}
      <div className="space-y-3">
        <a
          href="/checkout"
          onClick={closeCart}
          className="inline-flex items-center justify-center gap-2 w-full px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30"
        >
          Finalizar compra
        </a>
        <Button variant="outline" size="lg" fullWidth onClick={closeCart}>
          Continuar comprando
        </Button>
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export default function CartDrawer() {
  const isOpen = useStore($isCartOpen);
  const items = useStore($cartItems);
  const total = useStore($cartTotal);

  // Early return for closed state (rendering-conditional-render)
  if (!isOpen) return null;

  const hasItems = items.length > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={closeCart}
        role="presentation"
      />

      {/* Drawer */}
      <div
        className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Carrito ({items.length})
          </h2>
          <button
            onClick={closeCart}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Cerrar carrito"
          >
            {CloseIcon}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {hasItems ? (
            <div className="space-y-4">
              {items.map((item) => (
                <CartItem key={`${item.id}-${item.color || 'default'}`} item={item} />
              ))}

              {/* Clear cart button */}
              <button
                onClick={clearCart}
                className="w-full py-2 text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                Vaciar carrito
              </button>
            </div>
          ) : (
            <EmptyCartState />
          )}
        </div>

        {/* Footer - only shown when cart has items */}
        {hasItems ? <CartFooter total={total} /> : null}
      </div>
    </>
  );
}
