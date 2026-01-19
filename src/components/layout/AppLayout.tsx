import { ReactNode, useEffect, useState, useCallback } from 'react'
import { BottomNav } from './BottomNav'
import { ExpenseFormModal } from '../../features/expenses/ExpenseFormModal'
import { useSettings } from '../../hooks/useSettings'
import { getTodayISO, isFutureDate } from '../../lib/dates'
import { CalendarContext } from './CalendarContext'
import type { Expense } from '../../types'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { data: settings } = useSettings()
  const [selectedDate, setSelectedDate] = useState<string | null>(getTodayISO())
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const openExpenseForm = useCallback((expense?: Expense) => {
    setEditingExpense(expense ?? null)
    setShowExpenseForm(true)
  }, [])

  const handleCloseExpenseForm = useCallback(() => {
    setShowExpenseForm(false)
    setEditingExpense(null)
  }, [])

  const handleAddExpense = useCallback(() => {
    // Use selected date if available and not in the future, otherwise use today
    const dateToUse = selectedDate && !isFutureDate(selectedDate) ? selectedDate : getTodayISO()
    setSelectedDate(dateToUse)
    openExpenseForm()
  }, [selectedDate, openExpenseForm])

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

  // Determine which date to use for the expense form
  const expenseFormDate = selectedDate && !isFutureDate(selectedDate) ? selectedDate : getTodayISO()

  return (
    <CalendarContext.Provider value={{ selectedDate, setSelectedDate, openExpenseForm }}>
      <div className="min-h-screen bg-[var(--color-bg-primary)] pb-16">
        <main className="max-w-lg mx-auto">
          {children}
        </main>
        <BottomNav onAddExpense={handleAddExpense} />
        <ExpenseFormModal
          isOpen={showExpenseForm}
          onClose={handleCloseExpenseForm}
          date={expenseFormDate}
          expense={editingExpense}
        />
      </div>
    </CalendarContext.Provider>
  )
}
