import { describe, it, expect } from 'vitest'
import { parseUsdToCents, formatCentsToUsd, formatCentsToWholeDollars } from './money'

describe('parseUsdToCents', () => {
  it('parses basic decimal amounts', () => {
    expect(parseUsdToCents('12.34')).toBe(1234)
    expect(parseUsdToCents('0.99')).toBe(99)
    expect(parseUsdToCents('100.00')).toBe(10000)
  })

  it('parses amounts with dollar sign', () => {
    expect(parseUsdToCents('$12.34')).toBe(1234)
    expect(parseUsdToCents('$0.50')).toBe(50)
  })

  it('parses whole numbers', () => {
    expect(parseUsdToCents('12')).toBe(1200)
    expect(parseUsdToCents('100')).toBe(10000)
    expect(parseUsdToCents('$5')).toBe(500)
  })

  it('parses amounts starting with decimal', () => {
    expect(parseUsdToCents('.50')).toBe(50)
    expect(parseUsdToCents('.99')).toBe(99)
  })

  it('parses single digit cents', () => {
    expect(parseUsdToCents('1.5')).toBe(150)
    expect(parseUsdToCents('0.5')).toBe(50)
  })

  it('handles zero', () => {
    expect(parseUsdToCents('0')).toBe(0)
    expect(parseUsdToCents('0.00')).toBe(0)
    expect(parseUsdToCents('$0')).toBe(0)
  })

  it('returns null for invalid inputs', () => {
    expect(parseUsdToCents('')).toBe(null)
    expect(parseUsdToCents('abc')).toBe(null)
    expect(parseUsdToCents('12.345')).toBe(null) // More than 2 decimal places
    expect(parseUsdToCents('.')).toBe(null)
    expect(parseUsdToCents('-5')).toBe(null) // Negative
    expect(parseUsdToCents('1.2.3')).toBe(null) // Multiple decimals
  })

  it('handles amounts with commas', () => {
    expect(parseUsdToCents('1,234.56')).toBe(123456)
    expect(parseUsdToCents('$1,000')).toBe(100000)
  })

  it('handles whitespace', () => {
    expect(parseUsdToCents(' 12.34 ')).toBe(1234)
    expect(parseUsdToCents('$ 12.34')).toBe(1234)
  })
})

describe('formatCentsToUsd', () => {
  it('formats cents to USD string', () => {
    expect(formatCentsToUsd(1234)).toBe('$12.34')
    expect(formatCentsToUsd(99)).toBe('$0.99')
    expect(formatCentsToUsd(10000)).toBe('$100.00')
  })

  it('formats zero', () => {
    expect(formatCentsToUsd(0)).toBe('$0.00')
  })

  it('formats large amounts with commas', () => {
    expect(formatCentsToUsd(123456789)).toBe('$1,234,567.89')
  })

  it('formats single cent', () => {
    expect(formatCentsToUsd(1)).toBe('$0.01')
  })
})

describe('formatCentsToWholeDollars', () => {
  it('formats cents to whole dollars', () => {
    expect(formatCentsToWholeDollars(1234)).toBe('$12')
    expect(formatCentsToWholeDollars(10000)).toBe('$100')
  })

  it('rounds to nearest dollar', () => {
    expect(formatCentsToWholeDollars(99)).toBe('$1')
    expect(formatCentsToWholeDollars(149)).toBe('$1')
    expect(formatCentsToWholeDollars(150)).toBe('$2')
    expect(formatCentsToWholeDollars(50)).toBe('$1')
    expect(formatCentsToWholeDollars(49)).toBe('$0')
  })

  it('formats zero', () => {
    expect(formatCentsToWholeDollars(0)).toBe('$0')
  })

  it('formats large amounts with commas', () => {
    expect(formatCentsToWholeDollars(123456789)).toBe('$1,234,568')
  })
})
