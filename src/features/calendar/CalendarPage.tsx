import { useState, useCallback } from 'react'
import { format, addMonths, subMonths, isSameMonth } from 'date-fns'
import { PeriodNavigator } from '@/components/ui/PeriodNavigator'
import { MonthGrid } from '@/features/calendar/MonthGrid'
import { DayExpensePanel } from '@/features/calendar/DayExpensePanel'
import { useExpensesForMonth } from '@/hooks/useExpenses'
import { useHorizontalSwipe } from '@/hooks/useHorizontalSwipe'
import { aggregateExpenses } from '@/services/aggregation'
import { useCalendarContext } from '@/components/layout/CalendarContext'
import { getTodayISO } from '@/lib/dates'

export function CalendarPage() {
  const [viewDate, setViewDate] = useState(() => new Date())
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

  const { onTouchStart, onTouchEnd } = useHorizontalSwipe({
    onSwipeRight: goToPreviousMonth,
    onSwipeLeft: () => {
      if (!isCurrentMonth) goToNextMonth()
    },
  })

  return (
    <div
      className="p-4 space-y-6"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <PeriodNavigator
        label={format(viewDate, 'MMMM yyyy')}
        onPrevious={goToPreviousMonth}
        onNext={goToNextMonth}
        onToday={goToToday}
        isCurrentPeriod={isCurrentMonth}
        periodName="month"
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

export default CalendarPage
