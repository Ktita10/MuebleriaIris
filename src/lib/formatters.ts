/**
 * Utility functions for formatting values
 * Centralized to avoid duplication across components
 */

/**
 * Format a number as Argentine Peso currency
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "$ 1.500")
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Alias for formatPrice for backward compatibility
 */
export const formatCurrency = formatPrice;

/**
 * Format a date string to Argentine locale
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "15 de enero de 2024")
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format a date string to short format
 * @param dateString - ISO date string
 * @returns Short formatted date (e.g., "15/01/2024")
 */
export function formatDateShort(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * Format a date with time
 * @param dateString - ISO date string
 * @returns Formatted date with time (e.g., "15/01/2024 14:30")
 */
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
