import { useCallback, useRef } from 'react'

interface UseHorizontalSwipeOptions {
  onSwipeRight: () => void
  onSwipeLeft: () => void
  threshold?: number
}

export function useHorizontalSwipe({
  onSwipeRight,
  onSwipeLeft,
  threshold = 50,
}: UseHorizontalSwipeOptions) {
  const touchStartX = useRef<number | null>(null)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null) return

      const diff = e.changedTouches[0].clientX - touchStartX.current

      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          onSwipeRight()
        } else {
          onSwipeLeft()
        }
      }

      touchStartX.current = null
    },
    [onSwipeRight, onSwipeLeft, threshold]
  )

  return { onTouchStart, onTouchEnd }
}
