import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useExpensesByCategory } from '@/hooks/useExpenses'
import { useCategories } from '@/hooks/useCategories'
import { formatCentsToUsd } from '@/services/money'
import { parseDateFromISO } from '@/lib/dates'
import type { Expense } from '@/types'

interface CategoryExpenseListProps {
  categoryId: string
  start: string
  end: string
  onBack: () => void
}

export function CategoryExpenseList({
  categoryId,
  start,
  end,
  onBack,
}: CategoryExpenseListProps) {
  const navigate = useNavigate()
  const { data: expenses = [] } = useExpensesByCategory(categoryId, start, end)
  const { data: categories = [] } = useCategories()

  const category = categories.find((c) => c.id === categoryId)

  const handleEditExpense = (expense: Expense) => {
    navigate(`/expenses/${expense.id}`)
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          {category && (
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: category.color }}
            />
          )}
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
            {category?.name ?? 'Category'}
          </h1>
        </div>
      </div>

      <div className="space-y-2">
        {expenses.map((expense) => (
          <button
            key={expense.id}
            onClick={() => handleEditExpense(expense)}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors text-left"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium text-[var(--color-text-primary)]">
                  {formatCentsToUsd(expense.amountCents)}
                </span>
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {format(parseDateFromISO(expense.date), 'MMM d')}
                </span>
              </div>
              {expense.note && (
                <p className="text-sm text-[var(--color-text-secondary)] truncate mt-1">
                  {expense.note}
                </p>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--color-text-secondary)] flex-shrink-0" />
          </button>
        ))}
      </div>

      {expenses.length === 0 && (
        <p className="text-center text-[var(--color-text-secondary)] py-8">
          No expenses in this category
        </p>
      )}
    </div>
  )
}
