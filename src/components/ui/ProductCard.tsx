interface ProductCardProps {
  id: number;
  nombre: string;
  precio: number;
  categoria?: string;
  imagen?: string | null;
  material?: string;
  onAddToCart?: (id: number) => void;
}

const API_BASE_URL = 'http://localhost:5000';

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(price);
}

function getImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
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
    <article className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
      {/* Product Image */}
      <a
        href={`/producto/${id}`}
        className="block relative aspect-square bg-gray-100 overflow-hidden"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              // If image fails to load, hide it
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
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
            className="absolute bottom-3 right-3 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-lg hover:bg-primary-700"
            aria-label="Agregar al carrito"
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
        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
          <a href={`/producto/${id}`}>{nombre}</a>
        </h3>
        <p className="text-lg font-bold text-primary-600">{formatPrice(precio)}</p>
      </div>
    </article>
  );
}
