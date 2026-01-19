import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import {
  useExpensesForMonth,
  useExpensesForDay,
  useExpense,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
} from '@/hooks/useExpenses'
import { db } from '@/db'
import { createTestQueryClient, createWrapper } from '@/test/setup'

describe('useExpenses hooks', () => {
  beforeEach(async () => {
    await db.categories.add({
      id: 'cat-1',
      name: 'Food',
      color: '#ff0000',
      usageCount: 0,
    })
  })

  describe('useExpensesForMonth', () => {
    it('calls listExpensesForDateRange with correct month bounds', async () => {
      await db.expenses.bulkAdd([
        {
          id: 'jan-expense',
          date: '2024-01-15',
          amountCents: 1000,
          categoryId: 'cat-1',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'feb-expense',
          date: '2024-02-15',
          amountCents: 2000,
          categoryId: 'cat-1',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ])

      const { result } = renderHook(() => useExpensesForMonth(2024, 1), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toHaveLength(1)
      expect(result.current.data?.[0].id).toBe('jan-expense')
    })
  })

  describe('useExpensesForDay', () => {
    it('returns expenses for the specified day', async () => {
      await db.expenses.bulkAdd([
        {
          id: 'day-expense',
          date: '2024-01-15',
          amountCents: 1000,
          categoryId: 'cat-1',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'other-day',
          date: '2024-01-16',
          amountCents: 2000,
          categoryId: 'cat-1',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ])

      const { result } = renderHook(() => useExpensesForDay('2024-01-15'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toHaveLength(1)
      expect(result.current.data?.[0].id).toBe('day-expense')
    })

    it('is disabled when date is null', () => {
      const { result } = renderHook(() => useExpensesForDay(null), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useExpense', () => {
    it('returns expense by id', async () => {
      await db.expenses.add({
        id: 'single-expense',
        date: '2024-01-15',
        amountCents: 1500,
        categoryId: 'cat-1',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })

      const { result } = renderHook(() => useExpense('single-expense'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data?.amountCents).toBe(1500)
    })
  })

  describe('useCreateExpense', () => {
    it('invalidates expenses AND categories queries on success', async () => {
      const queryClient = createTestQueryClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children)

      const { result } = renderHook(() => useCreateExpense(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({
          date: '2024-01-15',
          amountCents: 1000,
          categoryId: 'cat-1',
        })
      })

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['expenses'] })
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['categories'] })
      })
    })
  })

  describe('useUpdateExpense', () => {
    it('invalidates expenses AND categories queries on success', async () => {
      await db.expenses.add({
        id: 'update-expense',
        date: '2024-01-15',
        amountCents: 1000,
        categoryId: 'cat-1',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })

      const queryClient = createTestQueryClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children)

      const { result } = renderHook(() => useUpdateExpense(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({
          id: 'update-expense',
          amountCents: 2000,
        })
      })

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['expenses'] })
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['categories'] })
      })
    })
  })

  describe('useDeleteExpense', () => {
    it('invalidates expenses query on success', async () => {
      await db.expenses.add({
        id: 'delete-expense',
        date: '2024-01-15',
        amountCents: 1000,
        categoryId: 'cat-1',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })

      const queryClient = createTestQueryClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children)

      const { result } = renderHook(() => useDeleteExpense(), { wrapper })

      await result.current.mutateAsync('delete-expense')

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['expenses'] })
      })
    })
  })
})
