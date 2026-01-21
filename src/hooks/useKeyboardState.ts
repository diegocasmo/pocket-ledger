import { useState, useEffect, useRef } from 'react'

interface KeyboardState {
  isKeyboardVisible: boolean
  isSettling: boolean
}

const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
}

export function useKeyboardState(): KeyboardState {
  const [state, setState] = useState<KeyboardState>({
    isKeyboardVisible: false,
    isSettling: false,
  })

  const initialViewportHeight = useRef<number | null>(null)
  const settlingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isMobile() || typeof window === 'undefined') return

    const visualViewport = window.visualViewport
    if (!visualViewport) return

    initialViewportHeight.current = visualViewport.height

    const handleResize = () => {
      if (initialViewportHeight.current === null) {
        initialViewportHeight.current = visualViewport.height
        return
      }

      const heightDiff = initialViewportHeight.current - visualViewport.height
      const keyboardNowVisible = heightDiff > 150

      // Start settling state
      setState({ isKeyboardVisible: keyboardNowVisible, isSettling: true })

      // Clear any existing timeout
      if (settlingTimeout.current) {
        clearTimeout(settlingTimeout.current)
      }

      // End settling after transition + trailing delay (400ms total)
      settlingTimeout.current = setTimeout(() => {
        setState((prev) => ({ ...prev, isSettling: false }))
      }, 400)
    }

    visualViewport.addEventListener('resize', handleResize)

    return () => {
      visualViewport.removeEventListener('resize', handleResize)
      if (settlingTimeout.current) {
        clearTimeout(settlingTimeout.current)
      }
    }
  }, [])

  return state
}
