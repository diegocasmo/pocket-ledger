import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  formatDateToISO,
  parseDateFromISO,
  getMonthRange,
  getWeekRange,
  getYearRange,
  isToday,
  isFutureDate,
  isValidISODate,
  formatRelativeDate,
  getTodayISO,
  isCurrentPeriod,
  formatPeriodLabel,
  shiftPeriod,
} from '@/lib/dates'

describe('formatDateToISO', () => {
  it('formats a date to ISO string', () => {
    const date = new Date(2024, 0, 15) // January 15, 2024
    expect(formatDateToISO(date)).toBe('2024-01-15')
  })

  it('pads single digit months and days', () => {
    const date = new Date(2024, 4, 5) // May 5, 2024
    expect(formatDateToISO(date)).toBe('2024-05-05')
  })
})

describe('parseDateFromISO', () => {
  it('parses an ISO string to a Date', () => {
    const date = parseDateFromISO('2024-01-15')
    expect(date.getFullYear()).toBe(2024)
    expect(date.getMonth()).toBe(0) // January (0-indexed)
    expect(date.getDate()).toBe(15)
  })
})

describe('getMonthRange', () => {
  it('returns correct range for January 2024', () => {
    const [start, end] = getMonthRange(2024, 1)
    expect(start).toBe('2024-01-01')
    expect(end).toBe('2024-01-31')
  })

  it('returns correct range for February 2024 (leap year)', () => {
    const [start, end] = getMonthRange(2024, 2)
    expect(start).toBe('2024-02-01')
    expect(end).toBe('2024-02-29')
  })

  it('returns correct range for February 2023 (non-leap year)', () => {
    const [start, end] = getMonthRange(2023, 2)
    expect(start).toBe('2023-02-01')
    expect(end).toBe('2023-02-28')
  })

  it('returns correct range for December', () => {
    const [start, end] = getMonthRange(2024, 12)
    expect(start).toBe('2024-12-01')
    expect(end).toBe('2024-12-31')
  })
})

describe('getWeekRange', () => {
  it('returns correct range with Sunday as start', () => {
    const date = new Date(2024, 0, 17) // Wednesday, Jan 17, 2024
    const [start, end] = getWeekRange(date, 0)
    expect(start).toBe('2024-01-14') // Sunday
    expect(end).toBe('2024-01-20') // Saturday
  })

  it('returns correct range with Monday as start', () => {
    const date = new Date(2024, 0, 17) // Wednesday, Jan 17, 2024
    const [start, end] = getWeekRange(date, 1)
    expect(start).toBe('2024-01-15') // Monday
    expect(end).toBe('2024-01-21') // Sunday
  })
})

describe('getYearRange', () => {
  it('returns correct range for 2024', () => {
    const [start, end] = getYearRange(2024)
    expect(start).toBe('2024-01-01')
    expect(end).toBe('2024-12-31')
  })
})

describe('isToday', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2024, 0, 15)) // January 15, 2024
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns true for today', () => {
    expect(isToday('2024-01-15')).toBe(true)
  })

  it('returns false for other dates', () => {
    expect(isToday('2024-01-14')).toBe(false)
    expect(isToday('2024-01-16')).toBe(false)
  })
})

describe('isFutureDate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2024, 0, 15, 12, 0, 0)) // January 15, 2024 at noon
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns true for future dates', () => {
    expect(isFutureDate('2024-01-16')).toBe(true)
    expect(isFutureDate('2024-02-01')).toBe(true)
  })

  it('returns false for today', () => {
    expect(isFutureDate('2024-01-15')).toBe(false)
  })

  it('returns false for past dates', () => {
    expect(isFutureDate('2024-01-14')).toBe(false)
    expect(isFutureDate('2023-12-31')).toBe(false)
  })
})

describe('isValidISODate', () => {
  it('accepts valid canonical ISO dates', () => {
    expect(isValidISODate('2025-06-25')).toBe(true)
    expect(isValidISODate('2024-02-29')).toBe(true) // leap day
  })

  it('rejects unparseable strings', () => {
    expect(isValidISODate('not-a-date')).toBe(false)
    expect(isValidISODate('')).toBe(false)
  })

  it('rejects impossible dates', () => {
    expect(isValidISODate('2025-02-30')).toBe(false)
    expect(isValidISODate('2025-13-45')).toBe(false)
    expect(isValidISODate('2023-02-29')).toBe(false) // non-leap year
  })

  it('rejects non-canonical formats', () => {
    expect(isValidISODate('2025-2-3')).toBe(false)
    expect(isValidISODate('2025/06/25')).toBe(false)
  })
})

describe('formatRelativeDate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2025, 5, 25)) // Wednesday, June 25, 2025
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "Today" for today', () => {
    expect(formatRelativeDate('2025-06-25')).toBe('Today')
  })

  it('returns the raw string for invalid input instead of throwing', () => {
    expect(() => formatRelativeDate('not-a-date')).not.toThrow()
    expect(formatRelativeDate('not-a-date')).toBe('not-a-date')
    expect(formatRelativeDate('2025-13-45')).toBe('2025-13-45')
  })

  it('returns "Yesterday" for one day ago', () => {
    expect(formatRelativeDate('2025-06-24')).toBe('Yesterday')
  })

  it('returns the weekday name for 2-6 days ago', () => {
    expect(formatRelativeDate('2025-06-23')).toBe('Last Monday') // 2 days ago
    expect(formatRelativeDate('2025-06-19')).toBe('Last Thursday') // 6 days ago
  })

  it('returns "MMM d" for 7+ days ago within the same year', () => {
    expect(formatRelativeDate('2025-06-18')).toBe('Jun 18') // 7 days ago
    expect(formatRelativeDate('2025-01-15')).toBe('Jan 15')
  })

  it('returns "MMM d, yyyy" for a date in an earlier year', () => {
    expect(formatRelativeDate('2024-06-03')).toBe('Jun 3, 2024')
  })

  it('prefers the weekday tier over the year tier across a year boundary', () => {
    vi.setSystemTime(new Date(2026, 0, 2)) // Friday, January 2, 2026
    expect(formatRelativeDate('2025-12-30')).toBe('Last Tuesday') // 3 days ago, prior year
    expect(formatRelativeDate('2025-12-01')).toBe('Dec 1, 2025') // >6 days ago, prior year
  })
})

describe('getTodayISO', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2024, 0, 15))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns today in ISO format', () => {
    expect(getTodayISO()).toBe('2024-01-15')
  })
})

describe('isCurrentPeriod', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2024, 0, 17)) // Wednesday, January 17, 2024
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns true for current week (Sunday start)', () => {
    expect(isCurrentPeriod(new Date(2024, 0, 17), 'week', 0)).toBe(true)
  })

  it('returns true for current week (Monday start)', () => {
    expect(isCurrentPeriod(new Date(2024, 0, 17), 'week', 1)).toBe(true)
  })

  it('returns false for past week', () => {
    expect(isCurrentPeriod(new Date(2024, 0, 8), 'week', 0)).toBe(false)
  })

  it('returns true for current month', () => {
    expect(isCurrentPeriod(new Date(2024, 0, 1), 'month', 0)).toBe(true)
  })

  it('returns false for past month', () => {
    expect(isCurrentPeriod(new Date(2023, 11, 15), 'month', 0)).toBe(false)
  })

  it('returns true for current year', () => {
    expect(isCurrentPeriod(new Date(2024, 5, 1), 'year', 0)).toBe(true)
  })

  it('returns false for past year', () => {
    expect(isCurrentPeriod(new Date(2023, 5, 1), 'year', 0)).toBe(false)
  })
})

describe('formatPeriodLabel', () => {
  it('formats same-month week', () => {
    const midWeek = new Date(2025, 0, 22) // Jan 22, 2025 (Wed)
    // Sun start: Jan 19 – Jan 25
    expect(formatPeriodLabel(midWeek, 'week', 0)).toBe('Jan 19 – 25, 2025')
  })

  it('formats cross-month week', () => {
    const date = new Date(2025, 0, 28) // Jan 28, 2025 (Tue)
    // Sun start: Jan 26 – Feb 1
    expect(formatPeriodLabel(date, 'week', 0)).toBe('Jan 26 – Feb 1, 2025')
  })

  it('formats cross-year week', () => {
    const date = new Date(2024, 11, 30) // Dec 30, 2024 (Mon)
    // Sun start: Dec 29 – Jan 4
    expect(formatPeriodLabel(date, 'week', 0)).toBe('Dec 29, 2024 – Jan 4, 2025')
  })

  it('formats month', () => {
    expect(formatPeriodLabel(new Date(2025, 0, 15), 'month', 0)).toBe('January 2025')
  })

  it('formats year', () => {
    expect(formatPeriodLabel(new Date(2025, 0, 15), 'year', 0)).toBe('2025')
  })
})

describe('shiftPeriod', () => {
  it('shifts week forward', () => {
    const date = new Date(2024, 0, 17)
    const result = shiftPeriod(date, 'week', 'next')
    expect(result.getDate()).toBe(24)
    expect(result.getMonth()).toBe(0)
  })

  it('shifts week backward', () => {
    const date = new Date(2024, 0, 17)
    const result = shiftPeriod(date, 'week', 'previous')
    expect(result.getDate()).toBe(10)
    expect(result.getMonth()).toBe(0)
  })

  it('shifts month forward', () => {
    const date = new Date(2024, 0, 15)
    const result = shiftPeriod(date, 'month', 'next')
    expect(result.getMonth()).toBe(1)
  })

  it('shifts month backward', () => {
    const date = new Date(2024, 0, 15)
    const result = shiftPeriod(date, 'month', 'previous')
    expect(result.getMonth()).toBe(11)
    expect(result.getFullYear()).toBe(2023)
  })

  it('shifts year forward', () => {
    const date = new Date(2024, 0, 15)
    const result = shiftPeriod(date, 'year', 'next')
    expect(result.getFullYear()).toBe(2025)
  })

  it('shifts year backward', () => {
    const date = new Date(2024, 0, 15)
    const result = shiftPeriod(date, 'year', 'previous')
    expect(result.getFullYear()).toBe(2023)
  })
})
