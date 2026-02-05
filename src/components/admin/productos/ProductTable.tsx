/**
 * ProductTable Component
 * Displays products in a table with actions
 * Extracted from ProductosManager for better separation of concerns
 */
import { memo } from 'react';
import { getImageUrl, type Producto } from '../../../lib/api';

interface ProductTableProps {
  productos: Producto[];
  onEdit: (producto: Producto) => void;
  onDelete: (producto: Producto) => void;
  onManageImages: (producto: Producto) => void;
  emptyMessage?: string;
}

// Hoisted static SVG icons (rendering-hoist-jsx)
const ImageIcon = (
  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const EditIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);

const DeleteIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const ImagesIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

// Table header configuration
const TABLE_HEADERS = [
  { label: 'Producto', className: 'text-left' },
  { label: 'SKU', className: 'text-left' },
  { label: 'Categoría', className: 'text-left' },
  { label: 'Material', className: 'text-left' },
  { label: 'Precio', className: 'text-left' },
  { label: 'Acciones', className: 'text-right' },
] as const;

// Memoized product row component (rerender-memo)
const ProductRow = memo(function ProductRow({
  producto,
  onEdit,
  onDelete,
  onManageImages,
}: {
  producto: Producto;
  onEdit: () => void;
  onDelete: () => void;
  onManageImages: () => void;
}) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    img.style.display = 'none';
    img.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
  };

  return (
    <tr className="hover:bg-gray-50">
      {/* Product info cell */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {producto.imagen_principal ? (
            <img
              src={getImageUrl(producto.imagen_principal)}
              alt={producto.nombre}
              className="w-12 h-12 rounded object-cover bg-gray-100"
              onError={handleImageError}
            />
          ) : null}
          <div
            className={[
              'w-12 h-12 bg-gray-200 rounded flex items-center justify-center',
              producto.imagen_principal ? 'hidden fallback-icon' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {ImageIcon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900 truncate">
              {producto.nombre}
            </div>
            <div className="text-xs text-gray-500">
              {producto.medidas.alto}x{producto.medidas.ancho}x{producto.medidas.profundidad} cm
            </div>
          </div>
        </div>
      </td>

      {/* SKU */}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
        {producto.sku}
      </td>

      {/* Category */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {producto.categoria}
      </td>

      {/* Material */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
        {producto.material}
      </td>

      {/* Price */}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
        ${producto.precio.toLocaleString()}
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onManageImages}
            className="btn-action btn-action-success"
            title="Gestionar imágenes"
          >
            {ImagesIcon}
            Imágenes
          </button>
          <button
            onClick={onEdit}
            className="btn-action btn-action-primary"
            title="Editar producto"
          >
            {EditIcon}
            Editar
          </button>
          <button
            onClick={onDelete}
            className="btn-action btn-action-danger"
            title="Desactivar producto"
          >
            {DeleteIcon}
            Eliminar
          </button>
        </div>
      </td>
    </tr>
  );
});

export function ProductTable({
  productos,
  onEdit,
  onDelete,
  onManageImages,
  emptyMessage = 'No hay productos registrados',
}: ProductTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {TABLE_HEADERS.map((header) => (
              <th
                key={header.label}
                className={`px-6 py-3 ${header.className} text-xs font-medium text-gray-500 uppercase`}
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {productos.map((producto) => (
            <ProductRow
              key={producto.id}
              producto={producto}
              onEdit={() => onEdit(producto)}
              onDelete={() => onDelete(producto)}
              onManageImages={() => onManageImages(producto)}
            />
          ))}
        </tbody>
      </table>

      {productos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
}
