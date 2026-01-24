import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { format, subMonths, subDays } from 'date-fns'
import { useNoteSuggestions } from '@/hooks/useNoteSuggestions'
import { db } from '@/db'
import { createWrapper } from '@/test/setup'

describe('useNoteSuggestions', () => {
  // Fixed date for consistent testing
  const fixedNow = new Date('2024-06-15T12:00:00.000Z')
  const recentDate = format(subDays(fixedNow, 30), 'yyyy-MM-dd')
  const oldDate = format(subMonths(fixedNow, 7), 'yyyy-MM-dd')

  beforeEach(async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(fixedNow)

    await db.categories.add({
      id: 'cat-1',
      name: 'Food',
      color: '#ff0000',
      usageCount: 0,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns empty when no category selected', async () => {
    const { result } = renderHook(
      () => useNoteSuggestions({ categoryId: null, query: 'test' }),
      { wrapper: createWrapper() }
    )

    await act(async () => {
      vi.advanceTimersByTime(200)
    })

    expect(result.current.suggestions).toEqual([])
  })

  it('returns empty when query < 1 char', async () => {
    const { result } = renderHook(
      () => useNoteSuggestions({ categoryId: 'cat-1', query: '' }),
      { wrapper: createWrapper() }
    )

    await act(async () => {
      vi.advanceTimersByTime(200)
    })

    expect(result.current.suggestions).toEqual([])
  })

  it('returns matching suggestions with case-insensitive prefix match', async () => {
    await db.expenses.bulkAdd([
      {
        id: 'exp-1',
        date: recentDate,
        amountCents: 1000,
        categoryId: 'cat-1',
        note: 'Coffee at Starbucks',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'exp-2',
        date: recentDate,
        amountCents: 2000,
        categoryId: 'cat-1',
        note: 'Lunch at restaurant',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ])

    const { result } = renderHook(
      () => useNoteSuggestions({ categoryId: 'cat-1', query: 'cof' }),
      { wrapper: createWrapper() }
    )

    await act(async () => {
      vi.advanceTimersByTime(200)
    })

    await waitFor(() => {
      expect(result.current.suggestions).toContain('Coffee at Starbucks')
    })
    expect(result.current.suggestions).not.toContain('Lunch at restaurant')
  })

  it('de-duplicates notes', async () => {
    await db.expenses.bulkAdd([
      {
        id: 'exp-1',
        date: recentDate,
        amountCents: 1000,
        categoryId: 'cat-1',
        note: 'Coffee',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'exp-2',
        date: recentDate,
        amountCents: 2000,
        categoryId: 'cat-1',
        note: 'Coffee',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ])

    const { result } = renderHook(
      () => useNoteSuggestions({ categoryId: 'cat-1', query: 'c' }),
      { wrapper: createWrapper() }
    )

    await act(async () => {
      vi.advanceTimersByTime(200)
    })

    await waitFor(() => {
      expect(result.current.suggestions).toHaveLength(1)
    })
    expect(result.current.suggestions).toEqual(['Coffee'])
  })

  it('limits to max 3 suggestions', async () => {
    await db.expenses.bulkAdd([
      {
        id: 'exp-1',
        date: recentDate,
        amountCents: 1000,
        categoryId: 'cat-1',
        note: 'Coffee 1',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'exp-2',
        date: recentDate,
        amountCents: 1000,
        categoryId: 'cat-1',
        note: 'Coffee 2',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'exp-3',
        date: recentDate,
        amountCents: 1000,
        categoryId: 'cat-1',
        note: 'Coffee 3',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'exp-4',
        date: recentDate,
        amountCents: 1000,
        categoryId: 'cat-1',
        note: 'Coffee 4',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ])

    const { result } = renderHook(
      () => useNoteSuggestions({ categoryId: 'cat-1', query: 'c' }),
      { wrapper: createWrapper() }
    )

    await act(async () => {
      vi.advanceTimersByTime(200)
    })

    await waitFor(() => {
      expect(result.current.suggestions).toHaveLength(3)
    })
  })

  it('excludes notes older than 6 months', async () => {
    await db.expenses.bulkAdd([
      {
        id: 'exp-recent',
        date: recentDate,
        amountCents: 1000,
        categoryId: 'cat-1',
        note: 'Coffee recent',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'exp-old',
        date: oldDate,
        amountCents: 1000,
        categoryId: 'cat-1',
        note: 'Coffee old',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ])

    const { result } = renderHook(
      () => useNoteSuggestions({ categoryId: 'cat-1', query: 'c' }),
      { wrapper: createWrapper() }
    )

    await act(async () => {
      vi.advanceTimersByTime(200)
    })

    await waitFor(() => {
      expect(result.current.suggestions).toContain('Coffee recent')
    })
    expect(result.current.suggestions).not.toContain('Coffee old')
  })

  it('respects debounce delay', async () => {
    await db.expenses.add({
      id: 'exp-1',
      date: recentDate,
      amountCents: 1000,
      categoryId: 'cat-1',
      note: 'Coffee',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    const { result, rerender } = renderHook(
      ({ query }) => useNoteSuggestions({ categoryId: 'cat-1', query }),
      { wrapper: createWrapper(), initialProps: { query: '' } }
    )

    rerender({ query: 'c' })

    // Before debounce
    expect(result.current.suggestions).toEqual([])

    await act(async () => {
      vi.advanceTimersByTime(100)
    })

    // Still before debounce completes
    expect(result.current.suggestions).toEqual([])

    await act(async () => {
      vi.advanceTimersByTime(100)
    })

    // After debounce
    await waitFor(() => {
      expect(result.current.suggestions).toContain('Coffee')
    })
  })
})
