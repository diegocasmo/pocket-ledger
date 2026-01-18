/**
 * Parse a USD string input to cents.
 * Accepts formats like: "12.34", "$12.34", "12", "0.50", ".50"
 * Returns null if the input is invalid.
 */
export function parseUsdToCents(input: string): number | null {
  if (!input || typeof input !== 'string') {
    return null
  }

  // Remove dollar sign and whitespace
  const cleaned = input.replace(/[$\s,]/g, '').trim()

  if (!cleaned) {
    return null
  }

  // Validate format: optional leading digits, optional decimal with up to 2 digits
  const validFormat = /^(\d+)?(\.\d{0,2})?$/
  if (!validFormat.test(cleaned)) {
    return null
  }

  // Handle edge case of just a decimal point
  if (cleaned === '.') {
    return null
  }

  const num = parseFloat(cleaned)

  if (isNaN(num) || num < 0) {
    return null
  }

  // Convert to cents (multiply by 100 and round to handle floating point)
  return Math.round(num * 100)
}

/**
 * Format cents to a USD string with 2 decimal places.
 * 1234 -> "$12.34"
 */
export function formatCentsToUsd(cents: number): string {
  const dollars = cents / 100
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(dollars)
}

/**
 * Format cents to whole dollars (for compact display like calendar badges).
 * 1234 -> "$12"
 * 99 -> "$1" (rounds up)
 */
export function formatCentsToWholeDollars(cents: number): string {
  const dollars = Math.round(cents / 100)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(dollars)
}
