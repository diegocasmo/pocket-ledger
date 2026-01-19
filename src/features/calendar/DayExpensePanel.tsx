import { format } from 'date-fns'
import { ExpenseList } from '@/features/calendar/ExpenseList'
import { useExpensesForDay } from '@/hooks/useExpenses'
import { parseDateFromISO, isFutureDate } from '@/lib/dates'
import type { Expense } from '@/types'

interface DayExpensePanelProps {
  date: string
  onEditExpense: (expense: Expense) => void
}

export function DayExpensePanel({ date, onEditExpense }: DayExpensePanelProps) {
  const { data: expenses = [] } = useExpensesForDay(date)

  const dateObj = parseDateFromISO(date)
  const title = format(dateObj, 'EEEE, MMMM d')
  const isFuture = isFutureDate(date)

  return (
    <div className="mt-4 bg-[var(--color-bg-secondary)] rounded-lg overflow-hidden animate-in slide-in-from-top-2 duration-200">
      <div className="p-4 border-b border-[var(--color-border)]">
        <h3 className="font-medium text-[var(--color-text-primary)]">{title}</h3>
      </div>
      <div className="p-4">
        {expenses.length > 0 ? (
          <ExpenseList expenses={expenses} onEdit={onEditExpense} />
        ) : (
          <p className="text-center text-[var(--color-text-secondary)] py-4">
            {isFuture ? "Can't add expenses for future dates" : 'No expenses for this day'}
          </p>
        )}
        {!isFuture && expenses.length > 0 && (
          <p className="text-center text-[var(--color-text-secondary)] text-sm mt-4">
            Tap an expense to edit
          </p>
        )}
      </div>
    </div>
  )
}
