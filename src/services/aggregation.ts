import type { Expense, RangeAggregate } from '@/types'

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
    result.byCategory[expense.categoryId] =
      (result.byCategory[expense.categoryId] ?? 0) + expense.amountCents

    // Add to day breakdown
    result.byDay[expense.date] =
      (result.byDay[expense.date] ?? 0) + expense.amountCents
  }

  return result
}
