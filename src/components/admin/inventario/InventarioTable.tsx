/**
 * InventarioTable Component
 * Displays inventory items in a table with stock actions (react-best-practices: rerender-memo)
 */
import React from 'react';
import { getImageUrl, type Inventario, type Producto } from '../../../lib/api';
import { ICONS, getStockStatus } from './constants';

// ============================================================================
// TYPES
// ============================================================================

interface InventarioExtendido extends Inventario {
  producto?: Producto;
}

interface InventarioTableProps {
  items: InventarioExtendido[];
  onAddStock: (item: InventarioExtendido) => void;
  onRemoveStock: (item: InventarioExtendido) => void;
}

// ============================================================================
// ROW COMPONENT (memoized)
// ============================================================================

const InventarioRow = React.memo<{
  item: InventarioExtendido;
  onAddStock: () => void;
  onRemoveStock: () => void;
}>(({ item, onAddStock, onRemoveStock }) => {
  const status = getStockStatus(item.stock, item.alerta_stock);

  return (
    <tr className="border-b border-gray-100">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {item.producto?.imagen_principal ? (
            <img
              src={getImageUrl(item.producto.imagen_principal)}
              alt={item.producto.nombre}
              className="w-12 h-12 rounded-lg object-cover shrink-0"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
              {ICONS.PlaceholderIcon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 truncate">
              {item.producto?.nombre || 'Producto desconocido'}
            </div>
            <div className="text-xs text-gray-500">SKU: {item.producto?.sku}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">{item.ubicacion}</td>
      <td className="px-6 py-4">
        <span className="text-2xl font-bold text-gray-900">{item.stock}</span>
        <span className="text-sm text-gray-500 ml-1">unidades</span>
      </td>
      <td className="px-6 py-4">
        <span className={status.color}>{status.label}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onAddStock}
            className="btn-action btn-action-success p-2"
            title="Agregar stock"
          >
            {ICONS.PlusIcon}
          </button>
          <button
            onClick={onRemoveStock}
            className="btn-action btn-action-danger p-2"
            title="Remover stock"
            disabled={item.stock === 0}
          >
            {ICONS.MinusIcon}
          </button>
        </div>
      </td>
    </tr>
  );
});

InventarioRow.displayName = 'InventarioRow';

// ============================================================================
// MAIN TABLE COMPONENT (memoized)
// ============================================================================

export const InventarioTable = React.memo<InventarioTableProps>(
  ({ items, onAddStock, onRemoveStock }) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-12">
          {ICONS.EmptyIcon}
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No hay productos en inventario
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Los productos se agregan automáticamente al ser creados.
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-4 font-medium">Producto</th>
              <th className="px-6 py-4 font-medium">Ubicación</th>
              <th className="px-6 py-4 font-medium">Stock</th>
              <th className="px-6 py-4 font-medium">Estado</th>
              <th className="px-6 py-4 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <InventarioRow
                key={item.id}
                item={item}
                onAddStock={() => onAddStock(item)}
                onRemoveStock={() => onRemoveStock(item)}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
);

InventarioTable.displayName = 'InventarioTable';
