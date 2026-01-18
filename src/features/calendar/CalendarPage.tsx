import { useState, useCallback, useRef, useEffect } from 'react'
import { format, addMonths, subMonths } from 'date-fns'
import { MonthNavigator } from './MonthNavigator'
import { MonthGrid } from './MonthGrid'
import { DayExpenseModal } from './DayExpenseModal'
import { useExpensesForMonth } from '../../hooks/useExpenses'
import { aggregateExpenses } from '../../services/aggregation'

export function CalendarPage() {
  const [viewDate, setViewDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const touchStartX = useRef<number | null>(null)

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

  const handleDayClick = useCallback((date: string) => {
    setSelectedDate(date)
  }, [])

  const handleCloseModal = useCallback(() => {
    setSelectedDate(null)
  }, [])

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
        } else {
          goToNextMonth()
        }
      }

      touchStartX.current = null
    },
    [goToPreviousMonth, goToNextMonth]
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
      />
      <MonthGrid
        year={year}
        month={month}
        dayTotals={aggregate.byDay}
        onDayClick={handleDayClick}
      />
      {expenses.length === 0 && (
        <p className="text-center text-[var(--color-text-secondary)] mt-6">
          Tap a day to add your first expense
        </p>
      )}
      <DayExpenseModal
        date={selectedDate}
        isOpen={selectedDate !== null}
        onClose={handleCloseModal}
      />
    </div>
  )
}
