import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import {
  useCategories,
  useCategoryHasExpenses,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/hooks/useCategories'
import { db } from '@/db'
import { createTestQueryClient, createWrapper } from '@/test/setup'

describe('useCategories hooks', () => {
  describe('useCategories', () => {
    it('returns categories from database', async () => {
      await db.categories.bulkAdd([
        { id: 'cat-1', name: 'Food', color: '#ff0000', usageCount: 5 },
        { id: 'cat-2', name: 'Transport', color: '#00ff00', usageCount: 3 },
      ])

      const { result } = renderHook(() => useCategories(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toHaveLength(2)
    })

    it('initializes default categories when database is empty', async () => {
      const { result } = renderHook(() => useCategories(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toHaveLength(7) // 7 default categories
    })
  })

  describe('useCategoryHasExpenses', () => {
    beforeEach(async () => {
      await db.categories.add({
        id: 'cat-1',
        name: 'Food',
        color: '#ff0000',
        usageCount: 1,
      })
    })

    it('returns true when category has expenses', async () => {
      await db.expenses.add({
        id: 'expense-1',
        date: '2024-01-15',
        amountCents: 1000,
        categoryId: 'cat-1',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })

      const { result } = renderHook(() => useCategoryHasExpenses('cat-1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toBe(true)
    })

    it('returns false when category has no expenses', async () => {
      const { result } = renderHook(() => useCategoryHasExpenses('cat-1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toBe(false)
    })

    it('is disabled when categoryId is empty string', () => {
      const { result } = renderHook(() => useCategoryHasExpenses(''), {
        wrapper: createWrapper(),
      })

      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useCreateCategory', () => {
    it('invalidates categories query on success', async () => {
      const queryClient = createTestQueryClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children)

      const { result } = renderHook(() => useCreateCategory(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({
          name: 'New Category',
          color: '#abcdef',
        })
      })

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['categories'] })
      })
    })
  })

  describe('useUpdateCategory', () => {
    beforeEach(async () => {
      await db.categories.add({
        id: 'cat-1',
        name: 'Food',
        color: '#ff0000',
        usageCount: 0,
      })
    })

    it('invalidates categories query on success', async () => {
      const queryClient = createTestQueryClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children)

      const { result } = renderHook(() => useUpdateCategory(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync({
          id: 'cat-1',
          name: 'Updated Food',
        })
      })

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['categories'] })
      })
    })
  })

  describe('useDeleteCategory', () => {
    beforeEach(async () => {
      await db.categories.add({
        id: 'cat-to-delete',
        name: 'To Delete',
        color: '#000000',
        usageCount: 0,
      })
    })

    it('invalidates categories query on success', async () => {
      const queryClient = createTestQueryClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const wrapper = ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children)

      const { result } = renderHook(() => useDeleteCategory(), { wrapper })

      await act(async () => {
        await result.current.mutateAsync('cat-to-delete')
      })

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['categories'] })
      })
    })
  })
})
