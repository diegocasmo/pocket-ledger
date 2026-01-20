import {
  format,
  parse,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfYear,
  endOfYear,
  addDays,
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
 * Check if a given year and month represent the current month or a future month
 */
export function isCurrentOrFutureMonth(year: number, month: number): boolean {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1 // Convert to 1-indexed

  if (year > currentYear) return true
  if (year === currentYear && month >= currentMonth) return true
  return false
}

/**
 * Get current date as ISO string
 */
export function getTodayISO(): string {
  return formatDateToISO(new Date())
}

export interface CalendarGrid {
  weeks: Date[][]
}

/**
 * Generate a calendar grid for a given month
 * @param monthDate - A date within the target month
 * @param weekStartsOn - 0 for Sunday, 1 for Monday
 */
export function getCalendarGrid(monthDate: Date, weekStartsOn: 0 | 1 = 0): CalendarGrid {
  const monthStart = startOfMonth(monthDate)
  const monthEnd = endOfMonth(monthDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn })

  const days: Date[] = []
  let day = calendarStart
  while (day <= calendarEnd) {
    days.push(day)
    day = addDays(day, 1)
  }

  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  return { weeks }
}
