import { useEffect } from "react";
import { useStore } from "@nanostores/react";
import { $cartCount, openCart, addToCart } from "../../stores/cart";

export default function CartButton() {
  const count = useStore($cartCount);

  // Listen for cart:add events from other components
  useEffect(() => {
    const handleAddToCart = (e: CustomEvent) => {
      const { productId, nombre, precio, cantidad, color } = e.detail;
      addToCart({
        id: productId,
        nombre: nombre || `Producto ${productId}`,
        precio: precio || 0,
        cantidad: cantidad || 1,
        color,
      });
      openCart();
    };

    window.addEventListener("cart:add", handleAddToCart as EventListener);
    return () => {
      window.removeEventListener("cart:add", handleAddToCart as EventListener);
    };
  }, []);

  return (
    <button
      onClick={openCart}
      className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
      aria-label="Ver carrito"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
