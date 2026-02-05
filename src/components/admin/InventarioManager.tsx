"use client";
import { useState, useEffect } from 'react';
import {
  inventarioApi,
  productosApi,
  type Inventario,
  type InventarioAjuste,
  type Producto,
} from '../../lib/api';
import { ErrorAlert, SuccessAlert } from '../ui/Alerts';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import {
  InventarioTable,
  InventarioAjusteModal,
  ICONS,
  ALERT_FILTER_OPTIONS,
  INITIAL_AJUSTE_FORM,
  validateAjusteForm,
} from './inventario';

// ============================================================================
// TYPES
// ============================================================================

interface InventarioExtendido extends Inventario {
  producto?: Producto;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function InventarioManager() {
  // State
  const [inventario, setInventario] = useState<InventarioExtendido[]>([]);
  const [filteredInventario, setFilteredInventario] = useState<InventarioExtendido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [alertFilter, setAlertFilter] = useState<string>('');

  // Modal state
  const [isAjusteModalOpen, setIsAjusteModalOpen] = useState(false);
  const [selectedInventario, setSelectedInventario] = useState<InventarioExtendido | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ajusteType, setAjusteType] = useState<'add' | 'remove'>('add');
  const [formData, setFormData] = useState<InventarioAjuste>(INITIAL_AJUSTE_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Auto-hide success messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Filter inventario by search and alert status
  useEffect(() => {
    let result = inventario;

    // Filter by alert status
    if (alertFilter === 'bajo_stock') {
      result = result.filter((i) => i.alerta_stock && i.stock > 0);
    } else if (alertFilter === 'sin_stock') {
      result = result.filter((i) => i.stock === 0);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((i) => {
        const producto = i.producto;
        return !!(
          producto?.nombre.toLowerCase().includes(term) ||
          producto?.sku.toLowerCase().includes(term) ||
          i.ubicacion.toLowerCase().includes(term)
        );
      });
    }

    setFilteredInventario(result);
  }, [searchTerm, alertFilter, inventario]);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [inventarioData, productosData] = await Promise.all([
        inventarioApi.getAll(),
        productosApi.getAll(),
      ]);

      // Merge inventario with producto data
      const inventarioExtendido = inventarioData.map((inv) => ({
        ...inv,
        producto: productosData.find((p) => p.id === inv.id_producto),
      }));

      setInventario(inventarioExtendido);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar inventario');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // AJUSTE HANDLERS
  // ============================================================================

  const openAjusteModal = (inv: InventarioExtendido, type: 'add' | 'remove') => {
    setSelectedInventario(inv);
    setAjusteType(type);
    setFormData(INITIAL_AJUSTE_FORM);
    setFormErrors({});
    setIsAjusteModalOpen(true);
  };

  const handleAjustar = async () => {
    if (!selectedInventario) return;

    const errors = validateAjusteForm(formData, ajusteType, selectedInventario.stock);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // If removing stock, make the amount negative
      const cantidad = ajusteType === 'remove' ? -formData.cantidad : formData.cantidad;

      await inventarioApi.ajustar(selectedInventario.id, {
        cantidad,
        razon: formData.razon,
      });

      setSuccess(`Stock ${ajusteType === 'add' ? 'agregado' : 'removido'} exitosamente`);
      setIsAjusteModalOpen(false);
      setSelectedInventario(null);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al ajustar stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setIsAjusteModalOpen(false);
    setSelectedInventario(null);
    setFormData(INITIAL_AJUSTE_FORM);
    setFormErrors({});
  };

  // ============================================================================
  // STATS CALCULATIONS
  // ============================================================================

  const stats = {
    total: inventario.length,
    bajoStock: inventario.filter((i) => i.alerta_stock && i.stock > 0).length,
    sinStock: inventario.filter((i) => i.stock === 0).length,
    totalUnidades: inventario.reduce((sum, i) => sum + i.stock, 0),
  };

  // ============================================================================
  // RENDER
  // ============================================================================

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
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Inventario</h2>
          <p className="text-gray-500">{stats.total} productos en inventario</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              {ICONS.PackageIcon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total Productos</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              {ICONS.WarningIcon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.bajoStock}</p>
              <p className="text-sm text-gray-500">Stock Bajo</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              {ICONS.CloseIcon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.sinStock}</p>
              <p className="text-sm text-gray-500">Sin Stock</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              {ICONS.CheckIcon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUnidades}</p>
              <p className="text-sm text-gray-500">Total Unidades</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">{ICONS.SearchIcon}</div>
              <input
                type="text"
                placeholder="Buscar por producto, SKU o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={alertFilter}
            onChange={(e) => setAlertFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            {ALERT_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Inventario Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <InventarioTable
          items={filteredInventario}
          onAddStock={(item) => openAjusteModal(item, 'add')}
          onRemoveStock={(item) => openAjusteModal(item, 'remove')}
        />
      </div>

      {/* Ajuste Modal */}
      <InventarioAjusteModal
        isOpen={isAjusteModalOpen}
        ajusteType={ajusteType}
        selectedInventario={selectedInventario}
        formData={formData}
        setFormData={setFormData}
        formErrors={formErrors}
        isSubmitting={isSubmitting}
        onSubmit={handleAjustar}
        onClose={closeModal}
      />
    </div>
  );
}
