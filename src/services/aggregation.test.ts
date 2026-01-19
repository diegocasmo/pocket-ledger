import { describe, it, expect } from 'vitest'
import { aggregateExpenses } from '@/services/aggregation'
import type { Expense } from '@/types'

const createExpense = (
  overrides: Partial<Expense> & Pick<Expense, 'date' | 'amountCents' | 'categoryId'>
): Expense => ({
  id: crypto.randomUUID(),
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
})

describe('aggregateExpenses', () => {
  it('returns zero totals for empty array', () => {
    const result = aggregateExpenses([])
    expect(result.totalCents).toBe(0)
    expect(result.byCategory).toEqual({})
    expect(result.byDay).toEqual({})
  })

  it('calculates total cents correctly', () => {
    const expenses: Expense[] = [
      createExpense({ date: '2024-01-15', amountCents: 1000, categoryId: 'cat-1' }),
      createExpense({ date: '2024-01-16', amountCents: 2500, categoryId: 'cat-1' }),
      createExpense({ date: '2024-01-17', amountCents: 500, categoryId: 'cat-2' }),
    ]

    const result = aggregateExpenses(expenses)
    expect(result.totalCents).toBe(4000)
  })

  it('groups by category correctly', () => {
    const expenses: Expense[] = [
      createExpense({ date: '2024-01-15', amountCents: 1000, categoryId: 'cat-1' }),
      createExpense({ date: '2024-01-16', amountCents: 2500, categoryId: 'cat-1' }),
      createExpense({ date: '2024-01-17', amountCents: 500, categoryId: 'cat-2' }),
      createExpense({ date: '2024-01-18', amountCents: 750, categoryId: 'cat-2' }),
    ]

    const result = aggregateExpenses(expenses)
    expect(result.byCategory).toEqual({
      'cat-1': 3500,
      'cat-2': 1250,
    })
  })

  it('groups by day correctly', () => {
    const expenses: Expense[] = [
      createExpense({ date: '2024-01-15', amountCents: 1000, categoryId: 'cat-1' }),
      createExpense({ date: '2024-01-15', amountCents: 500, categoryId: 'cat-2' }),
      createExpense({ date: '2024-01-16', amountCents: 2500, categoryId: 'cat-1' }),
    ]

    const result = aggregateExpenses(expenses)
    expect(result.byDay).toEqual({
      '2024-01-15': 1500,
      '2024-01-16': 2500,
    })
  })

  it('handles single expense', () => {
    const expenses: Expense[] = [
      createExpense({ date: '2024-01-15', amountCents: 1234, categoryId: 'cat-1' }),
    ]

    const result = aggregateExpenses(expenses)
    expect(result.totalCents).toBe(1234)
    expect(result.byCategory).toEqual({ 'cat-1': 1234 })
    expect(result.byDay).toEqual({ '2024-01-15': 1234 })
  })

  it('handles multiple expenses on same day with same category', () => {
    const expenses: Expense[] = [
      createExpense({ date: '2024-01-15', amountCents: 1000, categoryId: 'cat-1' }),
      createExpense({ date: '2024-01-15', amountCents: 2000, categoryId: 'cat-1' }),
      createExpense({ date: '2024-01-15', amountCents: 3000, categoryId: 'cat-1' }),
    ]

    const result = aggregateExpenses(expenses)
    expect(result.totalCents).toBe(6000)
    expect(result.byCategory).toEqual({ 'cat-1': 6000 })
    expect(result.byDay).toEqual({ '2024-01-15': 6000 })
  })
})
