/**
 * useEntityManager - Generic CRUD Hook
 * 
 * A reusable hook for managing entity state, CRUD operations, and filtering.
 * Reduces boilerplate across all admin managers by ~70%.
 * 
 * @example
 * ```tsx
 * const manager = useEntityManager<Producto, ProductoInput>({
 *   entityName: 'producto',
 *   fetchAll: () => productosApi.getAll(),
 *   create: (data) => productosApi.create(data),
 *   update: (id, data) => productosApi.update(id, data),
 *   remove: (id) => productosApi.delete(id),
 *   getEntityId: (item) => item.id,
 *   initialFormData: { sku: '', nombre: '', precio: 0 },
 *   validateForm: (data) => {
 *     const errors: Record<string, string> = {};
 *     if (!data.nombre) errors.nombre = 'Nombre requerido';
 *     return errors;
 *   },
 *   mapEntityToForm: (entity) => ({
 *     sku: entity.sku,
 *     nombre: entity.nombre,
 *     precio: entity.precio,
 *   }),
 * });
 * ```
 */
import { useState, useEffect, useCallback, useMemo } from 'react';

// =============================================================================
// Types
// =============================================================================

export type FormErrors = Record<string, string>;

export interface UseEntityManagerConfig<TEntity, TFormData> {
  /** Name of the entity for error messages (e.g., 'producto', 'usuario') */
  entityName: string;
  
  /** Function to fetch all entities */
  fetchAll: () => Promise<TEntity[]>;
  
  /** Function to create a new entity */
  create?: (data: TFormData) => Promise<TEntity>;
  
  /** Function to update an entity */
  update?: (id: number, data: TFormData) => Promise<TEntity>;
  
  /** Function to delete/deactivate an entity */
  remove?: (id: number) => Promise<void>;
  
  /** Function to get entity ID */
  getEntityId: (entity: TEntity) => number;
  
  /** Initial form data for create/reset */
  initialFormData: TFormData;
  
  /** Validation function returning errors object */
  validateForm?: (data: TFormData) => FormErrors;
  
  /** Map entity to form data for editing */
  mapEntityToForm?: (entity: TEntity) => TFormData;
  
  /** Additional data to fetch on mount (e.g., categories for a dropdown) */
  fetchRelated?: () => Promise<void>;
  
  /** Search filter function */
  filterFn?: (entity: TEntity, searchTerm: string, filters: Record<string, unknown>) => boolean;
  
  /** Success message timeout in ms (default: 3000) */
  successTimeout?: number;
}

export interface UseEntityManagerReturn<TEntity, TFormData> {
  // Data
  items: TEntity[];
  filteredItems: TEntity[];
  
  // Loading & Status
  loading: boolean;
  error: string | null;
  success: string | null;
  isSubmitting: boolean;
  
  // Form State
  formData: TFormData;
  formErrors: FormErrors;
  selectedItem: TEntity | null;
  
  // Filter State
  searchTerm: string;
  filters: Record<string, unknown>;
  
  // Setters
  setSearchTerm: (term: string) => void;
  setFilters: (filters: Record<string, unknown>) => void;
  setFormData: React.Dispatch<React.SetStateAction<TFormData>>;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  updateFormField: <K extends keyof TFormData>(field: K, value: TFormData[K]) => void;
  
  // CRUD Operations
  handleCreate: (e: React.FormEvent) => Promise<boolean>;
  handleUpdate: (e: React.FormEvent) => Promise<boolean>;
  handleDelete: () => Promise<boolean>;
  
  // Selection & Navigation
  selectForEdit: (item: TEntity) => void;
  selectForDelete: (item: TEntity) => void;
  clearSelection: () => void;
  resetForm: () => void;
  
  // Refresh
  refresh: () => Promise<void>;
}

// =============================================================================
// Hook Implementation
// =============================================================================

export function useEntityManager<TEntity, TFormData extends Record<string, unknown>>(
  config: UseEntityManagerConfig<TEntity, TFormData>
): UseEntityManagerReturn<TEntity, TFormData> {
  const {
    entityName,
    fetchAll,
    create,
    update,
    remove,
    getEntityId,
    initialFormData,
    validateForm,
    mapEntityToForm,
    fetchRelated,
    filterFn,
    successTimeout = 3000,
  } = config;

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  
  // Data state
  const [items, setItems] = useState<TEntity[]>([]);
  
  // Loading & status
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<TFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [selectedItem, setSelectedItem] = useState<TEntity | null>(null);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch main data and related data in parallel if available
        if (fetchRelated) {
          const [data] = await Promise.all([fetchAll(), fetchRelated()]);
          setItems(data);
        } else {
          const data = await fetchAll();
          setItems(data);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : `Error al cargar ${entityName}s`;
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [fetchAll, fetchRelated, entityName]);

  // Auto-clear success message
  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(null), successTimeout);
    return () => clearTimeout(timer);
  }, [success, successTimeout]);

  // ---------------------------------------------------------------------------
  // Memoized Values
  // ---------------------------------------------------------------------------

  // Filtered items based on search and filters
  const filteredItems = useMemo(() => {
    if (!filterFn) return items;
    return items.filter((item) => filterFn(item, searchTerm, filters));
  }, [items, searchTerm, filters, filterFn]);

  // ---------------------------------------------------------------------------
  // Form Helpers
  // ---------------------------------------------------------------------------

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setFormErrors({});
  }, [initialFormData]);

  const updateFormField = useCallback(<K extends keyof TFormData>(
    field: K,
    value: TFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const doValidation = useCallback((): boolean => {
    if (!validateForm) return true;
    
    const errors = validateForm(formData);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, validateForm]);

  // ---------------------------------------------------------------------------
  // Selection Helpers
  // ---------------------------------------------------------------------------

  const selectForEdit = useCallback((item: TEntity) => {
    setSelectedItem(item);
    if (mapEntityToForm) {
      setFormData(mapEntityToForm(item));
    }
    setFormErrors({});
  }, [mapEntityToForm]);

  const selectForDelete = useCallback((item: TEntity) => {
    setSelectedItem(item);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItem(null);
    resetForm();
  }, [resetForm]);

  // ---------------------------------------------------------------------------
  // CRUD Operations
  // ---------------------------------------------------------------------------

  const refresh = useCallback(async () => {
    try {
      const data = await fetchAll();
      setItems(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : `Error al cargar ${entityName}s`;
      setError(message);
    }
  }, [fetchAll, entityName]);

  const handleCreate = useCallback(async (e: React.FormEvent): Promise<boolean> => {
    e.preventDefault();
    if (!create) return false;
    if (!doValidation()) return false;

    try {
      setIsSubmitting(true);
      setError(null);
      await create(formData);
      setSuccess(`${capitalize(entityName)} creado exitosamente`);
      resetForm();
      await refresh();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : `Error al crear ${entityName}`;
      setError(message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [create, formData, doValidation, resetForm, refresh, entityName]);

  const handleUpdate = useCallback(async (e: React.FormEvent): Promise<boolean> => {
    e.preventDefault();
    if (!update || !selectedItem) return false;
    if (!doValidation()) return false;

    try {
      setIsSubmitting(true);
      setError(null);
      await update(getEntityId(selectedItem), formData);
      setSuccess(`${capitalize(entityName)} actualizado exitosamente`);
      clearSelection();
      await refresh();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : `Error al actualizar ${entityName}`;
      setError(message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [update, selectedItem, getEntityId, formData, doValidation, clearSelection, refresh, entityName]);

  const handleDelete = useCallback(async (): Promise<boolean> => {
    if (!remove || !selectedItem) return false;

    try {
      setIsSubmitting(true);
      setError(null);
      await remove(getEntityId(selectedItem));
      setSuccess(`${capitalize(entityName)} eliminado exitosamente`);
      clearSelection();
      await refresh();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : `Error al eliminar ${entityName}`;
      setError(message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [remove, selectedItem, getEntityId, clearSelection, refresh, entityName]);

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    // Data
    items,
    filteredItems,
    
    // Loading & Status
    loading,
    error,
    success,
    isSubmitting,
    
    // Form State
    formData,
    formErrors,
    selectedItem,
    
    // Filter State
    searchTerm,
    filters,
    
    // Setters
    setSearchTerm,
    setFilters,
    setFormData,
    setError,
    setSuccess,
    updateFormField,
    
    // CRUD Operations
    handleCreate,
    handleUpdate,
    handleDelete,
    
    // Selection & Navigation
    selectForEdit,
    selectForDelete,
    clearSelection,
    resetForm,
    
    // Refresh
    refresh,
  };
}

// =============================================================================
// Utility Functions
// =============================================================================

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
