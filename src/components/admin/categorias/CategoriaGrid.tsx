/**
 * CategoriaGrid Component
 * Displays categories in a responsive grid layout with memoized cards for performance
 */
import { memo } from 'react';
import type { Categoria } from '../../../lib/api';
import { ICONS } from './constants';

// =============================================================================
// Types
// =============================================================================

interface CategoriaGridProps {
  categorias: Categoria[];
  onEdit: (categoria: Categoria) => void;
  onDelete: (categoria: Categoria) => void;
}

// =============================================================================
// Memoized Card Component (react-best-practices: rerender-memo)
// =============================================================================

const CategoriaCard = memo(({
  categoria,
  onEdit,
  onDelete,
}: {
  categoria: Categoria;
  onEdit: (categoria: Categoria) => void;
  onDelete: (categoria: Categoria) => void;
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          {ICONS.CategoryIcon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          {categoria.nombre}
        </h3>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(categoria)}
          className="btn-action btn-action-primary"
          title="Editar categoría"
        >
          {ICONS.EditIcon}
          Editar
        </button>
        <button
          onClick={() => onDelete(categoria)}
          className="btn-action btn-action-danger"
          title="Eliminar categoría"
        >
          {ICONS.TrashIcon}
          Eliminar
        </button>
      </div>
    </div>
    <p className="text-sm text-gray-600">
      {categoria.descripcion || 'Sin descripción'}
    </p>
  </div>
));

CategoriaCard.displayName = 'CategoriaCard';

// =============================================================================
// Main Component
// =============================================================================

export const CategoriaGrid = memo(({ categorias, onEdit, onDelete }: CategoriaGridProps) => {
  if (categorias.length === 0) {
    return (
      <div className="text-center py-12">
        {ICONS.EmptyIcon}
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay categorías</h3>
        <p className="text-gray-600 mb-4">Comienza creando tu primera categoría</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categorias.map((categoria) => (
        <CategoriaCard
          key={categoria.id}
          categoria={categoria}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
});

CategoriaGrid.displayName = 'CategoriaGrid';
