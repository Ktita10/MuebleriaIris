import { useState, useEffect } from 'react';
import { favoritosApi, getImageUrl, type Favorito } from '../../lib/api';

interface FavoritosListProps {
  idCliente: number;
}

export function FavoritosList({ idCliente }: FavoritosListProps) {
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!idCliente) {
      setError('Se requiere ID de cliente');
      setLoading(false);
      return;
    }

    favoritosApi.getByCliente(idCliente)
      .then(data => {
        setFavoritos(data.favoritos);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [idCliente]);

  const handleRemove = async (idProducto: number) => {
    try {
      await favoritosApi.remove({ id_cliente: idCliente, id_producto: idProducto });
      setFavoritos(prev => prev.filter(f => f.id_producto !== idProducto));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <span className="ml-2">Cargando favoritos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (favoritos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No tienes productos favoritos.</p>
        <a href="/catalogo" className="text-orange-500 mt-2 inline-block">
          Explorar catálogo
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {favoritos.map(favorito => (
        <div 
          key={favorito.id} 
          className="bg-white rounded-lg overflow-hidden border border-gray-200"
        >
          <div className="relative">
            <img 
              src={getImageUrl(favorito.producto?.imagen_principal)} 
              alt={favorito.producto?.nombre || 'Producto'} 
              className="w-full h-48 object-cover"
            />
            <button
              onClick={() => handleRemove(favorito.id_producto)}
              className="absolute top-2 right-2 bg-white rounded-full p-2 shadow"
              title="Eliminar de favoritos"
            >
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 truncate">
              {favorito.producto?.nombre}
            </h3>
            <p className="text-orange-500 font-bold text-xl mt-1">
              ${favorito.producto?.precio?.toLocaleString('es-AR')}
            </p>
            <a 
              href={`/producto/${favorito.id_producto}`}
              className="mt-3 block text-center bg-orange-500 text-white py-2 rounded-lg"
            >
              Ver producto
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
