/**
 * CatalogGrid.tsx – Grilla de productos del catálogo
 * 
 * - Muestra productos en formato grid, filtrando por categoría, búsqueda o orden.
 * - Soporta carga asincrónica; muestra spinner y mensajes de error.
 * - Permite agregar productos al carrito interactuando con el contexto global (o disparando eventos).
 * 
 * Objetivo: Presentar al usuario una experiencia eficiente de exploración del catálogo.
 */
import { useState, useEffect } from "react";
import { productosApi, type Producto } from "../../lib/api";
import ProductCard from "../ui/ProductCard";
import Spinner from "../ui/Spinner";

interface CatalogGridProps {
  categoria?: string | null;
  buscar?: string | null;
  orden?: string;
}

const categoryMap: Record<string, string> = {
  sofas: "Sofas",
  sillas: "Sillas",
  mesas: "Mesas",
  camas: "Camas",
  estanterias: "Estanterias",
};

export default function CatalogGrid({ categoria, buscar, orden = "nombre" }: CatalogGridProps) {
  const [products, setProducts] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, [categoria, buscar, orden]);

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all products from API
      const allProducts = await productosApi.getAll();
      let filtered = [...allProducts];

      // Filter by category
      if (categoria && categoryMap[categoria]) {
        filtered = filtered.filter((p) => p.categoria === categoryMap[categoria]);
      }

      // Filter by search
      if (buscar) {
        const searchLower = buscar.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.nombre.toLowerCase().includes(searchLower) ||
            p.descripcion?.toLowerCase().includes(searchLower) ||
            p.material?.toLowerCase().includes(searchLower)
        );
      }

      // Sort products
      switch (orden) {
        case "precio_asc":
          filtered.sort((a, b) => a.precio - b.precio);
          break;
        case "precio_desc":
          filtered.sort((a, b) => b.precio - a.precio);
          break;
        case "nombre":
        default:
          filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
          break;
      }

      setProducts(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar productos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (id: number) => {
    // In production, this would add to cart context
    console.log("Adding to cart:", id);
    // Show toast notification
    const event = new CustomEvent("cart:add", { detail: { productId: id } });
    window.dispatchEvent(event);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 mb-2">Error al cargar productos</p>
        <p className="text-gray-600 text-sm mb-4">{error}</p>
        <button
          onClick={() => loadProducts()}
          className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <svg
          className="w-16 h-16 mx-auto text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No encontramos productos
        </h3>
        <p className="text-gray-600 mb-4">
          Intenta con otros filtros o explora todo el catalogo
        </p>
        <a
          href="/catalogo"
          className="inline-block px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
        >
          Ver todo el catalogo
        </a>
      </div>
    );
  }

  return (
    <>
      {/* Results count */}
      <p className="text-sm text-gray-500 mb-6">
        {products.length} producto{products.length !== 1 ? "s" : ""} encontrado
        {products.length !== 1 ? "s" : ""}
      </p>

      {/* Product Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            nombre={product.nombre}
            precio={product.precio}
            categoria={product.categoria}
            imagen={product.imagen_principal}
            material={product.material}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>
    </>
  );
}
