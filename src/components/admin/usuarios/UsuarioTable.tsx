/**
 * UsuarioTable Component
 * Displays users in a table format with memoized rows
 */
import React, { memo } from 'react';
import { type Usuario } from '../../../lib/api';
import { ICONS } from './constants';

// =============================================================================
// Types
// =============================================================================

interface UsuarioTableProps {
  usuarios: Usuario[];
  onEdit: (usuario: Usuario) => void;
  onChangePassword: (usuario: Usuario) => void;
  onDelete: (usuario: Usuario) => void;
}

interface UsuarioRowProps {
  usuario: Usuario;
  onEdit: () => void;
  onChangePassword: () => void;
  onDelete: () => void;
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
        dangerouslySetInnerHTML={{ __html: ICONS.users }}
      />
      <h3 className="mt-2 text-sm font-medium text-gray-900">No hay usuarios</h3>
      <p className="mt-1 text-sm text-gray-500">Comienza creando un nuevo usuario.</p>
    </div>
  );
});

// =============================================================================
// Table Row Component (Memoized for performance)
// =============================================================================

const UsuarioRow = memo(function UsuarioRow({
  usuario,
  onEdit,
  onChangePassword,
  onDelete,
}: UsuarioRowProps) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{usuario.nombre}</td>
      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{usuario.apellido}</td>
      <td className="px-6 py-4 text-sm text-gray-600">{usuario.email}</td>
      <td className="px-6 py-4">
        <span className="badge-primary">{usuario.rol}</span>
      </td>
      <td className="px-6 py-4">
        <span className={usuario.activo ? 'badge-success' : 'badge-secondary'}>
          {usuario.activo ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {/* Edit Button */}
          <button
            onClick={onEdit}
            className="btn-action btn-action-primary p-2"
            title="Editar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              dangerouslySetInnerHTML={{ __html: ICONS.edit }}
            />
          </button>

          {/* Change Password Button */}
          <button
            onClick={onChangePassword}
            className="btn-action btn-action-warning p-2"
            title="Cambiar contraseña"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              dangerouslySetInnerHTML={{ __html: ICONS.key }}
            />
          </button>

          {/* Delete Button */}
          <button
            onClick={onDelete}
            className="btn-action btn-action-danger p-2"
            title="Eliminar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              dangerouslySetInnerHTML={{ __html: ICONS.trash }}
            />
          </button>
        </div>
      </td>
    </tr>
  );
});

// =============================================================================
// Main Table Component
// =============================================================================

export const UsuarioTable = memo(function UsuarioTable({
  usuarios,
  onEdit,
  onChangePassword,
  onDelete,
}: UsuarioTableProps) {
  if (usuarios.length === 0) {
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
              <th className="px-6 py-4 font-medium">Nombre</th>
              <th className="px-6 py-4 font-medium">Apellido</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Rol</th>
              <th className="px-6 py-4 font-medium">Estado</th>
              <th className="px-6 py-4 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <UsuarioRow
                key={usuario.id}
                usuario={usuario}
                onEdit={() => onEdit(usuario)}
                onChangePassword={() => onChangePassword(usuario)}
                onDelete={() => onDelete(usuario)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
