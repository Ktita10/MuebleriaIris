/**
 * ProveedorTable Component
 * Memoized table for displaying providers
 */
import React, { memo } from 'react';
import { type Proveedor } from '../../../lib/api';
import { ICONS } from './constants';

// =============================================================================
// Types
// =============================================================================

interface ProveedorTableProps {
  proveedores: Proveedor[];
  onEdit: (proveedor: Proveedor) => void;
  onDelete: (proveedor: Proveedor) => void;
}

interface ProveedorRowProps {
  proveedor: Proveedor;
  onEdit: (proveedor: Proveedor) => void;
  onDelete: (proveedor: Proveedor) => void;
}

// =============================================================================
// Memoized Row Component
// =============================================================================

const ProveedorRow = memo(function ProveedorRow({ proveedor, onEdit, onDelete }: ProveedorRowProps) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            {ICONS.BuildingIcon}
          </div>
          <span className="font-medium text-gray-900">{proveedor.nombre_empresa}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">{proveedor.contacto_nombre}</td>
      <td className="px-6 py-4 text-sm text-gray-600">{proveedor.email}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(proveedor)}
            className="btn-action btn-action-primary"
            title="Editar"
          >
            {ICONS.EditIcon}
          </button>
          <button
            onClick={() => onDelete(proveedor)}
            className="btn-action btn-action-danger"
            title="Eliminar"
          >
            {ICONS.TrashIcon}
          </button>
        </div>
      </td>
    </tr>
  );
});

// =============================================================================
// Empty State Component
// =============================================================================

const EmptyState = memo(function EmptyState() {
  return (
    <div className="text-center py-12">
      {ICONS.EmptyIcon}
      <h3 className="mt-2 text-sm font-medium text-gray-900">No hay proveedores</h3>
      <p className="mt-1 text-sm text-gray-500">Comienza creando un nuevo proveedor.</p>
    </div>
  );
});

// =============================================================================
// Main Table Component
// =============================================================================

export const ProveedorTable = memo(function ProveedorTable({
  proveedores,
  onEdit,
  onDelete,
}: ProveedorTableProps) {
  if (proveedores.length === 0) {
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
              <th className="px-6 py-4 font-medium">Empresa</th>
              <th className="px-6 py-4 font-medium">Contacto</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedores.map((proveedor) => (
              <ProveedorRow
                key={proveedor.id}
                proveedor={proveedor}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
