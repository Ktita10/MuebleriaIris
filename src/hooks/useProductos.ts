/**
 * useProductos Hook
 * Manages product state, CRUD operations, and filtering
 * Extracted from ProductosManager for reusability and separation of concerns
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  productosApi,
  categoriasApi,
  type Producto,
  type ProductoInput,
  type Categoria,
} from '../lib/api';

// Form validation errors type
export type FormErrors = Record<string, string>;

// Initial form state
const INITIAL_FORM_DATA: ProductoInput = {
  sku: '',
  nombre: '',
  descripcion: '',
  precio: 0,
  alto_cm: 0,
  ancho_cm: 0,
  profundidad_cm: 0,
  material: '',
  id_categoria: 0,
};

// Validation rules configuration
const VALIDATION_RULES: Record<string, (value: unknown, formData: ProductoInput) => string | null> = {
  sku: (value) => (!String(value).trim() ? 'SKU requerido' : null),
  nombre: (value) => (!String(value).trim() ? 'Nombre requerido' : null),
  precio: (value) => (!value || Number(value) <= 0 ? 'Precio debe ser mayor a 0' : null),
  material: (value) => (!String(value).trim() ? 'Material requerido' : null),
  id_categoria: (value) => (!value || Number(value) <= 0 ? 'Categoría requerida' : null),
};

export interface UseProductosReturn {
  // Data
  productos: Producto[];
  categorias: Categoria[];
  filteredProductos: Producto[];
  
  // Loading & Error states
  loading: boolean;
  error: string | null;
  success: string | null;
  isSubmitting: boolean;
  
  // Form state
  formData: ProductoInput;
  formErrors: FormErrors;
  selectedProducto: Producto | null;
  
  // Filter state
  searchTerm: string;
  selectedCategoria: number | null;
  
  // Actions
  setSearchTerm: (term: string) => void;
  setSelectedCategoria: (id: number | null) => void;
  setFormData: React.Dispatch<React.SetStateAction<ProductoInput>>;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  
  // CRUD Operations
  createProducto: (e: React.FormEvent) => Promise<boolean>;
  updateProducto: (e: React.FormEvent) => Promise<boolean>;
  deleteProducto: () => Promise<boolean>;
  
  // Helpers
  resetForm: () => void;
  selectForEdit: (producto: Producto) => void;
  selectForDelete: (producto: Producto) => void;
  clearSelection: () => void;
  validateForm: () => boolean;
  refreshProductos: () => Promise<void>;
}

export function useProductos(): UseProductosReturn {
  // Data state
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  
  // Loading & error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<number | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<ProductoInput>(INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);

  // Load data on mount - use Promise.all for parallel fetching (async-parallel)
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [productosData, categoriasData] = await Promise.all([
          productosApi.getAll(),
          categoriasApi.getAll(),
        ]);
        setProductos(productosData);
        setCategorias(categoriasData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Auto-clear success message (rerender-move-effect-to-event alternative)
  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(null), 3000);
    return () => clearTimeout(timer);
  }, [success]);

  // Memoized filtered products (rerender-memo)
  const filteredProductos = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    
    return productos.filter((producto) => {
      const matchesSearch =
        producto.nombre.toLowerCase().includes(searchLower) ||
        producto.sku.toLowerCase().includes(searchLower);
      
      const matchesCategoria =
        !selectedCategoria ||
        categorias.find((c) => c.id === selectedCategoria)?.nombre === producto.categoria;
      
      return matchesSearch && matchesCategoria;
    });
  }, [productos, categorias, searchTerm, selectedCategoria]);

  // Validation function
  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};
    
    for (const [field, validate] of Object.entries(VALIDATION_RULES)) {
      const fieldValue = formData[field as keyof ProductoInput];
      const errorMessage = validate(fieldValue, formData);
      if (errorMessage) {
        errors[field] = errorMessage;
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setFormErrors({});
  }, []);

  // Refresh productos list
  const refreshProductos = useCallback(async () => {
    try {
      const data = await productosApi.getAll();
      setProductos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos');
    }
  }, []);

  // Select product for editing
  const selectForEdit = useCallback(
    (producto: Producto) => {
      setSelectedProducto(producto);
      const categoria = categorias.find((c) => c.nombre === producto.categoria);
      setFormData({
        sku: producto.sku,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
        alto_cm: producto.medidas.alto,
        ancho_cm: producto.medidas.ancho,
        profundidad_cm: producto.medidas.profundidad,
        material: producto.material,
        id_categoria: categoria?.id || 0,
      });
      setFormErrors({});
    },
    [categorias]
  );

  // Select product for deletion
  const selectForDelete = useCallback((producto: Producto) => {
    setSelectedProducto(producto);
  }, []);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedProducto(null);
    resetForm();
  }, [resetForm]);

  // Create product
  const createProducto = useCallback(
    async (e: React.FormEvent): Promise<boolean> => {
      e.preventDefault();
      if (!validateForm()) return false;

      try {
        setIsSubmitting(true);
        setError(null);
        await productosApi.create(formData);
        setSuccess('Producto creado exitosamente');
        resetForm();
        await refreshProductos();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al crear producto');
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validateForm, resetForm, refreshProductos]
  );

  // Update product
  const updateProducto = useCallback(
    async (e: React.FormEvent): Promise<boolean> => {
      e.preventDefault();
      if (!selectedProducto || !validateForm()) return false;

      try {
        setIsSubmitting(true);
        setError(null);
        await productosApi.update(selectedProducto.id, formData);
        setSuccess('Producto actualizado exitosamente');
        clearSelection();
        await refreshProductos();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al actualizar producto');
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedProducto, formData, validateForm, clearSelection, refreshProductos]
  );

  // Delete product
  const deleteProducto = useCallback(async (): Promise<boolean> => {
    if (!selectedProducto) return false;

    try {
      setIsSubmitting(true);
      setError(null);
      await productosApi.delete(selectedProducto.id);
      setSuccess('Producto eliminado exitosamente');
      clearSelection();
      await refreshProductos();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar producto');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedProducto, clearSelection, refreshProductos]);

  return {
    // Data
    productos,
    categorias,
    filteredProductos,
    
    // Loading & Error states
    loading,
    error,
    success,
    isSubmitting,
    
    // Form state
    formData,
    formErrors,
    selectedProducto,
    
    // Filter state
    searchTerm,
    selectedCategoria,
    
    // Actions
    setSearchTerm,
    setSelectedCategoria,
    setFormData,
    setError,
    setSuccess,
    
    // CRUD Operations
    createProducto,
    updateProducto,
    deleteProducto,
    
    // Helpers
    resetForm,
    selectForEdit,
    selectForDelete,
    clearSelection,
    validateForm,
    refreshProductos,
  };
}
