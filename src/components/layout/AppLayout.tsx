import { ReactNode, useEffect } from 'react'
import { BottomNav } from './BottomNav'
import { useSettings } from '../../hooks/useSettings'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { data: settings } = useSettings()

  useEffect(() => {
    const root = document.documentElement

    if (settings?.theme === 'dark') {
      root.classList.add('dark')
    } else if (settings?.theme === 'light') {
      root.classList.remove('dark')
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }, [settings?.theme])

  // Listen for system theme changes
  useEffect(() => {
    if (settings?.theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [settings?.theme])

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] pb-16">
      <main className="max-w-lg mx-auto">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
