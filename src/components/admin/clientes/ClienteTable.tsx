/**
 * ClienteTable Component
 * Displays the table of clientes with memoized rows for performance
 */
import { memo } from 'react';
import type { Cliente } from '../../../lib/api';
import { ICONS } from './constants';

// =============================================================================
// Types
// =============================================================================

interface ClienteTableProps {
  clientes: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onDelete: (cliente: Cliente) => void;
}

// =============================================================================
// Memoized Row Component (react-best-practices: rerender-memo)
// =============================================================================

const ClienteRow = memo(({ 
  cliente, 
  onEdit, 
  onDelete 
}: {
  cliente: Cliente;
  onEdit: (cliente: Cliente) => void;
  onDelete: (cliente: Cliente) => void;
}) => (
  <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          {ICONS.UserIcon}
        </div>
        <div>
          <div className="font-medium text-gray-900">{cliente.nombre} {cliente.apellido}</div>
          <div className="text-sm text-gray-500">{cliente.email}</div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4 text-sm text-gray-600">{cliente.dni_cuit}</td>
    <td className="px-6 py-4 text-sm text-gray-600">{cliente.ciudad}</td>
    <td className="px-6 py-4">
      <div className="flex items-center gap-2 justify-end">
        <button
          onClick={() => onEdit(cliente)}
          className="btn-action btn-action-primary"
          title="Editar"
        >
          {ICONS.EditIcon}
        </button>
        <button
          onClick={() => onDelete(cliente)}
          className="btn-action btn-action-danger"
          title="Eliminar"
        >
          {ICONS.TrashIcon}
        </button>
      </div>
    </td>
  </tr>
));

ClienteRow.displayName = 'ClienteRow';

// =============================================================================
// Main Component
// =============================================================================

export const ClienteTable = memo(({ clientes, onEdit, onDelete }: ClienteTableProps) => {
  if (clientes.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="text-center py-12">
          {ICONS.EmptyIcon}
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay clientes</h3>
          <p className="mt-1 text-sm text-gray-500">Comienza creando un nuevo cliente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-4 font-medium">Cliente</th>
              <th className="px-6 py-4 font-medium">DNI/CUIT</th>
              <th className="px-6 py-4 font-medium">Ciudad</th>
              <th className="px-6 py-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <ClienteRow
                key={cliente.id}
                cliente={cliente}
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

ClienteTable.displayName = 'ClienteTable';
