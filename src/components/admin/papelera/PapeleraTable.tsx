/**
 * PapeleraTable Component
 * Displays trashed products with restore/delete actions (react-best-practices: rerender-memo)
 */
import React from 'react';
import { getImageUrl, type Producto } from '../../../lib/api';
import { ICONS } from './constants';

// ============================================================================
// TYPES
// ============================================================================

interface PapeleraTableProps {
  productos: Producto[];
  onRestore: (producto: Producto) => void;
  onDelete: (producto: Producto) => void;
}

// ============================================================================
// ROW COMPONENT (memoized)
// ============================================================================

const PapeleraRow = React.memo<{
  producto: Producto;
  onRestore: () => void;
  onDelete: () => void;
}>(({ producto, onRestore, onDelete }) => (
  <tr className="hover:bg-gray-50">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        {producto.imagen_principal ? (
          <img
            src={getImageUrl(producto.imagen_principal)}
            alt={producto.nombre}
            className="w-12 h-12 rounded object-cover bg-gray-100"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
            {ICONS.PlaceholderIcon}
          </div>
        )}
        <div>
          <div className="text-sm font-medium text-gray-900">{producto.nombre}</div>
          <div className="text-xs text-gray-500">{producto.material}</div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
      {producto.sku}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
      {producto.categoria || '-'}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
      ${producto.precio.toLocaleString()}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
      {producto.stock ?? 0}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={onRestore}
          className="btn-action btn-action-success"
          title="Restaurar producto"
        >
          {ICONS.RestoreIcon}
          Restaurar
        </button>
        <button
          onClick={onDelete}
          className="btn-action btn-action-danger"
          title="Eliminar permanentemente"
        >
          {ICONS.DeleteIcon}
          Eliminar
        </button>
      </div>
    </td>
  </tr>
));

PapeleraRow.displayName = 'PapeleraRow';

// ============================================================================
// MAIN TABLE COMPONENT (memoized)
// ============================================================================

export const PapeleraTable = React.memo<PapeleraTableProps>(
  ({ productos, onRestore, onDelete }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Producto
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              SKU
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Categoria
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Precio
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Stock
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {productos.map((producto) => (
            <PapeleraRow
              key={producto.id}
              producto={producto}
              onRestore={() => onRestore(producto)}
              onDelete={() => onDelete(producto)}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
);

PapeleraTable.displayName = 'PapeleraTable';
