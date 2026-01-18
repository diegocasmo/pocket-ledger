import { useState } from 'react'
import { format } from 'date-fns'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { Button } from '../../components/ui/Button'
import { ExpenseList } from './ExpenseList'
import { ExpenseFormModal } from '../expenses/ExpenseFormModal'
import { useExpensesForDay } from '../../hooks/useExpenses'
import { parseDateFromISO, isFutureDate } from '../../lib/dates'
import type { Expense } from '../../types'

interface DayExpenseModalProps {
  date: string | null
  isOpen: boolean
  onClose: () => void
}

export function DayExpenseModal({ date, isOpen, onClose }: DayExpenseModalProps) {
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const { data: expenses = [] } = useExpensesForDay(date)

  if (!date) return null

  const dateObj = parseDateFromISO(date)
  const title = format(dateObj, 'EEEE, MMMM d')
  const isFuture = isFutureDate(date)

  const handleAddExpense = () => {
    setEditingExpense(null)
    setShowExpenseForm(true)
  }

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setShowExpenseForm(true)
  }

  const handleCloseExpenseForm = () => {
    setShowExpenseForm(false)
    setEditingExpense(null)
  }

  return (
    <>
      <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
        <div className="space-y-4">
          {!isFuture && (
            <Button onClick={handleAddExpense} className="w-full">
              Add Expense
            </Button>
          )}
          {expenses.length > 0 ? (
            <ExpenseList expenses={expenses} onEdit={handleEditExpense} />
          ) : (
            <p className="text-center text-[var(--color-text-secondary)] py-4">
              {isFuture ? "Can't add expenses for future dates" : 'No expenses for this day'}
            </p>
          )}
        </div>
      </BottomSheet>
      <ExpenseFormModal
        isOpen={showExpenseForm}
        onClose={handleCloseExpenseForm}
        date={date}
        expense={editingExpense}
      />
    </>
  )
}
