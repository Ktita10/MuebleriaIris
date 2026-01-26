"use client";
import { useState, useEffect } from 'react';
import { proveedoresApi, type Proveedor, type ProveedorInput } from '../../lib/api';
import Modal from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ErrorAlert, SuccessAlert } from '../ui/Alerts';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface FormErrors {
  nombre_empresa?: string;
  contacto_nombre?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}

export function ProveedoresManager() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [filteredProveedores, setFilteredProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<ProveedorInput>({
    nombre_empresa: '',
    contacto_nombre: '',
    telefono: '',
    email: '',
    direccion: '',
    activo: true,
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

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
    let result = proveedores;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        p =>
          p.nombre_empresa.toLowerCase().includes(term) ||
          p.contacto_nombre.toLowerCase().includes(term) ||
          p.email.toLowerCase().includes(term)
      );
    }

    setFilteredProveedores(result);
  }, [searchTerm, proveedores]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await proveedoresApi.getAll();
      setProveedores(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.nombre_empresa.trim()) {
      errors.nombre_empresa = 'El nombre de la empresa es requerido';
    }
    if (!formData.contacto_nombre.trim()) {
      errors.contacto_nombre = 'El nombre del contacto es requerido';
    }
    if (!formData.telefono.trim()) {
      errors.telefono = 'El teléfono es requerido';
    }
    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido';
    }
    if (!formData.direccion.trim()) {
      errors.direccion = 'La dirección es requerida';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await proveedoresApi.create(formData);
      setSuccess('Proveedor creado exitosamente');
      setIsCreateModalOpen(false);
      resetForm();
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear proveedor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProveedor || !validateForm()) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await proveedoresApi.update(selectedProveedor.id, formData);
      setSuccess('Proveedor actualizado exitosamente');
      setIsEditModalOpen(false);
      resetForm();
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar proveedor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProveedor) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await proveedoresApi.delete(selectedProveedor.id);
      setSuccess('Proveedor eliminado exitosamente');
      setIsDeleteDialogOpen(false);
      setSelectedProveedor(null);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar proveedor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const openEditModal = (proveedor: Proveedor) => {
    setSelectedProveedor(proveedor);
    // Note: The Proveedor interface from API doesn't include all fields, 
    // but we need to fetch the full details first
    // For now, we'll use what we have and assume the backend returns full details
    setFormData({
      nombre_empresa: proveedor.nombre_empresa,
      contacto_nombre: proveedor.contacto_nombre,
      telefono: proveedor.telefono,
      email: proveedor.email,
      direccion: proveedor.direccion,
      activo: proveedor.activo,
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const openDeleteDialog = (proveedor: Proveedor) => {
    setSelectedProveedor(proveedor);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      nombre_empresa: '',
      contacto_nombre: '',
      telefono: '',
      email: '',
      direccion: '',
      activo: true,
    });
    setFormErrors({});
    setSelectedProveedor(null);
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
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Proveedores</h2>
          <p className="text-gray-500">{proveedores.length} proveedores en total</p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-action btn-action-primary"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Proveedor
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por empresa, contacto o email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Proveedores Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filteredProveedores.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay proveedores</h3>
            <p className="mt-1 text-sm text-gray-500">Comienza creando un nuevo proveedor.</p>
          </div>
        ) : (
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
                {filteredProveedores.map(proveedor => (
                  <tr key={proveedor.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <span className="font-medium text-gray-900">{proveedor.nombre_empresa}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{proveedor.contacto_nombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{proveedor.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(proveedor)}
                          className="btn-action btn-action-primary"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openDeleteDialog(proveedor)}
                          className="btn-action btn-action-danger"
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
        title="Crear Nuevo Proveedor"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la Empresa <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nombre_empresa}
              onChange={e => setFormData({ ...formData, nombre_empresa: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formErrors.nombre_empresa ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Muebles SA"
            />
            {formErrors.nombre_empresa && <p className="mt-1 text-sm text-red-600">{formErrors.nombre_empresa}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Contacto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.contacto_nombre}
              onChange={e => setFormData({ ...formData, contacto_nombre: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formErrors.contacto_nombre ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Juan Pérez"
            />
            {formErrors.contacto_nombre && <p className="mt-1 text-sm text-red-600">{formErrors.contacto_nombre}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={e => setFormData({ ...formData, telefono: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formErrors.telefono ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="+54 11 1234-5678"
            />
            {formErrors.telefono && <p className="mt-1 text-sm text-red-600">{formErrors.telefono}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="contacto@empresa.com"
            />
            {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.direccion}
              onChange={e => setFormData({ ...formData, direccion: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formErrors.direccion ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Calle 123, Ciudad"
              rows={3}
            />
            {formErrors.direccion && <p className="mt-1 text-sm text-red-600">{formErrors.direccion}</p>}
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
              Proveedor activo
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-action btn-action-primary flex-1"
            >
              {isSubmitting ? 'Creando...' : 'Crear Proveedor'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreateModalOpen(false);
                resetForm();
              }}
              disabled={isSubmitting}
              className="btn-action btn-action-outline flex-1"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          resetForm();
        }}
        title="Editar Proveedor"
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la Empresa <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nombre_empresa}
              onChange={e => setFormData({ ...formData, nombre_empresa: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formErrors.nombre_empresa ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Muebles SA"
            />
            {formErrors.nombre_empresa && <p className="mt-1 text-sm text-red-600">{formErrors.nombre_empresa}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Contacto <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.contacto_nombre}
              onChange={e => setFormData({ ...formData, contacto_nombre: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formErrors.contacto_nombre ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Juan Pérez"
            />
            {formErrors.contacto_nombre && <p className="mt-1 text-sm text-red-600">{formErrors.contacto_nombre}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={e => setFormData({ ...formData, telefono: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formErrors.telefono ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="+54 11 1234-5678"
            />
            {formErrors.telefono && <p className="mt-1 text-sm text-red-600">{formErrors.telefono}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="contacto@empresa.com"
            />
            {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.direccion}
              onChange={e => setFormData({ ...formData, direccion: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${formErrors.direccion ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Calle 123, Ciudad"
              rows={3}
            />
            {formErrors.direccion && <p className="mt-1 text-sm text-red-600">{formErrors.direccion}</p>}
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
              Proveedor activo
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-action btn-action-primary flex-1"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditModalOpen(false);
                resetForm();
              }}
              disabled={isSubmitting}
              className="btn-action btn-action-outline flex-1"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedProveedor(null);
        }}
        onConfirm={handleDelete}
        title="Eliminar Proveedor"
        message={`¿Estás seguro de que deseas eliminar al proveedor "${selectedProveedor?.nombre_empresa}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
