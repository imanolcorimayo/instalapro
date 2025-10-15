/**
 * Utility functions for InstalarPro Booking
 */

/**
 * Format price in Argentine peso format
 * Example: 14700.50 -> "14.700,50"
 * Uses dot (.) for thousands separator and comma (,) for decimal separator
 * @param value - The numeric value to format
 * @returns Formatted price string in Argentine format
 */
export function formatPrice(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0'
  }

  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value)
}
