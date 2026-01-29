/**
 * CatalogFilters Component
 * Maneja búsqueda y ordenamiento del catálogo en tiempo real
 */
import { useState, useEffect } from 'react';

interface CatalogFiltersProps {
  initialBuscar?: string;
  initialOrden?: string;
  categoria?: string | null;
  onFilterChange?: (buscar: string, orden: string) => void;
}

export default function CatalogFilters({ 
  initialBuscar = '', 
  initialOrden = 'nombre',
  categoria = null,
  onFilterChange
}: CatalogFiltersProps) {
  const [buscar, setBuscar] = useState(initialBuscar);
  const [orden, setOrden] = useState(initialOrden);

  // Update state when URL changes (back/forward navigation)
  useEffect(() => {
    setBuscar(initialBuscar);
  }, [initialBuscar]);

  useEffect(() => {
    setOrden(initialOrden);
  }, [initialOrden]);

  // Notify parent component in real-time
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(buscar, orden);
    }
  }, [buscar, orden]);

  const handleOrdenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newOrden = e.target.value;
    setOrden(newOrden);
  };

  return (
    <div className="flex gap-4 lg:ml-auto">
      {/* Search Input - Real-time search */}
      <div className="relative flex-1 lg:w-64">
        <input
          type="search"
          name="buscar"
          placeholder="Buscar productos..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          className="w-full px-4 py-2 pl-10 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Sort Select */}
      <select
        name="orden"
        value={orden}
        onChange={handleOrdenChange}
        className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
      >
        <option value="nombre">Nombre A-Z</option>
        <option value="precio_asc">Menor precio</option>
        <option value="precio_desc">Mayor precio</option>
      </select>
    </div>
  );
}
