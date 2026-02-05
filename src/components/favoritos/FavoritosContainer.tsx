import { useStore } from '@nanostores/react';
import { $user, $isAuthenticated } from '../../stores/auth';
import { FavoritosList } from './FavoritosList';

/**
 * Container component that handles authentication check and passes
 * the client ID to FavoritosList. This allows the page to use client:load
 * without needing to know the client ID at build time.
 */
export default function FavoritosContainer() {
  const user = useStore($user);
  const isAuthenticated = useStore($isAuthenticated);

  if (!isAuthenticated || !user) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center">
        <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-8 h-8 text-orange-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Iniciá sesión para ver tus favoritos
        </h2>
        <p className="text-gray-600 mb-6">
          Guardá tus productos favoritos para encontrarlos fácilmente después.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/login?redirect=/favoritos"
            className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl"
          >
            Iniciar Sesión
          </a>
          <a
            href="/registro?redirect=/favoritos"
            className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl"
          >
            Crear Cuenta
          </a>
        </div>
      </div>
    );
  }

  if (!user.cliente_id) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center">
        <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Perfil incompleto
        </h2>
        <p className="text-gray-600 mb-6">
          Tu cuenta no tiene un perfil de cliente asociado. Por favor, contactá a soporte.
        </p>
        <a
          href="/contacto"
          className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl"
        >
          Contactar Soporte
        </a>
      </div>
    );
  }

  return <FavoritosList idCliente={user.cliente_id} />;
}
