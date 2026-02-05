import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
}

/**
 * Button Component
 * 
 * Componente de botón reutilizable siguiendo patrones de tailwind-patterns skill.
 * Soporta variantes, tamaños, estados de carga y iconos.
 * 
 * @example
 * <Button variant="primary" size="md">Click me</Button>
 * <Button variant="outline" isLoading>Saving...</Button>
 */

// Configuración de variantes usando objetos (evita if/else chains - react-best-practices)
const variants = {
  primary: "bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700",
  secondary: "bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-700",
  outline: "bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100",
  ghost: "bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200",
  danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
  success: "bg-green-600 text-white hover:bg-green-700 active:bg-green-800",
} as const;

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
} as const;

// Spinner component extraído (rendering-hoist-jsx)
const LoadingSpinner = () => (
  <svg
    className="animate-spin h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export default function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className = "",
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;
  
  // Clases construidas usando template literal (más legible)
  const buttonClasses = [
    // Base
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium",
    // Transiciones
    "transition-colors duration-200",
    // Focus para accesibilidad
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500",
    // Variante
    variants[variant],
    // Tamaño
    sizes[size],
    // Ancho completo
    fullWidth && "w-full",
    // Estados
    isLoading && "cursor-wait opacity-90",
    isDisabled && !isLoading && "cursor-not-allowed opacity-50",
    !isDisabled && "cursor-pointer",
    // Clases custom
    className,
  ].filter(Boolean).join(" ");

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={isDisabled}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner />
          <span>Procesando...</span>
        </>
      ) : (
        <>
          {leftIcon}
          <span>{children}</span>
          {rightIcon}
        </>
      )}
    </button>
  );
}

/**
 * ButtonGroup Component - Grupo de botones para modales y formularios
 */
interface ButtonGroupProps {
  children: ReactNode;
  align?: "left" | "center" | "right" | "between";
  className?: string;
}

export function ButtonGroup({
  children,
  align = "right",
  className = "",
}: ButtonGroupProps) {
  let alignClass = "";
  if (align === "left") {
    alignClass = "justify-start";
  } else if (align === "center") {
    alignClass = "justify-center";
  } else if (align === "right") {
    alignClass = "justify-end";
  } else if (align === "between") {
    alignClass = "justify-between";
  }

  return (
    <div
      className={`flex items-center gap-3 pt-4 border-t border-gray-200 mt-6 ${alignClass} ${className}`}
    >
      {children}
    </div>
  );
}
