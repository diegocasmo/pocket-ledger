import type { Expense, RangeAggregate } from '../types'

/**
 * Aggregate expenses for analytics.
 * Returns total cents, breakdown by category, and breakdown by day.
 */
export function aggregateExpenses(expenses: Expense[]): RangeAggregate {
  const result: RangeAggregate = {
    totalCents: 0,
    byCategory: {},
    byDay: {},
  }

  for (const expense of expenses) {
    // Add to total
    result.totalCents += expense.amountCents

    // Add to category breakdown
    if (result.byCategory[expense.categoryId]) {
      result.byCategory[expense.categoryId] += expense.amountCents
    } else {
      result.byCategory[expense.categoryId] = expense.amountCents
    }

    // Add to day breakdown
    if (result.byDay[expense.date]) {
      result.byDay[expense.date] += expense.amountCents
    } else {
      result.byDay[expense.date] = expense.amountCents
    }
  }

  return result
}
