import { useState, useEffect } from 'react';

interface DashboardData {
  periodo: string;
  fecha_inicio: string;
  fecha_fin: string;
  ventas: {
    total: number;
    cantidad_ordenes: number;
    promedio: number;
  };
  productos_bajo_stock: Array<{
    id_producto: number;
    sku: string;
    nombre: string;
    stock_actual: number;
    stock_minimo: number;
    categoria: string;
  }>;
  top_productos: Array<{
    id_producto: number;
    sku: string;
    nombre: string;
    categoria: string;
    total_vendido: number;
    ingresos: number;
  }>;
  ventas_por_categoria: Array<{
    categoria: string;
    total: number;
  }>;
  ordenes_por_estado: Array<{
    estado: string;
    cantidad: number;
  }>;
}

interface DashboardMetricsProps {
  periodo?: 'hoy' | 'semana' | 'mes' | 'anio';
}

export function DashboardMetrics({ periodo = 'mes' }: DashboardMetricsProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriodo, setSelectedPeriodo] = useState(periodo);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriodo]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:5000/api/dashboard/metricas?periodo=${selectedPeriodo}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar métricas del dashboard');
      }

      const jsonData = await response.json();
      setData(jsonData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const statusColors: { [key: string]: string } = {
    completada: 'bg-green-100 text-green-700',
    en_proceso: 'bg-blue-100 text-blue-700',
    pendiente: 'bg-yellow-100 text-yellow-700',
    cancelada: 'bg-red-100 text-red-700',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-red-700 text-sm">⚠️ {error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Calcular totales de órdenes
  const totalOrdenes = data.ordenes_por_estado.reduce((sum, o) => sum + o.cantidad, 0);

  return (
    <div>
      {/* Selector de Período */}
      <div className="flex justify-end mb-6">
        <div className="inline-flex rounded-lg bg-gray-100 p-1 gap-1">
          <button
            onClick={() => setSelectedPeriodo('hoy')}
            className={`
              px-4 py-2 rounded-md text-sm font-medium transition-all duration-150
              ${selectedPeriodo === 'hoy'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            Hoy
          </button>
          <button
            onClick={() => setSelectedPeriodo('semana')}
            className={`
              px-4 py-2 rounded-md text-sm font-medium transition-all duration-150
              ${selectedPeriodo === 'semana'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            Semana
          </button>
          <button
            onClick={() => setSelectedPeriodo('mes')}
            className={`
              px-4 py-2 rounded-md text-sm font-medium transition-all duration-150
              ${selectedPeriodo === 'mes'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            Mes
          </button>
          <button
            onClick={() => setSelectedPeriodo('anio')}
            className={`
              px-4 py-2 rounded-md text-sm font-medium transition-all duration-150
              ${selectedPeriodo === 'anio'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            Año
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Ventas Totales */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
              {data.ventas.cantidad_ordenes} órdenes
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(data.ventas.total)}</h3>
          <p className="text-sm text-gray-500">Ventas del {selectedPeriodo}</p>
        </div>

        {/* Promedio de Venta */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(data.ventas.promedio)}</h3>
          <p className="text-sm text-gray-500">Promedio por orden</p>
        </div>

        {/* Productos Bajo Stock */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
              data.productos_bajo_stock.length > 0 
                ? 'bg-red-100 text-red-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {data.productos_bajo_stock.length > 0 ? 'Alerta' : 'OK'}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{data.productos_bajo_stock.length}</h3>
          <p className="text-sm text-gray-500">Productos bajo stock</p>
        </div>

        {/* Total Órdenes */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{totalOrdenes}</h3>
          <p className="text-sm text-gray-500">Órdenes totales</p>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Productos Más Vendidos</h2>
          </div>
          <div className="p-6">
            {data.top_productos.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hay datos de ventas en este período</p>
            ) : (
              <div className="space-y-4">
                {data.top_productos.map((product, index) => (
                  <div key={product.id_producto} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0">
                    <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.nombre}</p>
                      <p className="text-xs text-gray-500">{product.categoria} • {product.total_vendido} unidades</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900 block">{formatCurrency(product.ingresos)}</span>
                      <span className="text-xs text-gray-500">{product.sku}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Alerts & Stats */}
        <div className="space-y-6">
          {/* Stock Alerts */}
          {data.productos_bajo_stock.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h2 className="text-lg font-bold text-gray-900">Alertas de Stock</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {data.productos_bajo_stock.map((producto) => (
                    <div key={producto.id_producto} className="p-3 bg-red-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">{producto.nombre}</p>
                      <p className="text-xs text-gray-600 mt-1">{producto.sku} • {producto.categoria}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-medium text-red-700">
                          Stock: {producto.stock_actual}
                        </span>
                        <span className="text-xs text-gray-500">
                          (Mín: {producto.stock_minimo})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Orders by Status */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Órdenes por Estado</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {data.ordenes_por_estado.map((item) => (
                  <div key={item.estado} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[item.estado] || 'bg-gray-100 text-gray-700'}`}>
                        {item.estado}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{item.cantidad}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sales by Category */}
          {data.ventas_por_categoria.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Ventas por Categoría</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {data.ventas_por_categoria.map((cat) => (
                    <div key={cat.categoria} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{cat.categoria}</span>
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(cat.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
