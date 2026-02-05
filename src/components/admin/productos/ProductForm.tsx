/**
 * ProductForm Component
 * Reusable form for creating and editing products
 * Extracted from ProductosManager for better separation of concerns
 */
import type { ProductoInput, Categoria } from '../../../lib/api';
import type { FormErrors } from '../../../hooks/useProductos';

// Input field configuration for dynamic rendering
interface FormFieldConfig {
  name: keyof ProductoInput;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea';
  placeholder?: string;
  required?: boolean;
  step?: string;
  rows?: number;
  colSpan?: 1 | 2;
}

interface ProductFormProps {
  formData: ProductoInput;
  formErrors: FormErrors;
  categorias: Categoria[];
  isSubmitting: boolean;
  isEditMode: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onChange: (data: Partial<ProductoInput>) => void;
}

// Form field configurations - separated for maintainability
const FORM_FIELDS: FormFieldConfig[][] = [
  // Row 1: SKU and Category
  [
    { name: 'sku', label: 'SKU', type: 'text', placeholder: 'SOF001', required: true },
    { name: 'id_categoria', label: 'Categoría', type: 'select', required: true },
  ],
  // Row 2: Name (full width)
  [
    { name: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Sofá 3 cuerpos', required: true, colSpan: 2 },
  ],
  // Row 3: Description (full width)
  [
    { name: 'descripcion', label: 'Descripción', type: 'textarea', placeholder: 'Descripción detallada del producto', rows: 3, colSpan: 2 },
  ],
  // Row 4: Price and Material
  [
    { name: 'precio', label: 'Precio', type: 'number', placeholder: '0.00', step: '0.01', required: true },
    { name: 'material', label: 'Material', type: 'text', placeholder: 'Madera, Metal, Tela...', required: true },
  ],
];

// Dimension fields configuration
const DIMENSION_FIELDS: { name: keyof ProductoInput; placeholder: string }[] = [
  { name: 'alto_cm', placeholder: 'Alto' },
  { name: 'ancho_cm', placeholder: 'Ancho' },
  { name: 'profundidad_cm', placeholder: 'Profundidad' },
];

// Input class builder - using array pattern instead of template literals
const getInputClassName = (hasError: boolean): string => {
  const baseClasses = ['w-full', 'px-3', 'py-2', 'border', 'rounded-lg', 'focus:ring-2', 'focus:ring-blue-500'];
  const borderClass = hasError ? 'border-red-500' : 'border-gray-300';
  return [...baseClasses, borderClass].join(' ');
};

// Hoisted static JSX elements (rendering-hoist-jsx)
const RequiredAsterisk = <span className="text-red-600">*</span>;

export function ProductForm({
  formData,
  formErrors,
  categorias,
  isSubmitting,
  isEditMode,
  onSubmit,
  onCancel,
  onChange,
}: ProductFormProps) {
  // Handle field change with partial update
  const handleChange = (name: keyof ProductoInput, value: string | number) => {
    onChange({ [name]: value });
  };

  // Render a single form field based on config
  const renderField = (field: FormFieldConfig) => {
    const value = formData[field.name];
    const error = formErrors[field.name];
    const inputClassName = getInputClassName(!!error);

    // Common label component
    const label = (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {field.label} {field.required ? RequiredAsterisk : null}
      </label>
    );

    // Error message component
    const errorMessage = error ? (
      <p className="mt-1 text-sm text-red-600">{error}</p>
    ) : null;

    // Render based on field type
    if (field.type === 'select') {
      return (
        <div key={field.name}>
          {label}
          <select
            value={value as number}
            onChange={(e) => handleChange(field.name, Number(e.target.value))}
            className={inputClassName}
            disabled={isSubmitting}
          >
            <option value={0}>Seleccionar categoría</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
          {errorMessage}
        </div>
      );
    }

    if (field.type === 'textarea') {
      return (
        <div key={field.name} className={field.colSpan === 2 ? 'col-span-2' : ''}>
          {label}
          <textarea
            value={value as string}
            onChange={(e) => handleChange(field.name, e.target.value)}
            rows={field.rows || 3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder={field.placeholder}
            disabled={isSubmitting}
          />
        </div>
      );
    }

    // Text or number input
    return (
      <div key={field.name} className={field.colSpan === 2 ? 'col-span-2' : ''}>
        {label}
        <input
          type={field.type}
          step={field.step}
          value={field.type === 'number' && value === 0 ? '' : value}
          onChange={(e) =>
            handleChange(
              field.name,
              field.type === 'number' ? Number(e.target.value) : e.target.value
            )
          }
          className={inputClassName}
          placeholder={field.placeholder}
          disabled={isSubmitting}
        />
        {errorMessage}
      </div>
    );
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Dynamic form fields */}
      {FORM_FIELDS.map((row, rowIndex) => (
        <div key={rowIndex} className={row.length > 1 ? 'grid grid-cols-2 gap-4' : ''}>
          {row.map(renderField)}
        </div>
      ))}

      {/* Dimensions section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dimensiones (cm)
        </label>
        <div className="grid grid-cols-3 gap-4">
          {DIMENSION_FIELDS.map((dim) => (
            <div key={dim.name}>
              <input
                type="number"
                step="0.01"
                value={formData[dim.name] === 0 ? '' : formData[dim.name]}
                onChange={(e) => handleChange(dim.name, Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={dim.placeholder}
                disabled={isSubmitting}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="btn-action btn-action-outline"
          style={{ padding: '0.5rem 1rem' }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-action btn-action-primary"
          style={{ padding: '0.5rem 1rem' }}
          aria-busy={isSubmitting}
        >
          {isSubmitting
            ? 'Guardando...'
            : isEditMode
              ? 'Guardar Cambios'
              : 'Crear Producto'}
        </button>
      </div>
    </form>
  );
}
