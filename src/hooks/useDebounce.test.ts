import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '@/hooks/useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 200))
    expect(result.current).toBe('initial')
  })

  it('returns debounced value after delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 200),
      { initialProps: { value: 'initial' } }
    )

    expect(result.current).toBe('initial')

    rerender({ value: 'updated' })
    expect(result.current).toBe('initial')

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(result.current).toBe('updated')
  })

  it('resets timer when value changes before delay completes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 200),
      { initialProps: { value: 'initial' } }
    )

    rerender({ value: 'first' })
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current).toBe('initial')

    rerender({ value: 'second' })
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current).toBe('initial')

    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current).toBe('second')
  })

  it('handles rapid value changes (only last value after delay)', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 200),
      { initialProps: { value: 'initial' } }
    )

    rerender({ value: 'a' })
    rerender({ value: 'ab' })
    rerender({ value: 'abc' })
    rerender({ value: 'abcd' })

    expect(result.current).toBe('initial')

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(result.current).toBe('abcd')
  })
})
