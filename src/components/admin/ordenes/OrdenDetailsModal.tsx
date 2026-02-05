/**
 * OrdenDetailsModal Component
 * Displays detailed information about an order including products
 */
import React, { memo } from 'react';
import { type Orden, type OrdenDetalle, getImageUrl } from '../../../lib/api';
import { formatPrice, formatDateTime } from '../../../lib/formatters';
import { ESTADO_COLORS, ESTADO_LABELS, ICONS, type EstadoOrden } from './constants';
import Modal from '../../ui/Modal';
import { LoadingSpinner } from '../../ui/LoadingSpinner';

// =============================================================================
// Types
// =============================================================================

interface OrdenDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orden: Orden | null;
  detalles: OrdenDetalle[];
  loadingDetails: boolean;
}

// =============================================================================
// Subcomponents
// =============================================================================

const OrderInfoGrid = memo(function OrderInfoGrid({ orden }: { orden: Orden }) {
  return (
    <div className="grid grid-cols-2 gap-6 p-5 bg-linear-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Cliente</p>
        <p className="text-base font-semibold text-gray-900">
          {orden.cliente.nombre_cliente} {orden.cliente.apellido_cliente}
        </p>
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Vendedor</p>
        <p className="text-base font-semibold text-gray-900">
          {orden.vendedor.nombre} {orden.vendedor.apellido}
        </p>
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Fecha</p>
        <p className="text-base font-medium text-gray-900">{formatDateTime(orden.fecha_creacion)}</p>
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Estado</p>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${ESTADO_COLORS[orden.estado as EstadoOrden]}`}>
          {ESTADO_LABELS[orden.estado as EstadoOrden]}
        </span>
      </div>
    </div>
  );
});

interface ProductDetailItemProps {
  detalle: OrdenDetalle;
}

const ProductDetailItem = memo(function ProductDetailItem({ detalle }: ProductDetailItemProps) {
  const productImage = detalle.producto.imagenes?.find(
    (img: { imagen_principal: boolean; url: string }) => img.imagen_principal
  )?.url || detalle.producto.imagenes?.[0]?.url;

  return (
    <div className="flex gap-5 p-5 bg-white border-2 border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all">
      {/* Product Image */}
      <div className="w-24 h-24 shrink-0 bg-gray-100 rounded-xl overflow-hidden shadow-sm">
        {productImage ? (
          <img
            src={getImageUrl(productImage)}
            alt={detalle.producto.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              dangerouslySetInnerHTML={{ __html: ICONS.imagePlaceholder }}
            />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <h5 className="font-bold text-gray-900 text-lg mb-2">{detalle.producto.nombre}</h5>
            {detalle.producto.categoria && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-800">
                {detalle.producto.categoria}
              </span>
            )}
          </div>
          <div className="text-right">
            <p className="font-bold text-2xl text-gray-900">
              {formatPrice(detalle.cantidad * detalle.precio_unitario)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Subtotal</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              dangerouslySetInnerHTML={{ __html: ICONS.tag }}
            />
            <span className="font-semibold text-gray-900">{detalle.cantidad}</span>
            <span className="text-gray-600">unidades</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              dangerouslySetInnerHTML={{ __html: ICONS.currency }}
            />
            <span className="text-gray-600">c/u:</span>
            <span className="font-semibold text-gray-900">{formatPrice(detalle.precio_unitario)}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

// =============================================================================
// Main Component
// =============================================================================

export const OrdenDetailsModal = memo(function OrdenDetailsModal({
  isOpen,
  onClose,
  orden,
  detalles,
  loadingDetails,
}: OrdenDetailsModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalles de Orden #${orden?.id}`}
      size="xl"
    >
      <div className="space-y-6">
        {orden && (
          <>
            <OrderInfoGrid orden={orden} />

            <div>
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  dangerouslySetInnerHTML={{ __html: ICONS.package }}
                />
                Productos ({detalles.length})
              </h4>

              {loadingDetails ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : detalles.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 text-sm">No hay productos en esta orden</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {detalles.map((detalle, index) => (
                    <ProductDetailItem key={index} detalle={detalle} />
                  ))}
                </div>
              )}
            </div>

            <div className="border-t-2 border-gray-200 pt-5 mt-2">
              <div className="flex justify-between items-center bg-linear-to-r from-blue-50 to-blue-100 p-5 rounded-xl">
                <span className="text-xl font-bold text-gray-900">Total de la Orden</span>
                <span className="text-3xl font-bold text-blue-600">{formatPrice(orden.total)}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
});
