/**
 * CatalogContainer - Conecta CatalogFilters con CatalogGrid para filtrado en tiempo real
 */
import { useState } from 'react';
import CatalogFilters from './CatalogFilters';
import CatalogGrid from './CatalogGrid';

interface CatalogContainerProps {
  categoria?: string | null;
}

export default function CatalogContainer({ categoria }: CatalogContainerProps) {
  const [buscar, setBuscar] = useState('');
  const [orden, setOrden] = useState('nombre');
  const [gridFilterCallback, setGridFilterCallback] = useState<((buscar: string, orden: string) => void) | null>(null);

  const handleFilterChange = (newBuscar: string, newOrden: string) => {
    setBuscar(newBuscar);
    setOrden(newOrden);
    
    // Notify CatalogGrid of filter changes
    if (gridFilterCallback) {
      gridFilterCallback(newBuscar, newOrden);
    }
  };

  return (
    <>
      {/* Search & Sort Filters */}
      <div className="flex justify-end mb-8">
        <CatalogFilters 
          initialBuscar={buscar}
          initialOrden={orden}
          categoria={categoria}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Product Grid */}
      <CatalogGrid 
        categoria={categoria}
        buscar={buscar}
        orden={orden}
        onFiltersReady={(callback) => setGridFilterCallback(() => callback)}
      />
    </>
  );
}
