import { ReactNode, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomNav } from '@/components/layout/BottomNav'
import { UpdatePrompt } from '@/components/pwa/UpdatePrompt'
import { useSettings } from '@/hooks/useSettings'
import { getTodayISO, isFutureDate } from '@/lib/dates'
import { CalendarContext } from '@/components/layout/CalendarContext'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate()
  const { data: settings } = useSettings()
  const [selectedDate, setSelectedDate] = useState<string | null>(getTodayISO())

  const handleAddExpense = useCallback(() => {
    // Use selected date if available and not in the future, otherwise use today
    const dateToUse = selectedDate && !isFutureDate(selectedDate) ? selectedDate : getTodayISO()
    navigate(`/expenses/new?date=${dateToUse}`)
  }, [selectedDate, navigate])

  const openExpenseForm = useCallback(
    (expense?: { id: string }) => {
      if (expense) {
        navigate(`/expenses/${expense.id}`)
      } else {
        handleAddExpense()
      }
    },
    [navigate, handleAddExpense]
  )

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
    <CalendarContext.Provider value={{ selectedDate, setSelectedDate, openExpenseForm }}>
      <div className="min-h-screen bg-[var(--color-bg-primary)] pb-20">
        <main className="max-w-lg mx-auto">{children}</main>
        <UpdatePrompt />
        <BottomNav onAddExpense={handleAddExpense} />
      </div>
    </CalendarContext.Provider>
  )
}
