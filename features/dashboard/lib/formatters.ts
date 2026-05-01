// ---------------------------------------------------------------------------
// Formatters — utilidades de presentación específicas del dashboard
// ---------------------------------------------------------------------------

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  ARS: 'ARS ',
  BRL: 'R$',
}

/**
 * Formatea un número como valor monetario.
 * Ej: formatCurrency(1234.5, 'USD') → '$1,234.50'
 */
export function formatCurrency(value: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? '$'
  return `${symbol}${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Extrae MM-DD de una fecha ISO YYYY-MM-DD para la tabla de transacciones.
 * Ej: formatShortDate('2026-04-30') → '04-30'
 */
export function formatShortDate(isoDate: string): string {
  return isoDate.slice(5)
}
