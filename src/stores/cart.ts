// Cart store using nanostores for Astro
// This allows state to be shared between React islands
import { atom, computed } from "nanostores";

export interface CartItem {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  color?: string;
  imagen?: string | null;
}

// Initialize cart from localStorage if available
function getInitialCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("muebleria-cart");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Cart items atom
export const $cartItems = atom<CartItem[]>([]);

// Initialize cart on client
if (typeof window !== "undefined") {
  $cartItems.set(getInitialCart());

  // Persist to localStorage on changes
  $cartItems.subscribe((items) => {
    localStorage.setItem("muebleria-cart", JSON.stringify(items));
  });
}

// Computed values
export const $cartCount = computed($cartItems, (items) =>
  items.reduce((total, item) => total + item.cantidad, 0)
);

export const $cartTotal = computed($cartItems, (items) =>
  items.reduce((total, item) => total + item.precio * item.cantidad, 0)
);

// Cart actions
export function addToCart(item: Omit<CartItem, "cantidad"> & { cantidad?: number }) {
  const items = $cartItems.get();
  const existingIndex = items.findIndex(
    (i) => i.id === item.id && i.color === item.color
  );

  if (existingIndex >= 0) {
    // Update quantity
    const updated = [...items];
    updated[existingIndex].cantidad += item.cantidad || 1;
    $cartItems.set(updated);
  } else {
    // Add new item
    $cartItems.set([...items, { ...item, cantidad: item.cantidad || 1 }]);
  }
}

export function removeFromCart(id: number, color?: string) {
  const items = $cartItems.get();
  $cartItems.set(items.filter((i) => !(i.id === id && i.color === color)));
}

export function updateQuantity(id: number, cantidad: number, color?: string) {
  if (cantidad <= 0) {
    removeFromCart(id, color);
    return;
  }

  const items = $cartItems.get();
  const updated = items.map((item) =>
    item.id === id && item.color === color ? { ...item, cantidad } : item
  );
  $cartItems.set(updated);
}

export function clearCart() {
  $cartItems.set([]);
}

// Cart open state
export const $isCartOpen = atom(false);

export function openCart() {
  $isCartOpen.set(true);
}

export function closeCart() {
  $isCartOpen.set(false);
}

export function toggleCart() {
  $isCartOpen.set(!$isCartOpen.get());
}
