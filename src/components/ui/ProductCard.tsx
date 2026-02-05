import { getImageUrl } from '../../lib/api';
import { formatPrice } from '../../lib/formatters';

interface ProductCardProps {
  id: number;
  nombre: string;
  precio: number;
  categoria?: string;
  imagen?: string | null;
  material?: string;
  onAddToCart?: (id: number) => void;
}

export default function ProductCard({
  id,
  nombre,
  precio,
  categoria,
  imagen,
  material,
  onAddToCart,
}: ProductCardProps) {
  const imageUrl = getImageUrl(imagen);

  return (
    <article className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      {/* Product Image */}
      <a
        href={`/producto/${id}`}
        className="block relative aspect-square bg-linear-to-br from-gray-50 to-gray-100 overflow-hidden"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={nombre}
            className="w-full h-full object-contain p-4"
            loading="lazy"
            onError={(e) => {
              // If image fails to load, hide it
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200">
            <svg
              className="w-20 h-20 text-gray-300"
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
          </div>
        )}

        {/* Category Badge */}
        {categoria && (
          <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-full shadow-sm">
            {categoria}
          </span>
        )}

        {/* Quick Add Button */}
        {onAddToCart && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddToCart(id);
            }}
            className="absolute bottom-3 right-3 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg"
            aria-label="Agregar al carrito"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        )}
      </a>

      {/* Product Info */}
      <div className="p-4">
        {material && (
          <span className="text-xs text-gray-500 mb-1 block">{material}</span>
        )}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          <a href={`/producto/${id}`}>{nombre}</a>
        </h3>
        <p className="text-lg font-bold text-primary-600">{formatPrice(precio)}</p>
      </div>
    </article>
  );
}
