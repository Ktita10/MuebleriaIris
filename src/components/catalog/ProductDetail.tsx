/**
 * ProductDetail.tsx – Vista detallada de un producto
 * 
 * - Muestra información completa e imágenes de un producto.
 * - Permite seleccionar color, cantidad y agregar al carrito.
 * - Gestiona imágenes y variantes, simulando comunicación con API.
 * 
 * Objetivo: Brindar al usuario toda la información necesaria para decidir y comprar un producto específico.
 */
import { useState } from "react";
import Button from "../ui/Button";

interface ProductDetailProps {
  product: {
    id: number;
    nombre: string;
    precio: number;
    descripcion: string;
    categoria: string;
    material: string;
    dimensiones: { alto: number; ancho: number; profundidad: number };
    colores: string[];
    imagenes: (string | null)[];
    stock: number;
    sku: string;
  };
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(price);
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [selectedColor, setSelectedColor] = useState(product.colores[0]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    setIsAddingToCart(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Dispatch event for cart
    const event = new CustomEvent("cart:add", {
      detail: {
        productId: product.id,
        nombre: product.nombre,
        precio: product.precio,
        cantidad: quantity,
        color: selectedColor,
      },
    });
    window.dispatchEvent(event);

    setIsAddingToCart(false);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-12">
      {/* Image Gallery */}
      <div>
        {/* Main Image */}
        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-4">
          {product.imagenes[selectedImage] ? (
            <img
              src={product.imagenes[selectedImage]!}
              alt={product.nombre}
              className="w-full h-full object-cover rounded-2xl"
            />
          ) : (
            <svg
              className="w-32 h-32 text-gray-300"
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

        {/* Thumbnail Grid */}
        {product.imagenes.length > 1 && (
          <div className="grid grid-cols-4 gap-4">
            {product.imagenes.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-colors ${
                  selectedImage === idx
                    ? "border-primary-600"
                    : "border-transparent hover:border-gray-300"
                }`}
              >
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  {img ? (
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg
                      className="w-8 h-8 text-gray-300"
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
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div>
        <div className="mb-6">
          <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
            {product.categoria}
          </span>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            {product.nombre}
          </h1>
          <p className="text-sm text-gray-500">SKU: {product.sku}</p>
        </div>

        <div className="text-3xl font-bold text-primary-600 mb-6">
          {formatPrice(product.precio)}
          <span className="block text-sm text-gray-500 font-normal mt-1">
            12 cuotas sin interes de {formatPrice(product.precio / 12)}
          </span>
        </div>

        <p className="text-gray-600 leading-relaxed mb-8">
          {product.descripcion}
        </p>

        {/* Color Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Color: <span className="text-gray-900">{selectedColor}</span>
          </label>
          <div className="flex gap-3">
            {product.colores.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                  selectedColor === color
                    ? "border-primary-600 bg-primary-50 text-primary-700"
                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Cantidad
          </label>
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-gray-200 rounded-xl">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="w-12 text-center font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <span className="text-sm text-gray-500">
              {product.stock} disponibles
            </span>
          </div>
        </div>

        {/* Add to Cart */}
        <div className="flex gap-4 mb-8">
          <Button
            onClick={handleAddToCart}
            isLoading={isAddingToCart}
            size="lg"
            fullWidth
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            }
          >
            Agregar al carrito
          </Button>
          <button
            className="p-4 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-red-500 transition-colors"
            aria-label="Agregar a favoritos"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        {/* Product Details */}
        <div className="border-t border-gray-200 pt-8">
          <h3 className="font-semibold text-gray-900 mb-4">
            Especificaciones
          </h3>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Material</dt>
              <dd className="text-gray-900 font-medium">{product.material}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Alto</dt>
              <dd className="text-gray-900 font-medium">{product.dimensiones.alto} cm</dd>
            </div>
            <div>
              <dt className="text-gray-500">Ancho</dt>
              <dd className="text-gray-900 font-medium">{product.dimensiones.ancho} cm</dd>
            </div>
            <div>
              <dt className="text-gray-500">Profundidad</dt>
              <dd className="text-gray-900 font-medium">{product.dimensiones.profundidad} cm</dd>
            </div>
          </dl>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap gap-4 mt-8 pt-8 border-t border-gray-200 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Envio gratis +$50.000
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Garantia 2 anios
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            12 cuotas sin interes
          </div>
        </div>
      </div>
    </div>
     );
}

/**
==================================================
Flujo de trabajo y comunicación:

- Recibe el objeto producto como prop, proveniente de página Astro/SSR o consulta al API.
- Al agregar al carrito, dispara evento global ("cart:add") escuchado por el contexto de carrito.
- Puede ser utilizado en ruta dinámica (producto/[id].astro), integrándose a la navegación general.
- Se comunica hacia arriba con la vista/página para obtener datos, y hacia el contexto para actualizar el carrito.
==================================================
*/

