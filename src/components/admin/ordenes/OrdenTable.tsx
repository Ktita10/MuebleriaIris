/**
 * OrdenTable Component
 * Displays orders in a table format with memoized rows
 */
import React, { memo } from 'react';
import { type Orden } from '../../../lib/api';
import { formatPrice, formatDateTime } from '../../../lib/formatters';
import { ESTADO_COLORS, ESTADO_LABELS, ICONS, type EstadoOrden } from './constants';

// =============================================================================
// Types
// =============================================================================

interface OrdenTableProps {
  ordenes: Orden[];
  onViewDetails: (orden: Orden) => void;
  onChangeStatus: (orden: Orden) => void;
  onCancel: (orden: Orden) => void;
}

interface OrdenRowProps {
  orden: Orden;
  onViewDetails: () => void;
  onChangeStatus: () => void;
  onCancel: () => void;
}

// =============================================================================
// Empty State Component
// =============================================================================

const EmptyState = memo(function EmptyState() {
  return (
    <div className="text-center py-12">
      <svg 
        className="mx-auto h-12 w-12 text-gray-400" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        dangerouslySetInnerHTML={{ __html: ICONS.clipboard }}
      />
      <h3 className="mt-2 text-sm font-medium text-gray-900">No hay órdenes</h3>
      <p className="mt-1 text-sm text-gray-500">
        Las órdenes se crean desde el flujo de ventas o utilizando el botón "Nueva Orden".
      </p>
    </div>
  );
});

// =============================================================================
// Table Row Component (Memoized for performance)
// =============================================================================

const OrdenRow = memo(function OrdenRow({
  orden,
  onViewDetails,
  onChangeStatus,
  onCancel,
}: OrdenRowProps) {
  const isEditable = orden.estado !== 'cancelada' && orden.estado !== 'completada';

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 text-sm font-mono text-gray-900">#{orden.id}</td>
      <td className="px-6 py-4 text-sm font-medium text-gray-900">
        {orden.cliente.nombre_cliente} {orden.cliente.apellido_cliente}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {orden.vendedor.nombre} {orden.vendedor.apellido}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">
        {formatDateTime(orden.fecha_creacion)}
      </td>
      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
        {formatPrice(orden.total)}
      </td>
      <td className="px-6 py-4">
        <span className={ESTADO_COLORS[orden.estado as EstadoOrden]}>
          {ESTADO_LABELS[orden.estado as EstadoOrden]}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {/* View Details Button */}
          <button
            onClick={onViewDetails}
            className="btn-action btn-action-primary p-2"
            title="Ver detalles"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              dangerouslySetInnerHTML={{ __html: ICONS.eye }}
            />
          </button>

          {/* Change Status Button (only for editable orders) */}
          {isEditable && (
            <button
              onClick={onChangeStatus}
              className="btn-action btn-action-warning p-2"
              title="Cambiar estado"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                dangerouslySetInnerHTML={{ __html: ICONS.refresh }}
              />
            </button>
          )}

          {/* Cancel Button (only for editable orders) */}
          {isEditable && (
            <button
              onClick={onCancel}
              className="btn-action btn-action-danger p-2"
              title="Cancelar orden"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                dangerouslySetInnerHTML={{ __html: ICONS.x }}
              />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
});

// =============================================================================
// Main Table Component
// =============================================================================

export const OrdenTable = memo(function OrdenTable({
  ordenes,
  onViewDetails,
  onChangeStatus,
  onCancel,
}: OrdenTableProps) {
  if (ordenes.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-4 font-medium">ID</th>
              <th className="px-6 py-4 font-medium">Cliente</th>
              <th className="px-6 py-4 font-medium">Vendedor</th>
              <th className="px-6 py-4 font-medium">Fecha</th>
              <th className="px-6 py-4 font-medium">Total</th>
              <th className="px-6 py-4 font-medium">Estado</th>
              <th className="px-6 py-4 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.map((orden) => (
              <OrdenRow
                key={orden.id}
                orden={orden}
                onViewDetails={() => onViewDetails(orden)}
                onChangeStatus={() => onChangeStatus(orden)}
                onCancel={() => onCancel(orden)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
