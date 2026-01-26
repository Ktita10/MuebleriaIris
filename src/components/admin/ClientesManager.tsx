/**
 * ClientesManager Component
 * Full CRUD operations for clients
 */
"use client";

import { useState, useEffect } from 'react';
import { clientesApi, type Cliente, type ClienteInput } from '../../lib/api';
import Modal from '../ui/Modal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ErrorAlert, SuccessAlert } from '../ui/Alerts';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export function ClientesManager() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState<ClienteInput>({
    nombre_cliente: '',
    apellido_cliente: '',
    dni_cuit: '',
    email_cliente: '',
    telefono: '',
    direccion_cliente: '',
    ciudad_cliente: '',
    codigo_postal: '',
    provincia_cliente: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadClientes();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const loadClientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clientesApi.getAll();
      setClientes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.nombre_cliente.trim()) errors.nombre_cliente = 'Nombre requerido';
    if (!formData.apellido_cliente.trim()) errors.apellido_cliente = 'Apellido requerido';
    if (!formData.dni_cuit.trim()) errors.dni_cuit = 'DNI/CUIT requerido';
    if (!formData.email_cliente.trim()) {
      errors.email_cliente = 'Email requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_cliente)) {
      errors.email_cliente = 'Email inválido';
    }
    if (!formData.telefono.trim()) errors.telefono = 'Teléfono requerido';
    if (!formData.direccion_cliente.trim()) errors.direccion_cliente = 'Dirección requerida';
    if (!formData.ciudad_cliente.trim()) errors.ciudad_cliente = 'Ciudad requerida';
    if (!formData.codigo_postal.trim()) errors.codigo_postal = 'Código postal requerido';
    if (!formData.provincia_cliente.trim()) errors.provincia_cliente = 'Provincia requerida';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      await clientesApi.create(formData);
      setSuccess('Cliente creado exitosamente');
      setIsCreateModalOpen(false);
      resetForm();
      loadClientes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCliente || !validateForm()) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      await clientesApi.update(selectedCliente.id, formData);
      setSuccess('Cliente actualizado exitosamente');
      setIsEditModalOpen(false);
      setSelectedCliente(null);
      resetForm();
      loadClientes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCliente) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      await clientesApi.delete(selectedCliente.id);
      setSuccess('Cliente eliminado exitosamente');
      setIsDeleteDialogOpen(false);
      setSelectedCliente(null);
      loadClientes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre_cliente: '',
      apellido_cliente: '',
      dni_cuit: '',
      email_cliente: '',
      telefono: '',
      direccion_cliente: '',
      ciudad_cliente: '',
      codigo_postal: '',
      provincia_cliente: '',
    });
    setFormErrors({});
  };

  const openEditModal = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    // Load full client data from API
    clientesApi.getById(cliente.id).then(fullCliente => {
      setFormData({
        nombre_cliente: fullCliente.nombre,
        apellido_cliente: fullCliente.apellido,
        dni_cuit: fullCliente.dni_cuit,
        email_cliente: fullCliente.email,
        telefono: fullCliente.telefono,
        direccion_cliente: fullCliente.direccion,
        ciudad_cliente: fullCliente.ciudad,
        codigo_postal: fullCliente.codigo_postal,
        provincia_cliente: fullCliente.provincia,
      });
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const openDeleteDialog = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsDeleteDialogOpen(true);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const filteredClientes = clientes.filter(cliente =>
    `${cliente.nombre} ${cliente.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.dni_cuit.includes(searchTerm)
  );

  if (loading) {
    return <LoadingSpinner size="lg" message="Cargando clientes..." />;
  }

  return (
    <div className="space-y-6">
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      {success && <SuccessAlert message={success} onClose={() => setSuccess(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="mt-1 text-sm text-gray-600">
            {clientes.length} clientes registrados
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-action btn-action-primary"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar por nombre, email o DNI..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DNI/CUIT</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ciudad</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredClientes.map((cliente) => (
              <tr key={cliente.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{cliente.nombre} {cliente.apellido}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{cliente.dni_cuit}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{cliente.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{cliente.ciudad}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditModal(cliente)}
                      className="btn-action btn-action-primary"
                      title="Editar cliente"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </button>
                    <button
                      onClick={() => openDeleteDialog(cliente)}
                      className="btn-action btn-action-danger"
                      title="Eliminar cliente"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredClientes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isCreateModalOpen ? 'Nuevo Cliente' : 'Editar Cliente'}
        size="lg"
      >
        <form onSubmit={isCreateModalOpen ? handleCreate : handleEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.nombre_cliente}
                onChange={(e) => setFormData({ ...formData, nombre_cliente: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  formErrors.nombre_cliente ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {formErrors.nombre_cliente && <p className="mt-1 text-sm text-red-600">{formErrors.nombre_cliente}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.apellido_cliente}
                onChange={(e) => setFormData({ ...formData, apellido_cliente: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  formErrors.apellido_cliente ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {formErrors.apellido_cliente && <p className="mt-1 text-sm text-red-600">{formErrors.apellido_cliente}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DNI/CUIT <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.dni_cuit}
                onChange={(e) => setFormData({ ...formData, dni_cuit: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  formErrors.dni_cuit ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {formErrors.dni_cuit && <p className="mt-1 text-sm text-red-600">{formErrors.dni_cuit}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  formErrors.telefono ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {formErrors.telefono && <p className="mt-1 text-sm text-red-600">{formErrors.telefono}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              value={formData.email_cliente}
              onChange={(e) => setFormData({ ...formData, email_cliente: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                formErrors.email_cliente ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {formErrors.email_cliente && <p className="mt-1 text-sm text-red-600">{formErrors.email_cliente}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.direccion_cliente}
              onChange={(e) => setFormData({ ...formData, direccion_cliente: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                formErrors.direccion_cliente ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {formErrors.direccion_cliente && <p className="mt-1 text-sm text-red-600">{formErrors.direccion_cliente}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ciudad <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.ciudad_cliente}
                onChange={(e) => setFormData({ ...formData, ciudad_cliente: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  formErrors.ciudad_cliente ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {formErrors.ciudad_cliente && <p className="mt-1 text-sm text-red-600">{formErrors.ciudad_cliente}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provincia <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.provincia_cliente}
                onChange={(e) => setFormData({ ...formData, provincia_cliente: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  formErrors.provincia_cliente ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {formErrors.provincia_cliente && <p className="mt-1 text-sm text-red-600">{formErrors.provincia_cliente}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                C.P. <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.codigo_postal}
                onChange={(e) => setFormData({ ...formData, codigo_postal: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  formErrors.codigo_postal ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {formErrors.codigo_postal && <p className="mt-1 text-sm text-red-600">{formErrors.codigo_postal}</p>}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
              }}
              disabled={isSubmitting}
              className="btn-action btn-action-outline"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-action btn-action-primary"
            >
              {isSubmitting ? 'Guardando...' : isCreateModalOpen ? 'Crear Cliente' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="¿Eliminar cliente?"
        message={`¿Estás seguro de que deseas eliminar a ${selectedCliente?.nombre} ${selectedCliente?.apellido}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}
