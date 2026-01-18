import {
  format,
  parse,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfYear,
  endOfYear,
  isToday as dateFnsIsToday,
  isFuture,
} from 'date-fns'

const ISO_DATE_FORMAT = 'yyyy-MM-dd'

/**
 * Format a Date to ISO date string 'YYYY-MM-DD'
 */
export function formatDateToISO(date: Date): string {
  return format(date, ISO_DATE_FORMAT)
}

/**
 * Parse an ISO date string 'YYYY-MM-DD' to a Date object
 */
export function parseDateFromISO(str: string): Date {
  return parse(str, ISO_DATE_FORMAT, new Date())
}

/**
 * Get the start and end dates of a month as ISO strings
 */
export function getMonthRange(year: number, month: number): [string, string] {
  const date = new Date(year, month - 1, 1) // month is 0-indexed in Date
  const start = startOfMonth(date)
  const end = endOfMonth(date)
  return [formatDateToISO(start), formatDateToISO(end)]
}

/**
 * Get the start and end dates of a week containing the given date
 * @param date - The date within the week
 * @param weekStartsOn - 0 for Sunday, 1 for Monday
 */
export function getWeekRange(date: Date, weekStartsOn: 0 | 1): [string, string] {
  const start = startOfWeek(date, { weekStartsOn })
  const end = endOfWeek(date, { weekStartsOn })
  return [formatDateToISO(start), formatDateToISO(end)]
}

/**
 * Get the start and end dates of a year as ISO strings
 */
export function getYearRange(year: number): [string, string] {
  const date = new Date(year, 0, 1)
  const start = startOfYear(date)
  const end = endOfYear(date)
  return [formatDateToISO(start), formatDateToISO(end)]
}

/**
 * Check if a date string represents today
 */
export function isToday(dateStr: string): boolean {
  const date = parseDateFromISO(dateStr)
  return dateFnsIsToday(date)
}

/**
 * Check if a date string represents a future date
 */
export function isFutureDate(dateStr: string): boolean {
  const date = parseDateFromISO(dateStr)
  // Compare just the date parts, not time
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return isFuture(date) && date > today
}

/**
 * Get current date as ISO string
 */
export function getTodayISO(): string {
  return formatDateToISO(new Date())
}
