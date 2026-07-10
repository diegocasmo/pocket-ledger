import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useHorizontalSwipe } from '@/hooks/useHorizontalSwipe'

function makeTouch(clientX: number): React.TouchEvent {
  return {
    touches: [{ clientX }],
    changedTouches: [{ clientX }],
  } as unknown as React.TouchEvent
}

describe('useHorizontalSwipe', () => {
  it('fires onSwipeRight when dragged right past the threshold', () => {
    const onSwipeRight = vi.fn()
    const onSwipeLeft = vi.fn()
    const { result } = renderHook(() =>
      useHorizontalSwipe({ onSwipeRight, onSwipeLeft })
    )

    result.current.onTouchStart(makeTouch(100))
    result.current.onTouchEnd(makeTouch(200))

    expect(onSwipeRight).toHaveBeenCalledTimes(1)
    expect(onSwipeLeft).not.toHaveBeenCalled()
  })

  it('fires onSwipeLeft when dragged left past the threshold', () => {
    const onSwipeRight = vi.fn()
    const onSwipeLeft = vi.fn()
    const { result } = renderHook(() =>
      useHorizontalSwipe({ onSwipeRight, onSwipeLeft })
    )

    result.current.onTouchStart(makeTouch(200))
    result.current.onTouchEnd(makeTouch(100))

    expect(onSwipeLeft).toHaveBeenCalledTimes(1)
    expect(onSwipeRight).not.toHaveBeenCalled()
  })

  it('ignores movement within the threshold', () => {
    const onSwipeRight = vi.fn()
    const onSwipeLeft = vi.fn()
    const { result } = renderHook(() =>
      useHorizontalSwipe({ onSwipeRight, onSwipeLeft })
    )

    result.current.onTouchStart(makeTouch(100))
    result.current.onTouchEnd(makeTouch(130))

    expect(onSwipeRight).not.toHaveBeenCalled()
    expect(onSwipeLeft).not.toHaveBeenCalled()
  })

  it('does nothing when touch end has no matching start', () => {
    const onSwipeRight = vi.fn()
    const onSwipeLeft = vi.fn()
    const { result } = renderHook(() =>
      useHorizontalSwipe({ onSwipeRight, onSwipeLeft })
    )

    result.current.onTouchEnd(makeTouch(300))

    expect(onSwipeRight).not.toHaveBeenCalled()
    expect(onSwipeLeft).not.toHaveBeenCalled()
  })

  it('respects a custom threshold', () => {
    const onSwipeRight = vi.fn()
    const onSwipeLeft = vi.fn()
    const { result } = renderHook(() =>
      useHorizontalSwipe({ onSwipeRight, onSwipeLeft, threshold: 100 })
    )

    result.current.onTouchStart(makeTouch(100))
    result.current.onTouchEnd(makeTouch(180))
    expect(onSwipeRight).not.toHaveBeenCalled()

    result.current.onTouchStart(makeTouch(100))
    result.current.onTouchEnd(makeTouch(220))
    expect(onSwipeRight).toHaveBeenCalledTimes(1)
  })
})
