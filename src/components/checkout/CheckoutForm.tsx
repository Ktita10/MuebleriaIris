import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { $cartItems, $cartTotal, clearCart } from "../../stores/cart";
import { $user, $isAuthenticated, $token } from "../../stores/auth";
import { ordenesApi } from "../../lib/api";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";

interface FormData {
  // Contact info
  email: string;
  phone: string;
  // Shipping info
  firstName: string;
  lastName: string;
  address: string;
  addressNumber: string;
  apartment: string;
  city: string;
  province: string;
  postalCode: string;
  // Payment
  paymentMethod: "card" | "transfer" | "mercadopago";
  // Notes
  notes: string;
}

interface FormErrors {
  [key: string]: string;
}

const provinces = [
  "Buenos Aires",
  "CABA",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Cordoba",
  "Corrientes",
  "Entre Rios",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquen",
  "Rio Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucuman",
];

export default function CheckoutForm() {
  const items = useStore($cartItems);
  const total = useStore($cartTotal);
  const user = useStore($user);
  const isAuthenticated = useStore($isAuthenticated);
  
  const [formData, setFormData] = useState<FormData>({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    address: "",
    addressNumber: "",
    apartment: "",
    city: "",
    province: "",
    postalCode: "",
    paymentMethod: "card",
    notes: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"form" | "success">("form");
  const [orderId, setOrderId] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // Email
    if (!formData.email) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email invalido";
    }

    // Phone
    if (!formData.phone) {
      newErrors.phone = "El telefono es requerido";
    }

    // Name
    if (!formData.firstName) {
      newErrors.firstName = "El nombre es requerido";
    }
    if (!formData.lastName) {
      newErrors.lastName = "El apellido es requerido";
    }

    // Address
    if (!formData.address) {
      newErrors.address = "La direccion es requerida";
    }
    if (!formData.addressNumber) {
      newErrors.addressNumber = "El numero es requerido";
    }
    if (!formData.city) {
      newErrors.city = "La ciudad es requerida";
    }
    if (!formData.province) {
      newErrors.province = "La provincia es requerida";
    }
    if (!formData.postalCode) {
      newErrors.postalCode = "El codigo postal es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;
    
    // Double-check authentication
    if (!user || !user.cliente_id) {
      setErrors({ submit: "Error de autenticacion. Por favor, inicia sesion nuevamente." });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order using the real API
      const ordenData = {
        id_cliente: user.cliente_id,
        id_usuarios: user.id, // The logged-in user who is placing the order
        productos: items.map((item) => ({
          id_producto: item.id,
          cantidad: item.cantidad,
        })),
        // Additional data for shipping (stored as notes or future shipping table)
        notas: formData.notes ? `${formData.notes} | Envio: ${formData.address} ${formData.addressNumber}${formData.apartment ? `, ${formData.apartment}` : ''}, ${formData.city}, ${formData.province} (${formData.postalCode})` : undefined,
      };

      const orden = await ordenesApi.create(ordenData);

      // Store the real order ID
      setOrderId(`ORD-${orden.id}`);
      
      // Clear cart
      clearCart();
      
      // Show success
      setStep("success");
    } catch (error) {
      console.error("Error submitting order:", error);
      const message = error instanceof Error ? error.message : "Error al procesar el pedido";
      setErrors({ submit: `${message}. Intenta nuevamente.` });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "success") {
    return (
      <div className="bg-white rounded-2xl p-8 text-center">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          ¡Pedido Confirmado!
        </h2>
        <p className="text-gray-600 mb-4">
          Tu pedido ha sido recibido y esta siendo procesado.
        </p>
        {orderId && (
          <p className="text-lg font-semibold text-primary-600 mb-6">
            Numero de orden: {orderId}
          </p>
        )}
        <p className="text-sm text-gray-500 mb-8">
          Te enviamos un email de confirmacion a <strong>{formData.email}</strong>
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
          >
            Volver al inicio
          </a>
          <a
            href="/catalogo"
            className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-primary-600 hover:text-primary-600 transition-colors"
          >
            Seguir comprando
          </a>
        </div>
      </div>
    );
  }

  // Require authentication to checkout
  if (!isAuthenticated || !user) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center">
        <svg
          className="w-16 h-16 mx-auto text-primary-400 mb-4"
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
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Inicia sesion para continuar
        </h2>
        <p className="text-gray-600 mb-6">
          Necesitas una cuenta para completar tu compra y hacer seguimiento de tus pedidos.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/login?redirect=/checkout"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
          >
            Iniciar Sesion
          </a>
          <a
            href="/registro?redirect=/checkout"
            className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-primary-600 hover:text-primary-600 transition-colors"
          >
            Crear Cuenta
          </a>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center">
        <svg
          className="w-16 h-16 mx-auto text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Tu carrito esta vacio
        </h2>
        <p className="text-gray-600 mb-6">
          Agrega productos antes de continuar con el checkout.
        </p>
        <a
          href="/catalogo"
          className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
        >
          Ir al catalogo
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Contact Information */}
      <section className="bg-white rounded-2xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
            1
          </span>
          Informacion de Contacto
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="tu@email.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />
          <Input
            label="Telefono"
            name="phone"
            type="tel"
            placeholder="+54 11 1234-5678"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            required
          />
        </div>
      </section>

      {/* Shipping Information */}
      <section className="bg-white rounded-2xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
            2
          </span>
          Direccion de Envio
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nombre"
            name="firstName"
            placeholder="Juan"
            value={formData.firstName}
            onChange={handleChange}
            error={errors.firstName}
            required
          />
          <Input
            label="Apellido"
            name="lastName"
            placeholder="Perez"
            value={formData.lastName}
            onChange={handleChange}
            error={errors.lastName}
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="md:col-span-2">
            <Input
              label="Direccion"
              name="address"
              placeholder="Av. Corrientes"
              value={formData.address}
              onChange={handleChange}
              error={errors.address}
              required
            />
          </div>
          <Input
            label="Numero"
            name="addressNumber"
            placeholder="1234"
            value={formData.addressNumber}
            onChange={handleChange}
            error={errors.addressNumber}
            required
          />
          <Input
            label="Depto (opcional)"
            name="apartment"
            placeholder="2B"
            value={formData.apartment}
            onChange={handleChange}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Input
            label="Ciudad"
            name="city"
            placeholder="Buenos Aires"
            value={formData.city}
            onChange={handleChange}
            error={errors.city}
            required
          />
          <Select
            label="Provincia"
            name="province"
            value={formData.province}
            onChange={handleChange}
            error={errors.province}
            placeholder="Seleccionar..."
            options={provinces.map((prov) => ({ value: prov, label: prov }))}
            required
          />
          <Input
            label="Codigo Postal"
            name="postalCode"
            placeholder="1000"
            value={formData.postalCode}
            onChange={handleChange}
            error={errors.postalCode}
            required
          />
        </div>
      </section>

      {/* Payment Method */}
      <section className="bg-white rounded-2xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
            3
          </span>
          Metodo de Pago
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label
            className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
              formData.paymentMethod === "card"
                ? "border-primary-600 bg-primary-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={formData.paymentMethod === "card"}
              onChange={handleChange}
              className="sr-only"
            />
            <svg
              className={`w-8 h-8 mb-2 ${
                formData.paymentMethod === "card"
                  ? "text-primary-600"
                  : "text-gray-400"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            <span className="font-medium text-gray-900">Tarjeta</span>
            <span className="text-xs text-gray-500">Credito o Debito</span>
          </label>

          <label
            className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
              formData.paymentMethod === "transfer"
                ? "border-primary-600 bg-primary-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="transfer"
              checked={formData.paymentMethod === "transfer"}
              onChange={handleChange}
              className="sr-only"
            />
            <svg
              className={`w-8 h-8 mb-2 ${
                formData.paymentMethod === "transfer"
                  ? "text-primary-600"
                  : "text-gray-400"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
              />
            </svg>
            <span className="font-medium text-gray-900">Transferencia</span>
            <span className="text-xs text-gray-500">Bancaria</span>
          </label>

          <label
            className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
              formData.paymentMethod === "mercadopago"
                ? "border-primary-600 bg-primary-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="mercadopago"
              checked={formData.paymentMethod === "mercadopago"}
              onChange={handleChange}
              className="sr-only"
            />
            <svg
              className={`w-8 h-8 mb-2 ${
                formData.paymentMethod === "mercadopago"
                  ? "text-primary-600"
                  : "text-gray-400"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-medium text-gray-900">MercadoPago</span>
            <span className="text-xs text-gray-500">Todas las opciones</span>
          </label>
        </div>
      </section>

      {/* Notes */}
      <section className="bg-white rounded-2xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
            4
          </span>
          Notas (opcional)
        </h2>
        <textarea
          name="notes"
          rows={3}
          placeholder="Instrucciones especiales para la entrega, color preferido, etc."
          value={formData.notes}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
        />
      </section>

      {/* Submit */}
      {errors.submit && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {errors.submit}
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        fullWidth
        isLoading={isSubmitting}
      >
        {isSubmitting ? "Procesando..." : "Confirmar Pedido"}
      </Button>

      <p className="text-center text-sm text-gray-500">
        Al confirmar, aceptas nuestros{" "}
        <a href="/terminos" className="text-primary-600 hover:underline">
          terminos y condiciones
        </a>{" "}
        y{" "}
        <a href="/privacidad" className="text-primary-600 hover:underline">
          politica de privacidad
        </a>
        .
      </p>
    </form>
  );
}
