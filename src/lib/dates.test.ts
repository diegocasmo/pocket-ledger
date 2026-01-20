import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  formatDateToISO,
  parseDateFromISO,
  getMonthRange,
  getWeekRange,
  getYearRange,
  isToday,
  isFutureDate,
  isCurrentOrFutureMonth,
  getTodayISO,
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

describe('isCurrentOrFutureMonth', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2024, 0, 15)) // January 15, 2024
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns true for current month', () => {
    expect(isCurrentOrFutureMonth(2024, 1)).toBe(true)
  })

  it('returns true for future months in same year', () => {
    expect(isCurrentOrFutureMonth(2024, 2)).toBe(true)
    expect(isCurrentOrFutureMonth(2024, 12)).toBe(true)
  })

  it('returns true for future years', () => {
    expect(isCurrentOrFutureMonth(2025, 1)).toBe(true)
    expect(isCurrentOrFutureMonth(2025, 6)).toBe(true)
  })

  it('returns false for past months in same year', () => {
    vi.setSystemTime(new Date(2024, 5, 15)) // June 15, 2024
    expect(isCurrentOrFutureMonth(2024, 1)).toBe(false)
    expect(isCurrentOrFutureMonth(2024, 5)).toBe(false)
  })

  it('returns false for past years', () => {
    expect(isCurrentOrFutureMonth(2023, 1)).toBe(false)
    expect(isCurrentOrFutureMonth(2023, 12)).toBe(false)
  })
})
