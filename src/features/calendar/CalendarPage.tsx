import { useState, useCallback, useRef, useEffect } from 'react'
import { format, addMonths, subMonths, isSameMonth } from 'date-fns'
import { MonthNavigator } from '@/features/calendar/MonthNavigator'
import { MonthGrid } from '@/features/calendar/MonthGrid'
import { DayExpensePanel } from '@/features/calendar/DayExpensePanel'
import { useExpensesForMonth } from '@/hooks/useExpenses'
import { aggregateExpenses } from '@/services/aggregation'
import { useCalendarContext } from '@/components/layout/CalendarContext'
import { getTodayISO } from '@/lib/dates'

export function CalendarPage() {
  const [viewDate, setViewDate] = useState(() => new Date())
  const touchStartX = useRef<number | null>(null)
  const { selectedDate, setSelectedDate, openExpenseForm } = useCalendarContext()

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth() + 1 // 1-indexed

  const { data: expenses = [] } = useExpensesForMonth(year, month)
  const aggregate = aggregateExpenses(expenses)

  const goToPreviousMonth = useCallback(() => {
    setViewDate((prev) => subMonths(prev, 1))
  }, [])

  const goToNextMonth = useCallback(() => {
    setViewDate((prev) => addMonths(prev, 1))
  }, [])

  const goToToday = useCallback(() => {
    setViewDate(new Date())
    setSelectedDate(getTodayISO())
  }, [setSelectedDate])

  const isCurrentMonth = isSameMonth(viewDate, new Date())

  const handleDayClick = useCallback((date: string) => {
    setSelectedDate(date)
  }, [setSelectedDate])

  // Swipe gesture handling
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null) return

      const touchEndX = e.changedTouches[0].clientX
      const diff = touchEndX - touchStartX.current

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          goToPreviousMonth()
        } else if (!isCurrentMonth) {
          goToNextMonth()
        }
      }

      touchStartX.current = null
    },
    [goToPreviousMonth, goToNextMonth, isCurrentMonth]
  )

  // Reset to current month on mount
  useEffect(() => {
    setViewDate(new Date())
  }, [])

  return (
    <div
      className="p-4"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <MonthNavigator
        monthLabel={format(viewDate, 'MMMM yyyy')}
        onPrevious={goToPreviousMonth}
        onNext={goToNextMonth}
        onToday={goToToday}
        isCurrentMonth={isCurrentMonth}
      />
      <MonthGrid
        year={year}
        month={month}
        dayTotals={aggregate.byDay}
        onDayClick={handleDayClick}
        selectedDate={selectedDate}
      />
      {expenses.length === 0 && !selectedDate && (
        <p className="text-center text-[var(--color-text-secondary)] mt-6">
          Tap the + button to add your first expense
        </p>
      )}
      {selectedDate && (
        <DayExpensePanel
          date={selectedDate}
          onEditExpense={openExpenseForm}
        />
      )}
    </div>
  )
}
