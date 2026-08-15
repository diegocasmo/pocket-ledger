import { ReactNode, useEffect, useState, useCallback } from 'react'
import { BottomNav } from '@/components/layout/BottomNav'
import { UpdatePrompt } from '@/components/pwa/UpdatePrompt'
import { useSettings } from '@/hooks/useSettings'
import { getTodayISO, isFutureDate } from '@/lib/dates'
import { CalendarContext } from '@/components/layout/CalendarContext'
import { useExpenseFormContext } from '@/contexts/ExpenseFormContext'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { data: settings } = useSettings()
  const { startExpenseForm } = useExpenseFormContext()
  const [selectedDate, setSelectedDate] = useState<string | null>(getTodayISO())

  const handleAddExpense = useCallback(() => {
    // startExpenseForm clears any leftover draft and navigates (the date travels
    // in the URL), so an abandoned entry can't leak into a fresh add.
    const dateToUse = selectedDate && !isFutureDate(selectedDate) ? selectedDate : getTodayISO()
    startExpenseForm({ date: dateToUse })
  }, [selectedDate, startExpenseForm])

  const openExpenseForm = useCallback(
    (expense: { id: string }) => {
      startExpenseForm({ id: expense.id })
    },
    [startExpenseForm]
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
