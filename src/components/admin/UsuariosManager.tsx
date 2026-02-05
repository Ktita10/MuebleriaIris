/**
 * UsuariosManager Component
 * 
 * Main admin component for managing users.
 * Refactored to use extracted components and useEntityManager hook for better maintainability.
 * 
 * Original: 695 lines
 * After refactor: ~200 lines
 */
import { useState, useCallback } from 'react';
import { usuariosApi, rolesApi, type Usuario, type UsuarioInput, type Rol } from '../../lib/api';
import { useEntityManager } from '../../hooks/useEntityManager';
import {
  validateUsuarioForm,
  validatePassword,
  ICONS,
  UsuarioTable,
  UsuarioFormModal,
  PasswordModal,
} from './usuarios';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ErrorAlert, SuccessAlert } from '../ui/Alerts';
import { LoadingSpinner } from '../ui/LoadingSpinner';

// =============================================================================
// Main Component
// =============================================================================

export function UsuariosManager() {
  // ---------------------------------------------------------------------------
  // Additional State for Roles and Password Modal
  // ---------------------------------------------------------------------------
  const [roles, setRoles] = useState<Rol[]>([]);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  // ---------------------------------------------------------------------------
  // useEntityManager for CRUD operations
  // ---------------------------------------------------------------------------
  const manager = useEntityManager<Usuario, UsuarioInput & Record<string, unknown>>({
    entityName: 'usuario',
    fetchAll: () => usuariosApi.getAll(),
    create: (data) => usuariosApi.create(data),
    update: (id, data) => {
      // Don't send password in update (changed separately)
      const { password, ...updateData } = data;
      return usuariosApi.update(id, updateData);
    },
    remove: async (id) => {
      await usuariosApi.delete(id);
    },
    getEntityId: (usuario) => usuario.id,
    initialFormData: {
      nombre_us: '',
      apellido_us: '',
      email_us: '',
      password: '',
      id_rol: 0,
      activo: true,
    },
    validateForm: (data): Record<string, string> => validateUsuarioForm(data, !!manager.selectedItem),
    mapEntityToForm: (usuario) => {
      const rol = roles.find(r => r.nombre === usuario.rol);
      return {
        nombre_us: usuario.nombre,
        apellido_us: usuario.apellido,
        email_us: usuario.email,
        password: '', // Don't pre-fill password
        id_rol: rol?.id || 0,
        activo: usuario.activo,
      };
    },
    fetchRelated: async () => {
      const rolesData = await rolesApi.getAll();
      setRoles(rolesData);
    },
    filterFn: (usuario, searchTerm, filters) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        usuario.nombre.toLowerCase().includes(term) ||
        usuario.apellido.toLowerCase().includes(term) ||
        usuario.email.toLowerCase().includes(term);
      
      const roleFilter = filters.roleFilter as string;
      const matchesRole = !roleFilter || usuario.rol === roleFilter;
      
      return matchesSearch && matchesRole;
    },
  });

  // ---------------------------------------------------------------------------
  // Modal State
  // ---------------------------------------------------------------------------
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleOpenCreateModal = useCallback(() => {
    manager.resetForm();
    setFormMode('create');
    setIsFormModalOpen(true);
  }, [manager.resetForm]);

  const handleOpenEditModal = useCallback((usuario: Usuario) => {
    manager.selectForEdit(usuario);
    setFormMode('edit');
    setIsFormModalOpen(true);
  }, [manager.selectForEdit]);

  const handleCloseFormModal = useCallback(() => {
    setIsFormModalOpen(false);
    manager.clearSelection();
  }, [manager.clearSelection]);

  const handleFormSubmit = useCallback(async (e: React.FormEvent): Promise<boolean> => {
    const success = formMode === 'create' 
      ? await manager.handleCreate(e)
      : await manager.handleUpdate(e);
    
    if (success) {
      setIsFormModalOpen(false);
    }
    return success;
  }, [formMode, manager.handleCreate, manager.handleUpdate]);

  const handleOpenPasswordModal = useCallback((usuario: Usuario) => {
    manager.selectForEdit(usuario);
    manager.setError(null);
    setIsPasswordModalOpen(true);
  }, [manager.selectForEdit, manager.setError]);

  const handleClosePasswordModal = useCallback(() => {
    setIsPasswordModalOpen(false);
    manager.clearSelection();
  }, [manager.clearSelection]);

  const handleChangePassword = useCallback(async (newPassword: string): Promise<boolean> => {
    if (!manager.selectedItem) return false;

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      manager.setError(passwordError);
      return false;
    }

    try {
      manager.setError(null);
      await usuariosApi.changePassword(manager.selectedItem.id, newPassword);
      manager.setSuccess('Contraseña actualizada exitosamente');
      return true;
    } catch (err) {
      manager.setError(err instanceof Error ? err.message : 'Error al cambiar contraseña');
      return false;
    }
  }, [manager.selectedItem, manager.setError, manager.setSuccess]);

  const handleOpenDeleteDialog = useCallback((usuario: Usuario) => {
    manager.selectForDelete(usuario);
    setIsDeleteDialogOpen(true);
  }, [manager.selectForDelete]);

  const handleCloseDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    manager.clearSelection();
  }, [manager.clearSelection]);

  const handleDelete = useCallback(async () => {
    const success = await manager.handleDelete();
    if (success) {
      setIsDeleteDialogOpen(false);
    }
  }, [manager.handleDelete]);

  const handleRoleFilterChange = useCallback((roleFilter: string) => {
    manager.setFilters({ roleFilter });
  }, [manager.setFilters]);

  // ---------------------------------------------------------------------------
  // Loading State
  // ---------------------------------------------------------------------------
  if (manager.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  // Get current role filter value
  const currentRoleFilter = (manager.filters.roleFilter as string) || '';

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div>
      {/* Alerts */}
      {manager.error && <ErrorAlert message={manager.error} onClose={() => manager.setError(null)} />}
      {manager.success && <SuccessAlert message={manager.success} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
          <p className="text-gray-500">{manager.items.length} usuarios en total</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="btn-action btn-action-primary"
        >
          {ICONS.PlusIcon}
          Nuevo Usuario
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              {ICONS.SearchIcon}
              <input
                type="text"
                placeholder="Buscar por nombre, apellido o email..."
                value={manager.searchTerm}
                onChange={(e) => manager.setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={currentRoleFilter}
            onChange={(e) => handleRoleFilterChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Todos los roles</option>
            {roles.map((rol) => (
              <option key={rol.id} value={rol.nombre}>
                {rol.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <UsuarioTable
        usuarios={manager.filteredItems}
        onEdit={handleOpenEditModal}
        onChangePassword={handleOpenPasswordModal}
        onDelete={handleOpenDeleteDialog}
      />

      {/* Form Modal (Create/Edit) */}
      <UsuarioFormModal
        isOpen={isFormModalOpen}
        mode={formMode}
        formData={manager.formData as UsuarioInput}
        setFormData={manager.setFormData as React.Dispatch<React.SetStateAction<UsuarioInput>>}
        formErrors={manager.formErrors}
        roles={roles}
        isSubmitting={manager.isSubmitting}
        onSubmit={handleFormSubmit}
        onClose={handleCloseFormModal}
      />

      {/* Password Change Modal */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        usuario={manager.selectedItem}
        isSubmitting={manager.isSubmitting}
        onChangePassword={handleChangePassword}
        onClose={handleClosePasswordModal}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDelete}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que deseas eliminar al usuario "${manager.selectedItem?.nombre} ${manager.selectedItem?.apellido}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
        isLoading={manager.isSubmitting}
      />
    </div>
  );
}
