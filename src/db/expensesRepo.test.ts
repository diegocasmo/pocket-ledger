import { describe, it, expect, vi, beforeEach } from 'vitest'
import { db } from '@/db'
import {
  createExpense,
  updateExpense,
  deleteExpense,
  getExpense,
  listExpensesForDateRange,
  listExpensesForDay,
  listExpensesByCategory,
} from '@/db/expensesRepo'
import * as categoriesRepo from '@/db/categoriesRepo'

describe('expensesRepo', () => {
  beforeEach(async () => {
    await db.categories.add({
      id: 'cat-1',
      name: 'Food',
      color: '#ff0000',
      usageCount: 0,
    })
    await db.categories.add({
      id: 'cat-2',
      name: 'Transport',
      color: '#00ff00',
      usageCount: 0,
    })
  })

  describe('createExpense', () => {
    it('creates expense with timestamps', async () => {
      const before = Date.now()
      const expense = await createExpense({
        date: '2024-01-15',
        amountCents: 1500,
        categoryId: 'cat-1',
        note: 'Test note',
      })
      const after = Date.now()

      expect(expense.id).toBeDefined()
      expect(expense.date).toBe('2024-01-15')
      expect(expense.amountCents).toBe(1500)
      expect(expense.categoryId).toBe('cat-1')
      expect(expense.note).toBe('Test note')
      expect(expense.createdAt).toBeGreaterThanOrEqual(before)
      expect(expense.createdAt).toBeLessThanOrEqual(after)
      expect(expense.updatedAt).toBe(expense.createdAt)
    })

    it('calls incrementUsage for the category', async () => {
      const incrementSpy = vi.spyOn(categoriesRepo, 'incrementUsage')
      await createExpense({
        date: '2024-01-15',
        amountCents: 1000,
        categoryId: 'cat-1',
      })
      expect(incrementSpy).toHaveBeenCalledWith('cat-1')
      incrementSpy.mockRestore()
    })

    it('creates expense without note', async () => {
      const expense = await createExpense({
        date: '2024-01-15',
        amountCents: 500,
        categoryId: 'cat-1',
      })
      expect(expense.note).toBeUndefined()
    })

    it('persists expense to database', async () => {
      const expense = await createExpense({
        date: '2024-01-15',
        amountCents: 2000,
        categoryId: 'cat-1',
      })
      const retrieved = await db.expenses.get(expense.id)
      expect(retrieved).toBeDefined()
      expect(retrieved?.amountCents).toBe(2000)
    })

    it('trims note when creating expense', async () => {
      const expense = await createExpense({
        date: '2024-01-15',
        amountCents: 1500,
        categoryId: 'cat-1',
        note: '  Test note with spaces  ',
      })
      expect(expense.note).toBe('Test note with spaces')
    })

    it('handles empty note after trimming', async () => {
      const expense = await createExpense({
        date: '2024-01-15',
        amountCents: 1500,
        categoryId: 'cat-1',
        note: '   ',
      })
      expect(expense.note).toBe('')
    })
  })

  describe('updateExpense', () => {
    beforeEach(async () => {
      await db.expenses.add({
        id: 'expense-1',
        date: '2024-01-15',
        amountCents: 1000,
        categoryId: 'cat-1',
        note: 'Original note',
        createdAt: 1000000,
        updatedAt: 1000000,
      })
    })

    it('throws error if expense not found', async () => {
      await expect(
        updateExpense('non-existent', { amountCents: 500 })
      ).rejects.toThrow('Expense not found: non-existent')
    })

    it('updates amount and sets updatedAt', async () => {
      const before = Date.now()
      const updated = await updateExpense('expense-1', { amountCents: 2000 })
      expect(updated.amountCents).toBe(2000)
      expect(updated.updatedAt).toBeGreaterThanOrEqual(before)
      expect(updated.createdAt).toBe(1000000) // Original createdAt preserved
    })

    it('updates date', async () => {
      const updated = await updateExpense('expense-1', { date: '2024-02-20' })
      expect(updated.date).toBe('2024-02-20')
    })

    it('updates note', async () => {
      const updated = await updateExpense('expense-1', { note: 'New note' })
      expect(updated.note).toBe('New note')
    })

    it('increments usage ONLY when categoryId changes', async () => {
      const incrementSpy = vi.spyOn(categoriesRepo, 'incrementUsage')

      // Update without changing category - should NOT increment
      await updateExpense('expense-1', { amountCents: 500 })
      expect(incrementSpy).not.toHaveBeenCalled()

      // Update with same category - should NOT increment
      await updateExpense('expense-1', { categoryId: 'cat-1' })
      expect(incrementSpy).not.toHaveBeenCalled()

      // Update with different category - SHOULD increment
      await updateExpense('expense-1', { categoryId: 'cat-2' })
      expect(incrementSpy).toHaveBeenCalledWith('cat-2')
      expect(incrementSpy).toHaveBeenCalledTimes(1)

      incrementSpy.mockRestore()
    })

    it('trims note when updating expense', async () => {
      const updated = await updateExpense('expense-1', {
        note: '  Updated note with spaces  ',
      })
      expect(updated.note).toBe('Updated note with spaces')
    })

    it('handles empty note after trimming on update', async () => {
      const updated = await updateExpense('expense-1', { note: '   ' })
      expect(updated.note).toBe('')
    })
  })

  describe('deleteExpense', () => {
    it('removes expense from database', async () => {
      await db.expenses.add({
        id: 'to-delete',
        date: '2024-01-15',
        amountCents: 1000,
        categoryId: 'cat-1',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
      await deleteExpense('to-delete')
      const expense = await db.expenses.get('to-delete')
      expect(expense).toBeUndefined()
    })
  })

  describe('getExpense', () => {
    it('returns expense by id', async () => {
      await db.expenses.add({
        id: 'get-test',
        date: '2024-01-15',
        amountCents: 1234,
        categoryId: 'cat-1',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
      const expense = await getExpense('get-test')
      expect(expense).toBeDefined()
      expect(expense?.amountCents).toBe(1234)
    })

    it('returns undefined for non-existent id', async () => {
      const expense = await getExpense('non-existent')
      expect(expense).toBeUndefined()
    })
  })

  describe('listExpensesForDateRange', () => {
    beforeEach(async () => {
      await db.expenses.bulkAdd([
        {
          id: 'e1',
          date: '2024-01-01',
          amountCents: 100,
          categoryId: 'cat-1',
          createdAt: 1000,
          updatedAt: 1000,
        },
        {
          id: 'e2',
          date: '2024-01-15',
          amountCents: 200,
          categoryId: 'cat-1',
          createdAt: 2000,
          updatedAt: 2000,
        },
        {
          id: 'e3',
          date: '2024-01-31',
          amountCents: 300,
          categoryId: 'cat-1',
          createdAt: 3000,
          updatedAt: 3000,
        },
        {
          id: 'e4',
          date: '2024-02-01',
          amountCents: 400,
          categoryId: 'cat-1',
          createdAt: 4000,
          updatedAt: 4000,
        },
      ])
    })

    it('is inclusive on both start and end dates', async () => {
      const expenses = await listExpensesForDateRange('2024-01-01', '2024-01-31')
      expect(expenses).toHaveLength(3)
      const dates = expenses.map((e) => e.date)
      expect(dates).toContain('2024-01-01')
      expect(dates).toContain('2024-01-31')
    })

    it('returns expenses in date range only', async () => {
      const expenses = await listExpensesForDateRange('2024-01-10', '2024-01-20')
      expect(expenses).toHaveLength(1)
      expect(expenses[0].date).toBe('2024-01-15')
    })

    it('returns empty array when no expenses in range', async () => {
      const expenses = await listExpensesForDateRange('2024-03-01', '2024-03-31')
      expect(expenses).toHaveLength(0)
    })
  })

  describe('listExpensesForDay', () => {
    beforeEach(async () => {
      await db.expenses.bulkAdd([
        {
          id: 'day-1',
          date: '2024-01-15',
          amountCents: 100,
          categoryId: 'cat-1',
          createdAt: 1000,
          updatedAt: 1000,
        },
        {
          id: 'day-2',
          date: '2024-01-15',
          amountCents: 200,
          categoryId: 'cat-1',
          createdAt: 3000,
          updatedAt: 3000,
        },
        {
          id: 'day-3',
          date: '2024-01-15',
          amountCents: 300,
          categoryId: 'cat-1',
          createdAt: 2000,
          updatedAt: 2000,
        },
        {
          id: 'other-day',
          date: '2024-01-16',
          amountCents: 400,
          categoryId: 'cat-1',
          createdAt: 4000,
          updatedAt: 4000,
        },
      ])
    })

    it('returns expenses for specific day only', async () => {
      const expenses = await listExpensesForDay('2024-01-15')
      expect(expenses).toHaveLength(3)
      expenses.forEach((e) => expect(e.date).toBe('2024-01-15'))
    })

    it('returns expenses sorted by createdAt descending (newest first)', async () => {
      const expenses = await listExpensesForDay('2024-01-15')
      expect(expenses.map((e) => e.id)).toEqual(['day-2', 'day-3', 'day-1'])
      expect(expenses.map((e) => e.createdAt)).toEqual([3000, 2000, 1000])
    })

    it('returns empty array for day with no expenses', async () => {
      const expenses = await listExpensesForDay('2024-01-20')
      expect(expenses).toHaveLength(0)
    })
  })

  describe('listExpensesByCategory', () => {
    beforeEach(async () => {
      await db.expenses.bulkAdd([
        {
          id: 'cat-expense-1',
          date: '2024-01-15',
          amountCents: 100,
          categoryId: 'cat-1',
          createdAt: 1000,
          updatedAt: 1000,
        },
        {
          id: 'cat-expense-2',
          date: '2024-01-15',
          amountCents: 200,
          categoryId: 'cat-2',
          createdAt: 2000,
          updatedAt: 2000,
        },
        {
          id: 'cat-expense-3',
          date: '2024-01-20',
          amountCents: 300,
          categoryId: 'cat-1',
          createdAt: 3000,
          updatedAt: 3000,
        },
        {
          id: 'cat-expense-4',
          date: '2024-02-15',
          amountCents: 400,
          categoryId: 'cat-1',
          createdAt: 4000,
          updatedAt: 4000,
        },
      ])
    })

    it('returns expenses for specific category within date range', async () => {
      const expenses = await listExpensesByCategory('cat-1', '2024-01-01', '2024-01-31')
      expect(expenses).toHaveLength(2)
      expenses.forEach((e) => expect(e.categoryId).toBe('cat-1'))
    })

    it('returns expenses sorted by createdAt descending', async () => {
      const expenses = await listExpensesByCategory('cat-1', '2024-01-01', '2024-01-31')
      expect(expenses.map((e) => e.id)).toEqual(['cat-expense-3', 'cat-expense-1'])
    })

    it('returns empty array for category with no expenses', async () => {
      const expenses = await listExpensesByCategory('cat-2', '2024-02-01', '2024-02-28')
      expect(expenses).toHaveLength(0)
    })
  })
})
