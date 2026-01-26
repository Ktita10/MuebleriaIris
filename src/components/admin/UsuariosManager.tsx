"use client";
import { useState, useEffect } from 'react';
import { usuariosApi, rolesApi, type Usuario, type UsuarioInput, type Rol } from '../../lib/api';
import Modal from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ErrorAlert, SuccessAlert } from '../ui/Alerts';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface FormErrors {
  nombre_us?: string;
  apellido_us?: string;
  email_us?: string;
  password?: string;
  id_rol?: string;
}

export function UsuariosManager() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<UsuarioInput>({
    nombre_us: '',
    apellido_us: '',
    email_us: '',
    password: '',
    id_rol: 0,
    activo: true,
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    let result = usuarios;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        u =>
          u.nombre.toLowerCase().includes(term) ||
          u.apellido.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term)
      );
    }

    // Filter by role
    if (roleFilter) {
      result = result.filter(u => u.rol === roleFilter);
    }

    setFilteredUsuarios(result);
  }, [searchTerm, roleFilter, usuarios]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usuariosData, rolesData] = await Promise.all([
        usuariosApi.getAll(),
        rolesApi.getAll(),
      ]);
      setUsuarios(usuariosData);
      setRoles(rolesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.nombre_us.trim()) {
      errors.nombre_us = 'El nombre es requerido';
    }
    if (!formData.apellido_us.trim()) {
      errors.apellido_us = 'El apellido es requerido';
    }
    if (!formData.email_us.trim()) {
      errors.email_us = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_us)) {
      errors.email_us = 'Email inválido';
    }
    if (!selectedUsuario && !formData.password?.trim()) {
      errors.password = 'La contraseña es requerida';
    } else if (!selectedUsuario && (formData.password?.length || 0) < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    if (!formData.id_rol || formData.id_rol === 0) {
      errors.id_rol = 'Debe seleccionar un rol';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await usuariosApi.create(formData);
      setSuccess('Usuario creado exitosamente');
      setIsCreateModalOpen(false);
      resetForm();
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedUsuario || !validateForm()) return;

    try {
      setIsSubmitting(true);
      setError(null);
      
      // Don't send password if it's empty (keep existing password)
      const updateData: Partial<UsuarioInput> = {
        nombre_us: formData.nombre_us,
        apellido_us: formData.apellido_us,
        email_us: formData.email_us,
        id_rol: formData.id_rol,
        activo: formData.activo,
      };

      await usuariosApi.update(selectedUsuario.id, updateData);
      setSuccess('Usuario actualizado exitosamente');
      setIsEditModalOpen(false);
      resetForm();
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    if (!selectedUsuario) return;

    if (!newPassword.trim()) {
      setError('La contraseña no puede estar vacía');
      return;
    }
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await usuariosApi.changePassword(selectedUsuario.id, newPassword);
      setSuccess('Contraseña actualizada exitosamente');
      setIsPasswordModalOpen(false);
      setNewPassword('');
      setSelectedUsuario(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar contraseña');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUsuario) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await usuariosApi.delete(selectedUsuario.id);
      setSuccess('Usuario eliminado exitosamente');
      setIsDeleteDialogOpen(false);
      setSelectedUsuario(null);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const openEditModal = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    const rol = roles.find(r => r.nombre === usuario.rol);
    setFormData({
      nombre_us: usuario.nombre,
      apellido_us: usuario.apellido,
      email_us: usuario.email,
      password: '', // Don't pre-fill password
      id_rol: rol?.id || 0,
      activo: usuario.activo,
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const openPasswordModal = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setNewPassword('');
    setError(null);
    setIsPasswordModalOpen(true);
  };

  const openDeleteDialog = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      nombre_us: '',
      apellido_us: '',
      email_us: '',
      password: '',
      id_rol: 0,
      activo: true,
    });
    setFormErrors({});
    setSelectedUsuario(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      {/* Alerts */}
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      {success && <SuccessAlert message={success} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
          <p className="text-gray-500">{usuarios.length} usuarios en total</p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-action btn-action-primary"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Usuario
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por nombre, apellido o email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Todos los roles</option>
            {roles.map(rol => (
              <option key={rol.id} value={rol.nombre}>{rol.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filteredUsuarios.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay usuarios</h3>
            <p className="mt-1 text-sm text-gray-500">Comienza creando un nuevo usuario.</p>
          </div>
        ) : (
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
                {filteredUsuarios.map(usuario => (
                  <tr key={usuario.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{usuario.nombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{usuario.apellido}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{usuario.email}</td>
                    <td className="px-6 py-4">
                      <span className="badge-primary">
                        {usuario.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={usuario.activo ? 'badge-success' : 'badge-secondary'}>
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(usuario)}
                          className="btn-action btn-action-primary p-2"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openPasswordModal(usuario)}
                          className="btn-action btn-action-warning p-2"
                          title="Cambiar contraseña"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openDeleteDialog(usuario)}
                          className="btn-action btn-action-danger p-2"
                          title="Eliminar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="Crear Nuevo Usuario"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nombre_us}
              onChange={e => setFormData({ ...formData, nombre_us: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formErrors.nombre_us ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Juan"
            />
            {formErrors.nombre_us && <p className="mt-1 text-sm text-red-600">{formErrors.nombre_us}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellido <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.apellido_us}
              onChange={e => setFormData({ ...formData, apellido_us: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formErrors.apellido_us ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Pérez"
            />
            {formErrors.apellido_us && <p className="mt-1 text-sm text-red-600">{formErrors.apellido_us}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email_us}
              onChange={e => setFormData({ ...formData, email_us: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formErrors.email_us ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="juan@ejemplo.com"
            />
            {formErrors.email_us && <p className="mt-1 text-sm text-red-600">{formErrors.email_us}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={formData.password_hash}
              onChange={e => setFormData({ ...formData, password_hash: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formErrors.password_hash ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Mínimo 6 caracteres"
            />
            {formErrors.password_hash && <p className="mt-1 text-sm text-red-600">{formErrors.password_hash}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.id_rol}
              onChange={e => setFormData({ ...formData, id_rol: parseInt(e.target.value) })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formErrors.id_rol ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value={0}>Seleccionar rol...</option>
              {roles.map(rol => (
                <option key={rol.id} value={rol.id}>{rol.nombre}</option>
              ))}
            </select>
            {formErrors.id_rol && <p className="mt-1 text-sm text-red-600">{formErrors.id_rol}</p>}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="activo-create"
              checked={formData.activo}
              onChange={e => setFormData({ ...formData, activo: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="activo-create" className="ml-2 block text-sm text-gray-700">
              Usuario activo
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleCreate}
              disabled={isSubmitting}
              className="btn-action btn-action-primary flex-1 justify-center"
            >
              {isSubmitting ? 'Creando...' : 'Crear Usuario'}
            </button>
            <button
              onClick={() => {
                setIsCreateModalOpen(false);
                resetForm();
              }}
              disabled={isSubmitting}
              className="btn-action btn-action-outline flex-1 justify-center"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          resetForm();
        }}
        title="Editar Usuario"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nombre_us}
              onChange={e => setFormData({ ...formData, nombre_us: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formErrors.nombre_us ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Juan"
            />
            {formErrors.nombre_us && <p className="mt-1 text-sm text-red-600">{formErrors.nombre_us}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellido <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.apellido_us}
              onChange={e => setFormData({ ...formData, apellido_us: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formErrors.apellido_us ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Pérez"
            />
            {formErrors.apellido_us && <p className="mt-1 text-sm text-red-600">{formErrors.apellido_us}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email_us}
              onChange={e => setFormData({ ...formData, email_us: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formErrors.email_us ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="juan@ejemplo.com"
            />
            {formErrors.email_us && <p className="mt-1 text-sm text-red-600">{formErrors.email_us}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.id_rol}
              onChange={e => setFormData({ ...formData, id_rol: parseInt(e.target.value) })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formErrors.id_rol ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value={0}>Seleccionar rol...</option>
              {roles.map(rol => (
                <option key={rol.id} value={rol.id}>{rol.nombre}</option>
              ))}
            </select>
            {formErrors.id_rol && <p className="mt-1 text-sm text-red-600">{formErrors.id_rol}</p>}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="activo-edit"
              checked={formData.activo}
              onChange={e => setFormData({ ...formData, activo: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="activo-edit" className="ml-2 block text-sm text-gray-700">
              Usuario activo
            </label>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Para cambiar la contraseña, use el botón "Cambiar contraseña" en la tabla.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleEdit}
              disabled={isSubmitting}
              className="btn-action btn-action-primary flex-1 justify-center"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button
              onClick={() => {
                setIsEditModalOpen(false);
                resetForm();
              }}
              disabled={isSubmitting}
              className="btn-action btn-action-outline flex-1 justify-center"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setNewPassword('');
          setSelectedUsuario(null);
        }}
        title="Cambiar Contraseña"
      >
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Usuario:</strong> {selectedUsuario?.nombre} {selectedUsuario?.apellido}
            </p>
            <p className="text-sm text-gray-600">{selectedUsuario?.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nueva Contraseña <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Mínimo 6 caracteres"
            />
            <p className="mt-1 text-xs text-gray-500">La contraseña debe tener al menos 6 caracteres</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleChangePassword}
              disabled={isSubmitting}
              className="btn-action btn-action-warning flex-1 justify-center"
            >
              {isSubmitting ? 'Cambiando...' : 'Cambiar Contraseña'}
            </button>
            <button
              onClick={() => {
                setIsPasswordModalOpen(false);
                setNewPassword('');
                setSelectedUsuario(null);
              }}
              disabled={isSubmitting}
              className="btn-action btn-action-outline flex-1 justify-center"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedUsuario(null);
        }}
        onConfirm={handleDelete}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que deseas eliminar al usuario "${selectedUsuario?.nombre} ${selectedUsuario?.apellido}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
