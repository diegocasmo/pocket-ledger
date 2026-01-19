import { createContext, useContext } from 'react'
import type { Expense } from '@/types'

export interface CalendarContextValue {
  selectedDate: string | null
  setSelectedDate: (date: string | null) => void
  openExpenseForm: (expense?: Expense) => void
}

export const CalendarContext = createContext<CalendarContextValue | null>(null)

export function useCalendarContext() {
  const context = useContext(CalendarContext)
  if (!context) {
    throw new Error('useCalendarContext must be used within AppLayout')
  }
  return context
}
