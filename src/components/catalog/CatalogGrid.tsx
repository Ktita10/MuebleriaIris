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
import { LoadingSpinner } from "../ui/LoadingSpinner";

interface CatalogGridProps {
  categoria?: string | null;
  buscar?: string | null;
  orden?: string;
  paginaInicial?: number;
  onFiltersReady?: (callback: (buscar: string, orden: string) => void) => void;
}

const categoryMap: Record<string, string> = {
  sofas: "Sofas",
  sillas: "Sillas",
  mesas: "Mesas",
  camas: "Camas",
  estanterias: "Estanterias",
};

export default function CatalogGrid({ categoria, buscar, orden = "nombre", paginaInicial = 1, onFiltersReady }: CatalogGridProps) {
  const [products, setProducts] = useState<Producto[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(paginaInicial);
  const [currentBuscar, setCurrentBuscar] = useState(buscar || '');
  const [currentOrden, setCurrentOrden] = useState(orden);
  
  const ITEMS_PER_PAGE = 20; // 5 rows × 4 columns

  // Register callback for real-time filtering
  useEffect(() => {
    if (onFiltersReady) {
      onFiltersReady((newBuscar: string, newOrden: string) => {
        setCurrentBuscar(newBuscar);
        setCurrentOrden(newOrden);
        setCurrentPage(1); // Reset to page 1 on filter change
      });
    }
  }, [onFiltersReady]);

  useEffect(() => {
    loadProducts();
  }, [categoria]);

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all products from API
      const allProducts = await productosApi.getAll();
      let filtered = [...allProducts];

      // Filter by category (case-insensitive comparison)
      if (categoria && categoryMap[categoria.toLowerCase()]) {
        const categoryName = categoryMap[categoria.toLowerCase()];
        filtered = filtered.filter(
          (p) => p.categoria.toLowerCase() === categoryName.toLowerCase()
        );
      }

      setProducts(filtered);
      setFilteredProducts(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar productos");
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters and sorting in real-time
  useEffect(() => {
    let filtered = [...products];

    // Filter by search
    if (currentBuscar) {
      const searchLower = currentBuscar.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.nombre.toLowerCase().includes(searchLower) ||
          p.descripcion?.toLowerCase().includes(searchLower) ||
          p.material?.toLowerCase().includes(searchLower)
      );
    }

    // Sort products
    switch (currentOrden) {
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

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [products, currentBuscar, currentOrden]);

  const handleAddToCart = (id: number) => {
    // Dispatch custom event to trigger cart addition
    const event = new CustomEvent("cart:add", { detail: { productId: id } });
    window.dispatchEvent(event);
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" centered={false} />;
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

  if (filteredProducts.length === 0) {
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
        {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""} encontrado
        {filteredProducts.length !== 1 ? "s" : ""}
      </p>

      {/* Product Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts
          .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
          .map((product) => (
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

      {/* Pagination Controls */}
      {filteredProducts.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-center gap-2 mt-12">
          {/* Previous button */}
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Página anterior"
          >
            ←
          </button>

          {/* Page numbers */}
          {Array.from({ length: Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) }, (_, i) => i + 1).map((pageNum) => {
            const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
            
            // Show first page, last page, current page, and pages around current
            const showPage = 
              pageNum === 1 || 
              pageNum === totalPages || 
              (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);
            
            // Show ellipsis
            const showEllipsis = 
              (pageNum === 2 && currentPage > 3) ||
              (pageNum === totalPages - 1 && currentPage < totalPages - 2);
            
            if (!showPage && !showEllipsis) return null;
            
            if (showEllipsis) {
              return (
                <span key={pageNum} className="px-2 text-gray-400">
                  ...
                </span>
              );
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === pageNum
                    ? 'bg-primary-600 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          {/* Next button */}
          <button
            onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredProducts.length / ITEMS_PER_PAGE), p + 1))}
            disabled={currentPage === Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Página siguiente"
          >
            →
          </button>
        </div>
      )}
    </>
  );
}
