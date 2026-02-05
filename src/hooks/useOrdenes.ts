/**
 * useOrdenes Hook
 * Manages order state, CRUD operations, filtering, and details loading
 * Extracted from OrdenesManager for reusability and separation of concerns
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ordenesApi,
  type Orden,
  type OrdenDetalle,
} from '../lib/api';
import { ESTADO_LABELS, type EstadoOrden } from '../components/admin/ordenes/constants';

// =============================================================================
// Types
// =============================================================================

export interface OrdenStats {
  pendiente: number;
  en_proceso: number;
  completada: number;
  cancelada: number;
  totalVentas: number;
}

export interface UseOrdenesReturn {
  // Data
  ordenes: Orden[];
  filteredOrdenes: Orden[];
  stats: OrdenStats;
  
  // Loading & Status
  loading: boolean;
  error: string | null;
  success: string | null;
  isSubmitting: boolean;
  
  // Filter State
  searchTerm: string;
  estadoFilter: EstadoOrden | '';
  
  // Selection & Details
  selectedOrden: Orden | null;
  ordenDetalles: OrdenDetalle[];
  loadingDetails: boolean;
  
  // Setters
  setSearchTerm: (term: string) => void;
  setEstadoFilter: (estado: EstadoOrden | '') => void;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  
  // Actions
  loadOrdenDetails: (ordenId: number) => Promise<void>;
  updateEstado: (newEstado: string) => Promise<boolean>;
  cancelOrden: () => Promise<boolean>;
  selectOrden: (orden: Orden) => void;
  clearSelection: () => void;
  refresh: () => Promise<void>;
}

// =============================================================================
// Hook Implementation
// =============================================================================

export function useOrdenes(): UseOrdenesReturn {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  
  // Data state
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  
  // Loading & status
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<EstadoOrden | ''>('');
  
  // Selection & details
  const [selectedOrden, setSelectedOrden] = useState<Orden | null>(null);
  const [ordenDetalles, setOrdenDetalles] = useState<OrdenDetalle[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Auto-clear success message
  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(null), 3000);
    return () => clearTimeout(timer);
  }, [success]);

  // ---------------------------------------------------------------------------
  // Memoized Values
  // ---------------------------------------------------------------------------

  // Calculate stats
  const stats = useMemo<OrdenStats>(() => ({
    pendiente: ordenes.filter(o => o.estado === 'pendiente').length,
    en_proceso: ordenes.filter(o => o.estado === 'en_proceso').length,
    completada: ordenes.filter(o => o.estado === 'completada').length,
    cancelada: ordenes.filter(o => o.estado === 'cancelada').length,
    totalVentas: ordenes.reduce((sum, o) => sum + o.total, 0),
  }), [ordenes]);

  // Filtered orders based on search and estado filter
  const filteredOrdenes = useMemo(() => {
    let result = ordenes;

    // Filter by estado
    if (estadoFilter) {
      result = result.filter(o => o.estado === estadoFilter);
    }

    // Filter by search term (cliente name, vendedor, or orden ID)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(o =>
        `${o.cliente.nombre_cliente} ${o.cliente.apellido_cliente}`.toLowerCase().includes(term) ||
        `${o.vendedor.nombre} ${o.vendedor.apellido}`.toLowerCase().includes(term) ||
        o.id.toString().includes(term)
      );
    }

    return result;
  }, [ordenes, searchTerm, estadoFilter]);

  // ---------------------------------------------------------------------------
  // Data Loading
  // ---------------------------------------------------------------------------

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ordenesApi.getAll();
      setOrdenes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await ordenesApi.getAll();
      setOrdenes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar órdenes');
    }
  }, []);

  const loadOrdenDetails = useCallback(async (ordenId: number) => {
    try {
      setLoadingDetails(true);
      const data = await ordenesApi.getById(ordenId);
      setOrdenDetalles(data.detalles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar detalles de la orden');
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Selection
  // ---------------------------------------------------------------------------

  const selectOrden = useCallback((orden: Orden) => {
    setSelectedOrden(orden);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedOrden(null);
    setOrdenDetalles([]);
  }, []);

  // ---------------------------------------------------------------------------
  // Operations
  // ---------------------------------------------------------------------------

  const updateEstado = useCallback(async (newEstado: string): Promise<boolean> => {
    if (!selectedOrden) return false;

    try {
      setIsSubmitting(true);
      setError(null);
      await ordenesApi.updateEstado(selectedOrden.id, newEstado);
      setSuccess(`Estado de la orden actualizado a "${ESTADO_LABELS[newEstado as EstadoOrden]}"`);
      setSelectedOrden(null);
      await refresh();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar estado');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedOrden, refresh]);

  const cancelOrden = useCallback(async (): Promise<boolean> => {
    if (!selectedOrden) return false;

    try {
      setIsSubmitting(true);
      setError(null);
      await ordenesApi.delete(selectedOrden.id);
      setSuccess('Orden cancelada exitosamente. El stock ha sido devuelto al inventario.');
      setSelectedOrden(null);
      await refresh();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cancelar orden');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedOrden, refresh]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    // Data
    ordenes,
    filteredOrdenes,
    stats,
    
    // Loading & Status
    loading,
    error,
    success,
    isSubmitting,
    
    // Filter State
    searchTerm,
    estadoFilter,
    
    // Selection & Details
    selectedOrden,
    ordenDetalles,
    loadingDetails,
    
    // Setters
    setSearchTerm,
    setEstadoFilter,
    setError,
    setSuccess,
    
    // Actions
    loadOrdenDetails,
    updateEstado,
    cancelOrden,
    selectOrden,
    clearSelection,
    refresh,
  };
}
